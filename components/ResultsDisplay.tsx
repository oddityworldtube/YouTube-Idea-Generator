import React, { useState, useEffect } from 'react';
import { CopyIcon, CheckIcon, LoadingIcon, ClipboardDocumentListIcon, RefreshIcon } from './Icons';
import { Idea } from '../services/geminiService';

interface ResultsDisplayProps {
  id?: string;
  ideas: Idea[];
  isLoading: boolean;
  error: string | null;
  selectedIdeas: Idea[];
  onSelectIdea: (idea: Idea) => void;
  onRegenerateFromTitle: (title: string) => void;
}

const getRatingColor = (rating: number): string => {
    if (rating >= 90) return 'bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/30';
    if (rating >= 80) return 'bg-yellow-500/20 text-yellow-300 ring-1 ring-inset ring-yellow-500/30';
    return 'bg-orange-500/20 text-orange-300 ring-1 ring-inset ring-orange-500/30';
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ id, ideas, isLoading, error, selectedIdeas, onSelectIdea, onRegenerateFromTitle }) => {
  const [isAllCopied, setIsAllCopied] = useState(false);
  const [isTitlesCopied, setIsTitlesCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const handleCopyAll = () => {
    const textToCopy = ideas.map(idea => idea.originalLine).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setIsAllCopied(true);
    setTimeout(() => setIsAllCopied(false), 2000);
  };

  const handleCopyTitles = () => {
    const titlesOnly = ideas.map(idea => idea.title).join('\n');
    navigator.clipboard.writeText(titlesOnly);
    setIsTitlesCopied(true);
    setTimeout(() => setIsTitlesCopied(false), 2000);
  }
  
  const handleCopyLine = (idea: Idea, index: number) => {
    navigator.clipboard.writeText(idea.originalLine);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  useEffect(() => {
    setIsAllCopied(false);
    setIsTitlesCopied(false);
    setCopiedIndex(null);
  }, [ideas]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-slate-400 p-8">
          <LoadingIcon className="animate-spin h-12 w-12 mb-4" />
          <p className="text-lg">يقوم الذكاء الاصطناعي بتحليل طلبك وتوليد أفضل الأفكار...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      );
    }
    
    if (ideas.length === 0) {
        return (
            <div className="text-center text-slate-500 p-8">
                <p>ستظهر نتائجك هنا.</p>
            </div>
        )
    }

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 relative">
        <div className="absolute top-3 left-3 flex gap-2 z-10">
            <button onClick={handleCopyAll} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-md transition-colors" title="نسخ الكل (عناوين وأوصاف)">
              {isAllCopied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
            </button>
            <button onClick={handleCopyTitles} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-md transition-colors" title="نسخ العناوين فقط">
              {isTitlesCopied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardDocumentListIcon className="h-5 w-5" />}
            </button>
        </div>
         <p className="text-sm text-slate-400 text-center mb-2 pt-10">النتائج مرتبة تلقائيًا حسب تقييم SEO الأعلى</p>
        <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2">
          {ideas.map((idea, index) => {
            const isSelected = selectedIdeas.some(i => i.id === idea.id);
            return (
              <div key={idea.id} className={`flex items-start group p-2 rounded-md transition-colors ${isSelected ? 'bg-red-500/10' : ''}`}>
                <div className="flex-shrink-0 pt-1.5 pr-2">
                    <input type="checkbox" checked={isSelected} onChange={() => onSelectIdea(idea)} className="h-4 w-4 rounded bg-slate-700 border-slate-500 text-red-600 focus:ring-red-500 cursor-pointer"/>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getRatingColor(idea.score)}`}>{idea.score}</span>
                    <p className="font-semibold text-slate-100">{idea.title}</p>
                  </div>
                  <p className="text-sm text-slate-400 mr-10">{idea.description}</p>
                </div>
                <div className="flex items-center ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onRegenerateFromTitle(idea.title)} className="bg-slate-700 hover:bg-slate-600 p-1.5 rounded-md" title="توليد أفكار مشابهة لهذا العنوان">
                        <RefreshIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleCopyLine(idea, index)} className="bg-slate-700 hover:bg-slate-600 p-1.5 rounded-md mr-1" title="نسخ السطر">
                      {copiedIndex === index ? <CheckIcon className="h-4 w-4 text-green-400" /> : <CopyIcon className="h-4 w-4" />}
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return <div id={id} className="mt-8 w-full">{renderContent()}</div>;
};
