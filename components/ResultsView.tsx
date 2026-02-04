
import React, { useState } from 'react';
import { Generation, SEOVariant, BrandProfile } from '../types';
import { BRAND_PROFILES } from '../constants';

interface ResultsViewProps {
  generation: Generation;
}

const ResultsView: React.FC<ResultsViewProps> = ({ generation }) => {
  const [activeTab, setActiveTab] = useState<'variants' | 'schema' | 'sources' | 'preview'>('variants');
  const [previewVariant, setPreviewVariant] = useState<SEOVariant | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  const activeProfile = BRAND_PROFILES.find(p => p.id === generation.profileId) || BRAND_PROFILES[0];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const tabs = [
    { id: 'variants', label: 'Growth Strategies' },
    { id: 'schema', label: 'Schema and Important Information' },
    { id: 'preview', label: 'Extracted Content' },
    { id: 'sources', label: 'Grounding', hidden: !generation.groundingSources?.length },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {previewVariant && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="px-12 py-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h4 className="font-black text-slate-900 text-2xl uppercase tracking-tight">Search Result Simulation</h4>
                <p className="text-[11px] text-[#414042] font-black tracking-[0.4em] uppercase mt-2 opacity-50">Enterprise Asset Visualization</p>
              </div>
              <button onClick={() => setPreviewVariant(null)} className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-400 hover:text-rose-500 transition-all border border-slate-200 active:scale-90">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-20 md:p-32 bg-white">
              <div className="max-w-[600px] w-full font-sans">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-black text-white border shadow-md uppercase" style={{ backgroundColor: activeProfile.primaryColor }}>{generation.url.charAt(0)}</div>
                  <div className="flex flex-col"><span className="text-[16px] text-[#202124] font-medium leading-none">{generation.url.split('/')[2] || 'source'}</span><span className="text-[14px] text-[#4d5156] mt-1">https://{generation.url.split('/')[2]} › ...</span></div>
                </div>
                <h3 className="text-[24px] text-[#1a0dab] hover:underline cursor-pointer leading-[1.3] mb-2 font-normal">{previewVariant.metaTitle}</h3>
                <p className="text-[16px] text-[#4d5156] leading-[1.58] line-clamp-3">{previewVariant.metaDescription}</p>
              </div>
            </div>
            <div className="px-12 py-10 bg-slate-50 border-t border-slate-100 flex justify-center">
              <button onClick={() => setPreviewVariant(null)} className="px-16 py-5 bg-slate-900 text-white font-black rounded-3xl text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all">Dismiss Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* Simplified Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-5">
             <span className="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-lg" style={{ backgroundColor: activeProfile.primaryColor }}>Audit Results</span>
             <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
             <span className="text-[#414042] text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Protocol v3.1</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">SEO Optimization Details</h2>
          <p className="text-[#414042] font-medium text-xl leading-relaxed">
            Performance breakdown for <span className="font-bold border-b-2 border-slate-200 pb-0.5">{generation.url}</span>
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 md:gap-2 bg-white/80 backdrop-blur-xl p-1.5 md:p-2 rounded-[2rem] md:rounded-[3rem] w-fit border border-slate-100 shadow-xl overflow-x-auto no-scrollbar">
        {tabs.filter(t => !t.hidden).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 sm:px-6 md:px-10 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2.5rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-[#414042] hover:text-slate-900 opacity-60 hover:opacity-100'}`}
            style={activeTab === tab.id ? { backgroundColor: activeProfile.primaryColor } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'variants' && (
          <div className="space-y-16">
            <div className="grid grid-cols-1 gap-12">
              {generation.seoVariants.map((variant: any, idx) => {
                const isWinner = generation.aiRecommendation?.winnerIndex === idx;
                const isEnhanced = variant.isEnhanced === true;
                return (
                  <div key={idx} className={`relative group bg-white border-2 rounded-[4rem] p-6 sm:p-8 md:p-12 lg:p-16 transition-all ${isWinner ? 'shadow-3xl' : isEnhanced ? 'border-[#63bfb5] hover:border-[#63bfb5]' : 'border-slate-100 hover:border-indigo-100'}`} style={isWinner ? { borderColor: activeProfile.primaryColor, boxShadow: `0 40px 80px -20px ${activeProfile.primaryColor}15` } : {}}>
                    {isWinner && (
                      <div
                        className="absolute -top-7 left-12 px-10 py-5 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-full shadow-2xl flex items-center gap-4"
                        style={{ backgroundColor: activeProfile.primaryColor }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        Recommended Strategy
                      </div>
                    )}
                    {isEnhanced && (
                      <div
                        className="absolute -top-7 left-12 px-10 py-5 text-[#461e57] text-[11px] font-black uppercase tracking-[0.4em] rounded-full shadow-2xl flex items-center gap-4"
                        style={{ backgroundColor: '#63bfb5' }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 7H7v6h6V7z"/><path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd"/></svg>
                        Enhanced via Chat
                      </div>
                    )}
                    <div className="flex flex-col lg:flex-row gap-12 md:gap-20">
                      <div className="flex-1 space-y-6 md:space-y-10 lg:space-y-12">
                        <div className="space-y-4">
                          <label className="text-[11px] font-black text-[#414042] uppercase tracking-[0.5em] block opacity-40">Primary H1</label>
                          <div className="p-8 bg-[#fbfbfd] rounded-[2rem] border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-all shadow-sm">
                            <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-tight tracking-tight">{variant.metaTitle}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <label className="text-[11px] font-black text-[#414042] uppercase tracking-[0.5em] block opacity-40">Meta Description</label>
                          <div className="p-8 bg-[#fbfbfd] rounded-[2rem] border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-all shadow-sm">
                            <p className="text-[#414042] text-lg leading-relaxed font-medium">{variant.metaDescription}</p>
                          </div>
                        </div>
                        <div className="pt-8 border-t border-slate-50 space-y-10">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <div>
                                 <label className="text-[11px] font-black text-[#414042] uppercase tracking-[0.5em] mb-4 block opacity-40">Rationale</label>
                                 <p className="text-base font-bold text-[#414042] leading-relaxed border-l-4 pl-6 opacity-70" style={{ borderColor: activeProfile.accentColor }}>{variant.justification}</p>
                              </div>
                              <div>
                                 <label className="text-[11px] font-black text-[#414042] uppercase tracking-[0.5em] mb-4 block opacity-40">Market Fit</label>
                                 <p className="text-base font-bold text-[#414042] italic bg-[#fbfbfd] p-6 rounded-2xl border border-slate-100">"{variant.situationalComparison}"</p>
                              </div>
                           </div>
                        </div>
                      </div>
                      <div className="lg:w-80 space-y-8 shrink-0">
                        <button onClick={() => setPreviewVariant(variant)} className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-slate-800 shadow-xl transition-all active:scale-95">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                           Google Preview
                        </button>
                        <div className="p-8 bg-[#fbfbfd] rounded-[2.5rem] border border-slate-100 space-y-6">
                          <label className="text-[11px] font-black text-[#414042] uppercase tracking-[0.5em] block opacity-40">Target Keywords</label>
                          <div className="flex flex-wrap gap-2">{variant.keyphrases.map((kp, kpi) => (<span key={kpi} className="px-4 py-2 bg-white text-[10px] font-black text-[#414042] rounded-lg shadow-sm border border-slate-100 uppercase tracking-tight">{kp}</span>))}</div>
                        </div>
                        <button onClick={() => copyToClipboard(variant.metaTitle + "\n" + variant.metaDescription, `Asset ${idx+1}`)} className="w-full text-center text-[12px] font-black uppercase tracking-[0.3em] py-5 rounded-[1.25rem] transition-all border-2 border-transparent hover:bg-slate-50" style={{ color: activeProfile.primaryColor }}>{copySuccess === `Asset ${idx+1}` ? '✓ Copied' : 'Copy Content'}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="bg-slate-900 rounded-[3.5rem] p-12 md:p-16 relative shadow-3xl border border-slate-800 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 opacity-60" style={{ backgroundColor: activeProfile.primaryColor }} />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div>
                  <h4 className="text-white font-black text-3xl tracking-tight">Structured Metadata (JSON-LD)</h4>
                  <p className="text-white text-[11px] font-black uppercase tracking-[0.4em] mt-3 opacity-30">Search Engine Ready</p>
                </div>
                <button onClick={() => copyToClipboard(JSON.stringify(generation.schemaJsonld, null, 2), 'JSON-LD')} className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all border border-white/5 shadow-2xl active:scale-95">{copySuccess === 'JSON-LD' ? '✓ Data Copied' : 'Copy Schema'}</button>
              </div>
              <div className="p-8 bg-black/40 rounded-[2rem] border border-slate-800 shadow-inner group relative">
                <pre className="font-mono text-sm overflow-x-auto no-scrollbar max-h-[600px] overflow-y-auto selection:bg-indigo-500/40" style={{ color: activeProfile.accentColor }}><code>{JSON.stringify(generation.schemaJsonld, null, 2)}</code></pre>
              </div>
            </div>

            <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden">
               <h4 className="text-[11px] font-black text-[#414042] uppercase tracking-[0.5em] opacity-40 mb-10">Entity Architecture Mapping</h4>
               <div className="flex items-center justify-center gap-8 flex-wrap py-6">
                  {generation.strategicImpact?.entityLinkage.map((entity, i) => (
                     <React.Fragment key={i}>
                        <div className="px-8 py-4 rounded-[1.5rem] bg-white border border-slate-200 text-[#414042] font-black text-xs uppercase tracking-[0.1em] shadow-sm">{entity}</div>
                        {i < generation.strategicImpact!.entityLinkage.length - 1 && (
                           <div className="flex items-center gap-1 opacity-20">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <div className="w-6 h-[1px] bg-slate-400" />
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                           </div>
                        )}
                     </React.Fragment>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="bg-white rounded-[3.5rem] p-12 md:p-16 border border-slate-100 shadow-2xl space-y-12 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-slate-50 gap-8">
                <div>
                   <h4 className="text-slate-900 font-black text-3xl tracking-tighter">Content Core Extraction</h4>
                   <p className="text-[#414042] text-[11px] font-black uppercase tracking-[0.5em] mt-3 opacity-40">Cleaned Semantic Data</p>
                </div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">
                <div className="lg:col-span-2 space-y-8">
                   <label className="text-[11px] font-black uppercase tracking-[0.5em]" style={{ color: activeProfile.primaryColor }}>Main Body Text</label>
                   <div className="p-8 md:p-12 bg-[#fbfbfd] rounded-[2.5rem] border border-slate-100 max-h-[600px] overflow-y-auto no-scrollbar shadow-inner">
                      <p className="text-[#414042] text-lg leading-[1.8] font-medium whitespace-pre-wrap">
                         {generation.extracted.mainTextPreview}
                      </p>
                   </div>
                </div>
                <div className="space-y-10">
                   <section className="space-y-4">
                      <label className="text-[11px] font-black text-[#414042] uppercase tracking-[0.4em] block opacity-40">Current H1</label>
                      <p className="p-6 bg-white rounded-2xl text-slate-900 font-black text-base border border-slate-200 shadow-sm">{generation.extracted.h1Current || 'No Structural H1'}</p>
                   </section>
                   <section className="space-y-4">
                      <label className="text-[11px] font-black text-[#414042] uppercase tracking-[0.4em] block opacity-40">Extracted Subheadings</label>
                      <div className="flex flex-col gap-2">
                         {generation.extracted.headings.slice(0, 8).map((h, i) => (
                            <div key={i} className="px-5 py-3 bg-white border border-slate-50 rounded-xl text-xs text-[#414042] font-bold truncate shadow-sm">
                               {h}
                            </div>
                         ))}
                      </div>
                   </section>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'sources' && generation.groundingSources && (
          <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-xl space-y-10 animate-in fade-in duration-500">
             <h4 className="text-slate-900 font-black text-3xl tracking-tight">Search Grounding References</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generation.groundingSources.map((source, i) => (
                   <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-6 bg-[#fbfbfd] rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all group flex items-start gap-4"
                   >
                     <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.172a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102 1.101" /></svg>
                     </div>
                     <div className="space-y-1 overflow-hidden">
                        <p className="font-black text-[#414042] text-sm truncate group-hover:text-indigo-600">{source.title}</p>
                        <p className="text-[10px] text-[#414042] opacity-40 truncate">{source.uri}</p>
                     </div>
                   </a>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsView;
