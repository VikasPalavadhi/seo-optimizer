
import React, { useState, useEffect } from 'react';
import { ViewState, Generation, BrandProfile, SEOVariant, AIRecommendation } from './types';
import { BRAND_PROFILES } from './constants';
import Layout from './components/Layout';
import Login from './components/Login';
import ModuleSelector from './components/ModuleSelector';
import Generator from './components/Generator';
import SimpleSEOGenerator from './components/SimpleSEOGenerator';
import ResultsView from './components/ResultsView';
import SimpleResultsView from './components/SimpleResultsView';
import HistoryList from './components/HistoryList';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('login');
  const [user, setUser] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<BrandProfile>(BRAND_PROFILES[0]);
  const [history, setHistory] = useState<Generation[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState<Generation | null>(null);
  const [currentSimpleResult, setCurrentSimpleResult] = useState<{ variants: SEOVariant[], aiRec: AIRecommendation } | null>(null);

  // Load user session and history from local storage on mount
  useEffect(() => {
    // Restore user session
    const savedUser = localStorage.getItem('seo_tool_user');
    const savedView = localStorage.getItem('seo_tool_view');
    const sessionTimestamp = localStorage.getItem('seo_tool_session_time');

    if (savedUser && sessionTimestamp) {
      const now = Date.now();
      const sessionAge = now - parseInt(sessionTimestamp);
      const TEN_MINUTES = 10 * 60 * 1000; // 10 minutes in milliseconds

      if (sessionAge < TEN_MINUTES) {
        setUser(savedUser);
        if (savedView) {
          setView(savedView as ViewState);
        } else {
          setView('module-select');
        }
      } else {
        // Session expired, clear it
        localStorage.removeItem('seo_tool_user');
        localStorage.removeItem('seo_tool_view');
        localStorage.removeItem('seo_tool_session_time');
      }
    }

    // Load history
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
    setView('module-select');
    // Save session to localStorage
    localStorage.setItem('seo_tool_user', username);
    localStorage.setItem('seo_tool_view', 'module-select');
    localStorage.setItem('seo_tool_session_time', Date.now().toString());
  };

  const handleModuleSelect = (module: 'simple-seo' | 'full-seo') => {
    setView(module);
    localStorage.setItem('seo_tool_view', module);
    localStorage.setItem('seo_tool_session_time', Date.now().toString()); // Refresh session
  };

  const handleSimpleSEOComplete = (variants: SEOVariant[], aiRec: AIRecommendation) => {
    setCurrentSimpleResult({ variants, aiRec });
    setView('results');
  };

  const handleBackToModules = () => {
    setView('module-select');
    setCurrentGeneration(null);
    setCurrentSimpleResult(null);
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
    // Clear session from localStorage
    localStorage.removeItem('seo_tool_user');
    localStorage.removeItem('seo_tool_view');
    localStorage.removeItem('seo_tool_session_time');
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
      {view === 'module-select' && (
        <ModuleSelector
          profile={activeProfile}
          onSelectModule={handleModuleSelect}
        />
      )}
      {view === 'simple-seo' && (
        <SimpleSEOGenerator
          profile={activeProfile}
          onComplete={handleSimpleSEOComplete}
          onBack={handleBackToModules}
        />
      )}
      {view === 'full-seo' && (
        <Generator
          profile={activeProfile}
          onComplete={handleGenerationComplete}
          onBack={handleBackToModules}
        />
      )}
      {view === 'results' && currentGeneration && (
        <ResultsView generation={currentGeneration} />
      )}
      {view === 'results' && currentSimpleResult && !currentGeneration && (
        <SimpleResultsView
          variants={currentSimpleResult.variants}
          aiRecommendation={currentSimpleResult.aiRec}
          profile={activeProfile}
        />
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
