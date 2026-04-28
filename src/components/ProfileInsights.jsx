import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, Zap, Fingerprint, AlertCircle, Loader2,
  Eye, EyeOff, RefreshCw, MessageSquare, Copy, Check,
  ChevronDown, ChevronUp
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis
} from 'recharts';
import { API_ENDPOINTS } from '../config/api';

// ── Constants ──────────────────────────────────────────────────────
const SERIES_COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#a855f7','#0ea5e9'];
const STATUS_COLORS = {
  'Stable Fact':'#ef4444','Stable':'#22c55e','Emerging':'#f59e0b',
  'ARCHIVED_CORE':'#94a3b8','CONTRADICTED':'#a855f7','Noise':'#cbd5e1'
};
const AXES = [
  { key:'core_score', label:'Core Score' },
  { key:'consistency_score', label:'Consistency' },
  { key:'trend_score_norm', label:'Trend' },
  { key:'avg_credibility', label:'Credibility' },
  { key:'frequency_norm', label:'Frequency' },
];

const clamp = (v,lo=0,hi=1) => Math.min(hi,Math.max(lo,v));

function normalizeEntry(e, maxFreq) {
  return {
    label: e.representative_topics?.[0] ?? `Cluster ${e.cluster_id}`,
    core_score: clamp(e.core_score),
    consistency_score: clamp(e.consistency_score),
    trend_score_norm: clamp((e.trend_score+1)/2),
    avg_credibility: clamp(e.avg_credibility ?? 0.5),
    frequency_norm: maxFreq > 0 ? clamp(e.frequency/maxFreq) : 0,
  };
}

function buildRadarData(normalized) {
  return AXES.map(({ key, label }) => {
    const row = { axis: label };
    normalized.forEach((e, i) => { row[`s${i}`] = e[key]; });
    return row;
  });
}

// ── Tooltip components ─────────────────────────────────────────────
const RadarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map(p => <div key={p.name} className="text-slate-500">{p.value.toFixed(2)}</div>)}
    </div>
  );
};

const ScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const pt = payload[0].payload;
  return (
    <div className="max-w-xs rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-lg text-xs">
      <p className="font-bold text-slate-800 mb-1 truncate">{pt.label || 'Unlabeled'}</p>
      <p className="text-slate-500 line-clamp-2">{pt.text}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[pt.status] || '#cbd5e1' }} />
        <span className="text-slate-400">{pt.status}</span>
      </div>
    </div>
  );
};

// ── Interest status card ───────────────────────────────────────────
function StatusCard({ title, items, accentColor, badgeClasses }) {
  const [open, setOpen] = useState(true);
  if (!items?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)} className={`w-full text-left border-l-4 ${accentColor} px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors`}>
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && (
        <ul className="divide-y divide-slate-100">
          {items.map((item, i) => (
            <li key={i} className="px-5 py-3.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{item.representative_topics?.join(' · ')}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-400 font-medium">
                  <span>Freq: {item.frequency}</span>
                  <span>Consistency: {item.consistency_score?.toFixed(2)}</span>
                  <span>Trend: {item.trend_score?.toFixed(2)}</span>
                  <span>Credibility: {(item.avg_credibility ?? 0.5).toFixed(2)}</span>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${badgeClasses}`}>
                {item.core_score?.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
const ProfileInsights = () => {
  const [profileData, setProfileData] = useState(null);
  const [embeddingData, setEmbeddingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  const [activeJobId, setActiveJobId] = useState(null);
  const [jobPolling, setJobPolling] = useState(false);
  const [identityPrompt, setIdentityPrompt] = useState(null);

  const getUserId = () =>
    import.meta.env.VITE_CBIE_USER_ID ||
    sessionStorage.getItem('userId') ||
    localStorage.getItem('userId') ||
    'pilot_user_1';

  // ── Fetch profile data ───────────────────────────────────────────
  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = getUserId();

      // Try /admin/users/{id}/profile first (has categorized interests)
      let profile = null;
      try {
        const adminRes = await fetch(API_ENDPOINTS.cbieCoreProfile(userId));
        if (adminRes.ok) profile = await adminRes.json();
      } catch {}

      // Fallback: /profiles/{id} (flat confirmed_interests array)
      if (!profile) {
        const profRes = await fetch(API_ENDPOINTS.cbieProfile(userId));
        if (!profRes.ok) throw new Error('No profile found for this user in CBIE engine');
        const raw = await profRes.json();
        // Transform flat list into categorized structure
        const interests = raw.confirmed_interests || [];
        profile = {
          user_id: raw.user_id,
          total_raw_behaviors: raw.total_raw_behaviors,
          critical_constraints: interests.filter(i => i.status === 'Stable Fact'),
          stable_interests: interests.filter(i => i.status === 'Stable'),
          emerging_interests: interests.filter(i => i.status === 'Emerging'),
          archived_core: interests.filter(i => i.status === 'ARCHIVED_CORE'),
          noise_summary: {
            noise_count: interests.filter(i => i.status === 'Noise').length,
            archived_count: interests.filter(i => i.status === 'ARCHIVED_CORE').length,
          },
          identity_anchor_prompt: raw.identity_anchor_prompt,
          last_updated: raw.last_updated,
        };
      }
      setProfileData(profile);

      // Also try to fetch identity anchor prompt from /context/{id}
      if (!profile.identity_anchor_prompt) {
        try {
          const ctxRes = await fetch(API_ENDPOINTS.cbieIdentityContext(userId));
          if (ctxRes.ok) {
            const ctx = await ctxRes.json();
            setIdentityPrompt(ctx.identity_anchor_prompt);
          }
        } catch {}
      }

      // Fetch embedding map
      try {
        const embRes = await fetch(API_ENDPOINTS.cbieEmbeddingMap(userId));
        if (embRes.ok) setEmbeddingData(await embRes.json());
      } catch {}

    } catch (err) {
      console.error('Error fetching CBIE data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Run pipeline ─────────────────────────────────────────────────
  const runPipeline = async () => {
    try {
      const userId = getUserId();
      const res = await fetch(API_ENDPOINTS.cbieRunPipeline(userId), { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start pipeline');
      const data = await res.json();
      setActiveJobId(data.job_id);
      setJobPolling(true);
    } catch (err) { alert('Pipeline error: ' + err.message); }
  };

  useEffect(() => {
    if (!activeJobId || !jobPolling) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(API_ENDPOINTS.cbieJobStatus(activeJobId));
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          setJobPolling(false);
          setActiveJobId(null);
          if (data.status === 'COMPLETED') fetchAll();
          else alert('Pipeline failed: ' + (data.error || 'Unknown error'));
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [activeJobId, jobPolling]);

  const handleCopy = () => {
    const prompt = profileData?.identity_anchor_prompt || identityPrompt;
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Derived data for charts ──────────────────────────────────────
  const allConfirmed = useMemo(() => {
    if (!profileData) return [];
    return [
      ...(profileData.critical_constraints || []),
      ...(profileData.stable_interests || []),
      ...(profileData.emerging_interests || []),
    ];
  }, [profileData]);

  const radarData = useMemo(() => {
    if (!allConfirmed.length) return { data: [], normalized: [] };
    // Only show top 6 by core_score for readability
    const top = [...allConfirmed].sort((a,b) => b.core_score - a.core_score).slice(0, 6);
    const maxFreq = Math.max(...top.map(e => e.frequency));
    const normalized = top.map(e => normalizeEntry(e, maxFreq));
    return { data: buildRadarData(normalized), normalized };
  }, [allConfirmed]);

  const scatterGroups = useMemo(() => {
    if (!embeddingData?.points?.length) return [];
    const map = {};
    for (const p of embeddingData.points) {
      const k = p.status || 'Noise';
      if (!map[k]) map[k] = [];
      map[k].push(p);
    }
    const order = ['Stable Fact','Stable','Emerging','ARCHIVED_CORE','CONTRADICTED','Noise'];
    return Object.entries(map).sort(([a],[b]) =>
      (order.indexOf(a) > -1 ? order.indexOf(a) : 99) - (order.indexOf(b) > -1 ? order.indexOf(b) : 99)
    );
  }, [embeddingData]);

  const anchorPrompt = profileData?.identity_anchor_prompt || identityPrompt;

  // ── Loading / Error states ───────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Loading CBIE profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-red-900 mb-2">Failed to Load Profile</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-12 text-center">
        <Fingerprint className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-700 mb-2">No Profile Generated Yet</h3>
        <p className="text-slate-500 mb-6">Click "Run CBIE Analysis" to generate the core behaviour profile.</p>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────
  const totalInterests = allConfirmed.length + (profileData.archived_core?.length || 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile Insights</h1>
        <p className="text-slate-500 font-medium mt-1">CBIE Core Behaviour Analysis — Identity-level behavioural profiling</p>
      </div>

      {/* Summary Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-500 text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              <Fingerprint size={12} /> {profileData.user_id}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              <Check size={12} /> Profile Ready
            </span>
            <button onClick={fetchAll} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all" title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>
          <button onClick={runPipeline} disabled={jobPolling}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${jobPolling ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100'}`}>
            {jobPolling ? (<><Loader2 size={14} className="animate-spin" /> Pipeline Running...</>) : (<><Zap size={14} /> Run CBIE Analysis</>)}
          </button>
        </div>

        {/* Stats row */}
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Behaviors', value: profileData.total_raw_behaviors, color: 'text-indigo-600' },
              { label: 'Total Interests', value: totalInterests, color: 'text-blue-600' },
              { label: 'Stable', value: profileData.stable_interests?.length || 0, color: 'text-emerald-600' },
              { label: 'Critical Facts', value: profileData.critical_constraints?.length || 0, color: 'text-rose-600' },
            ].map(s => (
              <div key={s.label} className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200">
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Identity Anchor Prompt */}
      {anchorPrompt && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
          <button onClick={() => setShowPrompt(!showPrompt)} className="w-full p-6 border-b border-slate-100 bg-gradient-to-br from-purple-50/50 to-transparent hover:bg-purple-50/80 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600"><MessageSquare size={20} /></div>
                Identity Anchor Prompt
              </h2>
              {showPrompt ? <EyeOff size={18} className="text-purple-500" /> : <Eye size={18} className="text-purple-500" />}
            </div>
            <p className="text-sm text-purple-700/70 mt-1 ml-12 text-left">Ready-to-inject LLM system prompt for deep personalization</p>
          </button>
          {showPrompt && (
            <div className="p-6">
              <div className="flex justify-end mb-3">
                <button onClick={handleCopy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-72 overflow-y-auto leading-relaxed">
                {anchorPrompt}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Charts Section */}
      {(allConfirmed.length > 0 || scatterGroups.length > 0) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
          <button onClick={() => setShowCharts(!showCharts)} className="w-full p-6 border-b border-slate-100 bg-gradient-to-br from-blue-50/50 to-transparent hover:bg-blue-50/80 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600"><TrendingUp size={20} /></div>
                Profile Visualizations
              </h2>
              {showCharts ? <EyeOff size={18} className="text-blue-500" /> : <Eye size={18} className="text-blue-500" />}
            </div>
          </button>
          {showCharts && (
            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
              {radarData.normalized.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-1">Profile Scoring Radar</h3>
                  <p className="text-[10px] text-slate-400 mb-3">Top interests — AHP dimensions normalized 0–1</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData.data} margin={{ top:8,right:24,bottom:8,left:24 }}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="axis" tick={{ fontSize:11,fill:'#64748b',fontWeight:500 }} />
                      <PolarRadiusAxis angle={90} domain={[0,1]} tick={{ fontSize:9,fill:'#cbd5e1' }} tickCount={4} axisLine={false} />
                      <Tooltip content={<RadarTooltip />} />
                      <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize:11,paddingTop:12 }} />
                      {radarData.normalized.map((entry, i) => (
                        <Radar key={entry.label} name={entry.label.length > 24 ? entry.label.slice(0,24)+'…' : entry.label}
                          dataKey={`s${i}`} stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                          fill={SERIES_COLORS[i % SERIES_COLORS.length]} fillOpacity={0.12} strokeWidth={1.5} dot={false} />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {scatterGroups.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-1">Behavior Embedding Map</h3>
                  <p className="text-[10px] text-slate-400 mb-3">t-SNE projection — similar clusters appear close together</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart margin={{ top:8,right:16,bottom:8,left:-16 }}>
                      <XAxis dataKey="x" type="number" tick={{ fontSize:10,fill:'#94a3b8' }} tickLine={false} axisLine={false} domain={['auto','auto']} />
                      <YAxis dataKey="y" type="number" tick={{ fontSize:10,fill:'#94a3b8' }} tickLine={false} axisLine={false} domain={['auto','auto']} />
                      <ZAxis range={[28,28]} />
                      <Tooltip content={<ScatterTooltip />} cursor={false} />
                      <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize:11,paddingTop:12 }} />
                      {scatterGroups.map(([status, pts]) => (
                        <Scatter key={status} name={status} data={pts} fill={STATUS_COLORS[status] || '#cbd5e1'}
                          fillOpacity={status === 'Noise' ? 0.35 : 0.75} strokeWidth={0} />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                  <p className="mt-1 text-center text-[10px] text-slate-400">
                    {embeddingData?.points?.length || 0} behaviors · colored by confirmed status
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Interest Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusCard title="Critical Constraints" items={profileData.critical_constraints}
          accentColor="border-rose-500" badgeClasses="bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200" />
        <StatusCard title="Stable Interests" items={profileData.stable_interests}
          accentColor="border-emerald-500" badgeClasses="bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200" />
        <StatusCard title="Emerging Interests" items={profileData.emerging_interests}
          accentColor="border-amber-400" badgeClasses="bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200" />
        <StatusCard title="Archived Patterns" items={profileData.archived_core}
          accentColor="border-slate-300" badgeClasses="bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200" />
      </div>

      {/* Noise footer */}
      {profileData.noise_summary && (
        <p className="text-xs text-slate-400">
          {profileData.noise_summary.noise_count} behavior{profileData.noise_summary.noise_count !== 1 ? 's' : ''} classified as noise
          &nbsp;·&nbsp;{profileData.noise_summary.archived_count} archived
          &nbsp;·&nbsp;{profileData.total_raw_behaviors} total behaviors analyzed
          {profileData.last_updated && (<>&nbsp;·&nbsp;Last updated: {new Date(profileData.last_updated).toLocaleDateString()}</>)}
        </p>
      )}
    </div>
  );
};

export default ProfileInsights;