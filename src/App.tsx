import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { MapExplorer } from './components/map/MapExplorer';
import { DetailPanel } from './components/panels/DetailPanel';
import { DataInsights } from './components/dashboard/DataInsights';
import { OsmDataStats } from './components/dashboard/OsmDataStats';
import { MethodologyModal } from './components/panels/MethodologyModal';
import { AppProvider, useApp } from './context/AppContext';
import { OsmAxisFeature, OsmLineFeature, OsmPointFeature, SelectedItemType } from './types';

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

  const findOsmFeature = (type: Exclude<SelectedItemType, 'hub'>, id: string | null) => {
    if (!id) {
      return null;
    }

    const searchLayer = <T extends OsmLineFeature | OsmPointFeature | OsmAxisFeature>(
      layer: { fr: T[] | null; be: T[] | null; nl: T[] | null }
    ) => Object.values(layer).flatMap((entries) => entries || []).find((feature) => feature.id === id) || null;

    switch (type) {
      case 'motorway':
        return searchLayer(osmData.motorways);
      case 'toll':
        return searchLayer(osmData.tolls);
      case 'truck_parking':
        return searchLayer(osmData.truckParkings);
      case 'axis':
        return searchLayer(osmData.axes);
      default:
        return null;
    }
  };

  const selectedSelection =
    selectedItemType === 'hub'
      ? selectedItem
        ? { type: 'hub' as const, item: selectedItem }
        : null
      : selectedItemType
      ? (() => {
          const osmItem = findOsmFeature(selectedItemType, selectedItemId);
          return osmItem ? { type: selectedItemType, item: osmItem } : null;
        })()
      : null;

  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative flex min-h-0 flex-[1.35] overflow-hidden">
        <MapExplorer 
          lang={lang} 
          filters={filters} 
          selectedItemId={selectedItemId}
          onSelectItem={(id, type) => {
            setSelectedItemId(id);
            setSelectedItemType(type);
          }}
        />

        {selectedSelection && (
          <DetailPanel 
            selection={selectedSelection} 
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
        <div className="p-6 md:p-8">
          <OsmDataStats lang={lang} />
        </div>
        
        <DataInsights hubs={hubs} lang={lang} />
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