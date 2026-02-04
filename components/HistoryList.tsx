
import React from 'react';
import { Generation } from '../types';
import { BRAND_PROFILES } from '../constants';

interface HistoryListProps {
  history: Generation[];
  onView: (gen: Generation) => void;
  onDelete: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onView, onDelete }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-40 bg-white/50 backdrop-blur-xl rounded-[4rem] border-2 border-slate-100 border-dashed max-w-3xl mx-auto shadow-sm">
        <div className="bg-white w-28 h-28 rounded-[2.5rem] shadow-2xl flex items-center justify-center mx-auto mb-10 text-slate-200">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Growth Archive Empty</h3>
        <p className="text-[#414042]/60 mt-4 font-bold text-lg">Your generated strategic audits will materialize here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div className="space-y-3">
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Growth Archive</h2>
          <p className="text-[#414042] font-medium text-xl">Repository of verified enterprise search intelligence.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {history.map((gen) => {
          const profile = BRAND_PROFILES.find(p => p.id === gen.profileId);
          return (
            <div 
              key={gen.id} 
              onClick={() => onView(gen)}
              className="group bg-white rounded-[3rem] p-10 border border-slate-100 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.04)] hover:shadow-3xl hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(gen.id); }}
                  className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
                  title="Archive Permanent Deletion"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              <div className="flex items-center gap-5 mb-10">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: profile?.primaryColor || '#000' }}
                >
                  {profile?.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xl tracking-tight truncate max-w-[180px]">{gen.url}</h4>
                  <p className="text-[10px] font-black text-[#414042]/50 uppercase tracking-[0.4em] mt-1">{new Date(gen.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="space-y-5 pt-8 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#414042]/40 uppercase tracking-[0.3em]">Institutional ID</span>
                  <span className="text-xs font-black text-[#414042]">{profile?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#414042]/40 uppercase tracking-[0.3em]">Search Index</span>
                  <span className="text-[10px] font-black px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl uppercase tracking-widest">{gen.pageType}</span>
                </div>
              </div>

              <div className="mt-10 pt-8">
                <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl group-hover:scale-[1.03] transition-transform active:scale-95">
                  Access Intelligence
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryList;
