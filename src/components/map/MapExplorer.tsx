import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Hub, FilterState, Language } from '../../types';
import { useTranslation } from '../../utils/i18n';
import { hubsData } from '../../data/hubs';

// Création d'icônes personnalisées par type de hub
const getHubIcon = (type: Hub['type'], isSelected: boolean) => {
  const iconMap: Record<Hub['type'], string> = {
    seaport: '⚓',
    urban_hub: '🏙️',
    border_hub: '🚧',
    industrial_hub: '🏭',
    inland_hub: '📦',
  };
  
  const emoji = iconMap[type] || '📍';
  
  return L.divIcon({
    className: 'custom-hub-marker',
    html: `<div style="
      width: ${isSelected ? '42px' : '36px'};
      height: ${isSelected ? '42px' : '36px'};
      background: white;
      border: 3px solid ${isSelected ? '#2563EB' : '#94A3B8'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${isSelected ? '22px' : '18px'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.2s ease;
      cursor: pointer;
    ">
      ${emoji}
    </div>`,
    iconSize: [isSelected ? 42 : 36, isSelected ? 42 : 36],
    iconAnchor: [isSelected ? 21 : 18, isSelected ? 21 : 18],
  });
};

interface MapExplorerProps {
  lang?: Language;
  filters?: FilterState;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
}

export const MapExplorer: React.FC<MapExplorerProps> = ({ 
  lang = 'fr', 
  filters, 
  selectedItemId, 
  onSelectItem 
}) => {
  const { t } = useTranslation(lang);
  
  const filteredHubs = useMemo(() => {
    if (!filters?.showHubs) return [];
    return hubsData.filter(h => 
      filters.countries.includes(h.country) && 
      filters.hubTypes.includes(h.type)
    );
  }, [filters]);

  return (
    <div className="relative z-0 h-full w-full min-h-0">
      <MapContainer 
        center={[50.8, 4.4]} 
        zoom={7} 
        className="h-full w-full min-h-0"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors | <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Hubs */}
        {filteredHubs.map(hub => {
          const isSelected = selectedItemId === hub.id;
          return (
            <Marker 
              key={hub.id} 
              position={hub.coordinates}
              icon={getHubIcon(hub.type, isSelected)}
              eventHandlers={{
                click: () => onSelectItem(hub.id),
              }}
            >
              <Tooltip offset={[0, -20]} className="border-none shadow-lg rounded-xl px-3 py-2 text-sm">
                <div className="font-bold">{hub.name}</div>
                <div className="text-xs text-brand-muted">{t(hub.type)}</div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Mini-légende flottante */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-brand-border bg-white/90 p-3 text-xs shadow-lg backdrop-blur-sm">
        <div className="font-bold mb-2 text-brand-text">📍 Hubs logistiques</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2"><span>⚓</span><span>Port maritime</span></div>
          <div className="flex items-center gap-2"><span>🏙️</span><span>Hub urbain</span></div>
          <div className="flex items-center gap-2"><span>🚧</span><span>Hub frontalier</span></div>
          <div className="flex items-center gap-2"><span>🏭</span><span>Hub industriel</span></div>
          <div className="flex items-center gap-2"><span>📦</span><span>Hub intérieur</span></div>
        </div>
      </div>
    </div>
  );
};