
import React from 'react';
import { YouTubeIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex justify-center items-center gap-4">
        <YouTubeIcon className="h-12 w-12 text-red-500" />
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-500 to-red-400 text-transparent bg-clip-text">
          مولد أفكار يوتيوب
        </h1>
      </div>
      <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
        أدخل النيتشات الخاصة بك واحصل على 50 فكرة فيديو فريدة ومُحسّنة لمحركات البحث بنقرة زر واحدة.
      </p>
    </header>
  );
};
