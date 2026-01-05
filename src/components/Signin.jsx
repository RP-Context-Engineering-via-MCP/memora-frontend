import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import {
  ShieldCheck,
  ArrowRight,
  Chrome,
  Github,
  Bot,
  Sparkles,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { handleOAuthLogin } from '../config/api';
import { GITHUB_CLIENT_ID, OAUTH_CONFIG } from '../config/oauth';

const API_BASE_URL = 'http://127.0.0.1:8000';

const Signin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hasProcessedCallback = useRef(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSignIn = async () => {
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Save to both localStorage and sessionStorage for persistence and session management
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('userId', data.user_id);
      sessionStorage.setItem('userId', data.user_id);
      sessionStorage.setItem('user', JSON.stringify(data));

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OAuth Google Login Handler
  const handleGoogleOAuthSuccess = async (tokenResponse) => {
    setLoading(true);
    setError('');

    try {
      // First, get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user information from Google');
      }

      const googleUserInfo = await userInfoResponse.json();

      // Send to backend to check if user exists or create new user
      const backendResponse = await fetch(`${API_BASE_URL}/api/users/oauth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: googleUserInfo.email,
          name: googleUserInfo.name,
          provider: 'google',
          provider_id: googleUserInfo.sub,
          picture: googleUserInfo.picture,
        }),
      });

      const data = await backendResponse.json();

      if (!backendResponse.ok) {
        throw new Error(data.detail || 'OAuth authentication failed');
      }

      // Save user data to storage
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('userId', data.user_id);
      sessionStorage.setItem('userId', data.user_id);
      sessionStorage.setItem('user', JSON.stringify(data));

      // Navigate based on whether user is new or existing
      if (data.is_new_user) {
        // New user - navigate to onboarding
        navigate('/profile-setup/step1');
      } else {
        // Existing user - navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('OAuth error:', err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuthError = (error) => {
    console.error('Google OAuth error:', error);
    setError('Failed to authenticate with Google. Please try again.');
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleOAuthSuccess,
    onError: handleGoogleOAuthError,
    flow: 'implicit',
  });

  // GitHub OAuth Login Handler
  const handleGitHubLogin = () => {
    if (!GITHUB_CLIENT_ID) {
      setError('GitHub OAuth is not configured. Please add VITE_GITHUB_CLIENT_ID to .env');
      return;
    }

    const githubAuthUrl = new URL(OAUTH_CONFIG.github.authorizationUrl);
    githubAuthUrl.searchParams.append('client_id', GITHUB_CLIENT_ID);
    githubAuthUrl.searchParams.append('redirect_uri', OAUTH_CONFIG.github.redirectUri);
    githubAuthUrl.searchParams.append('scope', OAUTH_CONFIG.github.scope);
    githubAuthUrl.searchParams.append('state', Math.random().toString(36).substring(7));

    // Redirect to GitHub OAuth
    window.location.href = githubAuthUrl.toString();
  };

  // Handle GitHub OAuth callback
  useEffect(() => {
    const handleGitHubCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      // Only process if we have both code and state, and haven't processed yet
      if (code && state && !hasProcessedCallback.current) {
        hasProcessedCallback.current = true;
        setLoading(true);
        setError('');

        try {
          // Send code to backend for exchange
          const backendResponse = await fetch(`${API_BASE_URL}/api/users/oauth/github/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: code,
              redirect_uri: OAUTH_CONFIG.github.redirectUri,
            }),
          });

          const data = await backendResponse.json();

          if (!backendResponse.ok) {
            throw new Error(data.detail || 'GitHub OAuth authentication failed');
          }

          // Save user data to storage
          localStorage.setItem('user', JSON.stringify(data));
          localStorage.setItem('userId', data.user_id);
          sessionStorage.setItem('userId', data.user_id);
          sessionStorage.setItem('user', JSON.stringify(data));

          // Clean up URL before navigation
          window.history.replaceState({}, document.title, '/signin');

          // Navigate based on whether user is new or existing
          if (data.is_new_user) {
            navigate('/profile-setup/step1');
          } else {
            navigate('/dashboard');
          }
        } catch (err) {
          console.error('GitHub OAuth error:', err);
          setError(err.message || 'Failed to sign in with GitHub. Please try again.');
          // Clean up URL on error
          window.history.replaceState({}, document.title, '/signin');
          setLoading(false);
        }
      }
    };

    handleGitHubCallback();
  }, []); // Empty dependency array - only run once on mount

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-900/90 to-slate-900 text-white relative overflow-hidden rounded-none lg:rounded-r-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-16">
          <div>
            <p className="text-indigo-200 text-base lg:text-lg font-medium mb-8 lg:mb-12 leading-relaxed">
              One secure hub to control how every AI sees and remembers you.
            </p>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6 lg:mb-8">
              Control<br />Your AI<br />Context
            </h1>

            <p className="text-lg lg:text-xl text-indigo-100 font-medium max-w-lg">
              Manage your preferences across every AI — keep personal data private, align tone and expertise, and stay in full control.
            </p>
          </div>
          
          <div className="relative max-w-md mx-auto hidden lg:block">
            <div className="bg-slate-800 rounded-[3rem] p-8 shadow-2xl border border-slate-700">
              <div className="bg-white rounded-[2rem] overflow-hidden shadow-inner">
                <div className="bg-gradient-to-b from-indigo-50 to-slate-50 h-96 flex flex-col">
                  <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                      M
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Memora</div>
                      <div className="text-xs text-emerald-600 flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Shield Active
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                        <Bot size={16} className="text-slate-600" />
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-xs">
                        <p className="text-sm text-slate-700">How can I help you today?</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-indigo-600 rounded-2xl rounded-tr-none px-4 py-3 shadow-sm max-w-xs">
                        <p className="text-sm text-white">Explain quantum error correction simply.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                        <Sparkles size={16} className="text-indigo-600" />
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-md">
                        <p className="text-sm text-slate-700 font-medium">Using Learning & Studying profile</p>
                        <p className="text-sm text-slate-600 mt-1">Think of quantum errors like typos in a message...</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-200 flex items-center gap-3">
                    <Lock size={18} className="text-emerald-600" />
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 text-sm bg-slate-100 rounded-full px-4 py-2 focus:outline-none"
                    />
                    <ShieldCheck size={18} className="text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 py-8 lg:py-0">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:mb-12">
            <div className="inline-flex items-center gap-2 sm:gap-3 mb-6 lg:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-xl">
                <ShieldCheck size={24} className="sm:hidden" strokeWidth={2.5} />
                <ShieldCheck size={28} className="hidden sm:block" strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900">
                Memora
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 sm:mb-4">Sign In</h2>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-[3rem] p-6 sm:p-8 lg:p-12 shadow-2xl border border-slate-100">
            <div className="space-y-3 sm:space-y-4 mb-8 lg:mb-10">
              <button 
                type="button"
                onClick={() => googleLogin()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 border border-slate-200 rounded-full font-bold text-sm sm:text-base text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Chrome size={22} /> Continue with Google
              </button>
              <button 
                type="button"
                onClick={handleGitHubLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 border border-slate-200 rounded-full font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Github size={22} /> Continue with GitHub
              </button>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500 font-bold">Or</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl flex items-start gap-2 sm:gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-4 sm:space-y-6">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Email or Username"
                className="w-full px-4 sm:px-6 py-4 sm:py-5 bg-transparent border border-slate-300 rounded-full text-base sm:text-lg focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
              />
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Password"
                  className="w-full px-4 sm:px-6 py-4 sm:py-5 bg-transparent border border-slate-300 rounded-full text-base sm:text-lg focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
                />
                <Lock size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <button
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="w-full py-4 sm:py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-base sm:text-lg font-black rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Signing In...' : 'Sign In'}
                <ArrowRight size={24} strokeWidth={3} />
              </button>
            </div>

            <p className="text-center mt-8 lg:mt-10 text-sm text-slate-600">
              Don't have an account? <a href="/signup" className="font-bold text-indigo-600 hover:underline">Sign Up</a>
            </p>
          </div>

          <p className="text-center mt-8 lg:mt-12 text-xs text-slate-400">
            © 2005-2025 Memora Inc. • Contact Us • English ▼
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signin;