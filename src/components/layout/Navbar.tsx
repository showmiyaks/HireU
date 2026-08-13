import React from 'react';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const { currentUser, setActiveView } = useApp();

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-end sticky top-0 z-20 shrink-0">
      {/* User Profile */}
      <button
        onClick={() => setActiveView('profile')}
        className="flex items-center space-x-2.5 text-xs focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
          {currentUser?.fullName?.charAt(0) || 'H'}
        </div>
        <div className="text-left leading-tight">
          <p className="font-semibold text-slate-800">{currentUser?.fullName}</p>
          <p className="text-[10px] text-slate-500">{currentUser?.role || 'Recruiter'}</p>
        </div>
      </button>
    </header>
  );
};


