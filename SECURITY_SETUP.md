# Security Recommendations for Corporate GPT

## 🔐 Required Security Setup

- **Environment Variables** (populate via your CI/CD secret manager, not in repo):
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
  - `GEMINI_API_KEY`
  - `OPENROUTER_API_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `VITE_FIREBASE_API_KEY`
  - *Any other VITE_* variables you need

> **Do not commit actual secret values** – store them in GitHub Secrets, Vercel environment variables, or another secret manager.

## Missing Variables
```
PORT=8080
NODE_ENV=development
CORS_ORIGIN=https://corporategpt.catalizia.com
APP_URL=https://corporategpt.catalizia.com
```

## Next Steps
1. Add these variables to your deployment platform's secret store.
2. Verify the app loads with `npm run dev`.
3. Ensure the Stripe webhook secret is set before handling payments.
