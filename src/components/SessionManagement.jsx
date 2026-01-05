import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Clock, 
  ShieldCheck, 
  Settings2,
  Trash2,
  Circle,
  X,
  FileText,
  Code2,
  PenTool
} from 'lucide-react';

const SessionManagement = () => {
  const [sessions, setSessions] = useState([
    { id: 1, name: 'Academic Research', type: 'Research', status: 'Active', updated: 'Just now', icon: FileText },
    { id: 2, name: 'Python Project X', type: 'Coding', status: 'Inactive', updated: '2 days ago', icon: Code2 },
    { id: 3, name: 'Thesis Writing', type: 'Writing', status: 'Inactive', updated: '1 week ago', icon: PenTool },
  ]);

  const toggleSession = (id) => {
    setSessions(sessions.map(s => ({
      ...s,
      status: s.id === id ? 'Active' : 'Inactive'
    })));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Session Contexts</h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
          Manage how your activity is grouped and shared
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Main List Area */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                 <div className="relative flex-1">
                  <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:hidden" size={14} />
                  <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 hidden sm:block" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search sessions..." 
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all text-sm sm:text-base">
                  <Plus size={18} /> New
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {sessions.map((session) => (
                  <div 
                    key={session.id} 
                    className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all group ${
                      session.status === 'Active' 
                      ? 'border-2 border-indigo-500 shadow-md' 
                      : 'border border-slate-200 hover:border-indigo-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex gap-3 sm:gap-5 w-full sm:w-auto">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm ${
                          session.status === 'Active' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors'
                        }`}>
                          <session.icon size={24} className="sm:hidden" />
                          <session.icon size={28} className="hidden sm:block" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <h3 className="font-bold text-base sm:text-lg text-slate-900">{session.name}</h3>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 uppercase tracking-wide">
                              {session.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-400">
                            <span className="flex items-center gap-1.5"><Clock size={14}/> {session.updated}</span>
                            <span className={`flex items-center gap-1.5 ${session.status === 'Active' ? 'text-emerald-600' : ''}`}>
                              <Circle size={8} fill="currentColor" className={session.status === 'Active' ? 'text-emerald-500' : 'text-slate-300'} /> 
                              {session.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button 
                          onClick={() => toggleSession(session.id)}
                          className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all ${
                            session.status === 'Active' 
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'
                          }`}
                        >
                          {session.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"><MoreHorizontal size={20}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Create Section */}
              <button className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-white hover:border-indigo-300 transition-all group">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <Plus size={24} className="text-indigo-500" />
                </div>
                <span className="text-slate-900 font-bold">Add Custom Context</span>
                <p className="text-slate-400 text-xs mt-1">Create a new container to isolate specific AI workflows.</p>
              </button>
            </div>

            {/* Sidebar Area: Memory Usage */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-sm mb-4 text-slate-900">Storage Usage</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-500 font-medium">Context Cache</span>
                      <span className="font-bold text-slate-900">12.4 MB</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-[45%] rounded-full"></div>
                    </div>
                  </div>
                  <button className="w-full py-3 flex items-center justify-center gap-2 text-rose-600 text-xs font-bold bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors">
                    <Trash2 size={14} /> Clear Archived Data
                  </button>
                </div>
              </div>
            </div>
          </div>
    </div>
  );
};

export default SessionManagement;