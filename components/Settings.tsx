import React from 'react';
import { CogIcon, AdjustmentsIcon } from './Icons';

interface SettingsProps {
    model: string;
    setModel: (model: string) => void;
    // FIX: Add missing props to the interface.
    customModels: string[];
    onNavigateToSettings: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ model, setModel, customModels, onNavigateToSettings }) => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    <CogIcon className="h-5 w-5" />
                    إعدادات النموذج
                </h3>
                {/* FIX: Add button to navigate to advanced settings */}
                <button 
                    onClick={onNavigateToSettings}
                    className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                    title="الإعدادات المتقدمة"
                >
                    <AdjustmentsIcon className="h-5 w-5" />
                </button>
            </div>
            <div>
                <label htmlFor="model-select" className="block text-sm font-medium text-slate-300 mb-1">
                    اختر نموذج Gemini
                </label>
                <select 
                    id="model-select" 
                    value={model} 
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md focus:ring-1 focus:ring-red-500 appearance-none text-right"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundPosition: 'left 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em' }}
                >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (الأسرع)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (الأكثر ذكاءً)</option>
                    {/* FIX: Render custom models from props */}
                    {customModels.map(customModel => (
                        <option key={customModel} value={customModel}>{customModel}</option>
                    ))}
                </select>
                <p className="text-xs text-slate-500 mt-2">
                    ملاحظة: استخدام نماذج مختلفة قد يؤثر على سرعة وجودة النتائج.
                </p>
            </div>
        </div>
    );
};
