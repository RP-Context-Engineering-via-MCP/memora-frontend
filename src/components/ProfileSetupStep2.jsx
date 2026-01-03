// src/components/ProfileSetupStep2.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Target, Layers, Check, AlertCircle, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';

const ProfileSetupStep2 = () => {
  const [step1Data, setStep1Data] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Load Step 1 data from sessionStorage
    const savedData = sessionStorage.getItem('onboardingStep1');
    if (!savedData) {
      navigate('/profile-setup/step1');
      return;
    }
    const data = JSON.parse(savedData);
    setStep1Data(data);
  }, [navigate]);

  const calculateScores = () => {
    if (!step1Data) return null;

    // Intent weights based on selection order (from onboard.txt)
    const intentWeights = [1.0, 0.6, 0.3];
    
    // Interest weights based on selection order (from onboard.txt)
    const interestWeights = [1.0, 0.7, 0.4, 0.2];

    // Calculate intent scores
    const intents = {};
    step1Data.intents.forEach((intent, index) => {
      intents[intent] = intentWeights[index];
    });

    // Calculate interest scores
    const interests = {};
    step1Data.interests.forEach((interest, index) => {
      interests[interest] = interestWeights[index];
    });

    return { intents, interests };
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User session not found. Please sign in again.');
      }

      const scores = calculateScores();
      
      // Build the request payload matching the API structure
      const payload = {
        behavior: {
          intents: scores.intents,
          interests: scores.interests,
          signals: {
            MULTI_STEP: 0.50,  // Default values for cold start
            ITERATIVE: 0.50
          },
          behavior_level: "INTERMEDIATE",  // Default for cold start
          consistency: 0,
          complexity: 0
        },
        user_id: userId
      };

      console.log('Submitting profile:', payload);

      const response = await fetch(`${API_BASE_URL}/api/predefined-profiles/assign-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to assign profile');
      }

      console.log('Profile assigned successfully:', data);
      setSuccess(true);
      
      // Clear onboarding data
      sessionStorage.removeItem('onboardingStep1');
      
      // Navigate to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      console.error('Profile assignment error:', err);
      setError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!step1Data) {
    return null;
  }

  const scores = calculateScores();
  
  // Labels mapping
  const intentLabels = {
    LEARNING: 'Learn or understand new topics',
    EXPLORATION: 'Research or explore information',
    PROBLEM_SOLVING: 'Solve technical or coding problems',
    CONTENT_CREATION: 'Write or create content',
    PLANNING: 'Plan, organize, or make decisions',
    IDEATION: 'Brainstorm ideas',
    GENERAL_HELP: 'General or casual assistance'
  };

  const interestLabels = {
    SOFTWARE_DEV: 'Software Development',
    AI_ML: 'AI / ML',
    DATA_SCIENCE: 'Data Science',
    ACADEMIC: 'Academic Studies',
    BUSINESS: 'Business',
    PRODUCTIVITY: 'Productivity',
    CREATIVE_WRITING: 'Creative Writing',
    DESIGN: 'Design & UX',
    SCIENCE: 'Science',
    FINANCE: 'Finance',
    GENERAL: 'General Knowledge'
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-900/90 to-slate-900 text-white relative overflow-hidden rounded-r-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="relative z-10 p-16 flex flex-col justify-center">
          <h1 className="text-6xl font-black tracking-tight leading-tight mb-8">
            Your AI<br />Profile is<br />Ready
          </h1>
          <p className="text-xl text-indigo-100 font-medium max-w-lg">
            This identity will evolve as you use AI tools — always under your control.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-8 py-8 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-slate-900">Review your profile</h2>
              <p className="text-slate-500 mt-3">Step 2 of 2 • Confirm and submit</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-200 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} className="text-rose-600" />
                <span className="text-rose-600 text-sm font-semibold">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center gap-3">
                <Check size={20} className="text-emerald-600" />
                <span className="text-emerald-600 text-sm font-semibold">Profile created successfully! Redirecting...</span>
              </div>
            )}

            {/* Intent Summary */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                <Target size={16} /> Your Intent Priorities
              </h3>
              <div className="space-y-3">
                {step1Data.intents.map((intent, index) => (
                  <div key={intent} className="flex items-center gap-4 p-5 bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-slate-900">{intentLabels[intent]}</span>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-2 bg-slate-200 rounded-full flex-1 max-w-[200px]">
                          <div
                            className="h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                            style={{ width: `${scores.intents[intent] * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-black text-indigo-600">
                          Weight: {scores.intents[intent].toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interest Summary */}
            <div className="mb-10">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                <Layers size={16} /> Your Interest Priorities
              </h3>
              <div className="space-y-3">
                {step1Data.interests.map((interest, index) => (
                  <div key={interest} className="flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-slate-900">{interestLabels[interest]}</span>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-2 bg-slate-200 rounded-full flex-1 max-w-[200px]">
                          <div
                            className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                            style={{ width: `${scores.interests[interest] * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-black text-emerald-600">
                          Weight: {scores.interests[interest].toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Preview */}
            <div className="mb-10 bg-slate-900 rounded-3xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck size={20} className="text-indigo-300" />
                <span className="text-sm font-bold uppercase text-indigo-300">Profile Scores to Submit</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Intents</h4>
                  {Object.entries(scores.intents).map(([intent, score]) => (
                    <div key={intent} className="mb-2 flex justify-between items-center">
                      <span className="text-sm text-slate-300">{intent}</span>
                      <span className="text-sm font-bold text-indigo-300">{score.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Interests</h4>
                  {Object.entries(scores.interests).map(([interest, score]) => (
                    <div key={interest} className="mb-2 flex justify-between items-center">
                      <span className="text-sm text-slate-300">{interest}</span>
                      <span className="text-sm font-bold text-emerald-300">{score.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={loading || success}
                className={`px-16 py-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xl font-black rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center gap-4 mx-auto ${
                  (loading || success) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={28} className="animate-spin" />
                    Creating Profile...
                  </>
                ) : success ? (
                  <>
                    <Check size={28} strokeWidth={3} />
                    Profile Created!
                  </>
                ) : (
                  <>
                    Confirm and Enter Dashboard
                    <Check size={28} strokeWidth={3} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupStep2;