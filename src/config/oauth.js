// OAuth 2.0 Configuration
// Add your OAuth Client IDs to your .env file

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';

export const OAUTH_CONFIG = {
  google: {
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: window.location.origin,
    scope: 'openid email profile',
  },
  github: {
    clientId: GITHUB_CLIENT_ID,
    redirectUri: `${window.location.origin}/signin`,
    scope: 'read:user user:email',
    authorizationUrl: 'https://github.com/login/oauth/authorize',
  },
};

// OAuth Providers
export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
};
