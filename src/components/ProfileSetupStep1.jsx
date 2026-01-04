// src/components/ProfileSetupStep1.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Code, 
  PenTool, 
  GraduationCap, 
  User,
  ChevronRight,
  Search,
  Wrench,
  Lightbulb,
  Target,
  Brain,
  TrendingUp,
  Palette,
  Laptop,
  Briefcase,
  Zap,
  Database
} from 'lucide-react';

const ProfileSetupStep1 = () => {
  const [selectedIntents, setSelectedIntents] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Intent options based on onboard.txt
  const intentOptions = [
    { label: 'Learn or understand new topics', code: 'LEARNING', icon: <BookOpen size={24} /> },
    { label: 'Research or explore information', code: 'EXPLORATION', icon: <Search size={24} /> },
    { label: 'Solve technical or coding problems', code: 'PROBLEM_SOLVING', icon: <Wrench size={24} /> },
    { label: 'Write or create content', code: 'CONTENT_CREATION', icon: <PenTool size={24} /> },
    { label: 'Plan, organize, or make decisions', code: 'PLANNING', icon: <Target size={24} /> },
    { label: 'Brainstorm ideas', code: 'IDEATION', icon: <Lightbulb size={24} /> },
    { label: 'General or casual assistance', code: 'GENERAL_HELP', icon: <User size={24} /> },
  ];

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

  const handleIntentToggle = (code) => {
    if (selectedIntents.includes(code)) {
      setSelectedIntents(selectedIntents.filter(c => c !== code));
    } else if (selectedIntents.length < 3) {
      setSelectedIntents([...selectedIntents, code]);
    }
    setError('');
  };

  const handleContinue = () => {
    if (selectedIntents.length === 0) {
      setError('Please select at least one intent');
      return;
    }

    // Store selections in sessionStorage to pass to Step 2
    sessionStorage.setItem('onboardingStep1', JSON.stringify({
      intents: selectedIntents
    }));
    navigate('/profile-setup/step2');
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-900/90 to-slate-900 text-white relative overflow-hidden rounded-r-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="relative z-10 p-16 flex flex-col justify-center">
          <h1 className="text-6xl font-black tracking-tight leading-tight mb-8">
            Personalize<br />Your AI<br />Experience
          </h1>
          <p className="text-xl text-indigo-100 font-medium max-w-lg">
            Tell us how you use AI — we’ll tailor responses, tone, and depth from day one.
          </p>
        </div>
      </div>
      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-8 py-8 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-slate-900">Set up your initial profile</h2>
              <p className="text-slate-500 mt-3">Step 1 of 2 • What do you use AI for?</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-semibold">
                {error}
              </div>
            )}

            {/* Question 1: Intent (up to 3, ordered) */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                What do you mainly want to use this AI for? <span className="text-rose-500">*</span>
              </h3>
              <p className="text-sm text-slate-500 mb-6">Select up to 3, in order of importance</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intentOptions.map((opt) => {
                  const isSelected = selectedIntents.includes(opt.code);
                  const selectionOrder = selectedIntents.indexOf(opt.code);
                  const isDisabled = !isSelected && selectedIntents.length >= 3;
                  
                  return (
                    <button
                      key={opt.code}
                      onClick={() => handleIntentToggle(opt.code)}
                      disabled={isDisabled}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all relative ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md'
                          : isDisabled
                          ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSelected 
                          ? 'bg-indigo-200 text-indigo-700' 
                          : isDisabled
                          ? 'bg-slate-100 text-slate-300'
                          : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        {opt.icon}
                      </div>
                      <span className="font-semibold text-sm text-left flex-1">{opt.label}</span>
                      {isSelected && (
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg">
                          {selectionOrder + 1}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedIntents.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs font-bold text-blue-700">
                    Selected order: {selectedIntents.map((code, idx) => {
                      const opt = intentOptions.find(o => o.code === code);
                      return `${idx + 1}. ${opt?.label}`;
                    }).join(' → ')}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-12 flex justify-center">
              <button
                onClick={handleContinue}
                className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-lg font-black rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                Continue
                <ChevronRight size={24} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupStep1;