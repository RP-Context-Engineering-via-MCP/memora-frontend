# Memora Frontend

A React-based frontend application for Memora - Control Your AI Context.

## Features

- 🔐 **OAuth 2.0 Authentication** - Google OAuth integration
- 🎨 **Modern UI** - Built with Tailwind CSS
- 🔄 **Smart Onboarding** - Profile setup for new users
- 📊 **Dashboard** - User profile and context management
- ⚡ **Fast Development** - Powered by Vite

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Backend API server running
- Google OAuth Client ID ([Get it here](https://console.cloud.google.com/apis/credentials))

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your Google OAuth Client ID

# Start development server
npm run dev
```

Visit `http://localhost:5173`

## OAuth Setup

**Quick Setup**: See [QUICKSTART.md](QUICKSTART.md)

**Complete Guide**: See [OAUTH_SETUP.md](OAUTH_SETUP.md)

**Backend Implementation**: See [OAUTH_BACKEND_SPEC.md](OAUTH_BACKEND_SPEC.md)

### Environment Variables

Create a `.env` file:
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Signin.jsx      # Login page (OAuth + traditional)
│   ├── Signup.jsx      # Registration page (OAuth + traditional)
│   ├── ProfileSetupStep1.jsx
│   ├── ProfileSetupStep2.jsx
│   ├── Dashboard.jsx
│   └── ...
├── config/             # Configuration files
│   ├── api.js          # API endpoints and OAuth functions
│   └── oauth.js        # OAuth provider configuration
└── App.jsx             # Main app with OAuth provider
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Authentication Flow

### OAuth (Google)
1. User clicks "Continue with Google"
2. Google OAuth popup appears
3. User authenticates with Google
4. Frontend receives user info
5. Backend checks if user exists:
   - **New user** → Create account → Redirect to `/profile-setup/step1`
   - **Existing user** → Redirect to `/dashboard`

### Traditional (Email/Password)
1. User enters credentials
2. Backend validates credentials
3. Frontend receives JWT token
4. Redirect to dashboard

## Tech Stack

- **React 19** - UI library
- **React Router** - Navigation
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **@react-oauth/google** - Google OAuth
- **Lucide React** - Icons
- **Framer Motion** - Animations
- **Recharts** - Data visualization

## Documentation

- [QUICKSTART.md](QUICKSTART.md) - Get started in 5 minutes
- [OAUTH_SETUP.md](OAUTH_SETUP.md) - Complete OAuth setup guide
- [OAUTH_BACKEND_SPEC.md](OAUTH_BACKEND_SPEC.md) - Backend API requirements
- [OAUTH_IMPLEMENTATION_SUMMARY.md](OAUTH_IMPLEMENTATION_SUMMARY.md) - Implementation details

## Development

### React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Security

- OAuth Client Secret is never exposed in frontend
- JWT tokens used for API authentication
- User data stored in localStorage/sessionStorage
- HTTPS required for production OAuth

## License

© 2025 Memora Inc.
