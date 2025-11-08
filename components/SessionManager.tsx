import React from 'react';
import { HistoryIcon } from './Icons';
import { HistoryItem } from '../App';

interface SessionManagerProps {
  sessions: HistoryItem[];
  onLoadSession: (sessionId: string) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ sessions, onLoadSession }) => {
  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium text-slate-300 flex items-center gap-2">
          <HistoryIcon className="h-5 w-5" />
          الجلسات السابقة
        </h2>
      </div>
      <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
        <select 
            onChange={(e) => e.target.value && onLoadSession(e.target.value)}
            className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md focus:ring-1 focus:ring-red-500 appearance-none text-right"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundPosition: 'left 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em' }}
            defaultValue=""
        >
            <option value="" disabled>اختر جلسة سابقة لتحميلها...</option>
            {sessions.map(session => (
                <option key={session.id} value={session.id}>
                    {new Date(parseInt(session.id)).toLocaleString()} - {session.niches}
                </option>
            ))}
        </select>
      </div>
    </div>
  );
};
