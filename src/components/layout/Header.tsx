import React from 'react';
import { Route, Info, Database, Layers, Globe } from 'lucide-react';
import { Language, Hub } from '../../types';
import { useTranslation } from '../../utils/i18n';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  lang: Language;
  onLangChange: (l: Language) => void;
  onOpenMethodology: () => void;
  onOpenAbout: () => void;
  hubs: Hub[];
}

export const Header: React.FC<HeaderProps> = ({ 
  lang, 
  onLangChange, 
  onOpenMethodology,
  onOpenAbout,
  hubs,
}) => {
  const { t } = useTranslation(lang);
  const { osmData } = useApp();

  const stats = {
    realHubs: hubs.filter(h => h.dataType === 'real').length,
    countries: new Set(hubs.map(h => h.country)).size
  };
  const osmSegments = osmData.stats.totalMotorways + osmData.stats.totalTolls + osmData.stats.totalParkings;

  return (
    <div className="shrink-0 z-50 relative card-shadow bg-white flex flex-col">
      <header className="h-16 border-b border-brand-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue-light flex items-center justify-center text-brand-blue">
            <Route className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-brand-text leading-tight">
              EuroRoad Atlas
            </h1>
            <p className="text-xs text-brand-muted hidden md:block font-medium">
              Routes, hubs et couches OSM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenMethodology}
            className="flex items-center gap-1.5 text-sm font-medium text-brand-muted hover:text-brand-blue transition-colors"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">{t('methodologyBtn')}</span>
          </button>
          <button 
            onClick={onOpenAbout}
            className="hidden md:flex items-center gap-1.5 text-sm font-medium bg-brand-bg hover:bg-brand-border px-4 py-2 rounded-full transition-all text-brand-text"
          >
            {t('portfolioBtn')}
          </button>

          <div className="h-6 w-px bg-brand-border mx-2"></div>

          {/* Custom Toggle Switch for i18n */}
          <div className="flex bg-brand-bg rounded-full p-1 border border-brand-border relative items-center cursor-pointer select-none"
               onClick={() => onLangChange(lang === 'fr' ? 'en' : 'fr')}>
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-200 ${lang === 'en' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}></div>
            <div className={`px-3 py-1 text-xs font-bold rounded-full relative z-10 transition-colors ${lang === 'fr' ? 'text-brand-blue' : 'text-brand-muted'}`}>
              FR
            </div>
            <div className={`px-3 py-1 text-xs font-bold rounded-full relative z-10 transition-colors ${lang === 'en' ? 'text-brand-blue' : 'text-brand-muted'}`}>
              EN
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-brand-bg to-white border-b border-brand-border px-6 py-4 flex flex-col md:flex-row items-center gap-6 justify-between">
        <p className="text-sm font-bold text-brand-text md:max-w-xl">
          {lang === 'fr' 
            ? "Explorez les grands axes logistiques entre la France, la Belgique et les Pays-Bas."
            : "Explore the main logistics routes across France, Belgium and the Netherlands."}
        </p>

        <div className="flex items-center gap-4 text-xs font-bold text-brand-muted">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-brand-border shadow-sm">
            <Database className="w-4 h-4 text-brand-blue" />
            <span className="text-brand-text">{stats.realHubs}</span>
            <span>{lang === 'fr' ? 'hubs documentés' : 'documented hubs'}</span>
          </div>
          {osmData.stats.loaded && (
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-brand-border shadow-sm">
              <Layers className="w-4 h-4 text-brand-green" />
              <span className="text-brand-text">{osmSegments}</span>
              <span>{lang === 'fr' ? 'segments OSM' : 'OSM segments'}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-brand-border shadow-sm">
            <Globe className="w-4 h-4 text-brand-orange" />
            <span className="text-brand-text">{stats.countries}</span>
            <span>{lang === 'fr' ? 'pays couverts' : 'countries covered'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
