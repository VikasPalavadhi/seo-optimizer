
import React, { useState } from 'react';
import { ViewState, BrandProfile, Generation, SEOVariant } from '../types';
import { BRAND_PROFILES } from '../constants';
import ChatBot from './ChatBot';

interface LayoutProps {
  children: React.ReactNode;
  view: ViewState;
  setView: (view: ViewState) => void;
  user: string | null;
  onLogout: () => void;
  activeProfile: BrandProfile;
  setActiveProfile: (p: BrandProfile) => void;
  currentGeneration: Generation | null;
  onAddEnhancedVariant?: (variant: SEOVariant) => void;
  onAddEnhancedSchema?: (schema: any) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children, view, setView, user, onLogout, activeProfile, setActiveProfile, currentGeneration,
  onAddEnhancedVariant, onAddEnhancedSchema
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const themeStyles = {
    '--brand-primary': activeProfile.primaryColor,
    '--brand-accent': activeProfile.accentColor,
    '--brand-surface': activeProfile.surfaceColor,
    '--charcoal': '#414042',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen flex flex-col font-inter bg-gradient-to-br from-indigo-50 via-purple-50/50 to-teal-50 selection:bg-indigo-100 transition-all duration-500" style={themeStyles}>
      
      {/* Top Navigation Bar - High Fidelity */}
      <header className="sticky top-0 z-50 h-16 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-[#414042] active:scale-90"
            title="Toggle Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg transition-transform group-hover:rotate-6 group-hover:scale-110" style={{ backgroundColor: 'var(--brand-primary)' }}>
              S
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              SEO <span className="bg-clip-text text-transparent bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)]">Guru</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-1 rounded-full border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all bg-white group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#414042] font-bold border border-slate-100 overflow-hidden transition-colors group-hover:bg-slate-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              </div>
              <div className="hidden md:flex flex-col items-start pr-4 leading-tight">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#414042]/60">Account</span>
                <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user?.split('@')[0]}</span>
              </div>
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                <div className="absolute right-0 mt-4 w-64 bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-100 z-20 py-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-7 py-3 border-b border-slate-50 mb-3">
                    <p className="text-[10px] font-black text-[#414042]/50 uppercase tracking-widest">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 mt-1 truncate">{user}</p>
                  </div>
                  <button onClick={() => { setIsProfileOpen(false); setView('history'); }} className="w-full text-left px-7 py-4 text-sm font-semibold text-[#414042] hover:bg-slate-50 flex items-center gap-3 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Audit History
                  </button>
                  <div className="h-px bg-slate-50 mx-4 my-2" />
                  <button onClick={onLogout} className="w-full text-left px-7 py-4 text-sm font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar - Apple Inspired */}
        <aside 
          className={`bg-white border-r border-slate-200/50 flex flex-col transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-80' : 'w-0 opacity-0 pointer-events-none'}`}
        >
          <div className="p-8 space-y-12 min-w-[320px] flex flex-col h-full">
            <nav className="space-y-3">
              <label className="text-[10px] font-black text-[#414042]/40 uppercase tracking-[0.4em] ml-4 mb-4 block">Navigation</label>
              <button
                onClick={() => setView('dashboard')}
                className={`w-full text-left px-6 py-4 rounded-[1.25rem] text-sm font-bold transition-all flex items-center gap-4 ${view === 'dashboard' ? 'shadow-xl text-white' : 'text-[#414042] hover:text-slate-900 hover:bg-slate-50'}`}
                style={view === 'dashboard' ? { backgroundColor: 'var(--brand-primary)' } : {}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                Engine Dashboard
              </button>
              <button
                onClick={() => setView('history')}
                className={`w-full text-left px-6 py-4 rounded-[1.25rem] text-sm font-bold transition-all flex items-center gap-4 ${view === 'history' ? 'shadow-xl text-white' : 'text-[#414042] hover:text-slate-900 hover:bg-slate-50'}`}
                style={view === 'history' ? { backgroundColor: 'var(--brand-primary)' } : {}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Growth Archive
              </button>
            </nav>

            <div className="mt-auto pt-8 border-t border-slate-100">
              <label className="text-[10px] font-black text-[#414042]/40 uppercase tracking-[0.4em] ml-4 mb-5 block">Brand Identity</label>
              <div className="space-y-3">
                {BRAND_PROFILES.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => setActiveProfile(profile)}
                    className={`w-full group text-xs font-bold text-left px-5 py-5 rounded-[1.5rem] border-2 transition-all flex items-center gap-4 ${activeProfile.id === profile.id ? `bg-slate-50 border-slate-200 text-slate-900 shadow-sm` : 'border-transparent text-[#414042]/60 hover:bg-slate-50 hover:text-[#414042]'}`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full transition-all duration-500 shadow-sm shrink-0" 
                      style={{ backgroundColor: profile.primaryColor }}
                    />
                    <div className="flex flex-col">
                      <span className="tracking-tight">{profile.name}</span>
                      <span className="text-[9px] font-medium tracking-normal opacity-50 truncate max-w-[160px]">{profile.domain}</span>
                    </div>
                    {activeProfile.id === profile.id && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-teal-50/30">
          <div className="max-w-7xl mx-auto p-6 md:p-12 lg:p-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {children}
          </div>
        </main>
      </div>

      {/* Floating ChatBot */}
      <ChatBot
        currentGeneration={currentGeneration}
        onAddVariant={onAddEnhancedVariant}
        onAddSchema={onAddEnhancedSchema}
      />
    </div>
  );
};

export default Layout;
