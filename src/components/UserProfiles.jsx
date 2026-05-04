import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  Code,
  Palette,
  Heart,
  GraduationCap,
  Users,
  Sparkles,
  CheckCircle,
  Calendar,
  Activity,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Shield,
  Target,
  Award,
  BarChart3,
  Info
} from 'lucide-react';

const API_BASE_URL = 'https://research.digitix365.com:8002';

const UserProfiles = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Profile metadata
  const PROFILE_METADATA = {
    P1: {
      name: 'Knowledge Seeker',
      description: 'Learning-focused interactions, explanations, and concept exploration',
      icon: GraduationCap,
      color: 'from-indigo-500 to-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-700'
    },

    P2: {
      name: 'Productivity Professional',
      description: 'Work-related tasks, efficiency, and professional productivity',
      icon: Briefcase,
      color: 'from-blue-500 to-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700'
    },

    P3: {
      name: 'Technical Problem Solver',
      description: 'Programming, debugging, and complex technical problem solving',
      icon: Code,
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700'
    },

    P4: {
      name: 'Creative Generator',
      description: 'Creative writing, ideation, and content generation',
      icon: Palette,
      color: 'from-pink-500 to-pink-700',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-700'
    },

    P5: {
      name: 'Lifestyle Advisor Seeker',
      description: 'Personal guidance, self-improvement, and lifestyle advice',
      icon: Heart,
      color: 'from-rose-500 to-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      textColor: 'text-rose-700'
    },

    P6: {
      name: 'Casual Explorer',
      description: 'Casual use, curiosity-driven queries, and entertainment',
      icon: Users,
      color: 'from-teal-500 to-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-700'
    }
  };

  // Get user ID from session
  useEffect(() => {
    const sessionUserId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    if (sessionUserId) {
      setUserId(sessionUserId);
      fetchUserProfiles(sessionUserId);
    } else {
      setError('User session not found. Please sign in again.');
      setLoading(false);
    }
  }, []);

  // Fetch user profiles from API
  const fetchUserProfiles = async (uid) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/api/predefined-profiles/user/${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }

      const data = await response.json();
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(err.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  // Assign profile based on behavior JSON
  const assignProfile = async () => {
    try {
      setAssigning(true);
      setJsonError('');

      // Validate JSON
      let behaviorData;
      try {
        behaviorData = JSON.parse(jsonInput);
      } catch (err) {
        setJsonError('Invalid JSON format. Please check your input.');
        return;
      }

      // Validate required fields
      if (!behaviorData.extracted_behavior) {
        setJsonError('JSON must contain "extracted_behavior" field.');
        return;
      }

      // Validate extracted_behavior is either object or array
      if (typeof behaviorData.extracted_behavior !== 'object') {
        setJsonError('"extracted_behavior" field must be an object or an array.');
        return;
      }

      // Prepare the payload
      const payload = {
        ...behaviorData,
        user_id: userId
      };

      // Send POST request
      const response = await fetch(`${API_BASE_URL}/api/predefined-profiles/assign-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to assign profile');
      }

      const result = await response.json();
      
      // Close form and refresh data
      setShowAssignForm(false);
      setJsonInput('');
      await fetchUserProfiles(userId);
      
      // Show success message (you can enhance this with a toast notification)
      // Removed blocking alert to improve UX; consider adding a toast notification here
      console.log(`Profile assigned successfully. New profile: ${result.assigned_profile_id || 'Updated'}`);
    } catch (err) {
      console.error('Error assigning profile:', err);
      setJsonError(err.message || 'Failed to assign profile');
    } finally {
      setAssigning(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get profile metadata
  const getProfileMetadata = (profileCode) => {
    return PROFILE_METADATA[profileCode] || {
      name: profileCode,
      description: 'AI interaction profile',
      icon: User,
      color: 'from-gray-500 to-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700'
    };
  };

  // Get rank badge styling
  const getRankBadge = (rank) => {
    const badges = {
      1: { bg: 'bg-gradient-to-br from-amber-400 to-amber-600', text: 'text-white', icon: '🥇' },
      2: { bg: 'bg-gradient-to-br from-slate-300 to-slate-500', text: 'text-white', icon: '🥈' },
      3: { bg: 'bg-gradient-to-br from-orange-400 to-orange-600', text: 'text-white', icon: '🥉' },
    };
    return badges[rank] || { bg: 'bg-slate-100', text: 'text-slate-600', icon: '' };
  };

  // Get assigned profile
  const getAssignedProfile = () => {
    if (!profileData || !profileData.aggregated_rankings) return null;
    return profileData.aggregated_rankings.find(
      p => p.profile_code === profileData.assigned_profile_id
    );
  };

  // Assigned Profile Hero Card Component
  const AssignedProfileHero = () => {
    if (!profileData) return null;
    
    const assignedProfile = getAssignedProfile();
    
    // Handle case when no profile is assigned yet
    if (!assignedProfile || !profileData.assigned_profile_id) {
      return (
        <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-3xl p-8 shadow-2xl text-white mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                <AlertCircle size={40} strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-4xl font-black">No Profile Assigned Yet</h2>
                </div>
                <p className="text-xl text-white/90 mb-3">
                  Submit behavior data to get your personalized AI profile assigned
                </p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm font-bold border border-white/30">
                    <Shield size={18} />
                    PENDING ASSIGNMENT
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Target size={20} />
                <span className="text-sm font-bold uppercase tracking-wide">Avg Score</span>
              </div>
              <p className="text-3xl font-black">N/A</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={20} />
                <span className="text-sm font-bold uppercase tracking-wide">Max Score</span>
              </div>
              <p className="text-3xl font-black">N/A</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={20} />
                <span className="text-sm font-bold uppercase tracking-wide">Sessions</span>
              </div>
              <p className="text-3xl font-black">0</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} />
                <span className="text-sm font-bold uppercase tracking-wide">Top Streak</span>
              </div>
              <p className="text-3xl font-black">0</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
              <p className="text-xs font-bold uppercase tracking-wide mb-1">Status</p>
              <p className="text-lg font-black">{profileData.status}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
              <p className="text-xs font-bold uppercase tracking-wide mb-1">Confidence</p>
              <p className="text-lg font-black">{profileData.confidence_level}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
              <p className="text-xs font-bold uppercase tracking-wide mb-1">User Mode</p>
              <p className="text-lg font-black">{profileData.user_mode}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
              <p className="text-xs font-bold uppercase tracking-wide mb-1">Prompts</p>
              <p className="text-lg font-black">{profileData.prompt_count}</p>
            </div>
          </div>
        </div>
      );
    }

    // Render assigned profile
    const metadata = getProfileMetadata(assignedProfile.profile_code);
    const IconComponent = metadata.icon;
    const rankBadge = getRankBadge(1);

    return (
      <div className={`bg-gradient-to-br ${metadata.color} rounded-3xl p-8 shadow-2xl text-white mb-8`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
              <IconComponent size={40} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-4xl font-black">{metadata.name}</h2>
                <CheckCircle size={32} strokeWidth={2.5} />
              </div>
              <p className="text-xl text-white/90 mb-3">{metadata.description}</p>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm font-bold border border-white/30">
                  <Shield size={18} />
                  ASSIGNED PROFILE
                </span>
                <span className={`inline-flex items-center justify-center px-4 py-2 rounded-xl font-black ${rankBadge.bg}`}>
                  {rankBadge.icon} RANK #1
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Target size={20} />
              <span className="text-sm font-bold uppercase tracking-wide">Avg Score</span>
            </div>
            <p className="text-3xl font-black">{(assignedProfile.average_score * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={20} />
              <span className="text-sm font-bold uppercase tracking-wide">Max Score</span>
            </div>
            <p className="text-3xl font-black">{(assignedProfile.max_score * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={20} />
              <span className="text-sm font-bold uppercase tracking-wide">Sessions</span>
            </div>
            <p className="text-3xl font-black">{assignedProfile.observations}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} />
              <span className="text-sm font-bold uppercase tracking-wide">Top Streak</span>
            </div>
            <p className="text-3xl font-black">{assignedProfile.consecutive_top_count}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
            <p className="text-xs font-bold uppercase tracking-wide mb-1">Status</p>
            <p className="text-lg font-black">{profileData.status}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
            <p className="text-xs font-bold uppercase tracking-wide mb-1">Confidence</p>
            <p className="text-lg font-black">{profileData.confidence_level}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
            <p className="text-xs font-bold uppercase tracking-wide mb-1">User Mode</p>
            <p className="text-lg font-black">{profileData.user_mode}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
            <p className="text-xs font-bold uppercase tracking-wide mb-1">Prompts</p>
            <p className="text-lg font-black">{profileData.prompt_count}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
            <p className="text-xs font-bold uppercase tracking-wide mb-1">Last Updated</p>
            <p className="text-lg font-black">{formatDate(assignedProfile.updated_at)}</p>
          </div>
        </div>
      </div>
    );
  };

  // Profile Ranking Card Component
  const ProfileRankingCard = ({ profile, rank, isAssigned }) => {
    const metadata = getProfileMetadata(profile.profile_code);
    const IconComponent = metadata.icon;
    const rankBadge = getRankBadge(rank);

    return (
      <div
        onClick={() => setSelectedProfile(profile)}
        className={`group bg-white rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${
          isAssigned 
            ? 'border-emerald-400 shadow-lg' 
            : 'border-slate-200 hover:border-indigo-300'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${metadata.color} flex items-center justify-center text-white shadow-lg`}>
              <IconComponent size={28} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-slate-900">{metadata.name}</h3>
                {isAssigned && <CheckCircle className="text-emerald-600" size={18} />}
              </div>
              <p className="text-sm text-slate-600 line-clamp-1">{metadata.description}</p>
            </div>
          </div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black ${rankBadge.bg} ${rankBadge.text} ml-2`}>
            #{rank}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <p className="text-xl font-black text-slate-900">{(profile.average_score * 100).toFixed(0)}%</p>
            <p className="text-xs text-slate-500 font-semibold">Avg</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-slate-900">{(profile.max_score * 100).toFixed(0)}%</p>
            <p className="text-xs text-slate-500 font-semibold">Max</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-slate-900">{profile.observations}</p>
            <p className="text-xs text-slate-500 font-semibold">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-emerald-600">{profile.consecutive_top_count}</p>
            <p className="text-xs text-slate-500 font-semibold">Streak</p>
          </div>
        </div>

        {isAssigned && (
          <div className="pt-4 border-t border-emerald-100">
            <div className="flex items-center gap-2 text-sm text-emerald-700 font-bold">
              <Shield size={16} />
              <span>Currently Assigned</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Profile Detail Modal
  const ProfileDetailModal = ({ profile, onClose }) => {
    if (!profile) return null;
    
    const metadata = getProfileMetadata(profile.profile_code);
    const IconComponent = metadata.icon;
    const isAssigned = profileData?.assigned_profile_id === profile.profile_code;
    const rank = profileData?.aggregated_rankings?.findIndex(p => p.profile_code === profile.profile_code) + 1 || 0;
    const rankBadge = getRankBadge(rank);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={`sticky top-0 p-8 rounded-t-3xl bg-gradient-to-br ${metadata.color}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-xl">
                  <IconComponent size={40} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-4xl font-black text-white">{metadata.name}</h2>
                    {isAssigned && <CheckCircle className="text-white" size={32} />}
                  </div>
                  <p className="text-white/90 text-lg mb-3">{metadata.description}</p>
                  <div className="flex items-center gap-3">
                    {isAssigned && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm font-bold border border-white/30 text-white">
                        <Shield size={18} />
                        ASSIGNED
                      </span>
                    )}
                    <span className={`inline-flex items-center justify-center px-4 py-2 rounded-xl font-black ${rankBadge.bg} ${rankBadge.text}`}>
                      {rankBadge.icon} RANK #{rank}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Performance Metrics */}
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <TrendingUp size={24} className="text-indigo-600" />
                </div>
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="text-indigo-600" size={24} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Average Score</span>
                  </div>
                  <p className="text-4xl font-black text-slate-900">{(profile.average_score * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="text-blue-600" size={24} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Max Score</span>
                  </div>
                  <p className="text-4xl font-black text-slate-900">{(profile.max_score * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="text-purple-600" size={24} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Cumulative</span>
                  </div>
                  <p className="text-4xl font-black text-slate-900">{profile.cumulative_score.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="text-emerald-600" size={24} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Sessions</span>
                  </div>
                  <p className="text-4xl font-black text-slate-900">{profile.observations}</p>
                </div>
              </div>
            </div>

            {/* Ranking Stats */}
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Award size={24} className="text-amber-600" />
                </div>
                Ranking Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-14 h-14 rounded-xl ${rankBadge.bg} ${rankBadge.text} flex items-center justify-center text-xl font-black`}>
                      #{rank}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Current Rank</p>
                      <p className="text-lg text-slate-600">Out of {profileData?.aggregated_rankings?.length || 0} profiles</p>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Top Streak</p>
                  <p className="text-5xl font-black text-emerald-600 mb-1">{profile.consecutive_top_count}</p>
                  <p className="text-sm text-slate-500">Consecutive times ranked #1</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Drop Count</p>
                  <p className="text-5xl font-black text-amber-600 mb-1">{profile.consecutive_drop_count}</p>
                  <p className="text-sm text-slate-500">Consecutive rank drops</p>
                </div>
              </div>
            </div>

            {/* Timeline Info */}
            <div className="mb-6">
              <h3 className="text-2xl font-black text-slate-900 mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Calendar size={24} className="text-blue-600" />
                </div>
                Timeline
              </h3>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Calendar className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Last Updated</p>
                    <p className="text-slate-600">{formatDate(profile.updated_at)}</p>
                    <p className="text-sm text-slate-500 mt-1">{new Date(profile.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Assign Profile Inline Form
  const AssignProfileForm = () => {
    return (
      <div className="bg-white rounded-2xl border-2 border-indigo-300 shadow-xl mb-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-white mb-1">Assign Profile with Behavior Data</h3>
              <p className="text-indigo-100">Submit your behavior JSON to get a personalized profile</p>
            </div>
            <button
              onClick={() => {
                setShowAssignForm(false);
                setJsonInput('');
                setJsonError('');
              }}
              disabled={assigning}
              className="text-white/80 hover:text-white transition-colors p-2 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* JSON Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-900 mb-3">
              Behavior JSON Data
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setJsonError('');
              }}
              placeholder='{\n  "extracted_behavior": {\n    "intents": { "PROBLEM_SOLVING": 0.9 },\n    "interests": { "PROGRAMMING": 0.85, "AI": 0.8 },\n    "signals": { "MULTI_STEP": 0.8, "ITERATIVE": 0.6 },\n    "behavior_level": "ADVANCED",\n    "consistency": 0.5,\n    "complexity": 0.6\n  }\n}'
              className="w-full h-64 px-4 py-3 border-2 border-slate-300 rounded-xl font-mono text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
              disabled={assigning}
            />
            <p className="text-xs text-slate-500 mt-2">
              Paste your extracted_behavior JSON data. Supports single behavior object or array of behaviors. Do not include user_id field.
            </p>
          </div>

          {/* Error Message */}
          {jsonError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                <div>
                  <p className="font-bold text-red-900 mb-1">Error</p>
                  <p className="text-sm text-red-700">{jsonError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={assignProfile}
              disabled={assigning || !jsonInput.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              {assigning ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Enter behavioural data
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowAssignForm(false);
                setJsonInput('');
                setJsonError('');
              }}
              disabled={assigning}
              className="px-8 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-900 font-bold py-4 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black text-slate-900 mb-2">User Profiles</h1>
            <p className="text-xl text-slate-600">Your personalized AI interaction profiles ranked by performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAssignForm(!showAssignForm)}
              disabled={loading || !userId}
              className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Sparkles size={20} />
              {showAssignForm ? 'Close the tab' : 'Enter Prompt data'}
            </button>
            <button
              onClick={() => userId && fetchUserProfiles(userId)}
              disabled={loading}
              className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Assign Profile Form - Inline Dropdown */}
        {showAssignForm && <AssignProfileForm />}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <p className="text-xl font-bold text-slate-700">Loading your profiles...</p>
            <p className="text-sm text-slate-500 mt-2">Please wait while we fetch your data</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white border-2 border-red-200 rounded-3xl p-12 text-center shadow-xl">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-600" size={48} />
            </div>
            <h3 className="text-2xl font-black text-red-900 mb-3">Error Loading Profiles</h3>
            <p className="text-red-700 mb-6 text-lg">{error}</p>
            <button
              onClick={() => userId && fetchUserProfiles(userId)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Success State */}
        {!loading && !error && profileData && (
          <>
            {/* Assigned Profile Hero Section */}
            <AssignedProfileHero />

            {/* All Profiles Ranking */}
            {profileData.aggregated_rankings && profileData.aggregated_rankings.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">Profile Rankings</h2>
                    <p className="text-slate-600">All profiles sorted by performance</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profileData.aggregated_rankings.map((profile, index) => (
                    <ProfileRankingCard
                      key={profile.profile_code}
                      profile={profile}
                      rank={index + 1}
                      isAssigned={profile.profile_code === profileData.assigned_profile_id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Info Footer */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Info size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">About Profile Rankings</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Profiles are automatically ranked based on their performance scores across your interactions. 
                    The assigned profile is the one that best matches your current usage patterns and preferences. 
                    Rankings are updated in real-time as you continue to use the system.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && !profileData && (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-16 text-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-slate-400" size={56} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3">No Profile Data Available</h3>
            <p className="text-slate-600 text-lg mb-8">
              {userId ? "We couldn't find any profile data for your account." : "Please sign in to view your profiles."}
            </p>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 shadow-lg">
              Get Started
            </button>
          </div>
        )}
      </div>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <ProfileDetailModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
};

export default UserProfiles;
