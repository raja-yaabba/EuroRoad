import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useApp } from '../../context/AppContext';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { lang, setLang, filters, setFilters, hubs, loading, error } = useApp();
  const [showMethodology, setShowMethodology] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-muted">Chargement des données depuis OSM, TEN-T, Eurostat...</p>
            <p className="text-brand-muted">Chargement des données open source...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-bg">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-2xl">
          <p className="text-red-600 font-bold mb-2">Erreur de chargement</p>
          <p className="text-brand-muted text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-xl"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-brand-bg text-brand-text font-sans">
      <Header 
        lang={lang} 
        onLangChange={setLang}
        onOpenMethodology={() => setShowMethodology(true)}
        onOpenAbout={() => window.open('https://github.com', '_blank')}
        hubs={hubs}
      />
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <Sidebar 
          filters={filters} 
          setFilters={setFilters} 
          lang={lang} 
        />
        <main className="flex-1 relative min-w-0 min-h-0 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};