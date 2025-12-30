# GitHub OAuth Authentication Setup Guide

## Overview

The PR Review AI now supports GitHub OAuth authentication, allowing users to:

- **Guest Mode**: Review public PRs without signing in
- **Authenticated Mode**: Review both public and private PRs with GitHub sign-in

## Setup Steps

### 1. Create GitHub OAuth Application

1. Go to **https://github.com/settings/developers**
2. Click **"New OAuth App"**
3. Fill in the application details:

   **For Development:**

   - Application name: `PR Review AI (Dev)`
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:4000/api/auth/github/callback`

   **For Production:**

   - Application name: `PR Review AI`
   - Homepage URL: `https://your-frontend-domain.vercel.app`
   - Authorization callback URL: `https://your-backend-domain.up.railway.app/api/auth/github/callback`

4. Click **"Register application"**
5. Copy the **Client ID**
6. Click **"Generate a new client secret"** and copy the **Client Secret**

### 2. Generate Secrets

Generate random secrets for JWT and session management:

```bash
# Generate JWT_SECRET (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use online generators like: https://randomkeygen.com/

### 3. Update Backend Environment Variables

Add these to your `backend/.env` file:

```env
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_client_id_from_step_1
GITHUB_CLIENT_SECRET=your_client_secret_from_step_1
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback

# JWT & Session Secrets (use generated values from step 2)
JWT_SECRET=your_generated_jwt_secret_here
SESSION_SECRET=your_generated_session_secret_here

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:5173
```

### 4. Update Frontend Environment Variables

Your `frontend/.env` should already have:

```env
VITE_API_BASE_URL=http://localhost:4000
```

### 5. Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
# Backend
cd backend
yarn install

# Frontend
cd frontend
yarn install
```

### 6. Start the Application

```bash
# Terminal 1 - Backend
cd backend
yarn dev

# Terminal 2 - Frontend
cd frontend
yarn dev
```

### 7. Test the Authentication Flow

1. **Guest Mode:**

   - Open http://localhost:5173
   - Click "Continue as Guest"
   - Try reviewing a public PR (e.g., `https://github.com/facebook/react/pull/12345`)
   - Note: Private PRs will fail with 404

2. **GitHub Authentication:**

   - Refresh the page or click "Sign in with GitHub" link
   - Click "Sign in with GitHub" button
   - Authorize the application
   - You'll be redirected back with your GitHub avatar
   - Try reviewing both public and private PRs

3. **Logout:**
   - Click the logout icon in the header
   - You'll be returned to the login screen

## Production Deployment

### Railway (Backend)

Add these environment variables in Railway dashboard:

```env
GITHUB_CLIENT_ID=your_production_client_id
GITHUB_CLIENT_SECRET=your_production_client_secret
GITHUB_CALLBACK_URL=https://your-backend.up.railway.app/api/auth/github/callback
JWT_SECRET=your_production_jwt_secret
SESSION_SECRET=your_production_session_secret
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### Vercel (Frontend)

Environment variables remain the same:

```env
VITE_API_BASE_URL=https://your-backend.up.railway.app
```

### Update GitHub OAuth App

Add production URLs to your GitHub OAuth app settings:

- Homepage URL: `https://your-frontend.vercel.app`
- Callback URL: `https://your-backend.up.railway.app/api/auth/github/callback`

## Architecture

```
┌─────────────────────────────────────────────┐
│           Frontend (Vite + React)           │
│                                             │
│  ┌─────────────┐    ┌──────────────────┐  │
│  │ LoginPage   │───▶│  AuthContext     │  │
│  │ - GitHub    │    │  - user state    │  │
│  │ - Guest     │    │  - login/logout  │  │
│  └─────────────┘    └──────────────────┘  │
│         │                    │              │
│         └────────┬───────────┘              │
│                  │                          │
└──────────────────┼──────────────────────────┘
                   │
              HTTP Requests
                   │
┌──────────────────┼──────────────────────────┐
│                  ▼                          │
│        Backend (Express + Passport)        │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │  Auth Routes                        │  │
│  │  - /api/auth/github (OAuth start)   │  │
│  │  - /api/auth/github/callback        │  │
│  │  - /api/auth/me (get current user)  │  │
│  │  - /api/auth/logout                 │  │
│  └─────────────────────────────────────┘  │
│              │                              │
│              ▼                              │
│  ┌─────────────────────────────────────┐  │
│  │  Middleware                         │  │
│  │  - optionalAuth (adds user if JWT)  │  │
│  │  - requireAuth (enforces auth)      │  │
│  └─────────────────────────────────────┘  │
│              │                              │
│              ▼                              │
│  ┌─────────────────────────────────────┐  │
│  │  Review Service                     │  │
│  │  - Uses user's GitHub token if auth │  │
│  │  - Falls back to app token          │  │
│  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Security Features

1. **HTTPOnly Cookies**: JWT tokens stored in HTTPOnly cookies (not accessible via JavaScript)
2. **CORS**: Configured to only accept requests from frontend origin
3. **Secure Cookies**: Enabled in production with `sameSite: 'none'`
4. **Token Expiry**: JWT tokens expire after 7 days
5. **No Token Exposure**: GitHub access tokens never sent to frontend

## Troubleshooting

### "Authentication failed" error

- Verify CLIENT_ID and CLIENT_SECRET are correct
- Check callback URL matches exactly in GitHub OAuth app settings

### CORS errors

- Ensure FRONTEND_URL matches your actual frontend URL
- Check that `withCredentials: true` is set in axios config

### Cookies not persisting

- For localhost: Ensure both backend and frontend use `localhost` (not `127.0.0.1`)
- For production: Verify `secure: true` and `sameSite: 'none'` are set

### Private PR 404 errors

- User must be authenticated with GitHub OAuth
- User's GitHub account must have access to the private repository

## Files Created/Modified

### Backend

- `src/config/passport.ts` - Passport GitHub strategy configuration
- `src/routes/auth.route.ts` - Authentication endpoints
- `src/middleware/auth.middleware.ts` - Auth middleware
- `src/utils/jwt.ts` - JWT token utilities
- `src/types/user.types.ts` - User type definitions
- `src/config/env.ts` - Added OAuth environment variables
- `src/app.ts` - Added session and passport middleware
- `src/services/github.service.ts` - Modified to accept user token
- `src/services/review.service.ts` - Pass user token to GitHub service

### Frontend

- `src/contexts/AuthContext.tsx` - React auth context and provider
- `src/pages/LoginPage.tsx` - Login/sign-in screen
- `src/lib/auth.ts` - Auth API service
- `src/types/auth.ts` - Auth type definitions
- `src/app/App.tsx` - Added auth routing and user display
- `src/app/providers/index.tsx` - Wrapped app with AuthProvider

## Next Steps

After testing locally:

1. Commit and push changes to your repository
2. Update environment variables on Railway and Vercel
3. Create and configure production GitHub OAuth app
4. Test production deployment
5. Update README with authentication documentation
