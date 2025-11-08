import React, { useState } from 'react';
import { SparklesIcon, LoadingIcon, AdjustmentsIcon, ChevronDownIcon, SearchIcon, SaveIcon, CheckIcon } from './Icons';
import { SUGGESTED_NICHES_WITH_RATINGS } from '../data/niches';


interface NicheInputFormProps {
  niches: string;
  setNiches: (niches: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  ideaCount: number;
  setIdeaCount: (count: number) => void;
  positivePrompt: string;
  setPositivePrompt: (prompt: string) => void;
  negativePrompt: string;
  setNegativePrompt: (prompt: string) => void;
  onSaveDefaults: () => void;
}

export const NicheInputForm: React.FC<NicheInputFormProps> = ({ 
    niches, setNiches, onGenerate, isLoading,
    ideaCount, setIdeaCount,
    positivePrompt, setPositivePrompt,
    negativePrompt, setNegativePrompt,
    onSaveDefaults
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmedNiches = niches.trim();
      if (trimmedNiches.length > 0 && !trimmedNiches.endsWith('،')) {
          setNiches(trimmedNiches + '، ');
      }
    }
  };
  
  const handleIdeaCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10);
    if (!isNaN(count)) {
        setIdeaCount(Math.max(5, Math.min(100, count)));
    }
  };
  
  const handleSaveClick = () => {
    onSaveDefaults();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const findRelatedNiches = () => {
    const searchTerms = niches.split('،').map(n => n.trim().toLowerCase()).filter(Boolean);
    if(searchTerms.length === 0) return;

    const related = SUGGESTED_NICHES_WITH_RATINGS.filter(niche => 
        searchTerms.some(term => niche.name.toLowerCase().includes(term))
    );

    const relatedNames = related.map(r => r.name);
    const currentNichesList = niches.split('،').map(n => n.trim()).filter(Boolean);
    const newNichesToAdd = relatedNames.filter(name => !currentNichesList.includes(name));

    if(newNichesToAdd.length > 0) {
        const updatedNiches = [...currentNichesList, ...newNichesToAdd].join('، ');
        setNiches(updatedNiches);
    }
  };

  return (
    <div className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <label htmlFor="niches" className="block text-lg font-medium text-slate-300 mb-2">
        أدخل النيتشات (اضغط Enter للفصل بينهم)
      </label>
      <div className="relative">
        <textarea
          id="niches"
          value={niches}
          onChange={(e) => setNiches(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="مثال: الطبخ الصحي، السفر الاقتصادي، تطوير الذات"
          rows={3}
          className="w-full p-4 pr-12 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors placeholder-slate-500 resize-none"
          disabled={isLoading}
        />
        <button 
          onClick={findRelatedNiches}
          disabled={isLoading || !niches.trim()}
          title="ابحث عن نيتشات مشابهة من القائمة المقترحة"
          className="absolute top-3 left-3 bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-md transition-colors disabled:opacity-50"
        >
            <SearchIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4">
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-slate-400 hover:text-slate-200">
            <AdjustmentsIcon className="h-5 w-5" />
            <span className="font-semibold">خيارات متقدمة</span>
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
        {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div>
                    <label htmlFor="ideaCount" className="block text-sm font-medium text-slate-300 mb-1">
                        عدد العناوين المطلوبة ({ideaCount})
                    </label>
                    <input
                        type="range" id="ideaCount" min="5" max="100" step="5" value={ideaCount}
                        onChange={handleIdeaCountChange}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="positivePrompt" className="block text-sm font-medium text-slate-300 mb-1">
                        التركيز على (برومبت إيجابي)
                    </label>
                    <input
                        type="text" id="positivePrompt" value={positivePrompt} onChange={(e) => setPositivePrompt(e.target.value)}
                        placeholder="مثال: للمبتدئين، بدون تكلفة"
                        className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md focus:ring-1 focus:ring-red-500"
                        disabled={isLoading}
                    />
                </div>
                <div className="md:col-span-2">
                     <label htmlFor="negativePrompt" className="block text-sm font-medium text-slate-300 mb-1">
                        تجنب (برومبت سلبي)
                    </label>
                    <input
                        type="text" id="negativePrompt" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="مثال: أدوات مدفوعة، للمحترفين"
                        className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md focus:ring-1 focus:ring-red-500"
                        disabled={isLoading}
                    />
                </div>
                <div className="md:col-span-2 flex justify-end">
                    <button onClick={handleSaveClick} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-3 rounded-md transition-colors text-sm">
                        {isSaved ? <CheckIcon className="h-5 w-5 text-green-400" /> : <SaveIcon className="h-5 w-5" />}
                        <span>{isSaved ? 'تم الحفظ!' : 'حفظ كإعدادات افتراضية'}</span>
                    </button>
                </div>
            </div>
        )}
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !niches.trim()}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? (
          <><LoadingIcon className="animate-spin h-5 w-5" /> جاري التوليد...</>
        ) : (
          <><SparklesIcon className="h-5 w-5" /> توليد الأفكار</>
        )}
      </button>
    </div>
  );
};
