
import React, { useState, useRef, useEffect } from 'react';
import { Generation, SEOVariant } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  newVariant?: SEOVariant;
  newSchema?: any;
  variantAdded?: boolean;
  schemaAdded?: boolean;
  variantCopied?: boolean;
  schemaCopied?: boolean;
  isExpanded?: boolean;
}

interface ChatBotProps {
  currentGeneration?: Generation | null;
  onAddVariant?: (variant: SEOVariant) => void;
  onAddSchema?: (schema: any) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ currentGeneration, onAddVariant, onAddSchema }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Use relative URL in production, localhost in development
      const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3007/api/chat'
        : '/api/chat';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: currentGeneration
        })
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = await response.json();

      // Clean up the message content by removing the markers
      let cleanContent = data.message;
      cleanContent = cleanContent.replace(/---NEW_VARIANT---[\s\S]*?---END_VARIANT---/g, '');
      cleanContent = cleanContent.replace(/---NEW_SCHEMA---[\s\S]*?---END_SCHEMA---/g, '');
      cleanContent = cleanContent.trim();

      const assistantMessage: Message = {
        role: 'assistant',
        content: cleanContent,
        timestamp: Date.now(),
        newVariant: data.newVariant,
        newSchema: data.newSchema
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 z-50"
          style={{ backgroundColor: '#63bfb5' }}
          title="Open SEO Assistant"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full sm:w-96 h-[500px] sm:h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100" style={{ backgroundColor: '#63bfb5' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-white text-lg" style={{ color: '#461e57' }}>SEO Assistant</h3>
                <p className="text-xs font-medium" style={{ color: '#461e57', opacity: 0.7 }}>Ask about your SEO variants</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              style={{ color: '#461e57' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">How can I help with your SEO?</p>
                <p className="text-xs text-slate-400 mt-2">Ask me about your variants, schema, or get recommendations</p>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isLongContent = msg.content.length > 400;
              const isJsonContent = msg.content.includes('"@context"') || msg.content.includes('"@type"') || msg.content.trim().startsWith('{');
              const isExpanded = msg.isExpanded ?? false;
              const displayContent = isLongContent && !isExpanded
                ? msg.content.substring(0, 400) + '...'
                : msg.content;

              return (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'max-w-[80%] bg-[#63bfb5] text-[#461e57] font-medium'
                    : 'max-w-[95%] bg-slate-100 text-slate-800'
                }`}>
                  {/* Check if content contains JSON/schema for special formatting */}
                  {msg.role === 'assistant' && isJsonContent ? (
                    <div className="space-y-2">
                      {/* Extract non-JSON text before the schema */}
                      {msg.content.split(/```json|```/)[0] && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {isExpanded ? msg.content.split(/```json|```/)[0] : msg.content.split(/```json|```/)[0].substring(0, 200)}
                        </p>
                      )}
                      {/* Schema code block - dynamic height when expanded */}
                      <div className={`bg-slate-800 rounded-xl p-3 ${isExpanded ? '' : 'max-h-[150px] overflow-hidden'}`}>
                        <pre className="text-xs text-green-400 whitespace-pre-wrap break-words font-mono">
                          {isExpanded ? msg.content : displayContent}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayContent}</p>
                  )}

                  {/* Show expand/collapse button for long content */}
                  {isLongContent && msg.role === 'assistant' && (
                    <button
                      onClick={() => {
                        setMessages(prev => prev.map((m, i) =>
                          i === idx ? { ...m, isExpanded: !isExpanded } : m
                        ));
                      }}
                      className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          </svg>
                          Show less
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                          Show full content ({msg.content.length} characters)
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Show action buttons for variants or schemas */}
                {msg.role === 'assistant' && (msg.newVariant || msg.newSchema) && (
                  <div className="w-full max-w-[90%] mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Quick Actions</p>

                    {/* Variant Actions */}
                    {msg.newVariant && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-700">New Variant Generated:</p>
                        <div className="flex flex-wrap gap-2">
                          {onAddVariant && !msg.variantAdded && (
                            <button
                              onClick={() => {
                                onAddVariant(msg.newVariant!);
                                // Mark as added
                                setMessages(prev => prev.map((m, i) =>
                                  i === idx ? { ...m, variantAdded: true } : m
                                ));
                              }}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                              style={{ backgroundColor: '#63bfb5', color: '#461e57' }}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                              </svg>
                              Add to Dashboard
                            </button>
                          )}
                          {msg.variantAdded && (
                            <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-green-100 text-green-700">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Added!
                            </span>
                          )}
                          <button
                            onClick={() => {
                              const variantText = `H1: ${msg.newVariant!.h1}\n\nMeta Title: ${msg.newVariant!.metaTitle}\n\nMeta Description: ${msg.newVariant!.metaDescription}\n\nKeywords: ${msg.newVariant!.keyphrases.join(', ')}`;
                              navigator.clipboard.writeText(variantText);
                              setMessages(prev => prev.map((m, i) =>
                                i === idx ? { ...m, variantCopied: true } : m
                              ));
                              setTimeout(() => {
                                setMessages(prev => prev.map((m, i) =>
                                  i === idx ? { ...m, variantCopied: false } : m
                                ));
                              }, 2000);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            {msg.variantCopied ? 'Copied!' : 'Copy Variant'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Schema Actions */}
                    {msg.newSchema && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-700">New Schema Generated:</p>
                        <div className="flex flex-wrap gap-2">
                          {onAddSchema && !msg.schemaAdded && (
                            <button
                              onClick={() => {
                                onAddSchema(msg.newSchema!);
                                // Mark as added
                                setMessages(prev => prev.map((m, i) =>
                                  i === idx ? { ...m, schemaAdded: true } : m
                                ));
                              }}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                              style={{ backgroundColor: '#63bfb5', color: '#461e57' }}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                              </svg>
                              Add to Dashboard
                            </button>
                          )}
                          {msg.schemaAdded && (
                            <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-green-100 text-green-700">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Added!
                            </span>
                          )}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(msg.newSchema, null, 2));
                              setMessages(prev => prev.map((m, i) =>
                                i === idx ? { ...m, schemaCopied: true } : m
                              ));
                              setTimeout(() => {
                                setMessages(prev => prev.map((m, i) =>
                                  i === idx ? { ...m, schemaCopied: false } : m
                                ));
                              }, 2000);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            {msg.schemaCopied ? 'Copied!' : 'Copy Schema'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your SEO variants..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#63bfb5] outline-none transition-all text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="px-4 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                style={{ backgroundColor: '#63bfb5' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
