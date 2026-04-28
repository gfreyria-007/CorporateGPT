import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  // API Route to fetch models
  app.get('/api/models', async (req, res) => {
    try {
      if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: 'OPENROUTER_API_KEY is not set' });
      }

      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'OpenRouter Chat Explorer',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching models:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route to fetch credits
  app.get('/api/admin/credits', async (req, res) => {
    try {
      if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: 'OPENROUTER_API_KEY is not set' });
      }

      const response = await fetch('https://openrouter.ai/api/v1/credits', {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch credits: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching credits:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for chat completions
  app.post('/api/chat', async (req, res) => {
    try {
      if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: 'OPENROUTER_API_KEY is not set' });
      }

      // Check balance and trigger alerts if needed
      const creditRes = await fetch('https://openrouter.ai/api/v1/credits', {
        headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}` }
      });
      if (creditRes.ok) {
        const creditData = await creditRes.json();
        const balance = creditData.data?.total_credits - creditData.data?.total_usage;
        if (balance < 5) {
          console.log(`[ALERT] LOW CREDITS DETECTED: $${balance.toFixed(2)}. Simulation: Sending email to super-admins...`);
          // Here you would integrate with an email provider like SendGrid or Nodemailer
        }
      }

      const { model, messages, userId, instructions, temperature, maxTokens, deepThink, webSearch, docsOnly } = req.body;
      const currentTime = new Date().toISOString();

      // Basic Safety Guardrails & Forbidden Subjects Check
      const lastMessage = messages[messages.length - 1]?.content || '';
      const forbiddenPatterns = [
        /ignore previous instructions/i,
        /system prompt/i,
        /dan mode/i,
        /bypass safety/i,
        /sql injection/i,
        /generate malware/i,
        /how to hack/i,
        /unauthorized access/i,
        /prohibited content/i,
        /child abuse/i,
        /hate speech/i,
        /bomb making/i
      ];

      const isViolation = forbiddenPatterns.some(pattern => pattern.test(lastMessage));

      if (isViolation) {
        return res.status(403).json({ 
          error: "SAFETY_VIOLATION", 
          reason: "Forbidden keywords or injection attempt detected."
        });
      }

      // Construction of system message based on advanced triggers
      let systemContent = `You are Catalizia CorporateGPT, a premium corporate AI assistant. Current time: ${currentTime}. Always prioritize data privacy and corporate security.`;
      
      if (instructions) {
        systemContent += `\n\nSpecific Persona Instructions:\n${instructions}`;
      }

      if (deepThink) {
        systemContent += `\n\n[REASONING MODE ENABLED]: Think step-by-step in extreme detail before providing your final answer. Analyze all angles and potential corporate implications.`;
      }

      if (webSearch) {
        systemContent += `\n\n[SEARCH MODE ENABLED]: You are encouraged to use your internal search capabilities or provide information as if you had access to the most recent web data available. Verify facts against current events.`;
      }

      if (docsOnly) {
        systemContent += `\n\n[STRICT DOCUMENT MODE]: Limit your response STRICTLY to the information provided in the attached documents or context. If the answer is not contained therein, explicitly state that you cannot answer based on internal records. Do NOT use general knowledge.`;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'Catalizia CorporateGPT',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'openrouter/auto',
          messages: [
            { 
              role: 'system', 
              content: systemContent
            },
            ...messages
          ],
          temperature: temperature ?? 0.7,
          max_tokens: maxTokens ?? 4000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Chat completion failed');
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
