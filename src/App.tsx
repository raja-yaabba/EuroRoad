import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { MapExplorer } from './components/map/MapExplorer';
import { Sidebar } from './components/layout/Sidebar';
import { DetailPanel } from './components/panels/DetailPanel';
import { DataInsights } from './components/dashboard/DataInsights';
import { AppProvider, useApp } from './context/AppContext';
import { ArrowDown, Code2, Database, Layers, Layout, Map as MapIcon, Microscope, ShieldCheck, Zap } from 'lucide-react';

const Hero: React.FC = () => {
  const { osmData } = useApp();
  const totalMotorways = (osmData.motorways.fr?.length || 0) + (osmData.motorways.be?.length || 0) + (osmData.motorways.nl?.length || 0);
  const totalTolls = (osmData.tolls.fr?.length || 0) + (osmData.tolls.be?.length || 0) + (osmData.tolls.nl?.length || 0);
  const totalParkings = (osmData.truckParkings.fr?.length || 0) + (osmData.truckParkings.be?.length || 0) + (osmData.truckParkings.nl?.length || 0);
  const osmElements = totalMotorways + totalTolls + totalParkings;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-28 pb-20 px-6 overflow-hidden bg-white">
      {/* Background Cartographic Pattern */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 35c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm60-17c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM88 45c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM8 66c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm91-49c.828 0 1.5-.672 1.5-1.5S99.828 14 99 14s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zM75 70c.828 0 1.5-.672 1.5-1.5S75.828 67 75 67s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zM24 44c.828 0 1.5-.672 1.5-1.5S24.828 41 24 41s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zM53 24c.828 0 1.5-.672 1.5-1.5S53.828 21 53 21s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zM49 82c.828 0 1.5-.672 1.5-1.5S49.828 79 49 79s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zM5 8c.828 0 1.5-.672 1.5-1.5S5.828 5 5 5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm81 60c.828 0 1.5-.672 1.5-1.5S86.828 65 86 65s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm-67-25c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm76 11c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-52 25c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm17-45c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-40-26c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm60 45c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-71 22c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm16 24c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm5-66c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm90 45c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-40 30c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm0-70c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM9 26c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm28 25c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm56-35c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-75-20c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm103 30c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z' fill='%233b82f6' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>

      {/* Abstract Animated Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      
      <div className="max-w-4xl w-full text-center space-y-8 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue-light border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-[0.2em] shadow-sm mb-4">
          <Zap className="w-3.5 h-3.5" /> Portfolio Showcase
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-brand-text tracking-tight leading-[1.1]">
          EuroRoad <span className="text-brand-blue">Atlas</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-brand-muted font-medium max-w-2xl mx-auto leading-relaxed">
          Atlas open data des infrastructures logistiques FR/BE/NL. Explorez les hubs, autoroutes, péages et parkings à partir de données réelles.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
          {[
            { label: 'Hubs documentés', value: '15', icon: Database, color: 'text-brand-blue' },
            { label: 'Éléments OSM', value: osmElements.toLocaleString('fr-FR'), icon: Layers, color: 'text-brand-green' },
            { label: 'Pays couverts', value: '3', icon: MapIcon, color: 'text-brand-orange' },
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
            Explorer la carte
            <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </button>
          <button 
            onClick={() => scrollTo('methodology')}
            className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-brand-border text-brand-text rounded-2xl font-black text-lg hover:bg-brand-bg transition-all"
          >
            Voir la méthodologie
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

  const findOsmFeature = (type: string | null, id: string | null) => {
    if (!id || !type) return null;
    const key = type === 'motorway' ? 'motorways' : type === 'toll' ? 'tolls' : type === 'truck_parking' ? 'truckParkings' : 'axes';
    const layer = (osmData as any)[key];
    if (!layer) return null;
    
    // Flatten all countries to find the feature
    const allFeatures = Object.values(layer).flatMap((list: any) => list || []);
    return allFeatures.find((f: any) => f.id === id) || null;
  };

  const selectedSelection = React.useMemo(() => {
    if (!selectedItemId || !selectedItemType) return null;
    
    if (selectedItemType === 'hub') {
      const hub = hubs.find(h => h.id === selectedItemId);
      return hub ? { type: 'hub' as const, item: hub } : null;
    }
    
    const feature = findOsmFeature(selectedItemType, selectedItemId);
    return feature ? { type: selectedItemType as any, item: feature } : null;
  }, [selectedItemId, selectedItemType, hubs, osmData]);

  return (
    <section id="interactive-map" className={`relative flex flex-col bg-white border-y border-brand-border transition-all duration-500 ${isFullScreen ? '' : 'py-12 md:py-20'}`}>
      {!isFullScreen && (
        <div className="max-w-7xl mx-auto px-6 md:px-8 mb-10 w-full text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-2">Carte interactive</h2>
          <p className="text-brand-muted max-w-2xl leading-relaxed">
            Activez les couches, zoomez, cliquez sur les hubs ou infrastructures pour afficher les détails.
          </p>
        </div>
      )}

      <div className={`transition-all duration-500 overflow-hidden ${
        isFullScreen 
          ? 'fixed inset-0 w-screen h-screen z-[9999] bg-white' 
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
            title={isSidebarOpen ? "Fermer le panneau" : "Ouvrir le panneau"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isSidebarOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>

          {/* Map */}
          <div className="flex-1 relative min-w-0 h-full">
            <MapExplorer 
              lang={lang} 
              filters={filters} 
              selectedItemId={selectedItemId}
              onSelectItem={(id, type) => { setSelectedItemId(id); setSelectedItemType(type); }}
            />
            
            {/* Detail Panel */}
            <div className={`absolute top-0 right-0 h-full z-[1001] transition-transform duration-300 pointer-events-none ${selectedSelection ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="h-full pointer-events-auto">
                <DetailPanel 
                  selection={selectedSelection} 
                  lang={lang} 
                  onClose={() => { setSelectedItemId(null); setSelectedItemType(null); }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const MethodologySection: React.FC = () => (
  <section id="methodology" className="bg-brand-bg py-20 px-6 overflow-hidden">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-4">Méthodologie open data</h2>
        <div className="w-20 h-1.5 bg-brand-blue mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: Database, title: 'Extraction', text: 'Récupération des données brutes via Overpass API (OSM).' },
          { icon: Code2, title: 'Parsing', text: 'Nettoyage et structuration du format Overpass JSON.' },
          { icon: MapIcon, title: 'Visualisation', text: 'Conversion des géométries en couches interactives Leaflet.' },
          { icon: Microscope, title: 'Analyse', text: 'Calcul des axes logistiques par regroupement analytique des tags.' },
        ].map((step, idx) => (
          <div key={idx} className="relative group">
            {idx < 3 && <div className="hidden lg:block absolute top-10 left-full w-full h-px border-t-2 border-dashed border-brand-border -z-0"></div>}
            <div className="relative bg-white p-8 rounded-3xl border border-brand-border shadow-sm group-hover:shadow-xl transition-all z-10">
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
          “Les axes calculés sont des regroupements analytiques issus d’OpenStreetMap. Ils ne représentent pas des corridors officiels ni des flux transporteur réels.”
        </p>
      </div>
    </div>
  </section>
);

const LimitsSection: React.FC = () => (
  <section id="limits" className="bg-white py-20 px-6">
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black text-brand-text">Limites et transparence</h2>
          <p className="text-brand-muted leading-relaxed">
            Ce projet est un démonstrateur technique. Pour garantir une lecture honnête des données, plusieurs limites doivent être soulignées :
          </p>
          <ul className="space-y-4 text-sm font-bold text-brand-text">
            {[
              'Qualité dépendante des contributeurs OpenStreetMap.',
              'Infrastructures (parkings, péages) parfois incomplètes.',
              'Axes calculés purement analytiques (non officiels).',
              'Aucun flux privé, coût ou volume n\'est mesuré.',
              'Données OSM exploitées sous licence ODbL.',
            ].map((limit, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-orange shrink-0" />
                <span>{limit}</span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-brand-muted italic pt-4">
            Source : OpenStreetMap / Overpass API · Données OSM sous licence ODbL
          </p>
        </div>
        <div className="w-full md:w-1/3 aspect-square bg-brand-bg rounded-[40px] flex items-center justify-center border-4 border-brand-border">
          <ShieldCheck className="w-32 h-32 text-brand-border" />
        </div>
      </div>
    </div>
  </section>
);

const SkillsSection: React.FC = () => (
  <section id="skills" className="bg-brand-text py-24 px-6 text-white overflow-hidden relative">
    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-[100px]"></div>
    <div className="max-w-5xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-black mb-4">Compétences démontrées</h2>
        <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
          Ce projet démontre la capacité à transformer des données ouvertes brutes en interface interactive, lisible et exploitable.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {[
          'React', 'TypeScript', 'Leaflet', 'OpenStreetMap', 'Overpass API', 'Parsing JSON',
          'Data visualisation', 'UX cartographique', 'Optimisation performance', 'Dashboard KPI', 'Bilingue FR/EN'
        ].map(skill => (
          <span key={skill} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-black hover:bg-brand-blue hover:border-brand-blue transition-all cursor-default">
            {skill}
          </span>
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue flex items-center justify-center">
            <Layout className="w-6 h-6" />
          </div>
          <div className="text-left pr-4">
            <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Architecture</div>
            <div className="text-sm font-bold">SPA - One Page Portfolio</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const AppContent: React.FC = () => {
  const { hubs, lang } = useApp();

  return (
    <div className="flex flex-col">
      <Hero />
      <MapSection />
      <div id="analysis">
        <DataInsights hubs={hubs} lang={lang} />
      </div>
      <MethodologySection />
      <LimitsSection />
      <SkillsSection />
      
      <footer className="bg-brand-bg py-10 border-t border-brand-border text-center">
        <div className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-2">
          EuroRoad Atlas — Atlas open data
        </div>
        <p className="text-xs text-brand-muted/60">
          Conçu pour le portfolio technique · 2024
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