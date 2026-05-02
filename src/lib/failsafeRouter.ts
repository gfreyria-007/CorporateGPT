/**
 * failsafeRouter.ts — Corporate GPT V2 Gateway of Immortality
 *
 * Architecture:
 *   Primary: /api/chat (OpenRouter — any model)
 *   Fallback: /api/fallback (Gemini 1.5 Flash — always-on emergency engine)
 *
 * Rules:
 *   - If primary responds HTTP 500 → immediate fallback
 *   - If primary takes > 6 seconds → abort + fallback
 *   - User NEVER sees an error screen. Fallback is transparent.
 *   - A silent console event is logged for Super Admin diagnostics.
 */

const PRIMARY_TIMEOUT_MS = 30000;    // 30-second SLA - give models time to respond
const FALLBACK_MODEL = 'gemini-1.5-flash-latest';

export interface RouterPayload {
  model: string;
  messages: { role: string; content: string }[];
  userId: string;
  idToken: string; // Required for backend verification
  instructions?: string | null;
  temperature?: number;
  maxTokens?: number;
  deepThink?: boolean;
  webSearch?: boolean;
  docsOnly?: boolean;
}

export interface RouterResult {
  content: string;
  usedFallback: boolean;
  fallbackReason?: string;
  tier?: string;
  tierLabel?: string;
  notification?: string | null;
  needsModelSwitch?: boolean;
}

/**
 * Race a fetch against a timeout. Rejects with 'TIMEOUT' if breached.
 */
function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...init, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

/**
 * Parse the chat response from OpenRouter format.
 */
async function parsePrimaryResponse(res: Response): Promise<{ content: string; tier?: string; tierLabel?: string; notification?: string | null }> {
  const data = await res.json();
  if (data.choices?.[0]?.message?.content) {
    return {
      content: data.choices[0].message.content,
      tier: data._tier,
      tierLabel: data._tierLabel,
      notification: data._notification,
    };
  }
  throw new Error(data.error || 'Empty response from primary engine');
}

/**
 * Parse fallback response from /api/fallback (Gemini 1.5 Flash).
 */
async function parseFallbackResponse(res: Response): Promise<string> {
  const data = await res.json();
  if (data.text) return data.text;
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  throw new Error('Empty response from fallback engine');
}

/**
 * Core fail-safe router.
 * Tries primary → on any failure (timeout, 5xx) → silently escalates to fallback.
 */
export async function failsafeChat(payload: RouterPayload): Promise<RouterResult> {
  const { idToken, ...rest } = payload;
  const body = JSON.stringify(rest);
  const headers = { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  };

  // ─── PRIMARY ATTEMPT ─────────────────────────────────────────────────────
  try {
    const primaryRes = await fetchWithTimeout(
      '/api/chat',
      { method: 'POST', headers, body },
      PRIMARY_TIMEOUT_MS
    );

    if (primaryRes.ok) {
      const result = await parsePrimaryResponse(primaryRes);
      return { ...result, usedFallback: false };
    }

    // 4xx (safety violations) are NOT retried — surface them immediately
    if (primaryRes.status === 403) {
      const err = await primaryRes.json();
      throw Object.assign(new Error('SAFETY_VIOLATION'), { status: 403, data: err });
    }

    // 5xx → fall through to fallback
    const reason = `Primary engine HTTP ${primaryRes.status}`;
    console.warn(`[GatewayOfImmortality] Primary failed (${reason}) → Activating Safe-Fallback`);
    return await runFallback(payload, reason);

  } catch (err: any) {
    // AbortError = timeout; network error = catch
    if (err.status === 403) throw err;   // re-throw safety violations

    const reason = err.name === 'AbortError'
      ? `Primary timeout > ${PRIMARY_TIMEOUT_MS / 1000}s`
      : `Primary network error: ${err.message}`;

    console.warn(`[GatewayOfImmortality] ${reason} → Activating Safe-Fallback`);
    return await runFallback(payload, reason);
  }
}

/**
 * Emergency fallback — Gemini 1.5 Flash via /api/fallback endpoint.
 * Transparent to the user.
 */
async function runFallback(payload: RouterPayload, reason: string): Promise<RouterResult> {
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
      const errData = await fallbackRes.json();
      throw new Error(errData.error || `Fallback HTTP ${fallbackRes.status}`);
    }

    const content = await parseFallbackResponse(fallbackRes);
    console.info(`[GatewayOfImmortality] Fallback SUCCESS via ${FALLBACK_MODEL}`);
    return { content, usedFallback: true, fallbackReason: reason };

  } catch (fallbackErr: any) {
    const cleanError = fallbackErr.message || 'Error desconocido';
    console.error('[GatewayOfImmortality] TOTAL FAILURE — both engines unreachable:', cleanError);
    return {
      content: `⚠️ Modelo no disponible actualmente. Por favor selecciona otro modelo del menú o intenta de nuevo en unos segundos.`,
      usedFallback: true,
      fallbackReason: `TOTAL FAILURE: ${cleanError}`,
      needsModelSwitch: true,
    };
  }
}
