import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { MapExplorer } from './components/map/MapExplorer';
import { Sidebar } from './components/layout/Sidebar';
import { DetailPanel } from './components/panels/DetailPanel';
import { DataInsights } from './components/dashboard/DataInsights';
import { AppProvider, useApp } from './context/AppContext';
import { useTranslation } from './utils/i18n';
import { ArrowDown, Code2, Database, Layers, Layout, Map as MapIcon, Microscope, ShieldCheck, Zap, Route, Info } from 'lucide-react';
import { computeGlobalStats } from './utils/calculations';

const Hero: React.FC = () => {
  const { osmData, hubs, lang } = useApp();
  const { t } = useTranslation(lang);
  const stats = React.useMemo(() => computeGlobalStats(hubs, osmData), [hubs, osmData]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-40 pb-20 px-6 overflow-hidden bg-white">
      {/* Background Cartographic Pattern */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 35c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm60-17c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM88 45c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM8 66c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm91-49c.828 0 1.5-.672 1.5-1.5S99.828 14 99 14s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zM75 70c.828 0 1.5-.672 1.5-1.5S75.828 67 75 67s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zM24 44c.828 0 1.5-.672 1.5-1.5S24.828 41 24 41s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zM53 24c.828 0 1.5-.672 1.5-1.5S53.828 21 53 21s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zM49 82c.828 0 1.5-.672 1.5-1.5S49.828 79 49 79s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zM5 8c.828 0 1.5-.672 1.5-1.5S5.828 5 5 5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm81 60c.828 0 1.5-.672 1.5-1.5S86.828 65 86 65s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm-67-25c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm76 11c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-52 25c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm17-45c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-40-26c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm60 45c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-71 22c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm16 24c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm5-66c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm90 45c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-40 30c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm0-70c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM9 26c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm28 25c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm56-35c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-75-20c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm103 30c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z' fill='%233b82f6' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>

      {/* Abstract Animated Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      
      <div className="max-w-4xl w-full text-center space-y-8 relative">

        
        <h1 className="text-5xl md:text-7xl font-black text-brand-text tracking-tight leading-[1.1]">
          {lang === 'fr' ? 'EuroRoad' : 'EuroRoad'} <span className="text-brand-blue">{lang === 'fr' ? 'Atlas' : 'Atlas'}</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-brand-muted font-medium max-w-2xl mx-auto leading-relaxed">
          {t('heroSubtitle')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
          {[
            { label: t('hubsDocumented'), value: stats.totalHubs.toString(), icon: Database, color: 'text-brand-blue' },
            { label: t('osmElementsLabel'), value: stats.osmElements.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US'), icon: Layers, color: 'text-brand-green' },
            { label: t('calculatedAxesLabel'), value: stats.totalAxes.toString(), icon: Route, color: 'text-brand-turquoise' },
            { label: t('countriesCoveredLabel'), value: '3', icon: MapIcon, color: 'text-brand-orange' },
          ].map((kpi, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1 group">
              <div className={`w-12 h-12 rounded-2xl bg-brand-bg flex items-center justify-center ${kpi.color} mb-2 shadow-sm group-hover:scale-110 transition-transform`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-brand-text leading-none">{kpi.value}</span>
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{kpi.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button 
            onClick={() => scrollTo('interactive-map')}
            className="w-full sm:w-auto px-10 py-5 bg-brand-blue text-white rounded-2xl font-black text-lg hover:bg-brand-blue/90 transition-all shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-3 group"
          >
            {t('explorerBtn')}
            <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </button>
          <button 
            onClick={() => scrollTo('methodology')}
            className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-brand-border text-brand-text rounded-2xl font-black text-lg hover:bg-brand-bg transition-all"
          >
            {t('methodologyBtnHero')}
          </button>
        </div>
      </div>
    </section>
  );
};

const MapSection: React.FC = () => {
  const { 
    selectedItemId, 
    setSelectedItemId, 
    selectedItemType, 
    setSelectedItemType,
    hubs,
    osmData,
    lang,
    filters,
    setFilters,
    isFullScreen,
    isSidebarOpen,
    setIsSidebarOpen
  } = useApp();
  const { t } = useTranslation(lang);

  const findOsmFeature = (type: string | null, id: string | null) => {
    if (!id || !type) return null;
    if (type === 'hub') return hubs.find(h => h.id === id) || null;
    const key = type === 'motorway' ? 'motorways' : type === 'toll' ? 'tolls' : type === 'truck_parking' ? 'truckParkings' : 'axes';
    const layer = (osmData as any)[key];
    if (!layer) return null;
    
    // Flatten all countries to find the feature
    const allFeatures = Object.values(layer).flatMap((list: any) => list || []);
    return allFeatures.find((f: any) => f.id === id) || null;
  };

  const selectedSelection = React.useMemo(() => {
    if (!selectedItemId || !selectedItemType) return null;
    const item = findOsmFeature(selectedItemType, selectedItemId);
    if (!item) return null;
    return { type: selectedItemType as any, item };
  }, [selectedItemId, selectedItemType, hubs, osmData]);

  return (
    <section id="interactive-map" className={`relative flex flex-col transition-all duration-500 overflow-hidden ${isFullScreen ? 'fixed inset-0 z-[5000] h-screen' : 'py-12 md:py-20 border-y border-brand-border bg-white'}`}>
      {!isFullScreen && (
        <div className="max-w-7xl mx-auto px-6 md:px-8 mb-10 w-full text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-2">{t('interactiveMapTitle')}</h2>
          <p className="text-brand-muted max-w-2xl leading-relaxed">
            {t('interactiveMapSubtitle')}
          </p>
        </div>
      )}

      <div id="map-viewport" className={`transition-all duration-500 overflow-hidden ${
        isFullScreen 
          ? 'fixed inset-0 z-[9999] bg-white' 
          : 'relative w-full h-[70vh] min-h-[600px] max-w-[1440px] mx-auto md:rounded-3xl border border-brand-border shadow-2xl'
      }`}>
        <div className="flex w-full h-full relative">
          {/* Sidebar */}
          <div className={`absolute top-0 left-0 transition-all duration-300 ease-in-out h-full z-40 bg-white border-r border-brand-border overflow-hidden ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full'}`}>
            <div className="w-80 h-full">
              <Sidebar filters={filters} setFilters={setFilters} lang={lang} />
            </div>
          </div>

          {/* Toggle Sidebar Button */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`absolute top-20 z-[1001] p-2 bg-white rounded-xl shadow-md border border-brand-border text-brand-muted hover:text-brand-blue transition-all duration-300 ${isSidebarOpen ? 'left-[336px]' : 'left-4'}`}
            title={isSidebarOpen ? (lang === 'fr' ? "Fermer le panneau" : "Close panel") : (lang === 'fr' ? "Ouvrir le panneau" : "Open panel")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isSidebarOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>

          {/* Map */}
          <div className="flex-1 relative min-w-0 h-full">
            {/* Mobile/Tablet Sidebar Toggle */}
            {!isFullScreen && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`absolute top-4 left-4 z-[1500] p-3 rounded-2xl border-2 shadow-xl transition-all flex items-center gap-2 ${
                  isSidebarOpen 
                    ? 'bg-brand-text text-white border-brand-text' 
                    : 'bg-white text-brand-text border-brand-border hover:bg-brand-bg'
                } md:hidden`}
                title={isSidebarOpen ? (lang === 'fr' ? "Fermer les filtres" : "Close filters") : (lang === 'fr' ? "Ouvrir les filtres" : "Open filters")}
              >
                <Layout className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-wider">{isSidebarOpen ? (lang === 'fr' ? 'Fermer' : 'Close') : (lang === 'fr' ? 'Filtres' : 'Filters')}</span>
              </button>
            )}

            <MapExplorer 
              lang={lang} 
              filters={filters} 
              selectedItemId={selectedItemId}
              onSelectItem={(id, type) => { setSelectedItemId(id); setSelectedItemType(type); }}
            />
            
            {/* Detail Panel */}
            {selectedItemId && (
              <div className="absolute top-0 right-0 h-full w-full md:w-96 z-[2000] pointer-events-none p-0 md:p-4">
                <div className="h-full pointer-events-auto">
                  <DetailPanel 
                    selection={selectedSelection}
                    onClose={() => setSelectedItemId(null)}
                    lang={lang}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const MethodologySection: React.FC = () => {
  const { lang } = useApp();
  const { t } = useTranslation(lang);
  return (
    <section id="methodology" className="bg-brand-bg py-20 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-4">{t('methodologySectionTitle')}</h2>
          <div className="w-20 h-1.5 bg-brand-blue mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Database, title: t('methodologyStep1Title'), text: t('methodologyStep1Text') },
            { icon: Code2, title: t('methodologyStep2Title'), text: t('methodologyStep2Text') },
            { icon: MapIcon, title: t('methodologyStep3Title'), text: t('methodologyStep3Text') },
            { icon: Microscope, title: t('methodologyStep4Title'), text: t('methodologyStep4Text') },
          ].map((step, idx) => (
            <div key={idx} className="relative group h-full">
              {idx < 3 && <div className="hidden lg:block absolute top-10 left-full w-full h-px border-t-2 border-dashed border-brand-border -z-0"></div>}
              <div className="relative bg-white p-8 rounded-3xl border border-brand-border shadow-sm group-hover:shadow-xl transition-all z-10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue-light text-brand-blue flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-brand-text mb-3">{idx + 1}. {step.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-brand-blue/5 rounded-2xl border border-brand-blue/10 text-center">
          <p className="text-sm text-brand-blue font-bold">
            {t('axesDisclaimer')}
          </p>
        </div>
      </div>
    </section>
  );
};

const LimitsSection: React.FC = () => {
  const { lang } = useApp();
  const { t } = useTranslation(lang);
  return (
    <section id="limits" className="bg-[#F8FAFC] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black text-brand-text tracking-tight">{t('transparencyTitle')}</h2>
              <p className="text-brand-muted leading-relaxed max-w-2xl">
                {t('transparencyIntro')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: t('limitOsmQualityTitle'), text: t('limitOsmQualityText') },
                { title: t('limitIncompleteTitle'), text: t('limitIncompleteText') },
                { title: t('limitAxesTitle'), text: t('limitAxesText') },
                { title: t('limitNoFlowsTitle'), text: t('limitNoFlowsText') },
                { title: t('limitOdblTitle'), text: t('limitOdblText') },
              ].map((limit, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-brand-border shadow-sm flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
                    <span className="text-[10px] font-black text-brand-text uppercase tracking-widest">{limit.title}</span>
                  </div>
                  <p className="text-[11px] text-brand-muted leading-normal">{limit.text}</p>
                </div>
              ))}
            </div>
            
            <div className="p-5 bg-white rounded-2xl border border-brand-border/60 border-l-4 border-l-brand-blue text-[11px] leading-relaxed text-brand-muted shadow-sm flex gap-4">
              <Info className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
              <div>
                <strong className="text-brand-text block mb-1">{t('methodologicalNoteTitle')}</strong>
                {t('methodologicalNoteText')}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[320px] shrink-0">
            <div className="bg-white p-8 rounded-[32px] border border-brand-border shadow-md sticky top-24">
              <h3 className="text-lg font-black text-brand-text mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-blue" />
                {t('transparencyPrinciplesTitle')}
              </h3>
              <ul className="space-y-5">
                {[
                  t('principleSourcePreserved'),
                  t('principleNoPrivateFlows'),
                  t('principleNonOfficialAxes'),
                  t('principleOdblRespected')
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-xs font-bold text-brand-text">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-brand-border">
                <p className="text-[9px] text-brand-muted font-bold uppercase tracking-[0.1em] mb-1">{t('sourceMain')}</p>
                <p className="text-[10px] text-brand-text font-black">OpenStreetMap & Overpass API</p>
              </div>
              <div className="mt-6 p-4 bg-brand-bg rounded-2xl border border-brand-border/50">
                <p className="text-[9px] text-brand-muted font-bold uppercase tracking-[0.1em] mb-2">{t('excludedDataTitle')}</p>
                <p className="text-[10px] text-brand-text font-black leading-relaxed">
                  {t('excludedDataContent')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AppContent: React.FC = () => {
  const { hubs, lang } = useApp();
  const { t } = useTranslation(lang);

  return (
    <div className="flex flex-col">
      <Hero />
      <MapSection />
      <div id="analysis">
        <DataInsights hubs={hubs} lang={lang} />
      </div>
      <MethodologySection />
      <LimitsSection />
      
      <footer className="bg-brand-bg py-10 border-t border-brand-border text-center">
        <div className="text-[10px] font-black text-brand-text uppercase tracking-[0.2em] mb-2">
          EuroRoad Atlas
        </div>
        <p className="text-[11px] text-brand-muted font-bold mb-2">
          {t('footerData')}
        </p>
        <p className="text-[10px] text-brand-muted/60 italic">
          {t('footerDisclaimer')}
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell>
        <AppContent />
      </AppShell>
    </AppProvider>
  );
}