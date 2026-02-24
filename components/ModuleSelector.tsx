
import React from 'react';
import { BrandProfile } from '../types';

interface ModuleSelectorProps {
  profile: BrandProfile;
  onSelectModule: (module: 'simple-seo' | 'full-seo') => void;
}

const ModuleSelector: React.FC<ModuleSelectorProps> = ({ profile, onSelectModule }) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter">
            Choose Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">Workflow</span>
          </h2>
          <p className="text-[#414042] font-medium text-lg md:text-xl max-w-2xl mx-auto">
            Select the SEO optimization module that best fits your needs
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {/* Simple SEO Module */}
          <button
            onClick={() => onSelectModule('simple-seo')}
            className="group bg-white rounded-[3rem] p-10 md:p-12 border-2 border-slate-200 hover:border-indigo-400 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:shadow-[0_32px_64px_-16px_rgba(79,70,229,0.3)] transition-all duration-500 hover:scale-[1.02] text-left"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Simple SEO</h3>
                  <p className="text-xs font-black text-[#414042] uppercase tracking-[0.3em] opacity-40">Quick Variant Generation</p>
                </div>
              </div>

              <p className="text-[#414042] leading-relaxed font-medium">
                Perfect for quick content optimization. Generate 3 SEO variants with H1, meta tags, and target URLs for your campaigns, pages, press releases, or offers.
              </p>

              <div className="pt-6 border-t border-slate-100 space-y-3">
                <label className="text-[10px] font-black text-[#414042] uppercase tracking-[0.4em] opacity-40">What you get:</label>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#414042]">
                    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    3 SEO Variants with URLs
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#414042]">
                    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Strategic Keywords
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#414042]">
                    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    AI Recommendation
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-slate-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    No Schema Generation
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <span className="inline-flex items-center gap-2 text-sm font-black text-indigo-600 group-hover:gap-4 transition-all">
                  Get Started
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </button>

          {/* Full SEO Module */}
          <button
            onClick={() => onSelectModule('full-seo')}
            className="group bg-gradient-to-br from-white to-indigo-50 rounded-[3rem] p-10 md:p-12 border-2 border-indigo-200 hover:border-indigo-400 shadow-[0_32px_64px_-16px_rgba(79,70,229,0.2)] hover:shadow-[0_32px_64px_-16px_rgba(79,70,229,0.4)] transition-all duration-500 hover:scale-[1.02] text-left relative overflow-hidden"
          >
            <div className="absolute top-6 right-6">
              <span className="px-4 py-2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                Complete
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Full SEO Suite</h3>
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] opacity-60">Enterprise-Grade Optimization</p>
                </div>
              </div>

              <p className="text-[#414042] leading-relaxed font-medium">
                Complete SEO optimization with advanced schema.org markup, strategic insights, performance scoring, and comprehensive grounding for banking & financial services.
              </p>

              <div className="pt-6 border-t border-indigo-100 space-y-3">
                <label className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.4em] opacity-40">What you get:</label>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#414042]">
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    3 SEO Variants with URLs
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#414042]">
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    World-Class Schema.org Markup
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#414042]">
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Strategic Impact Scores
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#414042]">
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Content Analysis & Insights
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <span className="inline-flex items-center gap-2 text-sm font-black text-indigo-600 group-hover:gap-4 transition-all">
                  Launch Full Suite
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </button>
        </div>

        <footer className="text-center pt-8">
          <p className="text-[11px] font-black text-[#414042] uppercase tracking-[0.5em] opacity-30">
            Optimizing for {profile.name}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ModuleSelector;
