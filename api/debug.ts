import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const check = (name: string) => {
    const val = process.env[name];
    return {
      present: !!val,
      length: val ? val.length : 0,
      prefix: val ? val.substring(0, 4) + '...' : 'N/A'
    };
  };

  const results = {
    timestamp: new Date().toISOString(),
    env: {
      OPENROUTER_API_KEY: check('OPENROUTER_API_KEY'),
      GEMINI_API_KEY: check('GEMINI_API_KEY'),
      FIREBASE_PROJECT_ID: check('FIREBASE_PROJECT_ID'),
      FIREBASE_PRIVATE_KEY: check('FIREBASE_PRIVATE_KEY'),
      FIREBASE_CLIENT_EMAIL: check('FIREBASE_CLIENT_EMAIL'),
      NEXT_PUBLIC_FIREBASE_API_KEY: check('NEXT_PUBLIC_FIREBASE_API_KEY'),
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: check('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
      APP_URL: check('APP_URL'),
    },
    node_version: process.version,
  };

  return res.status(200).json(results);
}
