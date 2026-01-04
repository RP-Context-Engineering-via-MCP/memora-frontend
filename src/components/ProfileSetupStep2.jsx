// src/components/ProfileSetupStep2.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Target, 
  Layers, 
  Check, 
  AlertCircle, 
  Loader2,
  Code,
  Brain,
  Database,
  GraduationCap,
  Briefcase,
  Zap,
  PenTool,
  Palette,
  Laptop,
  TrendingUp,
  BookOpen
} from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';

const ProfileSetupStep2 = () => {
  const [step1Data, setStep1Data] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
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

  const handleInterestToggle = (code) => {
    if (selectedInterests.includes(code)) {
      setSelectedInterests(selectedInterests.filter(c => c !== code));
    } else if (selectedInterests.length < 4) {
      setSelectedInterests([...selectedInterests, code]);
    }
    setError('');
  };

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
    selectedInterests.forEach((interest, index) => {
      interests[interest] = interestWeights[index];
    });

    return { intents, interests };
  };

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) {
      setError('Please select at least one area of interest');
      return;
    }

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

  // Interest areas based on onboard.txt
  const interestOptions = [
    { label: 'Software Development', code: 'SOFTWARE_DEV', icon: <Code size={20} /> },
    { label: 'Artificial Intelligence / ML', code: 'AI_ML', icon: <Brain size={20} /> },
    { label: 'Data Science', code: 'DATA_SCIENCE', icon: <Database size={20} /> },
    { label: 'Academic Studies', code: 'ACADEMIC', icon: <GraduationCap size={20} /> },
    { label: 'Business & Entrepreneurship', code: 'BUSINESS', icon: <Briefcase size={20} /> },
    { label: 'Personal Productivity', code: 'PRODUCTIVITY', icon: <Zap size={20} /> },
    { label: 'Creative Writing', code: 'CREATIVE_WRITING', icon: <PenTool size={20} /> },
    { label: 'Design & UX', code: 'DESIGN', icon: <Palette size={20} /> },
    { label: 'Science & Engineering', code: 'SCIENCE', icon: <Laptop size={20} /> },
    { label: 'Finance & Economics', code: 'FINANCE', icon: <TrendingUp size={20} /> },
    { label: 'General Knowledge', code: 'GENERAL', icon: <BookOpen size={20} /> },
  ];

  const scores = calculateScores();

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
              <h2 className="text-4xl font-black text-slate-900">Choose your interests</h2>
              <p className="text-slate-500 mt-3">Step 2 of 2 • What areas interest you?</p>
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

            {/* Question: Interest Areas (up to 4, ordered) */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                Which areas are you most interested in? <span className="text-rose-500">*</span>
              </h3>
              <p className="text-sm text-slate-500 mb-6">Select up to 4, in order of importance</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interestOptions.map((opt) => {
                  const isSelected = selectedInterests.includes(opt.code);
                  const selectionOrder = selectedInterests.indexOf(opt.code);
                  const isDisabled = !isSelected && selectedInterests.length >= 4;
                  
                  return (
                    <button
                      key={opt.code}
                      onClick={() => handleInterestToggle(opt.code)}
                      disabled={isDisabled}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all relative ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                          : isDisabled
                          ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg z-10">
                          {selectionOrder + 1}
                        </div>
                      )}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected 
                          ? 'bg-emerald-200 text-emerald-700' 
                          : isDisabled
                          ? 'bg-slate-100 text-slate-300'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {opt.icon}
                      </div>
                      <span className="font-medium text-xs text-center leading-tight">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {selectedInterests.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
                  <p className="text-xs font-bold text-emerald-700">
                    Selected order: {selectedInterests.map((code, idx) => {
                      const opt = interestOptions.find(o => o.code === code);
                      return `${idx + 1}. ${opt?.label}`;
                    }).join(' → ')}
                  </p>
                </div>
              )}
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