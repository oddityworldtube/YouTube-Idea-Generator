import React, { useState } from 'react';
import { ApiKey, CustomNiche, DefaultSettings } from '../App';
import { ArrowLeftIcon, PlusCircleIcon, TrashIcon, KeyIcon, DocumentTextIcon, RefreshIcon } from '../components/Icons';
import { NICHE_CATEGORIES, SUGGESTED_NICHES_WITH_RATINGS } from '../data/niches';


interface SettingsPageProps {
  apiKeys: ApiKey[];
  setApiKeys: (keys: ApiKey[] | ((currentKeys: ApiKey[]) => ApiKey[])) => void;
  activeApiKey: string | null;
  setActiveApiKey: (id: string | null) => void;
  customModels: string[];
  setCustomModels: (models: string[]) => void;
  customNiches: CustomNiche[];
  setCustomNiches: (niches: CustomNiche[]) => void;
  onBack: () => void;
  defaultSettings: DefaultSettings;
  setDefaultSettings: (settings: DefaultSettings | ((current: DefaultSettings) => DefaultSettings)) => void;
}

// Sub-component for API Key Management
const ApiKeyManager: React.FC<Pick<SettingsPageProps, 'apiKeys' | 'setApiKeys' | 'activeApiKey' | 'setActiveApiKey'>> = 
({ apiKeys, setApiKeys, activeApiKey, setActiveApiKey }) => {
    const [newKey, setNewKey] = useState('');
    const [newName, setNewName] = useState('');

    const handleAddKey = () => {
        if (newKey.trim() && newName.trim()) {
            const newApiKey: ApiKey = { id: Date.now().toString(), key: newKey.trim(), name: newName.trim() };
            setApiKeys(currentKeys => [...currentKeys, newApiKey]);
            if (!activeApiKey) setActiveApiKey(newApiKey.id);
            setNewKey('');
            setNewName('');
        }
    };
    
    const handleRemoveKey = (id: string) => {
        setApiKeys(currentKeys => {
            const filteredKeys = currentKeys.filter(k => k.id !== id);
            if (activeApiKey === id) {
                setActiveApiKey(filteredKeys.length > 0 ? filteredKeys[0].id : null);
            }
            return filteredKeys;
        });
    };

    return (
        <div className="space-y-4">
            {apiKeys.map(apiKey => {
                const isDefault = apiKey.id === 'default-key';
                return (
                    <div key={apiKey.id} className={`flex items-center gap-3 p-3 rounded-lg ${isDefault ? 'bg-slate-700/50' : 'bg-slate-800'}`}>
                        <input type="radio" name="api-key-select" checked={activeApiKey === apiKey.id} onChange={() => setActiveApiKey(apiKey.id)} className="form-radio h-5 w-5 text-red-600 bg-slate-700 border-slate-500 focus:ring-red-500" />
                        <div className="flex-grow">
                            <p className="font-semibold text-slate-100 flex items-center">{apiKey.name} {isDefault && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full mr-2">افتراضي</span>}</p>
                            <p className="text-xs text-slate-400 truncate">{isDefault ? 'مفتاح للاستخدام المحدود، يوصى بإضافة مفتاحك الخاص.' : `...${apiKey.key.slice(-8)}`}</p>
                        </div>
                        {!isDefault && (
                            <button onClick={() => handleRemoveKey(apiKey.id)} className="p-2 text-slate-400 hover:text-red-400"><TrashIcon className="h-5 w-5"/></button>
                        )}
                    </div>
                );
            })}
             <div className="flex flex-col md:flex-row gap-2 pt-4 border-t border-slate-700">
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="اسم المفتاح (مثال: حسابي الشخصي)" className="flex-grow p-2 bg-slate-800 border border-slate-600 rounded-md"/>
                <input type="password" value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="أضف مفتاح API جديد هنا" className="flex-grow p-2 bg-slate-800 border border-slate-600 rounded-md"/>
                <button onClick={handleAddKey} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md"><PlusCircleIcon className="h-5 w-5"/> إضافة</button>
            </div>
        </div>
    );
};


// Sub-component for Custom Niche Management
const CustomNicheManager: React.FC<Pick<SettingsPageProps, 'customNiches' | 'setCustomNiches'>> = ({ customNiches, setCustomNiches }) => {
    const [newNicheName, setNewNicheName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(Object.keys(NICHE_CATEGORIES)[0]);

    const handleAddNiche = () => {
        if (newNicheName.trim()) {
            const newNiche: CustomNiche = { id: Date.now().toString(), name: newNicheName.trim(), category: selectedCategory };
            setCustomNiches([...customNiches, newNiche]);
            setNewNicheName('');
        }
    };

    const handleRemoveNiche = (id: string) => {
        setCustomNiches(customNiches.filter(n => n.id !== id));
    };
    
    const handleResetCategory = (category: string) => {
        setCustomNiches(customNiches.filter(n => n.category !== category));
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row gap-2 mb-4">
                <input type="text" value={newNicheName} onChange={e => setNewNicheName(e.target.value)} placeholder="اسم النيتش الجديد" className="flex-grow p-2 bg-slate-800 border border-slate-600 rounded-md"/>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="p-2 bg-slate-800 border border-slate-600 rounded-md">
                    {Object.entries(NICHE_CATEGORIES).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
                <button onClick={handleAddNiche} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md"><PlusCircleIcon className="h-5 w-5"/> إضافة</button>
            </div>
            <div className="space-y-3">
                {Object.entries(NICHE_CATEGORIES).map(([key, title]) => {
                    const defaultNiches = SUGGESTED_NICHES_WITH_RATINGS.filter(n => n.category === key);
                    const userNiches = customNiches.filter(n => n.category === key);
                    if(defaultNiches.length === 0 && userNiches.length === 0) return null;
                    return (
                        <div key={key}>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-slate-300">{title}</h4>
                                <button onClick={() => handleResetCategory(key)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400" title="إزالة كل النيتشات المضافة لهذه الفئة"><RefreshIcon className="h-3 w-3" /> إعادة تعيين</button>
                            </div>
                            <div className="flex flex-wrap gap-2 p-2 bg-slate-800/50 rounded-md">
                                {defaultNiches.map(n => <span key={n.name} className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-sm">{n.name}</span>)}
                                {userNiches.map(n => (
                                    <span key={n.id} className="flex items-center gap-2 bg-red-900/50 text-red-300 px-2 py-1 rounded text-sm">
                                        {n.name}
                                        <button onClick={() => handleRemoveNiche(n.id)}><TrashIcon className="h-3 w-3"/></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

// Sub-component for Custom Model Management
const CustomModelManager: React.FC<Pick<SettingsPageProps, 'customModels' | 'setCustomModels'>> = ({ customModels, setCustomModels }) => {
    const [newModelName, setNewModelName] = useState('');
    const defaultModels = ["gemini-2.5-flash", "gemini-2.5-pro"];

    const handleAddModel = () => {
        if(newModelName.trim() && !defaultModels.includes(newModelName.trim()) && !customModels.includes(newModelName.trim())) {
            setCustomModels([...customModels, newModelName.trim()]);
            setNewModelName('');
        }
    };
    
    const handleRemoveModel = (modelName: string) => {
        setCustomModels(customModels.filter(m => m !== modelName));
    };

    return (
        <div>
            <div className="flex gap-2 mb-4">
                <input type="text" value={newModelName} onChange={e => setNewModelName(e.target.value)} placeholder="اسم النموذج المخصص" className="flex-grow p-2 bg-slate-800 border border-slate-600 rounded-md"/>
                <button onClick={handleAddModel} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md"><PlusCircleIcon className="h-5 w-5"/> إضافة</button>
            </div>
             <div className="flex flex-wrap gap-2 p-2 bg-slate-800/50 rounded-md">
                {defaultModels.map(m => <span key={m} className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-sm">{m}</span>)}
                {customModels.map(m => (
                    <span key={m} className="flex items-center gap-2 bg-red-900/50 text-red-300 px-2 py-1 rounded text-sm">
                        {m}
                        <button onClick={() => handleRemoveModel(m)}><TrashIcon className="h-3 w-3"/></button>
                    </span>
                ))}
            </div>
        </div>
    )

};

// Sub-component for Formatting Settings
const FormattingSettingsManager: React.FC<Pick<SettingsPageProps, 'defaultSettings' | 'setDefaultSettings'>> = 
({ defaultSettings, setDefaultSettings }) => {
    const handleStyleChange = (style: 'sentence' | 'title' | 'allcaps') => {
        setDefaultSettings(current => ({ ...current, titleCaseStyle: style }));
    };

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-slate-300">أسلوب كتابة العنوان</h4>
            <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 flex-1 cursor-pointer has-[:checked]:ring-2 has-[:checked]:ring-red-500 transition-all">
                    <input type="radio" name="title-case-style" checked={defaultSettings.titleCaseStyle === 'sentence'} onChange={() => handleStyleChange('sentence')} className="form-radio h-5 w-5 text-red-600 bg-slate-700 border-slate-500 focus:ring-red-500" />
                    <div className="flex-grow">
                        <p className="font-semibold text-slate-100">حالة الجملة</p>
                        <p className="text-xs text-slate-400">مثال: أفضل 5 طرق لزيادة متابعينك.</p>
                    </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 flex-1 cursor-pointer has-[:checked]:ring-2 has-[:checked]:ring-red-500 transition-all">
                    <input type="radio" name="title-case-style" checked={defaultSettings.titleCaseStyle === 'title'} onChange={() => handleStyleChange('title')} className="form-radio h-5 w-5 text-red-600 bg-slate-700 border-slate-500 focus:ring-red-500" />
                    <div className="flex-grow">
                        <p className="font-semibold text-slate-100">حالة العنوان</p>
                        <p className="text-xs text-slate-400">مثال: أفضل 5 طرق لزيادة متابعينك.</p>
                    </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 flex-1 cursor-pointer has-[:checked]:ring-2 has-[:checked]:ring-red-500 transition-all">
                    <input type="radio" name="title-case-style" checked={defaultSettings.titleCaseStyle === 'allcaps'} onChange={() => handleStyleChange('allcaps')} className="form-radio h-5 w-5 text-red-600 bg-slate-700 border-slate-500 focus:ring-red-500" />
                    <div className="flex-grow">
                        <p className="font-semibold text-slate-100">أحرف كبيرة</p>
                        <p className="text-xs text-slate-400">مثال: أفضل 5 طرق لزيادة متابعينك</p>
                    </div>
                </label>
            </div>
        </div>
    );
};


export const SettingsPage: React.FC<SettingsPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState('apis');

    const renderTabContent = () => {
        switch(activeTab) {
            case 'apis': return <ApiKeyManager {...props} />;
            case 'niches': return <CustomNicheManager {...props} />;
            case 'models': return <CustomModelManager {...props} />;
            case 'formatting': return <FormattingSettingsManager {...props} />;
            default: return null;
        }
    };

  return (
    <div className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-4 sm:p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-100">الإعدادات المتقدمة</h2>
            <button onClick={props.onBack} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md">
                <ArrowLeftIcon className="h-5 w-5"/> العودة للمولد
            </button>
        </div>

        <div className="flex border-b border-slate-700 mb-6 overflow-x-auto">
            <button onClick={() => setActiveTab('apis')} className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'apis' ? 'border-b-2 border-red-500 text-white' : 'text-slate-400'}`}>مفاتيح API</button>
            <button onClick={() => setActiveTab('niches')} className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'niches' ? 'border-b-2 border-red-500 text-white' : 'text-slate-400'}`}>إدارة النيتشات</button>
            <button onClick={() => setActiveTab('models')} className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'models' ? 'border-b-2 border-red-500 text-white' : 'text-slate-400'}`}>إدارة النماذج</button>
            <button onClick={() => setActiveTab('formatting')} className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'formatting' ? 'border-b-2 border-red-500 text-white' : 'text-slate-400'}`}>التنسيق</button>
        </div>

        <div>
            {renderTabContent()}
        </div>
    </div>
  );
};