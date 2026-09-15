import React, { useState } from 'react';
import MobileSimulator from './components/MobileSimulator';
import BackOffice from './components/BackOffice';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  const [view, setView] = useState<'MOBILE' | 'BO'>('MOBILE');

  return (
    <LanguageProvider>
      <div className="h-screen w-full flex flex-col font-sans">
        {/* Toggle Bar for Demo Purposes */}
        <div className="bg-slate-800 text-white p-2 flex justify-center gap-4 text-sm z-50">
          <span className="opacity-50">Prototype Agro Rayane - Basculer la vue :</span>
          <button 
            onClick={() => setView('MOBILE')} 
            className={`px-4 py-1 rounded font-bold transition-colors ${view === 'MOBILE' ? 'bg-emerald-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            Vue Client (Mobile Simulator)
          </button>
          <button 
            onClick={() => setView('BO')} 
            className={`px-4 py-1 rounded font-bold transition-colors ${view === 'BO' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            Vue Commercial (Back-Office)
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {view === 'MOBILE' ? <MobileSimulator /> : <BackOffice />}
        </div>
      </div>
    </LanguageProvider>
  );
}