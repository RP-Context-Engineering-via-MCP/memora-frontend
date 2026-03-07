import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  Brain,
  Lightbulb,
  Activity,
  BarChart3,
  Filter,
  Calendar,
  ChevronRight,
  Info,
  ArrowUpRight,
  Zap,
  RefreshCw,
  X
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_ENDPOINTS } from '../config/api';

const DriftDashboard = ({ userId = 'user_123' }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDrift, setSelectedDrift] = useState(null);
  const [timeRange, setTimeRange] = useState(90);
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, [userId, timeRange]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.getDriftDashboard(userId, timeRange));
      if (!response.ok) throw new Error('Failed to load dashboard');
      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runDetection = async () => {
    setDetecting(true);
    setDetectError(null);
    try {
      const response = await fetch(API_ENDPOINTS.detectDrift(userId, false), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to run drift detection');
      // Refresh dashboard after successful detection
      await loadDashboard();
    } catch (err) {
      setDetectError(err.message);
    } finally {
      setDetecting(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'STRONG_DRIFT': 'from-red-500 to-pink-500',
      'MODERATE_DRIFT': 'from-orange-500 to-yellow-500',
      'WEAK_DRIFT': 'from-blue-500 to-cyan-500'
    };
    return colors[severity] || 'from-gray-500 to-gray-600';
  };

  const getSeverityBadgeColor = (severity) => {
    const colors = {
      'STRONG_DRIFT': 'bg-red-100 text-red-700 border-red-200',
      'MODERATE_DRIFT': 'bg-orange-100 text-orange-700 border-orange-200',
      'WEAK_DRIFT': 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[severity] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getImpactColor = (impact) => {
    const colors = {
      'high': 'text-red-600 bg-red-50',
      'medium': 'text-orange-600 bg-orange-50',
      'low': 'text-blue-600 bg-blue-50'
    };
    return colors[impact] || 'text-gray-600 bg-gray-50';
  };

  const getDriftTypeIcon = (type) => {
    const icons = {
      'TOPIC_EMERGENCE': <Sparkles className="w-5 h-5" />,
      'TOPIC_ABANDONMENT': <TrendingDown className="w-5 h-5" />,
      'PREFERENCE_REVERSAL': <RefreshCw className="w-5 h-5" />,
      'INTENSITY_SHIFT': <Activity className="w-5 h-5" />,
      'CONTEXT_EXPANSION': <ArrowUpRight className="w-5 h-5" />,
      'CONTEXT_CONTRACTION': <Target className="w-5 h-5" />
    };
    return icons[type] || <AlertCircle className="w-5 h-5" />;
  };

  const getDriftTypeDescription = (type) => {
    const descriptions = {
      'TOPIC_EMERGENCE': 'New interests appearing',
      'TOPIC_ABANDONMENT': 'Interests disappearing',
      'PREFERENCE_REVERSAL': 'Opinion flips',
      'INTENSITY_SHIFT': 'Conviction changes',
      'CONTEXT_EXPANSION': 'Broader application',
      'CONTEXT_CONTRACTION': 'Focused application'
    };
    return descriptions[type] || type;
  };

  const filteredTimeline = dashboard?.timeline?.filter(item => {
    const typeMatch = filterType === 'all' || item.drift_type === filterType;
    const severityMatch = filterSeverity === 'all' || item.severity === filterSeverity;
    return typeMatch && severityMatch;
  }) || [];

  const filteredInsights = dashboard?.insights?.filter(insight => {
    const rawEvent = dashboard.raw_events.find(e => e.drift_event_id === insight.drift_event_id);
    const typeMatch = filterType === 'all' || rawEvent?.drift_type === filterType;
    const severityMatch = filterSeverity === 'all' || rawEvent?.severity === filterSeverity;
    return typeMatch && severityMatch;
  }) || [];

  // Prepare chart data
  const severityChartData = dashboard?.summary?.by_severity ? 
    Object.entries(dashboard.summary.by_severity).map(([key, value]) => ({
      name: key.replace('_DRIFT', '').replace('_', ' '),
      value: value
    })) : [];

  const typeChartData = dashboard?.summary?.by_type ?
    Object.entries(dashboard.summary.by_type).map(([key, value]) => ({
      name: key.replace('_', ' '),
      value: value
    })) : [];

  const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-xl font-bold">Error Loading Dashboard</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadDashboard}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          {/* Detection Error Banner */}
          {detectError && (
            <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
              <AlertCircle size={16} className="flex-shrink-0" />
              {detectError}
              <button onClick={() => setDetectError(null)} className="ml-auto">
                <X size={14} />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Behavioral Drift Dashboard
              </h1>
              <p className="text-gray-600">
                Tracking changes in your AI interaction patterns
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
                <option value={180}>Last 6 months</option>
                <option value={365}>Last year</option>
              </select>
              <button
                onClick={runDetection}
                disabled={detecting}
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Run drift detection"
              >
                <Zap className={`w-5 h-5 ${detecting ? 'animate-pulse' : ''}`} />
                {detecting ? 'Detecting...' : 'Run Detection'}
              </button>
              <button
                onClick={loadDashboard}
                disabled={loading}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                title="Refresh dashboard"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Brain className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{dashboard?.summary?.total_drifts || 0}</span>
            </div>
            <h3 className="text-lg font-semibold opacity-90">Total Drifts</h3>
            <p className="text-sm opacity-75 mt-1">Detected changes</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="w-8 h-8 opacity-80" />
              <span className="text-xl font-bold">{dashboard?.summary?.highest_severity?.replace('_', ' ') || 'None'}</span>
            </div>
            <h3 className="text-lg font-semibold opacity-90">Highest Severity</h3>
            <p className="text-sm opacity-75 mt-1">Most significant change</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <span className="text-lg font-bold truncate">{dashboard?.summary?.most_common_type?.replace(/_/g, ' ') || 'None'}</span>
            </div>
            <h3 className="text-lg font-semibold opacity-90">Most Common</h3>
            <p className="text-sm opacity-75 mt-1">Frequent drift type</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 opacity-80" />
              <span className="text-sm font-semibold">{dashboard?.summary?.date_range?.from || '-'}</span>
            </div>
            <h3 className="text-lg font-semibold opacity-90">Date Range</h3>
            <p className="text-sm opacity-75 mt-1">to {dashboard?.summary?.date_range?.to || '-'}</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Drift by Severity
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={severityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-indigo-600" />
              Drift by Type
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={({ percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="TOPIC_EMERGENCE">Topic Emergence</option>
              <option value="TOPIC_ABANDONMENT">Topic Abandonment</option>
              <option value="PREFERENCE_REVERSAL">Preference Reversal</option>
              <option value="INTENSITY_SHIFT">Intensity Shift</option>
              <option value="CONTEXT_EXPANSION">Context Expansion</option>
              <option value="CONTEXT_CONTRACTION">Context Contraction</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Severities</option>
              <option value="STRONG_DRIFT">Strong Drift</option>
              <option value="MODERATE_DRIFT">Moderate Drift</option>
              <option value="WEAK_DRIFT">Weak Drift</option>
            </select>

            {(filterType !== 'all' || filterSeverity !== 'all') && (
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterSeverity('all');
                }}
                className="px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="w-7 h-7 text-indigo-600" />
            Timeline
          </h3>
          
          {filteredTimeline.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No drift events found matching the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTimeline.map((item, index) => (
                <motion.div
                  key={item.drift_event_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedDrift(item.drift_event_id)}
                  className="relative pl-8 pb-6 border-l-2 border-gray-200 hover:border-indigo-500 transition-colors cursor-pointer group"
                >
                  <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full bg-gradient-to-br ${getSeverityColor(item.severity)} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {getDriftTypeIcon(item.drift_type)}
                  </div>
                  
                  <div className="bg-gray-50 group-hover:bg-indigo-50 rounded-xl p-4 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityBadgeColor(item.severity)}`}>
                          {item.severity.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">{item.date_label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <p className="text-gray-700 font-medium">{item.short_description}</p>
                    <p className="text-xs text-gray-500 mt-1">{getDriftTypeDescription(item.drift_type)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Lightbulb className="w-7 h-7 text-yellow-500" />
            Insights & Recommendations
          </h3>
          
          {filteredInsights.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No insights available matching the selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredInsights.map((insight, index) => (
                <motion.div
                  key={insight.drift_event_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-2 rounded-2xl p-6 hover:shadow-xl transition-shadow ${
                    insight.impact_level === 'high' ? 'border-red-200 bg-red-50' :
                    insight.impact_level === 'medium' ? 'border-orange-200 bg-orange-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-800 flex-1">{insight.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getImpactColor(insight.impact_level)}`}>
                      {insight.impact_level.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">{insight.description}</p>
                  
                  {insight.affected_items && insight.affected_items.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Affected Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {insight.affected_items.map((item, i) => (
                          <span key={i} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">{insight.time_period}</p>
                  </div>
                  
                  {insight.recommendations && insight.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Recommendations:
                      </p>
                      <ul className="space-y-2">
                        {insight.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Drift Detail Modal */}
        <AnimatePresence>
          {selectedDrift && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDrift(null)}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Drift Event Details</h3>
                  <button
                    onClick={() => setSelectedDrift(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                
                {(() => {
                  const event = dashboard.raw_events.find(e => e.drift_event_id === selectedDrift);
                  if (!event) return <p>Event not found</p>;
                  
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-600 mb-1">Drift Type</p>
                          <p className="font-semibold text-gray-800">{event.drift_type.replace(/_/g, ' ')}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-600 mb-1">Severity</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getSeverityBadgeColor(event.severity)}`}>
                            {event.severity}
                          </span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-600 mb-1">Drift Score</p>
                          <p className="font-semibold text-gray-800">{(event.drift_score * 100).toFixed(1)}%</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-600 mb-1">Confidence</p>
                          <p className="font-semibold text-gray-800">{(event.confidence * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                      
                      {event.affected_targets && event.affected_targets.length > 0 && (
                        <div>
                          <p className="font-semibold text-gray-800 mb-2">Affected Targets:</p>
                          <div className="flex flex-wrap gap-2">
                            {event.affected_targets.map((target, i) => (
                              <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                {target}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {event.evidence && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="font-semibold text-gray-800 mb-2">Evidence:</p>
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(event.evidence, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default DriftDashboard;
