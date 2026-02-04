
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (user: string) => void;
}

// Valid users with their credentials
const VALID_USERS = {
  'hakan': 'WPBmartech@i2025',
  'vikas': 'WPBmartech@i2025',
  'sudhir': 'WPBmartech@i2025'
};

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate credentials
    const lowercaseUsername = username.toLowerCase();
    if (VALID_USERS[lowercaseUsername as keyof typeof VALID_USERS] === password) {
      onLogin(username);
    } else {
      setError('Invalid credentials. Please check your username and password.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/50 to-teal-50 flex items-center justify-center p-6 selection:bg-indigo-100">
      <div className="bg-white/80 backdrop-blur-2xl p-10 md:p-14 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] max-w-lg w-full border border-white/50 animate-in zoom-in-95 duration-700">
        <div className="text-center mb-12">
          <div className="inline-flex p-5 rounded-3xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm border border-indigo-100/50">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">SEO <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">Guru</span></h2>
          <p className="text-slate-500 mt-4 font-medium tracking-tight">Enterprise SEO intelligence powered by AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-[1.5rem] text-sm font-semibold">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
              placeholder="Enter username"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
              placeholder="••••••••"
            />
          </div>
          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-slate-800 transition shadow-[0_16px_32px_-8px_rgba(0,0,0,0.2)] transform active:scale-[0.98]"
            >
              Sign In
            </button>
            <p className="text-center text-[10px] font-bold text-slate-400 mt-8 uppercase tracking-[0.2em]">Authorized Access Only</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
