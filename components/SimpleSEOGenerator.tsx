
import React, { useState } from 'react';
import { BrandProfile, SEOVariant, AIRecommendation, ModelProvider } from '../types';

interface SimpleSEOGeneratorProps {
  profile: BrandProfile;
  onComplete: (variants: SEOVariant[], aiRec: AIRecommendation) => void;
  onBack: () => void;
}

interface SimpleGenerationResult {
  seoVariants: SEOVariant[];
  aiRecommendation: AIRecommendation;
}

const SimpleSEOGenerator: React.FC<SimpleSEOGeneratorProps> = ({ profile, onComplete, onBack }) => {
  const [contentType, setContentType] = useState<string>('campaign');
  const [content, setContent] = useState('');
  const [modelProvider, setModelProvider] = useState<ModelProvider>(ModelProvider.OPENAI);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contentTypes = [
    { id: 'campaign', label: 'Campaign', icon: '🎯' },
    { id: 'page', label: 'Web Page', icon: '📄' },
    { id: 'terms', label: 'Terms & Conditions', icon: '📋' },
    { id: 'press', label: 'Press Release', icon: '📰' },
    { id: 'offer', label: 'Offer/Deal', icon: '🎁' },
    { id: 'other', label: 'Other', icon: '✨' }
  ];

  const generateSimpleSEO = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please provide content or context to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3007/api/generate-simple'
        : '/api/generate-simple';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          contentType,
          profile,
          modelProvider
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const result: SimpleGenerationResult = await response.json();
      onComplete(result.seoVariants, result.aiRecommendation);
    } catch (err: any) {
      console.error('Simple SEO Generation Error:', err);
      setError(err.message || 'Failed to generate SEO variants');
    } finally {
      setIsLoading(false);
    }
  };

  const clearInput = () => {
    setContent('');
    setError(null);
  };

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col gap-4 sm:gap-5 md:gap-6">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onBack}
              className="p-2 sm:p-2.5 md:p-3 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-all text-[#414042] active:scale-90 touch-manipulation flex-shrink-0"
              title="Back to Module Selection"
              aria-label="Go back to module selection"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 tracking-tighter">
                Simple SEO Generator
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#414042] font-medium leading-relaxed mt-1.5 sm:mt-2">
                Generate optimized variants for{' '}
                <span style={{ color: profile.primaryColor }} className="font-bold underline decoration-2 underline-offset-4 sm:underline-offset-8">
                  {profile.name}
                </span>
              </p>
            </div>
          </div>
        </div>
        {content && !isLoading && (
          <button
            onClick={clearInput}
            className="self-start sm:self-end text-[10px] sm:text-[11px] font-black text-[#414042] hover:text-rose-500 uppercase tracking-[0.3em] sm:tracking-[0.4em] px-5 sm:px-8 py-3 sm:py-4 bg-white border border-slate-200 rounded-full transition-all shadow-sm active:scale-95 touch-manipulation"
          >
            Clear Content
          </button>
        )}
      </header>

      <form onSubmit={generateSimpleSEO} className="bg-white rounded-xl sm:rounded-2xl md:rounded-[2.5rem] lg:rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-slate-200 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-12 space-y-6 sm:space-y-8 md:space-y-10">
        {/* Content Type Selection */}
        <section className="space-y-4 sm:space-y-5 md:space-y-6">
          <label className="text-[10px] sm:text-[11px] font-black text-[#414042] uppercase tracking-[0.4em] sm:tracking-[0.5em] ml-1 sm:ml-2 block opacity-60">
            Content Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {contentTypes.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setContentType(type.id)}
                className={`py-3 sm:py-4 px-3 sm:px-4 rounded-lg sm:rounded-xl md:rounded-[1.25rem] text-xs font-black uppercase tracking-tight transition-all border-2 flex flex-col items-center justify-center gap-1.5 sm:gap-2 touch-manipulation active:scale-95 ${
                  contentType === type.id
                    ? 'text-white shadow-xl scale-[1.02]'
                    : 'bg-white border-slate-50 text-[#414042] hover:border-slate-200 opacity-60 hover:opacity-100'
                }`}
                style={
                  contentType === type.id
                    ? { backgroundColor: profile.primaryColor, borderColor: profile.primaryColor, opacity: 1 }
                    : {}
                }
              >
                <span className="text-xl sm:text-2xl">{type.icon}</span>
                <span className="text-[9px] sm:text-[10px] leading-tight text-center">{type.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Model Provider Selection */}
        <section className="space-y-4 sm:space-y-5 md:space-y-6">
          <label className="text-[10px] sm:text-[11px] font-black text-[#414042] uppercase tracking-[0.4em] sm:tracking-[0.5em] ml-1 sm:ml-2 block opacity-60">
            AI Model
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setModelProvider(ModelProvider.GEMINI)}
              className={`p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-[1.25rem] md:rounded-[1.5rem] text-left border-2 transition-all touch-manipulation active:scale-95 ${
                modelProvider === ModelProvider.GEMINI
                  ? 'border-indigo-400 bg-indigo-50 shadow-lg'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-base sm:text-lg flex-shrink-0 ${
                  modelProvider === ModelProvider.GEMINI ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  G
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-xs sm:text-sm text-slate-900">Google Gemini 2.5</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5 sm:mt-1">Fast & Efficient</p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setModelProvider(ModelProvider.OPENAI)}
              className={`p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-[1.25rem] md:rounded-[1.5rem] text-left border-2 transition-all touch-manipulation active:scale-95 ${
                modelProvider === ModelProvider.OPENAI
                  ? 'border-green-400 bg-green-50 shadow-lg'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-base sm:text-lg flex-shrink-0 ${
                  modelProvider === ModelProvider.OPENAI ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  AI
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-xs sm:text-sm text-slate-900">OpenAI GPT-4o-mini</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5 sm:mt-1">Recommended</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Content Input */}
        <section className="space-y-3 sm:space-y-4">
          <label className="text-[10px] sm:text-[11px] font-black text-[#414042] uppercase tracking-[0.4em] sm:tracking-[0.5em] ml-1 sm:ml-2 block opacity-60">
            Content / Context / Brief
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your content, campaign brief, page context, or key information here. Can be plain text or HTML. AI will analyze and extract the core message to generate optimized SEO variants."
            className="w-full h-48 sm:h-56 md:h-64 px-4 sm:px-5 md:px-6 py-4 sm:py-5 bg-slate-50/50 border border-slate-100 rounded-xl sm:rounded-[1.25rem] md:rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all font-medium text-sm sm:text-base text-[#414042] placeholder:text-slate-300 placeholder:text-xs sm:placeholder:text-sm resize-none"
            required
          />
          <p className="text-[11px] sm:text-xs text-[#414042] opacity-40 ml-1 sm:ml-2 font-semibold">
            Tip: Provide key features, benefits, offers, and target audience details for best results
          </p>
        </section>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 sm:px-5 md:px-6 py-3 sm:py-4 rounded-xl sm:rounded-[1.25rem] md:rounded-[1.5rem] text-xs sm:text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex flex-col gap-3 sm:gap-4 pt-3 sm:pt-4">
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="w-full py-5 sm:py-6 px-6 sm:px-8 rounded-xl sm:rounded-[1.25rem] md:rounded-[1.5rem] font-black text-base sm:text-lg text-white shadow-[0_16px_32px_-8px_rgba(0,0,0,0.2)] transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group touch-manipulation"
            style={{ backgroundColor: profile.primaryColor }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2 sm:gap-3">
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm sm:text-base">Generating SEO Variants...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 sm:gap-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate SEO Variants
              </span>
            )}
          </button>
        </div>
      </form>

      <footer className="text-center pt-5 sm:pt-6 pb-8 sm:pb-10 px-2">
        <p className="text-[10px] sm:text-[11px] font-black text-[#414042] uppercase tracking-[0.4em] sm:tracking-[0.5em] opacity-30">
          Quick SEO Optimization v1.0
        </p>
      </footer>
    </div>
  );
};

export default SimpleSEOGenerator;
