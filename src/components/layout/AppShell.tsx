import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { useApp } from '../../context/AppContext';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { lang, setLang, hubs, loading, error, isFullScreen } = useApp();

  // Prevent Ctrl+scroll from zooming the entire browser page
  // (Leaflet's own scroll zoom should work; browser zoom should not)
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };
    // { passive: false } required so preventDefault() works on wheel events
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-muted font-bold tracking-tight">Chargement de l'Atlas...</p>
          <p className="text-xs text-brand-muted/70 mt-2">Récupération des données OpenStreetMap FR/BE/NL</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-bg p-6">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl border border-red-100 shadow-xl">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <p className="text-brand-text font-black text-xl mb-3">Erreur de chargement</p>
          <p className="text-brand-muted text-sm leading-relaxed mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
          >
            Réessayer le chargement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col bg-brand-bg text-brand-text font-sans selection:bg-brand-blue/10 ${isFullScreen ? 'h-screen overflow-hidden' : ''}`}>
      {!isFullScreen && (
        <Header 
          lang={lang} 
          onLangChange={setLang}
          hubs={hubs}
        />
      )}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
};