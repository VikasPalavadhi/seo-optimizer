
import React, { useState } from 'react';
import { SEOVariant, AIRecommendation, BrandProfile } from '../types';
import SERPPreview from './SERPPreview';

interface SimpleResultsViewProps {
  variants: SEOVariant[];
  aiRecommendation: AIRecommendation;
  profile: BrandProfile;
}

const SimpleResultsView: React.FC<SimpleResultsViewProps> = ({ variants, aiRecommendation, profile }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [serpPreviewIndex, setSerpPreviewIndex] = useState<number | null>(null);

  const copyVariant = (variant: SEOVariant, index: number) => {
    const text = `H1: ${variant.h1}
URL: ${variant.url || 'Not specified'}
Meta Title: ${variant.metaTitle}
Meta Description: ${variant.metaDescription}
Keyphrases: ${variant.keyphrases.join(', ')}`;

    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const recommended = aiRecommendation?.winnerIndex;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="text-center space-y-3 sm:space-y-4 px-2">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter">
          SEO <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">Variants</span>
        </h2>
        <p className="text-[#414042] font-medium text-sm sm:text-base lg:text-lg">
          Choose the variant that best fits your strategy
        </p>
      </header>

      {/* AI Recommendation Card */}
      {aiRecommendation && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] p-5 sm:p-6 md:p-8 lg:p-12 border-2 border-indigo-200 shadow-xl">
          <div className="flex items-start gap-4 sm:gap-5 md:gap-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
              <h3 className="text-base sm:text-lg md:text-xl font-black text-indigo-900">Recommended: Variant {recommended + 1}</h3>
              <p className="text-sm sm:text-base text-[#414042] leading-relaxed font-medium">
                {aiRecommendation.expertRationale}
              </p>
              {aiRecommendation.comparisonNotes && (
                <p className="text-xs sm:text-sm text-[#414042] opacity-70 font-medium">
                  {aiRecommendation.comparisonNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Variants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {variants.map((variant, index) => {
          const isRecommended = recommended === index;

          return (
            <div
              key={index}
              className={`bg-white rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] p-5 sm:p-6 md:p-8 lg:p-10 border-2 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] relative ${
                isRecommended
                  ? 'border-indigo-400 shadow-indigo-200'
                  : 'border-slate-200 hover:border-indigo-200'
              }`}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6">
                  <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1.5 sm:gap-2">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="hidden sm:inline">Top Pick</span>
                    <span className="sm:hidden">Top</span>
                  </span>
                </div>
              )}

              {/* Variant Number */}
              <div className="mb-6 sm:mb-8">
                <span
                  className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl text-white font-black text-base sm:text-lg shadow-lg"
                  style={{ backgroundColor: isRecommended ? profile.primaryColor : '#64748b' }}
                >
                  {index + 1}
                </span>
              </div>

              {/* Content */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* H1 */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#414042] uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-40">H1 Headline</label>
                  <p className="text-base sm:text-lg md:text-xl font-black text-slate-900 leading-tight">
                    {variant.h1}
                  </p>
                </div>

                {/* URL */}
                {variant.url && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-[#414042] uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-40">Target URL</label>
                    <p className="text-xs sm:text-sm font-bold text-indigo-600 bg-indigo-50 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl break-all">
                      {variant.url}
                    </p>
                  </div>
                )}

                {/* Meta Title */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#414042] uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-40">Meta Title</label>
                  <p className="text-xs sm:text-sm font-semibold text-[#414042]">
                    {variant.metaTitle}
                  </p>
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#414042] uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-40">Meta Description</label>
                  <p className="text-xs sm:text-sm text-[#414042] leading-relaxed">
                    {variant.metaDescription}
                  </p>
                </div>

                {/* Keyphrases */}
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#414042] uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-40">Keywords</label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {variant.keyphrases.map((kp, i) => (
                      <span
                        key={i}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-100 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold text-[#414042]"
                      >
                        {kp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Best For */}
                <div className="space-y-1.5 sm:space-y-2 pt-4 sm:pt-6 border-t border-slate-100">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#414042] uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-40">Best For</label>
                  <p className="text-xs sm:text-sm font-medium text-[#414042]">
                    {variant.bestFor}
                  </p>
                </div>

                {/* Rationale */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#414042] uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-40">Why This Works</label>
                  <p className="text-[11px] sm:text-xs text-[#414042] leading-relaxed opacity-80">
                    {variant.rationale}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 mt-4 sm:mt-6">
                  <button
                    onClick={() => setSerpPreviewIndex(index)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-indigo-200 text-indigo-700 rounded-lg font-semibold text-xs sm:text-sm hover:bg-indigo-50 hover:border-indigo-300 active:scale-95 transition-all touch-manipulation"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => copyVariant(variant, index)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm active:scale-95 transition-all touch-manipulation ${
                      copiedIndex === index
                        ? 'bg-green-50 border-2 border-green-300 text-green-700'
                        : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {copiedIndex === index ? (
                      <>
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="text-center pt-6 sm:pt-8 pb-8 sm:pb-10 px-2">
        <p className="text-[10px] sm:text-[11px] font-black text-[#414042] uppercase tracking-[0.4em] sm:tracking-[0.5em] opacity-30">
          {variants.length} SEO Variant{variants.length !== 1 ? 's' : ''} Generated
        </p>
      </footer>

      {/* SERP Preview Modal */}
      {serpPreviewIndex !== null && (
        <SERPPreview
          variant={variants[serpPreviewIndex]}
          profile={profile}
          onClose={() => setSerpPreviewIndex(null)}
        />
      )}
    </div>
  );
};

export default SimpleResultsView;
