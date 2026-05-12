import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Country, FilterState, Hub, Language, SelectedItemType } from '../../types';
import { useTranslation } from '../../utils/i18n';
import { hubsData } from '../../data/hubs';
import { MotorwayLayer } from './MotorwayLayer';
import { TollLayer } from './TollLayer';
import { TruckParkingLayer } from './TruckParkingLayer';
import { RealCorridorLayer } from './RealCorridorLayer';
import { useApp } from '../../context/AppContext';

// FR/BE/NL bounds
const FR_BE_NL_BOUNDS: L.LatLngBoundsExpression = [[49.0, 1.8], [53.5, 7.2]];

// Custom hub icons
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
      width: ${isSelected ? '42px' : '34px'};
      height: ${isSelected ? '42px' : '34px'};
      background: white;
      border: 2.5px solid ${isSelected ? '#2563EB' : '#94A3B8'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${isSelected ? '22px' : '17px'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.2s ease;
      cursor: pointer;
    ">${emoji}</div>`,
    iconSize: [isSelected ? 42 : 34, isSelected ? 42 : 34],
    iconAnchor: [isSelected ? 21 : 17, isSelected ? 21 : 17],
  });
};

interface MapExplorerProps {
  lang?: Language;
  filters?: FilterState;
  selectedItemId: string | null;
  onSelectItem: (id: string | null, type: SelectedItemType | null) => void;
}

// Zoom tracker
const MapZoomTracker: React.FC<{ onZoomChange: (zoom: number) => void }> = ({ onZoomChange }) => {
  const map = useMap();
  useMapEvents({ zoomend: () => onZoomChange(map.getZoom()) });
  useEffect(() => { onZoomChange(map.getZoom()); }, [map, onZoomChange]);
  return null;
};

// Component that calls invalidateSize and fits bounds when fullScreen changes
const MapResizer: React.FC<{ isFullScreen: boolean }> = ({ isFullScreen }) => {
  const map = useMap();
  useEffect(() => {
    // Sequence of invalidations to ensure Leaflet captures the final container size
    const timeouts = [100, 300, 600, 1000].map(delay => 
      setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(FR_BE_NL_BOUNDS, { padding: [40, 40] });
      }, delay)
    );
    
    return () => timeouts.forEach(clearTimeout);
  }, [isFullScreen, map]);
  return null;
};

export const MapExplorer: React.FC<MapExplorerProps> = ({ lang = 'fr', filters, selectedItemId, onSelectItem }) => {
  const { t } = useTranslation(lang);
  const [zoom, setZoom] = useState(7);
  const { isFullScreen, setIsFullScreen, setIsSidebarOpen } = useApp();
  const [showHelp, setShowHelp] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHelp(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = useCallback((id: string | null, type: SelectedItemType | null) => {
    setShowHelp(false);
    onSelectItem(id, type);
  }, [onSelectItem]);

  const filteredHubs = useMemo(() => {
    if (!filters?.showHubs) return [];
    return hubsData.filter(h =>
      filters.countries.includes(h.country) &&
      filters.hubTypes.includes(h.type)
    );
  }, [filters]);

  const selectedCountries = filters?.countries ?? ['France', 'Belgium', 'Netherlands'];

  const toggleFullScreen = () => {
    const entering = !isFullScreen;
    setIsFullScreen(entering);
    if (entering) {
      setIsSidebarOpen(false);
      onSelectItem(null, null);
    } else {
      setIsSidebarOpen(true);
    }
  };

  return (
    <div className="relative z-0 h-full w-full min-h-0">
      <MapContainer
        center={[50.8, 4.6]}
        zoom={7}
        minZoom={5}
        maxZoom={18}
        className="h-full w-full min-h-0"
        zoomControl={false}
        scrollWheelZoom={true}
        preferCanvas={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://carto.com/attributions">CARTO</a> · Données OSM sous licence ODbL'
        />
        <ZoomControl position="topleft" />
        <MapZoomTracker onZoomChange={setZoom} />
        <MapResizer isFullScreen={isFullScreen} />

        {/* Hubs */}
        {filteredHubs.map(hub => {
          const isSelected = selectedItemId === hub.id;
          return (
            <Marker
              key={hub.id}
              position={hub.coordinates}
              icon={getHubIcon(hub.type, isSelected)}
              eventHandlers={{ click: () => handleSelect(hub.id, 'hub') }}
            >
              <Tooltip offset={[0, -20]} className="border-none shadow-lg rounded-xl px-3 py-2 text-sm">
                <div className="font-bold">{hub.name}</div>
                <div className="text-xs text-brand-muted">{t(hub.type)}</div>
              </Tooltip>
            </Marker>
          );
        })}

        {filters?.showMotorways && selectedCountries.map((country) => (
          <MotorwayLayer
            key={`motorway-${country}`}
            country={country as Country}
            enabled={Boolean(filters?.showMotorways)}
            zoom={zoom}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelect}
          />
        ))}

        {filters?.showTolls && selectedCountries.map((country) => (
          <TollLayer
            key={`toll-${country}`}
            country={country as Country}
            enabled={Boolean(filters?.showTolls)}
            zoom={zoom}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelect}
          />
        ))}

        {filters?.showTruckParkings && selectedCountries.map((country) => (
          <TruckParkingLayer
            key={`parking-${country}`}
            country={country as Country}
            enabled={Boolean(filters?.showTruckParkings)}
            zoom={zoom}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelect}
          />
        ))}

        {filters?.showAxes && selectedCountries.map((country) => (
          <RealCorridorLayer
            key={`axis-${country}`}
            country={country as Country}
            enabled={Boolean(filters?.showAxes)}
            zoom={zoom}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelect}
          />
        ))}
      </MapContainer>

      {/* Help card */}
      {showHelp && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-start gap-3 rounded-2xl border border-brand-blue/20 bg-white/96 px-5 py-3 text-xs font-medium text-brand-text shadow-xl backdrop-blur-sm max-w-sm">
          <span className="text-lg shrink-0 mt-0.5">💡</span>
          <div className="leading-relaxed">
            <span className="font-bold block mb-0.5">Vue initiale : hubs + autoroutes</span>
            Cliquez sur un hub ⚓, une autoroute, un péage ou un parking PL pour explorer ses données. Activez des couches avancées dans le panneau de gauche.
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className="shrink-0 ml-1 text-brand-muted hover:text-brand-text transition-colors text-base leading-none"
            title="Fermer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Consolidated zoom warning */}
      {zoom < 10 && (filters?.showTolls || filters?.showTruckParkings) && (
        <div className="pointer-events-none absolute left-6 bottom-24 z-[1000] rounded-xl border-2 border-brand-orange/30 bg-white/95 px-5 py-3 text-xs font-bold text-brand-orange shadow-2xl backdrop-blur-md max-w-[280px]">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
            <span>Zoom requis</span>
          </div>
          Zoomez davantage pour afficher les couches locales : péages et parkings PL.
        </div>
      )}

      {/* Fullscreen toggle */}
      <button
        onClick={toggleFullScreen}
        className={`z-[10000] p-3 rounded-2xl border-2 transition-all flex items-center gap-2 text-sm font-black shadow-2xl ${
          isFullScreen 
            ? 'fixed bottom-8 right-8 bg-brand-text text-white border-white/20 hover:bg-black' 
            : 'absolute bottom-6 right-6 bg-white text-brand-text border-brand-border hover:bg-brand-bg'
        }`}
        title={isFullScreen ? "Réduire la carte" : "Plein écran immersif"}
      >
        {isFullScreen ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Quitter le plein écran
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
            Mode immersif
          </>
        )}
      </button>
    </div>
  );
};