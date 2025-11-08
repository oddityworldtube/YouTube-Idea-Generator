import React, { useCallback, useMemo } from 'react';
import { NicheInputForm } from '../components/NicheInputForm';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { generateIdeas, Idea } from '../services/geminiService';
import { SuggestedNiches } from '../components/SuggestedNiches';
import { SessionManager } from '../components/SessionManager';
import { SelectedIdeas } from '../components/SelectedIdeas';
import { Settings } from '../components/Settings';
import { ApiKey, CustomNiche, HistoryItem, DefaultSettings } from '../App';
import { Niche } from '../data/niches';

interface MainPageProps {
    currentNiches: string;
    setCurrentNiches: React.Dispatch<React.SetStateAction<string>>;
    currentIdeas: Idea[];
    setCurrentIdeas: React.Dispatch<React.SetStateAction<Idea[]>>;
    selectedIdeas: Idea[];
    setSelectedIdeas: React.Dispatch<React.SetStateAction<Idea[]>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    sessions: HistoryItem[];
    handleLoadSession: (sessionId: string) => void;
    handleSaveSession: (generatedIdeas: Idea[]) => void;
    ideaCount: number;
    setIdeaCount: React.Dispatch<React.SetStateAction<number>>;
    positivePrompt: string;
    setPositivePrompt: React.Dispatch<React.SetStateAction<string>>;
    negativePrompt: string;
    setNegativePrompt: React.Dispatch<React.SetStateAction<string>>;
    model: string;
    setModel: React.Dispatch<React.SetStateAction<string>>;
    customModels: string[];
    allNiches: Niche[];
    apiKeys: ApiKey[];
    nextApiKeyIndex: number;
    setNextApiKeyIndex: React.Dispatch<React.SetStateAction<number>>;
    onNavigateToSettings: () => void;
    onSaveDefaults: () => void;
    onDeleteNiche: (nicheId: string) => void;
    onRefreshCategory: (category: string) => Promise<void>;
    defaultSettings: DefaultSettings;
}

export const MainPage: React.FC<MainPageProps> = (props) => {
    const {
        currentNiches, setCurrentNiches, currentIdeas, setCurrentIdeas,
        selectedIdeas, setSelectedIdeas, isLoading, setIsLoading,
        error, setError, sessions, handleLoadSession, handleSaveSession,
        ideaCount, setIdeaCount, positivePrompt, setPositivePrompt,
        negativePrompt, setNegativePrompt, model, setModel,
        customModels, allNiches, apiKeys, nextApiKeyIndex, setNextApiKeyIndex, 
        onNavigateToSettings, onSaveDefaults, onDeleteNiche, onRefreshCategory, defaultSettings
    } = props;

    const handleGenerate = useCallback(async () => {
        if (!currentNiches.trim()) {
            setError('الرجاء إدخال نيتش واحد على الأقل.');
            return;
        }
        if (apiKeys.length === 0) {
            setError('يرجى إضافة مفتاح API واحد على الأقل من صفحة الإعدادات.');
            return;
        }

        const currentIndex = nextApiKeyIndex % apiKeys.length;
        const keyToUse = apiKeys[currentIndex];
        setNextApiKeyIndex(prev => prev + 1);

        setIsLoading(true);
        setError(null);
        setCurrentIdeas([]);

        try {
            const generatedIdeas = await generateIdeas(currentNiches, ideaCount, positivePrompt, negativePrompt, model, keyToUse.key, defaultSettings.titleCaseStyle);
            setCurrentIdeas(generatedIdeas);
            handleSaveSession(generatedIdeas);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء توليد الأفكار. الرجاء المحاولة مرة أخرى.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [
        currentNiches, ideaCount, positivePrompt, negativePrompt, model, apiKeys, nextApiKeyIndex, setNextApiKeyIndex,
        setError, setIsLoading, setCurrentIdeas, handleSaveSession, defaultSettings.titleCaseStyle
    ]);
    
    const handleRegenerateFromTitle = useCallback((title: string) => {
        setCurrentNiches(title);
        setTimeout(handleGenerate, 100);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [handleGenerate, setCurrentNiches]);

    const handleNicheSelect = useCallback((niche: string) => {
        setCurrentNiches(prevNiches => {
            const nicheList = prevNiches.split('،').map(n => n.trim()).filter(Boolean);
            if (nicheList.includes(niche)) return prevNiches;
            return [...nicheList, niche].join('، ');
        });
    }, [setCurrentNiches]);

    const handleSelectIdea = useCallback((ideaToToggle: Idea) => {
        setSelectedIdeas(prevSelected => {
            const isSelected = prevSelected.some(i => i.id === ideaToToggle.id);
            if (isSelected) {
                return prevSelected.filter(i => i.id !== ideaToToggle.id);
            } else {
                return [...prevSelected, ideaToToggle];
            }
        });
    }, [setSelectedIdeas]);

    const handleReorderIdea = useCallback((index: number, direction: 'up' | 'down') => {
        setSelectedIdeas(prevSelected => {
            const newSelected = [...prevSelected];
            const [item] = newSelected.splice(index, 1);
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            newSelected.splice(newIndex, 0, item);
            return newSelected;
        });
    }, [setSelectedIdeas]);
    
    const handleDropReorder = useCallback((dragIndex: number, hoverIndex: number) => {
        setSelectedIdeas(prevSelected => {
            const newSelected = [...prevSelected];
            const [draggedItem] = newSelected.splice(dragIndex, 1);
            newSelected.splice(hoverIndex, 0, draggedItem);
            return newSelected;
        });
    }, [setSelectedIdeas]);

    return (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <aside className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-8">
                <Settings 
                  model={model} 
                  setModel={setModel} 
                  customModels={customModels}
                  onNavigateToSettings={onNavigateToSettings}
                />
                <SuggestedNiches 
                    onNicheSelect={handleNicheSelect} 
                    allNiches={allNiches}
                    onDeleteNiche={onDeleteNiche}
                    onRefreshCategory={onRefreshCategory}
                />
            </aside>
            <main className="lg:col-span-2 flex flex-col gap-6">
                <NicheInputForm
                    niches={currentNiches}
                    setNiches={setCurrentNiches}
                    onGenerate={handleGenerate}
                    isLoading={isLoading}
                    ideaCount={ideaCount}
                    setIdeaCount={setIdeaCount}
                    positivePrompt={positivePrompt}
                    setPositivePrompt={setPositivePrompt}
                    negativePrompt={negativePrompt}
                    setNegativePrompt={setNegativePrompt}
                    onSaveDefaults={onSaveDefaults}
                />
                <SessionManager sessions={sessions} onLoadSession={handleLoadSession} />
                <ResultsDisplay
                    id="results-display"
                    ideas={currentIdeas}
                    isLoading={isLoading}
                    error={error}
                    selectedIdeas={selectedIdeas}
                    onSelectIdea={handleSelectIdea}
                    onRegenerateFromTitle={handleRegenerateFromTitle}
                />
                <SelectedIdeas
                    selectedIdeas={selectedIdeas}
                    onReorder={handleReorderIdea}
                    onClearSelection={() => setSelectedIdeas([])}
                    onDropReorder={handleDropReorder}
                />
            </main>
        </div>
    );
};
