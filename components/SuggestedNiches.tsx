import React, { useState, useMemo } from 'react';
import { ChevronDownIcon, RefreshIcon, TrashIcon, LoadingIcon } from './Icons';
import { Niche } from '../data/niches';

interface SuggestedNichesProps {
  onNicheSelect: (niche: string) => void;
  allNiches: Niche[];
  onDeleteNiche: (nicheId: string) => void;
  onRefreshCategory: (category: string) => Promise<void>;
}

const getRatingColor = (rating: number): string => {
    if (rating >= 90) return 'bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/30';
    if (rating >= 80) return 'bg-yellow-500/20 text-yellow-300 ring-1 ring-inset ring-yellow-500/30';
    return 'bg-orange-500/20 text-orange-300 ring-1 ring-inset ring-orange-500/30';
};

export const SuggestedNiches: React.FC<SuggestedNichesProps> = ({ onNicheSelect, allNiches, onDeleteNiche, onRefreshCategory }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshingCategory, setRefreshingCategory] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState({
        'psychology': true, 'documentary': true, 'tech': true,
        'lifestyle': true, 'finance': true, 'business': true,
        'entertainment': true, 'education': true, 'general': true
    });

    const handleToggleGroup = (group: keyof typeof expandedGroups) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const handleRefresh = async (e: React.MouseEvent, category: string) => {
        e.stopPropagation(); // Prevent toggling the group
        setRefreshingCategory(category);
        await onRefreshCategory(category);
        setRefreshingCategory(null);
    };

    const filteredNiches = useMemo(() => {
        return allNiches.filter(niche =>
            niche.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allNiches]);

    const nicheGroups = useMemo(() => {
        const groups: Record<string, { title: string, niches: Niche[], color: string }> = {
            'psychology': { title: 'علم النفس وتحليل الشخصيات', niches: [], color: 'border-purple-500/50' },
            'documentary': { title: 'وثائقي، تاريخي واكتشافات', niches: [], color: 'border-sky-500/50' },
            'tech': { title: 'تكنولوجيا وتقنية', niches: [], color: 'border-blue-500/50' },
            'lifestyle': { title: 'أسلوب حياة', niches: [], color: 'border-pink-500/50' },
            'finance': { title: 'تمويل واستثمار', niches: [], color: 'border-green-500/50' },
            'business': { title: 'أعمال وتسويق', niches: [], color: 'border-indigo-500/50' },
            'entertainment': { title: 'ترفيه', niches: [], color: 'border-red-500/50' },
            'education': { title: 'تعليم', niches: [], color: 'border-amber-500/50' },
            'general': { title: 'متنوع', niches: [], color: 'border-gray-500/50' },
        };

        filteredNiches.forEach(niche => {
            if (groups[niche.category]) {
                groups[niche.category].niches.push(niche);
            } else {
                groups['general'].niches.push(niche);
            }
        });
        
        return Object.entries(groups).map(([id, data]) => ({ id: id as keyof typeof expandedGroups, ...data }));

    }, [filteredNiches]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h2 className="text-lg font-medium text-slate-300 mb-3">نيتشات مقترحة</h2>
      <div className="relative mb-4">
          <input
              type="search" placeholder="ابحث عن نيتش..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500"
          />
      </div>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
        {nicheGroups.map(group => (
            group.niches.length > 0 && (
                <div key={group.id} className={`bg-slate-800/50 rounded-lg border ${group.color}`}>
                    <button onClick={() => handleToggleGroup(group.id)} className="w-full flex justify-between items-center p-3 text-right font-semibold text-slate-200">
                        <div className="flex items-center gap-2">
                            <button onClick={(e) => handleRefresh(e, group.id)} disabled={refreshingCategory === group.id} className="text-slate-400 hover:text-white disabled:opacity-50" title="تحديث لأفضل النيتشات الرائجة الآن">
                                {refreshingCategory === group.id ? <LoadingIcon className="h-4 w-4 animate-spin"/> : <RefreshIcon className="h-4 w-4"/>}
                            </button>
                            <span>{group.title} <span className="text-slate-400">({group.niches.length})</span></span>
                        </div>
                        <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${!expandedGroups[group.id] ? '-rotate-90' : ''}`} />
                    </button>
                    {expandedGroups[group.id] && (
                        <div className="p-4 border-t border-slate-700">
                            <div className="flex flex-wrap gap-3">
                                {group.niches.sort((a,b) => (b.rating ?? 0) - (a.rating ?? 0)).map((niche) => (
                                    <div key={niche.id} className="group relative flex items-center bg-slate-700 rounded-full text-sm font-medium">
                                        <button
                                          onClick={() => onNicheSelect(niche.name)}
                                          className="flex items-center text-slate-200 hover:text-white transition-colors duration-200 pl-4 pr-4 py-1.5"
                                        >
                                          <span>{niche.name}</span>
                                          {niche.rating && (
                                            <span className={`mr-2 text-xs font-bold px-2 py-0.5 rounded-full ${getRatingColor(niche.rating)}`}>
                                              {niche.rating}
                                            </span>
                                          )}
                                        </button>
                                        {!niche.id.startsWith("dyn_") && (
                                            <button onClick={() => onDeleteNiche(niche.id)} className="absolute -left-1 -top-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" title="حذف النيتش من القائمة">
                                                <TrashIcon className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )
        ))}
      </div>
    </div>
  );
};
