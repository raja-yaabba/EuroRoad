import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { MapExplorer } from './components/map/MapExplorer';
import { DetailPanel } from './components/panels/DetailPanel';
import { DataInsights } from './components/dashboard/DataInsights';
import { OsmDataStats } from './components/dashboard/OsmDataStats';
import { MethodologyModal } from './components/panels/MethodologyModal';
import { AppProvider, useApp } from './context/AppContext';

const AppContent: React.FC = () => {
  const { 
    selectedItemId, 
    setSelectedItemId, 
    selectedItemType, 
    setSelectedItemType,
    hubs,
    osmData,
    lang,
    filters 
  } = useApp();

  const selectedItem = selectedItemType === 'hub' 
    ? hubs.find(h => h.id === selectedItemId) || null
    : null;

  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative flex min-h-0 flex-[1.35] overflow-hidden">
        <MapExplorer 
          lang={lang} 
          filters={filters} 
          selectedItemId={selectedItemId}
          onSelectItem={(id) => {
            setSelectedItemId(id);
            setSelectedItemType('hub');
          }}
        />

        {selectedItemId && (
          <DetailPanel 
            item={selectedItem} 
            lang={lang} 
            onClose={() => {
              setSelectedItemId(null);
              setSelectedItemType(null);
            }} 
          />
        )}
      </div>

      <div className="h-12 shrink-0 border-t border-brand-border bg-white px-6 flex items-center justify-between z-20">
        <span className="text-sm font-bold text-brand-muted">
          EuroRoad Data Explorer — Real open data only | Sources: OSM, Official Ports
        </span>
      </div>

      <div className="min-h-0 flex-[0.85] overflow-y-auto bg-brand-bg">
        {osmData && osmData.stats && (
          <div className="p-6 md:p-8">
            <OsmDataStats 
              totalMotorways={osmData.stats.totalMotorways}
              totalTolls={osmData.stats.totalTolls}
              totalParkings={osmData.stats.totalParkings}
              countriesCovered={osmData.stats.countriesCovered}
              lang={lang}
            />
          </div>
        )}
        
        <DataInsights hubs={hubs} lang={lang} totalMotorways={osmData?.stats.totalMotorways} />
      </div>

      <MethodologyModal 
        isOpen={showMethodology} 
        onClose={() => setShowMethodology(false)} 
        lang={lang} 
      />
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