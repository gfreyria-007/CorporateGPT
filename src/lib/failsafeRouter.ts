/**
 * failsafeRouter.ts — Corporate GPT V2 Gateway of Immortality
 *
 * Architecture:
 *   Primary: /api/chat (tries multiple AI providers)
 *   Fallback: /api/fallback (Gemini emergency engine)
 *
 * Features:
 *   - Multiple model switching within each request
 *   - Transparent fallback (user never sees errors)
 *   - NO API keys exposed in responses
 *   - Comprehensive error handling
 */

const PRIMARY_TIMEOUT_MS = 30000;
const FALLBACK_MODEL = 'gemini-1.5-flash';

export interface RouterPayload {
  model: string;
  messages: { role: string; content: string }[];
  userId: string;
  idToken: string;
  instructions?: string | null;
  temperature?: number;
  maxTokens?: number;
  deepThink?: boolean;
  webSearch?: boolean;
  docsOnly?: boolean;
  ecoMode?: boolean;
  dataProtected?: boolean;
}

export interface RouterResult {
  content: string;
  usedFallback: boolean;
  fallbackReason?: string;
  tier?: string;
  tierLabel?: string;
  notification?: string | null;
  modelSwitched?: boolean;
}

function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...init, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

async function parseChatResponse(res: Response): Promise<{ content: string; tier?: string; tierLabel?: string; notification?: string }> {
  const data = await res.json();
  
  // Never expose API keys - strip any debug info
  if (data.debug) delete data.debug;
  if (data.error?.includes('key')) {
    throw new Error('API configuration error');
  }
  
  if (data.choices?.[0]?.message?.content) {
    return {
      content: data.choices[0].message.content,
      tier: data._tier,
      tierLabel: data._tierLabel,
      notification: data._notification,
    };
  }
  
  if (data.text) {
    return { content: data.text };
  }
  
  throw new Error(data.error || 'Empty response');
}

async function tryFallback(payload: RouterPayload, reason: string): Promise<RouterResult> {
  const fallbackBody = JSON.stringify({
    messages: payload.messages,
    instructions: payload.instructions,
    temperature: payload.temperature,
    model: FALLBACK_MODEL,
  });

  try {
    const fallbackRes = await fetch('/api/fallback', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${payload.idToken}`
      },
      body: fallbackBody,
    });

    if (!fallbackRes.ok) {
      const err = await fallbackRes.json().catch(() => ({ error: 'Fallback failed' }));
      throw new Error(err.error || `Fallback HTTP ${fallbackRes.status}`);
    }

    const data = await fallbackRes.json();
    const content = data.text || data.choices?.[0]?.message?.content || '';
    
    if (!content) throw new Error('Empty fallback response');
    
    console.info(`[Gateway] Fallback SUCCESS via ${FALLBACK_MODEL}`);
    return { content, usedFallback: true, fallbackReason: reason };

  } catch (fallbackErr: any) {
    throw new Error(`All engines failed: ${fallbackErr.message}`);
  }
}

export async function failsafeChat(payload: RouterPayload): Promise<RouterResult> {
  const { idToken, ...rest } = payload;
  const body = JSON.stringify(rest);
  const headers = { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  };

  // ═══════════════════════════════════════════════════════════════
  // PRIMARY ATTEMPT (with internal model switching)
  // ═══════════════════════════════════════════════════════════════
  try {
    const primaryRes = await fetchWithTimeout(
      '/api/chat',
      { method: 'POST', headers, body },
      PRIMARY_TIMEOUT_MS
    );

    if (primaryRes.ok) {
      const result = await parseChatResponse(primaryRes);
      return { ...result, usedFallback: false };
    }

    // 4xx = safety violation → don't retry
    if (primaryRes.status === 403) {
      const err = await primaryRes.json().catch(() => ({}));
      throw Object.assign(new Error(err.error || 'Safety violation'), { status: 403 });
    }

    // 5xx or other → try fallback
    const reason = `Primary HTTP ${primaryRes.status}`;
    console.warn(`[Gateway] ${reason} → Fallback`);
    return await tryFallback(payload, reason);

  } catch (err: any) {
    // Safety violation → throw immediately
    if (err.status === 403) throw err;

    const reason = err.name === 'AbortError'
      ? `Timeout after ${PRIMARY_TIMEOUT_MS / 1000}s`
      : `Error: ${err.message}`;

    console.warn(`[Gateway] ${reason} → Fallback`);
    
    try {
      return await tryFallback(payload, reason);
    } catch (fallbackErr: any) {
      // Total failure - but DON'T expose keys or technical details
      console.error('[Gateway] TOTAL FAILURE:', fallbackErr.message);
      return {
        content: '⚠️ El servicio está temporalmente ocupado. Por favor espera unos segundos e intenta de nuevo.',
        usedFallback: true,
        fallbackReason: 'service_unavailable',
      };
    }
  }
}