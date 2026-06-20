# Cloudflare Pages Deployment Guide

## Setup Instructions

### 1. Configure Environment Variables in Cloudflare Pages

1. Go to Cloudflare Pages dashboard
2. Select your project
3. Go to **Settings** > **Environment variables**
4. Add the following secret environment variables:

```bash
# Firebase Web Configuration
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin Service Account (for API routes)
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_PROJECT_ID=your-project-id

# App Configuration
APP_URL=https://your-project.pages.dev
CF_PAGES=1
CF_PAGES_URL=https://your-project.pages.dev
```

### 2. Build and Deploy

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

### 3. Firebase OAuth Configuration

Ensure your Firebase project is configured for web OAuth:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** > **Sign-in method**
4. Enable:
   - Google (OAuth 2.0)
   - Apple (OAuth 2.0)
   - Email/Password (if needed)

4. Go to **Project Settings** > **General** > **Your apps**
5. Add your web app and copy the configuration
6. Update environment variables with the actual values

### 4. OAuth Redirect URI Configuration

In Firebase Console:
1. Go to **Authentication** > **Settings**
2. Under **Authorized domains**, add:
   - `your-project.pages.dev`
   - `*.your-project.pages.dev`

### 5. Testing

After deployment, test:
- Google OAuth sign-in
- Apple OAuth sign-in
- Email authentication
- API routes authentication

### 6. Troubleshooting

If OAuth doesn't work:
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Check Firebase console for authentication logs
4. Ensure domains are authorized in Firebase settings