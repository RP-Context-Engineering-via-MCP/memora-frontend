// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const SESSION_API_URL = import.meta.env.VITE_SESSION_API_URL || 'http://localhost:8080';
export const API_VERSION = '/api/v1';

export const API_ENDPOINTS = {
  getUserProfile: (userId) => `${API_BASE_URL}${API_VERSION}/get-user-profile/${userId}`,
  listCoreBehaviors: (userId) => `${API_BASE_URL}${API_VERSION}/list-core-behaviors/${userId}`,
  analyzeFromStorage: (userId) => `${API_BASE_URL}${API_VERSION}/analyze-behaviors-from-storage?user_id=${userId}`,
  getLLMContext: (userId, params) => {
    const queryParams = new URLSearchParams(params).toString();
    return `${API_BASE_URL}${API_VERSION}/profile/${userId}/llm-context${queryParams ? '?' + queryParams : ''}`;
  },
  health: `${API_BASE_URL}${API_VERSION}/health`,
  
  // OAuth endpoints
  oauthLogin: `${API_BASE_URL}/api/users/oauth/login`,
  oauthSignup: `${API_BASE_URL}/api/users/oauth/signup`,
  githubCallback: `${API_BASE_URL}/api/users/oauth/github/callback`,
  
  // MCP Token endpoint
  generateMcpToken: (userId) => `${API_BASE_URL}/api/users/${userId}/mcp-token`,
  
  // Session endpoints (port 8080)
  listSessions: (userId, page = 1, pageSize = 20) =>
    `${SESSION_API_URL}/api/users/${userId}/sessions/?page=${page}&page_size=${pageSize}`,
  createSession: (userId) => `${SESSION_API_URL}/api/users/${userId}/sessions/`,
  getSession: (userId, sessionId) => `${SESSION_API_URL}/api/users/${userId}/sessions/${sessionId}`,
  updateSession: (userId, sessionId) => `${SESSION_API_URL}/api/users/${userId}/sessions/${sessionId}`,
  deleteSession: (userId, sessionId) => `${SESSION_API_URL}/api/users/${userId}/sessions/${sessionId}`,
  getActiveSession: (userId) => `${SESSION_API_URL}/api/users/${userId}/current-session`,
  updateActiveSession: (userId) => `${SESSION_API_URL}/api/users/${userId}/active-session`,

  // Drift Detection endpoints
  getDriftDashboard: (userId, days = 90) => `${API_BASE_URL}${API_VERSION}/dashboard/${userId}?days=${days}`,
  detectDrift: (userId, force = false) => `${API_BASE_URL}${API_VERSION}/detect/${userId}?force=${force}`,
  getDriftEvents: (userId, limit = 50, offset = 0) => `${API_BASE_URL}${API_VERSION}/events/${userId}?limit=${limit}&offset=${offset}`,
  getDriftEvent: (userId, driftEventId) => `${API_BASE_URL}${API_VERSION}/events/${userId}/${driftEventId}`,
  acknowledgeDriftEvent: (userId, driftEventId) => `${API_BASE_URL}${API_VERSION}/events/${userId}/${driftEventId}/acknowledge`,
};

/**
 * Handles OAuth login flow
 * Checks if user exists, if so logs them in, otherwise creates account
 * @param {Object} tokenData - OAuth token response from provider
 * @returns {Promise<Object>} User data and authentication info
 */
export const handleOAuthLogin = async (tokenData) => {
  try {
    const response = await fetch(API_ENDPOINTS.oauthLogin, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: tokenData.credential || tokenData.access_token,
        provider: tokenData.provider || 'google',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'OAuth login failed');
    }

    return data;
  } catch (error) {
    console.error('OAuth login error:', error);
    throw error;
  }
};

/**
 * Handles OAuth signup for new users
 * @param {Object} userData - User data from OAuth provider
 * @returns {Promise<Object>} New user data
 */
export const handleOAuthSignup = async (userData) => {
  try {
    const response = await fetch(API_ENDPOINTS.oauthSignup, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'OAuth signup failed');
    }

    return data;
  } catch (error) {
    console.error('OAuth signup error:', error);
    throw error;
  }
};

export default API_BASE_URL;
