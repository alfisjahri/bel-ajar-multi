import React from 'react';
import { BookOpen, Edit3, Users, FileText, LogOut } from 'lucide-react';

const BottomNavigation = ({ activeTab, setActiveTab, handleLogout }) => {
  return (
    <div className="no-print fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-slate-800/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-700 flex justify-around p-2 z-30 rounded-t-2xl shadow-lg">
      <button onClick={() => setActiveTab('input')} className={`p-2 flex flex-col items-center ${activeTab === 'input' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400 dark:text-slate-500'}`}>
        <BookOpen className="w-5 h-5" />
        <span className="text-[10.5pt] mt-1">Jurnal</span>
      </button>

      <button onClick={() => setActiveTab('edit')} className={`p-2 flex flex-col items-center ${activeTab === 'edit' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400 dark:text-slate-500'}`}>
        <Edit3 className="w-5 h-5" />
        <span className="text-[10.5pt] mt-1">Review</span>
      </button>

      <button onClick={() => setActiveTab('siswa')} className={`p-2 flex flex-col items-center ${activeTab === 'siswa' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400 dark:text-slate-500'}`}>
        <Users className="w-5 h-5" />
        <span className="text-[10.5pt] mt-1">Siswa</span>
      </button>

      <button onClick={() => setActiveTab('profile')} className={`p-2 flex flex-col items-center ${activeTab === 'profile' ? 'text-blue-600 font-bold scale-105' : 'text-slate-400 dark:text-slate-500'}`}>
        <FileText className="w-5 h-5" />
        <span className="text-[10.5pt] mt-1">Export</span>
      </button>

      <button onClick={handleLogout} className="p-2 flex flex-col items-center text-red-500 hover:text-red-700 active:scale-95 transition-all">
        <LogOut className="w-5 h-5" />
        <span className="text-[10.5pt] mt-1 font-semibold">Keluar</span>
      </button>
    </div>
  );
};

export default BottomNavigation;
