
import React, { useState, useEffect, useRef } from 'react';
import { BrandProfile, PageType, Generation, ModelProvider } from '../types';
import { PAGE_TYPES } from '../constants';
import { generateContent } from '../services/geminiService';

interface GeneratorProps {
  profile: BrandProfile;
  onComplete: (gen: Generation) => void;
}

const Generator: React.FC<GeneratorProps> = ({ profile, onComplete }) => {
  const [url, setUrl] = useState('');
  const [pastedHtml, setPastedHtml] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const [pageType, setPageType] = useState<PageType | 'auto'>('auto');
  const [modelProvider, setModelProvider] = useState<ModelProvider>(ModelProvider.GEMINI);
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; type: 'limit' | 'error' | 'timeout' } | null>(null);
  const [loadingTime, setLoadingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => setLoadingTime(prev => prev + 1), 1000);
    } else {
      setLoadingTime(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError({ message: 'File too large. Please upload a document under 15MB.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setUploadedFile({
        name: file.name,
        data: base64,
        mimeType: file.type || 'application/octet-stream'
      });
      setUrl('');
      setPastedHtml('');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (inputMethod === 'text' && !url.trim() && !pastedHtml.trim()) {
      setError({ message: 'Provide source URL or HTML content to begin audit.', type: 'error' });
      return;
    }
    if (inputMethod === 'file' && !uploadedFile) {
      setError({ message: 'Please upload a document to begin audit.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setError(null);

    const TIMEOUT_MS = 120000; 
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS)
    );

    try {
      let input: any = inputMethod === 'text' ? (url.trim() || pastedHtml.trim()) : { data: uploadedFile?.data, mimeType: uploadedFile?.mimeType };
      const isUrlInput = inputMethod === 'text' && !!url.trim();

      const apiCall = generateContent(
        input,
        profile,
        pageType === 'auto' ? undefined : (pageType as PageType),
        isUrlInput,
        modelProvider
      );

      const result: any = await Promise.race([apiCall, timeoutPromise]);

      if (!result || !result.seoVariants || result.seoVariants.length === 0) {
        throw new Error("Audit failed. Check source accessibility.");
      }

      const generation: Generation = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        url: url.trim() || uploadedFile?.name || (pastedHtml ? 'Manual Context' : 'Manual Audit'),
        profileId: profile.id,
        pageType: result.pageType || PageType.GENERIC,
        modelProvider: modelProvider,
        extracted: result.extraction,
        seoVariants: result.seoVariants,
        schemaJsonld: result.schemaJsonld,
        schemaCommentary: result.schemaCommentary,
        validation: result.validation,
        groundingSources: result.groundingSources,
        aiRecommendation: result.aiRecommendation,
        strategicImpact: result.strategicImpact
      };

      onComplete(generation);
    } catch (err: any) {
      console.error("SEO Audit Error:", err);
      let msg = err.message || 'Audit failed.';
      let type: 'limit' | 'error' | 'timeout' = 'error';

      if (err.message === 'TIMEOUT') {
        msg = 'Connection timed out.';
        type = 'timeout';
      } else if (msg.includes('429')) {
        msg = 'Engine is busy. Try again soon.';
        type = 'limit';
      }

      setError({ message: msg, type });
    } finally {
      setIsLoading(false);
    }
  };

  const clearInputs = () => {
    setUrl('');
    setPastedHtml('');
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <h2 className="text-6xl font-black text-slate-900 tracking-tighter">SEO Generator</h2>
          <p className="text-[#414042] font-medium text-xl leading-relaxed">
            Optimizing for <span style={{ color: profile.primaryColor }} className="font-bold underline decoration-2 underline-offset-8">{profile.name}</span>.
          </p>
        </div>
        {(url || pastedHtml || uploadedFile) && !isLoading && (
          <button onClick={clearInputs} className="text-[11px] font-black text-[#414042] hover:text-rose-500 uppercase tracking-[0.4em] px-8 py-4 bg-white border border-slate-200 rounded-full transition-all shadow-sm active:scale-95">
            Clear Configuration
          </button>
        )}
      </header>

      <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-slate-200 p-8 md:p-12 overflow-hidden">
        <div className="flex flex-col gap-8">

          {/* Main Input Toggle Area */}
          <div className="space-y-6">
            {inputMethod === 'text' ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <section className="space-y-4">
                  <label className="text-[11px] font-black text-[#414042] uppercase tracking-[0.5em] ml-2 block opacity-60">Target Destination URL</label>
                  <div className="relative group">
                    <input
                      type="url"
                      value={url}
                      disabled={isLoading}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.example.com/product-page"
                      className="w-full pl-14 pr-8 py-6 bg-[#f5f5f7]/50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-[var(--brand-primary)] outline-none transition-all shadow-inner font-bold text-slate-900 text-lg placeholder:text-slate-300"
                    />
                    <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[var(--brand-primary)] transition-colors">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <label className="text-[11px] font-black text-[#414042] uppercase tracking-[0.5em] ml-2 block opacity-60">Direct Content / HTML Payload</label>
                  <textarea
                    value={pastedHtml}
                    disabled={isLoading}
                    onChange={(e) => setPastedHtml(e.target.value)}
                    placeholder="Paste your page source or marketing copy here for deep semantic indexing..."
                    className="w-full px-10 py-8 bg-[#f5f5f7]/50 border-2 border-transparent rounded-[2.5rem] focus:bg-white focus:border-[var(--brand-primary)] outline-none transition-all shadow-inner font-medium text-[#414042] text-base min-h-[200px] resize-none leading-relaxed placeholder:text-slate-300"
                  />
                </section>
              </div>
            ) : (
              <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <label className="text-[11px] font-black text-[#414042] uppercase tracking-[0.5em] ml-2 block opacity-60">Enterprise Asset Audit</label>
                <div
                  onClick={() => !isLoading && fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-[3rem] p-16 transition-all flex flex-col items-center justify-center gap-6 cursor-pointer ${isLoading ? 'opacity-30 grayscale cursor-not-allowed bg-[#f5f5f7]' : uploadedFile ? 'bg-indigo-50/20 border-indigo-200' : 'bg-[#f5f5f7]/30 border-slate-200 hover:border-[var(--brand-primary)] hover:bg-white'}`}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.html,.txt" onChange={handleFileUpload} />
                  {uploadedFile ? (
                    <>
                      <div className="p-8 rounded-[2.5rem] shadow-2xl text-white transform transition-transform scale-110" style={{ backgroundColor: 'var(--brand-primary)' }}>
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-slate-900 text-2xl tracking-tight">{uploadedFile.name}</p>
                        <p className="text-sm font-black text-[#414042] mt-2 uppercase tracking-[0.2em] opacity-50">Document verified for processing</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-xl font-bold text-[#414042]">Drag & Drop Growth Assets</p>
                        <p className="text-xs font-black text-[#414042] uppercase tracking-[0.4em] opacity-40">PDF • HTML • TXT (MAX 15MB)</p>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            <div className="flex justify-center">
               <button 
                onClick={() => setInputMethod(inputMethod === 'text' ? 'file' : 'text')}
                className="text-[11px] font-black text-[#414042] hover:text-indigo-600 transition-all uppercase tracking-[0.4em] px-10 py-4 rounded-full border border-slate-200 hover:border-indigo-100 bg-white shadow-sm flex items-center gap-3 active:scale-95"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                 {inputMethod === 'text' ? 'Analyze a document or PDF instead?' : 'Switch to Text/URL input mode'}
               </button>
            </div>
          </div>

          <div className="space-y-8 pt-8 border-t border-slate-50">
            <section className="space-y-6">
              <label className="text-[11px] font-black text-[#414042] uppercase tracking-[0.5em] ml-2 block opacity-60">Target Search Intent</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {['auto', ...PAGE_TYPES].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPageType(type as any)}
                    className={`py-4 px-5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-3 ${pageType === type ? 'text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-50 text-[#414042] hover:border-slate-200 opacity-60 hover:opacity-100'}`}
                    style={pageType === type ? { backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)', opacity: 1 } : {}}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <label className="text-[11px] font-black text-[#414042] uppercase tracking-[0.5em] ml-2 block opacity-60">AI Model Provider</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  key="gemini"
                  type="button"
                  onClick={() => setModelProvider(ModelProvider.GEMINI)}
                  className={`py-6 px-6 rounded-[1.5rem] text-sm font-black uppercase tracking-wide transition-all border-2 flex flex-col items-center justify-center gap-2 ${modelProvider === ModelProvider.GEMINI ? 'shadow-xl scale-[1.02]' : 'bg-white border-slate-50 text-[#414042] hover:border-slate-200 opacity-60 hover:opacity-100'}`}
                  style={modelProvider === ModelProvider.GEMINI ? { backgroundColor: '#63bfb5', borderColor: '#63bfb5', color: '#461e57', opacity: 1 } : {}}
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>
                  <span>Google Gemini</span>
                  <span className="text-[9px] opacity-70">Gemini 2.0 Flash</span>
                </button>
                <button
                  key="openai"
                  type="button"
                  onClick={() => setModelProvider(ModelProvider.OPENAI)}
                  className={`py-6 px-6 rounded-[1.5rem] text-sm font-black uppercase tracking-wide transition-all border-2 flex flex-col items-center justify-center gap-2 ${modelProvider === ModelProvider.OPENAI ? 'shadow-xl scale-[1.02]' : 'bg-white border-slate-50 text-[#414042] hover:border-slate-200 opacity-60 hover:opacity-100'}`}
                  style={modelProvider === ModelProvider.OPENAI ? { backgroundColor: '#63bfb5', borderColor: '#63bfb5', color: '#461e57', opacity: 1 } : {}}
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>
                  <span>OpenAI GPT-4</span>
                  <span className="text-[9px] opacity-70">GPT-4o Latest</span>
                </button>
              </div>
            </section>

            <div className="pt-6">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className={`w-full py-8 rounded-[2rem] font-black text-xl transition-all transform active:scale-[0.98] flex flex-col items-center justify-center relative overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] ${isLoading ? 'bg-slate-100 text-[#414042] cursor-not-allowed opacity-40' : 'text-white hover:brightness-110 active:brightness-95 hover:shadow-[0_32px_56px_-16px_rgba(0,0,0,0.3)]'}`}
                style={!isLoading ? { backgroundColor: 'var(--brand-primary)' } : {}}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center gap-5">
                    <svg className="animate-spin h-10 w-10" style={{ color: 'var(--brand-primary)' }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span className="uppercase tracking-[0.5em] text-[11px] font-black">Processing Engine</span>
                  </div>
                ) : (
                  <span className="uppercase tracking-[0.4em]">Get SEO Details Now</span>
                )}
                {isLoading && <div className="absolute bottom-0 left-0 h-2 w-full animate-progress" style={{ backgroundColor: 'var(--brand-accent)' }} />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 px-8 py-6 bg-rose-50 rounded-[2rem] border-2 border-rose-100 flex items-start gap-4 animate-in shake duration-500">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-rose-500">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <p className="font-bold text-rose-900 text-lg leading-relaxed mt-2">{error.message}</p>
          </div>
        )}
      </div>

      <footer className="text-center pt-6 pb-10">
        <p className="text-[11px] font-black text-[#414042] uppercase tracking-[0.5em] opacity-30">Global Enterprise Optimization Framework v3.1</p>
      </footer>
    </div>
  );
};

export default Generator;
