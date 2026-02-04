
import React, { useState, useEffect } from 'react';
import { ViewState, Generation, BrandProfile, SEOVariant } from './types';
import { BRAND_PROFILES } from './constants';
import Layout from './components/Layout';
import Login from './components/Login';
import Generator from './components/Generator';
import ResultsView from './components/ResultsView';
import HistoryList from './components/HistoryList';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('login');
  const [user, setUser] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<BrandProfile>(BRAND_PROFILES[0]);
  const [history, setHistory] = useState<Generation[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState<Generation | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('seo_tool_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const saveToHistory = (gen: Generation) => {
    const newHistory = [gen, ...history];
    setHistory(newHistory);
    localStorage.setItem('seo_tool_history', JSON.stringify(newHistory));
  };

  const handleLogin = (username: string) => {
    setUser(username);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  const handleGenerationComplete = (gen: Generation) => {
    setCurrentGeneration(gen);
    saveToHistory(gen);
    setView('results');
  };

  const viewGeneration = (gen: Generation) => {
    setCurrentGeneration(gen);
    setView('results');
  };

  const handleAddEnhancedVariant = (variant: SEOVariant) => {
    if (!currentGeneration) return;

    const updatedGeneration = {
      ...currentGeneration,
      seoVariants: [...currentGeneration.seoVariants, { ...variant, isEnhanced: true }]
    };

    setCurrentGeneration(updatedGeneration);

    // Update in history as well
    const updatedHistory = history.map(h =>
      h.id === currentGeneration.id ? updatedGeneration : h
    );
    setHistory(updatedHistory);
    localStorage.setItem('seo_tool_history', JSON.stringify(updatedHistory));
  };

  const handleAddEnhancedSchema = (schema: any) => {
    if (!currentGeneration) return;

    const updatedGeneration = {
      ...currentGeneration,
      schemaJsonld: schema,
      schemaCommentary: (currentGeneration.schemaCommentary || '') + '\n\n[Enhanced via Chat Assistant]'
    };

    setCurrentGeneration(updatedGeneration);

    // Update in history as well
    const updatedHistory = history.map(h =>
      h.id === currentGeneration.id ? updatedGeneration : h
    );
    setHistory(updatedHistory);
    localStorage.setItem('seo_tool_history', JSON.stringify(updatedHistory));
  };

  if (view === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout
      view={view}
      setView={setView}
      user={user}
      onLogout={handleLogout}
      activeProfile={activeProfile}
      setActiveProfile={setActiveProfile}
      currentGeneration={currentGeneration}
      onAddEnhancedVariant={handleAddEnhancedVariant}
      onAddEnhancedSchema={handleAddEnhancedSchema}
    >
      {view === 'dashboard' && (
        <Generator 
          profile={activeProfile} 
          onComplete={handleGenerationComplete} 
        />
      )}
      {view === 'results' && currentGeneration && (
        <ResultsView generation={currentGeneration} />
      )}
      {view === 'history' && (
        <HistoryList 
          history={history} 
          onView={viewGeneration} 
          onDelete={(id) => {
            const updated = history.filter(h => h.id !== id);
            setHistory(updated);
            localStorage.setItem('seo_tool_history', JSON.stringify(updated));
          }}
        />
      )}
    </Layout>
  );
};

export default App;
