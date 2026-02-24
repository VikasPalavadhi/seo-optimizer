
import React, { useEffect, useRef } from 'react';
import { SEOVariant, BrandProfile } from '../types';

interface SERPPreviewProps {
  variant: SEOVariant;
  profile: BrandProfile;
  onClose: () => void;
}

const SERPPreview: React.FC<SERPPreviewProps> = ({ variant, profile, onClose }) => {
  const fullUrl = `https://${profile.domain}${variant.url || ''}`;
  const displayUrl = `${profile.domain}${variant.url || ''}`;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll modal content to top when it opens
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    // Note: Removed scroll locking to allow background page scrolling while modal is open
  }, []);

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] w-full max-w-xl h-[90vh] sm:h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 flex-shrink-0">
          <div className="min-w-0 flex-1 pr-3">
            <h3 className="text-base sm:text-lg font-black text-slate-900">SERP Preview</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5 sm:mt-1 truncate">How this will appear in Google search results</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-all text-slate-400 hover:text-slate-900 flex-shrink-0 touch-manipulation"
            aria-label="Close preview"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* SERP Display - Scrollable Content */}
        <div ref={contentRef} className="overflow-y-auto flex-1 p-4 sm:p-5 md:p-6">
          {/* Google SERP Mockup */}
          <div className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5">
            {/* Breadcrumb / URL */}
            <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black text-white flex-shrink-0" style={{ backgroundColor: profile.primaryColor }}>
                {profile.name.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs sm:text-sm text-slate-700 font-medium truncate">{displayUrl}</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-base sm:text-lg md:text-xl font-normal text-[#1a0dab] hover:underline cursor-pointer mb-1.5 sm:mb-2 leading-tight">
              {variant.metaTitle}
            </h2>

            {/* Meta Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {variant.metaDescription}
            </p>

            {/* Additional Info */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[11px] sm:text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Title Length:</span>
                  <span className={`ml-2 font-black ${variant.metaTitle.length > 60 ? 'text-red-600' : 'text-green-600'}`}>
                    {variant.metaTitle.length}/60
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Description:</span>
                  <span className={`ml-2 font-black ${variant.metaDescription.length > 160 ? 'text-red-600' : 'text-green-600'}`}>
                    {variant.metaDescription.length}/160
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Preview */}
          <div className="mt-5 sm:mt-6">
            <h4 className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 sm:mb-3">Mobile Preview</h4>
            <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 max-w-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black text-white flex-shrink-0" style={{ backgroundColor: profile.primaryColor }}>
                  {profile.name.charAt(0)}
                </div>
                <span className="text-[11px] sm:text-xs text-slate-600 font-medium truncate">{displayUrl}</span>
              </div>
              <h3 className="text-sm sm:text-base font-normal text-[#1a0dab] mb-1 leading-tight line-clamp-2">
                {variant.metaTitle}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed line-clamp-2">
                {variant.metaDescription}
              </p>
            </div>
          </div>

          {/* Keywords */}
          <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-indigo-50 rounded-xl sm:rounded-2xl">
            <h4 className="text-[11px] sm:text-xs font-black text-indigo-900 uppercase tracking-wider mb-2.5 sm:mb-3">Target Keywords</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {variant.keyphrases.map((kp, i) => (
                <span key={i} className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white border border-indigo-200 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold text-indigo-700">
                  {kp}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-2.5 p-3 sm:p-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2.5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-all touch-manipulation"
          >
            Close
          </button>
          <button
            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(variant.metaTitle)}`, '_blank')}
            className="px-4 sm:px-5 py-2.5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-lg touch-manipulation"
          >
            Search on Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default SERPPreview;
