import React, { useState } from 'react';
import { Idea } from '../services/geminiService';
import { ArrowUpIcon, ArrowDownIcon, CopyIcon, CheckIcon, XCircleIcon, Bars3Icon } from './Icons';

interface SelectedIdeasProps {
  selectedIdeas: Idea[];
  onReorder: (index: number, direction: 'up' | 'down') => void;
  onClearSelection: () => void;
  onDropReorder: (dragIndex: number, hoverIndex: number) => void;
}

export const SelectedIdeas: React.FC<SelectedIdeasProps> = ({ selectedIdeas, onReorder, onClearSelection, onDropReorder }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (selectedIdeas.length === 0) {
    return null;
  }

  const handleCopy = () => {
    const textToCopy = selectedIdeas.map(idea => idea.originalLine).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    e.currentTarget.classList.remove('drag-over-up', 'drag-over-down');
    if (dragIndex !== dropIndex) {
      onDropReorder(dragIndex, dropIndex);
    }
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex > index) {
      e.currentTarget.classList.add('drag-over-up');
    } else {
      e.currentTarget.classList.add('drag-over-down');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over-up', 'drag-over-down');
  };

  return (
    <div className="mt-8 w-full">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-100">
            الأفكار المختارة ({selectedIdeas.length})
          </h3>
          <div className="flex gap-2">
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md transition-colors text-sm"
                title="نسخ الأفكار المحددة"
            >
                {isCopied ? <CheckIcon className="h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
                <span>{isCopied ? 'تم النسخ!' : 'نسخ'}</span>
            </button>
            <button
                onClick={onClearSelection}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-md transition-colors"
                title="مسح التحديد"
            >
                <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
          {selectedIdeas.map((idea, index) => (
            <div 
              key={idea.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragLeave={handleDragLeave}
              className="flex items-center group bg-slate-900/50 p-2 rounded-md transition-all duration-150 relative"
            >
              <div className="cursor-move p-1 text-slate-500 touch-none" title="اسحب للترتيب">
                  <Bars3Icon className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-400 text-sm ml-2">{index + 1}.</span>
              <div className="flex-grow">
                <p className="font-semibold text-slate-200">{idea.title}</p>
                <p className="text-xs text-slate-500">{idea.description}</p>
              </div>
              <div className="flex flex-col ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onReorder(index, 'up')} 
                  disabled={index === 0}
                  className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="صعود"
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => onReorder(index, 'down')}
                  disabled={index === selectedIdeas.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="نزول"
                >
                  <ArrowDownIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};