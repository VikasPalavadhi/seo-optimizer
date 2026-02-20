
import React, { useState, useRef, useEffect } from 'react';
import { Generation, SEOVariant } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  newVariant?: SEOVariant;
  newSchema?: any;
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

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#63bfb5] text-[#461e57] font-medium'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Show "Add to Dashboard" buttons for variants or schemas */}
                {msg.role === 'assistant' && (msg.newVariant || msg.newSchema) && (
                  <div className="flex gap-2 px-2">
                    {msg.newVariant && onAddVariant && (
                      <button
                        onClick={() => {
                          onAddVariant(msg.newVariant!);
                          // Show confirmation
                          const confirmMsg: Message = {
                            role: 'assistant',
                            content: '✓ Enhanced variant added to dashboard! You can now view and copy it from the main view.',
                            timestamp: Date.now()
                          };
                          setMessages(prev => [...prev, confirmMsg]);
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105"
                        style={{ backgroundColor: '#63bfb5', color: '#461e57' }}
                      >
                        Add Variant to Dashboard
                      </button>
                    )}
                    {msg.newSchema && onAddSchema && (
                      <button
                        onClick={() => {
                          onAddSchema(msg.newSchema!);
                          // Show confirmation
                          const confirmMsg: Message = {
                            role: 'assistant',
                            content: '✓ Enhanced schema added to dashboard! You can now view and copy it from the main view.',
                            timestamp: Date.now()
                          };
                          setMessages(prev => [...prev, confirmMsg]);
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105"
                        style={{ backgroundColor: '#63bfb5', color: '#461e57' }}
                      >
                        Add Schema to Dashboard
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

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
