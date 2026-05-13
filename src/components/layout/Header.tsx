import React, { useEffect, useState } from 'react';
import { Route, Database, Layers, Globe, Menu, X } from 'lucide-react';
import { Language, Hub } from '../../types';
import { useTranslation } from '../../utils/i18n';
import { useApp } from '../../context/AppContext';
import { computeGlobalStats } from '../../utils/calculations';

interface HeaderProps {
  lang: Language;
  onLangChange: (l: Language) => void;
  hubs: Hub[];
}

export const Header: React.FC<HeaderProps> = ({ 
  lang, 
  onLangChange, 
  hubs,
}) => {
  const { t } = useTranslation(lang);
  const { osmData } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = React.useMemo(() => computeGlobalStats(hubs, osmData), [hubs, osmData]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { id: 'interactive-map', label: t('navExplore') },
    { id: 'analysis',        label: t('navAnalysis') },
    { id: 'methodology',     label: t('navMethod') },
    { id: 'limits',          label: t('navTransparency') },
  ];

  return (
    <div className={`fixed top-0 left-0 right-0 z-[2000] transition-all duration-300 ${isScrolled ? 'py-2 px-4' : 'py-0 px-0'}`}>
      <div className={`mx-auto max-w-7xl transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md rounded-2xl border border-brand-border shadow-lg px-6' : 'bg-white border-b border-brand-border px-6'}`}>
        <header className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-brand-blue-light flex items-center justify-center text-brand-blue shadow-inner">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-brand-text leading-tight">
                {t('heroTitle')}
              </h1>
              <p className="text-[10px] text-brand-muted hidden md:block font-bold uppercase tracking-wider">
                {t('heroSublabel')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-12">
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="px-4 py-2 text-xs font-bold text-brand-muted hover:text-brand-blue transition-colors rounded-lg hover:bg-brand-bg"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {/* Custom Toggle Switch for i18n */}
              <div className="flex bg-brand-bg rounded-full p-1 border border-brand-border relative items-center cursor-pointer select-none"
                   onClick={() => onLangChange(lang === 'fr' ? 'en' : 'fr')}>
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-200 ${lang === 'en' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}></div>
                <div className={`px-2 py-0.5 text-[10px] font-black rounded-full relative z-10 transition-colors ${lang === 'fr' ? 'text-brand-blue' : 'text-brand-muted'}`}>
                  FR
                </div>
                <div className={`px-2 py-0.5 text-[10px] font-black rounded-full relative z-10 transition-colors ${lang === 'en' ? 'text-brand-blue' : 'text-brand-muted'}`}>
                  EN
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Floating Stats Bar in Sub-header (only when not scrolled) */}
        {!isScrolled && (
          <div className="hidden md:flex h-12 items-center justify-between border-t border-brand-border/50 text-[10px] font-black text-brand-muted uppercase tracking-widest overflow-hidden">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 group">
                <Database className="w-3 h-3 text-brand-blue/60 group-hover:text-brand-blue transition-colors" />
                <span className="text-brand-text min-w-[1ch] text-center">{stats.totalHubs}</span>
                <span className="opacity-80">{t('hubsCount')}</span>
              </div>
              <div className="flex items-center gap-1.5 group">
                <Layers className="w-3 h-3 text-brand-green/60 group-hover:text-brand-green transition-colors" />
                <span className={`text-brand-text min-w-[2ch] text-center ${stats.states.motorways === 'loading' ? 'animate-pulse opacity-50' : ''}`}>
                  {stats.states.motorways === 'loading' ? '...' : stats.osmElements.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                </span>
                <span className="opacity-80">{t('osmElements')}</span>
              </div>
              <div className="flex items-center gap-1.5 group">
                <Route className="w-3 h-3 text-brand-turquoise/60 group-hover:text-brand-turquoise transition-colors" />
                <span className={`text-brand-text min-w-[1ch] text-center ${stats.states.motorways === 'loading' ? 'animate-pulse opacity-50' : ''}`}>
                  {stats.states.motorways === 'loading' ? '...' : stats.totalAxes}
                </span>
                <span className="opacity-80">{t('calculatedAxesLabel')}</span>
              </div>
              <div className="flex items-center gap-1.5 group">
                <Globe className="w-3 h-3 text-brand-orange/60 group-hover:text-brand-orange transition-colors" />
                <span className="text-brand-text">{stats.countriesCount}</span>
                <span className="opacity-80">{t('countries')}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              <span className="text-[9px] font-bold tracking-normal">{t('osmLicenceShort')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
