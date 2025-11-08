import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { generateIdeas, Idea, fetchTrendingNiches } from './services/geminiService';
import { MainPage } from './pages/MainPage';
import { SettingsPage } from './pages/SettingsPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SUGGESTED_NICHES_WITH_RATINGS, Niche } from './data/niches';

export interface HistoryItem {
  niches: string;
  ideas: Idea[];
  id: string;
  selectedIdeas: Idea[];
  model: string;
  ideaCount: number;
  positivePrompt: string;
  negativePrompt: string;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
}

export interface CustomNiche {
  id: string;
  name: string;
  category: string;
}

export interface DefaultSettings {
  ideaCount: number;
  positivePrompt: string;
  negativePrompt: string;
  model: string;
  titleCaseStyle: 'sentence' | 'title' | 'allcaps';
}

const DEFAULT_API_KEY: ApiKey = {
  id: 'default-key',
  key: 'DEFAULT_API_KEY_PLACEHOLDER', // This is a placeholder, user should add their own
  name: 'مفتاح افتراضي (محدود)'
};

const App: React.FC = () => {
  const [view, setView] = useState<'generator' | 'settings'>('generator');
  
  // Persistent State using LocalStorage
  const [sessions, setSessions] = useLocalStorage<HistoryItem[]>('yt_sessions', []);
  const [apiKeys, setApiKeys] = useLocalStorage<ApiKey[]>('yt_apiKeys', [DEFAULT_API_KEY]);
  const [activeApiKey, setActiveApiKey] = useLocalStorage<string | null>('yt_activeApiKey', DEFAULT_API_KEY.id);
  const [customModels, setCustomModels] = useLocalStorage<string[]>('yt_customModels', []);
  const [customNiches, setCustomNiches] = useLocalStorage<CustomNiche[]>('yt_customNiches', []);
  const [deletedNicheIds, setDeletedNicheIds] = useLocalStorage<string[]>('yt_deletedNicheIds', []);
  const [dynamicNiches, setDynamicNiches] = useLocalStorage<Record<string, Niche[]>>('yt_dynamicNiches', {});

  const [defaultSettings, setDefaultSettings] = useLocalStorage<DefaultSettings>('yt_defaultSettings', {
    ideaCount: 50,
    positivePrompt: '',
    negativePrompt: 'تجنب المواضيع العامة، ركز فقط على الحدث أو الشخصية أو الموضوع المحدد',
    model: 'gemini-2.5-flash',
    titleCaseStyle: 'sentence',
  });
  
  // Active state for the generator, initialized from defaults
  const [currentNiches, setCurrentNiches] = useState<string>('');
  const [currentIdeas, setCurrentIdeas] = useState<Idea[]>([]);
  const [selectedIdeas, setSelectedIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Advanced options state, initialized from defaults
  const [ideaCount, setIdeaCount] = useState<number>(defaultSettings.ideaCount);
  const [positivePrompt, setPositivePrompt] = useState<string>(defaultSettings.positivePrompt);
  const [negativePrompt, setNegativePrompt] = useState<string>(defaultSettings.negativePrompt);
  const [model, setModel] = useState<string>(defaultSettings.model);

  // Effect to ensure there's an active API key if keys exist
  useEffect(() => {
    if (apiKeys.length > 0 && (!activeApiKey || !apiKeys.some(k => k.id === activeApiKey))) {
      setActiveApiKey(apiKeys[0].id);
    } else if (apiKeys.length === 0) {
      setActiveApiKey(null);
    }
  }, [apiKeys, activeApiKey, setActiveApiKey]);


  const handleSaveSession = (generatedIdeas: Idea[]) => {
      if (generatedIdeas.length > 0) {
        const newSession: HistoryItem = {
          niches: currentNiches,
          ideas: generatedIdeas,
          id: Date.now().toString(),
          selectedIdeas: selectedIdeas,
          model,
          ideaCount,
          positivePrompt,
          negativePrompt
        };
        setSessions(prevSessions => 
            [newSession, ...prevSessions.filter(s => s.niches !== currentNiches)].slice(0, 20)
        );
      }
  };
  
  const handleLoadSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
        setCurrentNiches(session.niches);
        setCurrentIdeas(session.ideas);
        setSelectedIdeas(session.selectedIdeas);
        setModel(session.model);
        setIdeaCount(session.ideaCount);
        setPositivePrompt(session.positivePrompt);
        setNegativePrompt(session.negativePrompt);
        setError(null);
        setTimeout(() => {
            const resultsEl = document.getElementById('results-display');
            resultsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
  }, [sessions]);
  
  const handleSaveDefaults = useCallback(() => {
      setDefaultSettings(current => ({ ...current, ideaCount, positivePrompt, negativePrompt, model }));
  }, [ideaCount, positivePrompt, negativePrompt, model, setDefaultSettings]);

  const handleDeleteNiche = (nicheId: string) => {
    setDeletedNicheIds(prev => [...new Set([...prev, nicheId])]);
  };

  const handleRefreshCategory = useCallback(async (category: string) => {
    const keyToUse = apiKeys.find(k => k.id === activeApiKey)?.key;
    if (!keyToUse || keyToUse === DEFAULT_API_KEY.key) {
      alert("يرجى إضافة مفتاح API خاص بك في الإعدادات لاستخدام هذه الميزة.");
      return;
    }
    try {
      const newNiches = await fetchTrendingNiches(category, keyToUse);
      const newNicheObjects: Niche[] = newNiches.map((name, index) => ({
        id: `dyn_${category}_${Date.now()}_${index}`,
        name,
        category,
        rating: 90 + Math.floor(Math.random() * 10) // Assign a high random rating
      }));
      setDynamicNiches(prev => ({...prev, [category]: newNicheObjects }));
    } catch (e: any) {
      alert(`فشل تحديث النيتشات: ${e.message}`);
    }
  }, [apiKeys, activeApiKey, setDynamicNiches]);
  
  const combinedNiches = useMemo(() => {
      const baseNiches = SUGGESTED_NICHES_WITH_RATINGS.filter(n => !deletedNicheIds.includes(n.id));
      const allNiches = [...baseNiches];
      Object.keys(dynamicNiches).forEach(category => {
          // Replace base niches of this category with dynamic ones
          const categoryBaseNiches = allNiches.filter(n => n.category !== category);
          allNiches.length = 0; // Clear array
          allNiches.push(...categoryBaseNiches, ...dynamicNiches[category]);
      });
      const custom = customNiches.map(cn => ({ ...cn, rating: undefined }));
      return [...allNiches, ...custom];
  }, [customNiches, deletedNicheIds, dynamicNiches]);


  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header />
        
        {view === 'generator' ? (
          <MainPage
            currentNiches={currentNiches}
            setCurrentNiches={setCurrentNiches}
            currentIdeas={currentIdeas}
            setCurrentIdeas={setCurrentIdeas}
            selectedIdeas={selectedIdeas}
            setSelectedIdeas={setSelectedIdeas}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
            sessions={sessions}
            handleLoadSession={handleLoadSession}
            handleSaveSession={handleSaveSession}
            ideaCount={ideaCount}
            setIdeaCount={setIdeaCount}
            positivePrompt={positivePrompt}
            setPositivePrompt={setPositivePrompt}
            negativePrompt={negativePrompt}
            setNegativePrompt={setNegativePrompt}
            model={model}
            setModel={setModel}
            customModels={customModels}
            allNiches={combinedNiches}
            apiKeys={apiKeys}
            activeApiKey={activeApiKey}
            onNavigateToSettings={() => setView('settings')}
            onSaveDefaults={handleSaveDefaults}
            onDeleteNiche={handleDeleteNiche}
            onRefreshCategory={handleRefreshCategory}
            defaultSettings={defaultSettings}
          />
        ) : (
          <SettingsPage
            apiKeys={apiKeys}
            setApiKeys={setApiKeys}
            activeApiKey={activeApiKey}
            setActiveApiKey={setActiveApiKey}
            customModels={customModels}
            setCustomModels={setCustomModels}
            customNiches={customNiches}
            setCustomNiches={setCustomNiches}
            onBack={() => setView('generator')}
            defaultSettings={defaultSettings}
            setDefaultSettings={setDefaultSettings}
          />
        )}
      </div>
    </div>
  );
};

export default App;