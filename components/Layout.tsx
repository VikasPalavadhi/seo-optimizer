
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
  // Sidebar always hidden by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      <header className="sticky top-0 z-50 h-14 md:h-16 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 flex items-center justify-between px-3 md:px-6">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2 md:gap-2.5 group cursor-pointer" onClick={() => setView('module-select')}>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-white font-black text-sm md:text-base shadow-lg transition-transform group-hover:rotate-6 group-hover:scale-110" style={{ backgroundColor: 'var(--brand-primary)' }}>
              S
            </div>
            <h1 className="text-base md:text-xl font-black tracking-tight text-slate-900">
              SEO <span className="bg-clip-text text-transparent bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)]">Optimizer</span>
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

        {/* Floating Sidebar Toggle - Vertically Centered */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed left-0 top-1/2 -translate-y-1/2 z-50 group transition-all duration-500 touch-manipulation ${
            isSidebarOpen ? 'translate-x-[280px] sm:translate-x-[320px]' : 'translate-x-0'
          }`}
          title="Toggle Navigation"
          aria-label="Toggle navigation menu"
        >
          <div className="relative">
            {/* Icon Container */}
            <div className="bg-white/95 backdrop-blur-xl border-2 border-slate-200 hover:border-indigo-400 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.2)] hover:shadow-[0_16px_48px_-8px_rgba(79,70,229,0.4)] rounded-r-xl sm:rounded-r-2xl py-4 sm:py-6 px-2.5 sm:px-3 transition-all duration-300 group-hover:px-3 sm:group-hover:px-4">
              <div className="flex flex-col items-center gap-1.5">
                {/* Animated bars */}
                <div className={`w-4 sm:w-5 h-0.5 rounded-full transition-all duration-300 ${
                  isSidebarOpen ? 'bg-indigo-500 rotate-45 translate-y-2' : 'bg-slate-400 group-hover:bg-indigo-500'
                }`} />
                <div className={`w-4 sm:w-5 h-0.5 rounded-full transition-all duration-300 ${
                  isSidebarOpen ? 'bg-indigo-500 opacity-0' : 'bg-slate-400 group-hover:bg-indigo-500'
                }`} />
                <div className={`w-4 sm:w-5 h-0.5 rounded-full transition-all duration-300 ${
                  isSidebarOpen ? 'bg-indigo-500 -rotate-45 -translate-y-2' : 'bg-slate-400 group-hover:bg-indigo-500'
                }`} />
              </div>
            </div>

            {/* Tooltip - Hidden on mobile */}
            <div className="hidden md:block absolute left-full ml-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap">
                {isSidebarOpen ? 'Close Menu' : 'Open Menu'}
              </div>
            </div>
          </div>
        </button>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Apple Inspired */}
        <aside
          className={`bg-white border-r border-slate-200/50 flex flex-col transition-all duration-500 ease-in-out fixed z-40 h-full top-0 left-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } w-[280px] sm:w-80`}
        >
          <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 md:space-y-12 flex flex-col h-full overflow-y-auto">
            <nav className="space-y-2 sm:space-y-3">
              <label className="text-[9px] sm:text-[10px] font-black text-[#414042]/40 uppercase tracking-[0.3em] sm:tracking-[0.4em] ml-3 sm:ml-4 mb-3 sm:mb-4 block">Navigation</label>
              <button
                onClick={() => { setView('module-select'); setIsSidebarOpen(false); }}
                className={`w-full text-left px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-[1.25rem] text-xs sm:text-sm font-bold transition-all flex items-center gap-3 sm:gap-4 touch-manipulation ${view === 'module-select' || view === 'simple-seo' || view === 'full-seo' ? 'shadow-xl text-white' : 'text-[#414042] hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100'}`}
                style={view === 'module-select' || view === 'simple-seo' || view === 'full-seo' ? { backgroundColor: 'var(--brand-primary)' } : {}}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                <span className="truncate">SEO Generator</span>
              </button>
              <button
                onClick={() => { setView('history'); setIsSidebarOpen(false); }}
                className={`w-full text-left px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-[1.25rem] text-xs sm:text-sm font-bold transition-all flex items-center gap-3 sm:gap-4 touch-manipulation ${view === 'history' ? 'shadow-xl text-white' : 'text-[#414042] hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100'}`}
                style={view === 'history' ? { backgroundColor: 'var(--brand-primary)' } : {}}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="truncate">Growth Archive</span>
              </button>
            </nav>

            <div className="mt-auto pt-6 sm:pt-8 border-t border-slate-100">
              <label className="text-[9px] sm:text-[10px] font-black text-[#414042]/40 uppercase tracking-[0.3em] sm:tracking-[0.4em] ml-3 sm:ml-4 mb-4 sm:mb-5 block">Brand Identity</label>
              <div className="space-y-2 sm:space-y-3">
                {BRAND_PROFILES.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => { setActiveProfile(profile); setIsSidebarOpen(false); }}
                    className={`w-full group text-[11px] sm:text-xs font-bold text-left px-4 sm:px-5 py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] border-2 transition-all flex items-center gap-3 sm:gap-4 touch-manipulation ${activeProfile.id === profile.id ? `bg-slate-50 border-slate-200 text-slate-900 shadow-sm` : 'border-transparent text-[#414042]/60 hover:bg-slate-50 hover:text-[#414042] active:bg-slate-100'}`}
                  >
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-500 shadow-sm shrink-0"
                      style={{ backgroundColor: profile.primaryColor }}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="tracking-tight truncate">{profile.name}</span>
                      <span className="text-[9px] font-medium tracking-normal opacity-50 truncate">{profile.domain}</span>
                    </div>
                    {activeProfile.id === profile.id && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-teal-50/30 w-full">
          <div className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6 md:p-12 lg:p-16 xl:p-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
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
