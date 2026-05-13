import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import { Layers, Route, Box, Info } from 'lucide-react';
import L from 'leaflet';
import { Country, FilterState, Hub, Language, SelectedItemType } from '../../types';
import { useTranslation } from '../../utils/i18n';
import { MotorwayLayer } from './MotorwayLayer';
import { TollLayer } from './TollLayer';
import { TruckParkingLayer } from './TruckParkingLayer';
import { RealCorridorLayer } from './RealCorridorLayer';
import { MapSearch } from './MapSearch';
import { useApp } from '../../context/AppContext';
import { MAP_CONSTANTS } from '../../constants/map';

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
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    ">${emoji}</div>`,
    iconSize: [isSelected ? 42 : 34, isSelected ? 42 : 34],
    iconAnchor: [isSelected ? 21 : 17, isSelected ? 21 : 17],
  });
};

// Map state tracker
const MapStateTracker: React.FC<{ 
  onStateChange: (zoom: number, bounds: L.LatLngBounds) => void 
}> = ({ onStateChange }) => {
  const map = useMap();
  const update = useCallback(() => {
    onStateChange(map.getZoom(), map.getBounds());
  }, [map, onStateChange]);

  useMapEvents({ 
    zoomend: update,
    moveend: update
  });

  useEffect(() => { update(); }, [update]);
  return null;
};

// Map resizer
const MapResizer: React.FC<{ isFullScreen: boolean }> = ({ isFullScreen }) => {
  const map = useMap();
  useEffect(() => {
    const timeouts = [100, 300, 600, 1000].map(delay => 
      setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(MAP_CONSTANTS.FR_BE_NL_BOUNDS, { padding: [40, 40] });
      }, delay)
    );
    return () => timeouts.forEach(clearTimeout);
  }, [isFullScreen, map]);
  return null;
};

import { HubLayer } from './HubLayer';

interface MapExplorerProps {
  lang: Language;
  filters: FilterState;
  selectedItemId: string | null;
  onSelectItem: (id: string, type: SelectedItemType) => void;
}

export const MapExplorer: React.FC<MapExplorerProps> = ({ lang = 'fr', filters, selectedItemId, onSelectItem }) => {
  const { t } = useTranslation(lang);
  const [zoom, setZoom] = useState(MAP_CONSTANTS.INITIAL_ZOOM);
  const { isFullScreen, setIsFullScreen, setIsSidebarOpen, osmData } = useApp();
  const [showHelp, setShowHelp] = useState(true);
  const [showZoomHint, setShowZoomHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mapElement = document.querySelector(".leaflet-container");
    if (!mapElement) return;

    const preventBrowserZoomOnMap = (event: WheelEvent) => {
      if (event.ctrlKey) event.preventDefault();
    };

    mapElement.addEventListener("wheel", preventBrowserZoomOnMap, { passive: false });
    return () => mapElement.removeEventListener("wheel", preventBrowserZoomOnMap);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHelp(false);
      setShowZoomHint(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = useCallback((id: string | null, type: SelectedItemType | null) => {
    setShowHelp(false);
    setShowZoomHint(false);
    onSelectItem(id, type);
  }, [onSelectItem]);

  const selectedCountries = filters?.countries ?? ['France', 'Belgium', 'Netherlands'];

  const toggleFullScreen = () => {
    const entering = !isFullScreen;
    setIsFullScreen(entering);
    if (entering) {
      setIsSidebarOpen(false);
      onSelectItem(null, null);
    } else {
      setIsSidebarOpen(true);
      setTimeout(() => {
        const el = document.getElementById('map-viewport');
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - 40;
          window.scrollTo({ top: y, behavior: 'auto' });
        }
      }, 50);
    }
  };

  return (
    <div ref={containerRef} className="relative z-0 h-full w-full overflow-hidden">
      <MapContainer
        center={MAP_CONSTANTS.INITIAL_CENTER}
        zoom={MAP_CONSTANTS.INITIAL_ZOOM}
        minZoom={MAP_CONSTANTS.MIN_ZOOM}
        maxZoom={MAP_CONSTANTS.MAX_ZOOM}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        scrollWheelZoom="center"
        wheelDebounceTime={80}
        wheelPxPerZoomLevel={180}
        preferCanvas={true}
        dragging={true}
        doubleClickZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://carto.com/attributions">CARTO</a> · OSM ODbL'
        />
        <ZoomControl position="topleft" />
        <MapStateTracker onStateChange={(z) => setZoom(z)} />
        <MapResizer isFullScreen={isFullScreen} />
        
        <MapSearch onSelectResult={(id, type) => handleSelect(id, type)} />

        {filters && (
          <HubLayer 
            lang={lang}
            filters={{
              showHubs: !!filters.showHubs,
              countries: filters.countries,
              hubTypes: filters.hubTypes
            }}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelect}
            getHubIcon={getHubIcon}
            t={t}
          />
        )}

        {(filters?.showMotorways || filters?.showAllMotorways) && selectedCountries.map((country) => (
          <MotorwayLayer
            key={`motorway-${country}`}
            country={country as Country}
            enabled={Boolean(filters?.showMotorways || filters?.showAllMotorways)}
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

        {(filters?.showAxes || filters?.showAllAxes) && selectedCountries.map((country) => (
          <RealCorridorLayer
            key={`axis-${country}`}
            country={country as Country}
            enabled={Boolean(filters?.showAxes || filters?.showAllAxes)}
            zoom={zoom}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelect}
          />
        ))}
      </MapContainer>

      {/* Zoom trackpad hint */}
      {showZoomHint && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-brand-text/90 text-white px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs font-bold leading-tight">
            {t('zoomHintTrackpad')}
          </p>
          <button onClick={() => setShowZoomHint(false)} className="ml-2 opacity-50 hover:opacity-100 transition-opacity text-base">✕</button>
        </div>
      )}

      {/* Help card */}
      {showHelp && (
        <div className="absolute top-4 right-4 z-[1000] flex items-start gap-3 rounded-2xl border border-brand-blue/20 bg-white/96 px-5 py-3 text-xs font-medium text-brand-text shadow-xl backdrop-blur-sm max-w-sm animate-in fade-in slide-in-from-top-2">
          <span className="text-lg shrink-0 mt-0.5">💡</span>
          <div className="leading-relaxed">
            <span className="font-bold block mb-0.5">{t('mapHelpTitle')}</span>
            {t('mapHelpText')}
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className="shrink-0 ml-1 text-brand-muted hover:text-brand-text transition-colors text-base leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* Consolidated zoom warning / Performance hint */}
      {(zoom < MAP_CONSTANTS.ZOOM_TOLLS_MIN && (filters?.showTolls || filters?.showTruckParkings)) || (zoom < MAP_CONSTANTS.ZOOM_ALL_MOTORWAYS_MIN && filters?.showAllMotorways) ? (
        <div className="pointer-events-none absolute left-6 bottom-36 z-[1000] rounded-xl border-2 border-brand-orange/30 bg-white/95 px-5 py-3 text-xs font-bold text-brand-orange shadow-2xl backdrop-blur-md max-w-[280px] animate-in fade-in slide-in-from-left-4">
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-4 h-4" />
            <span>{t('layerAvailable')}</span>
          </div>
          {t('zoomFurtherToDisplay')}
        </div>
      ) : null}

      {/* Loading states overlay */}
      {(osmData.loading.motorways.fr || osmData.loading.tolls.fr || osmData.loading.truckParkings.fr) && (
        <div className="absolute left-6 bottom-10 z-[1000] flex flex-col gap-2 pointer-events-none">
          {osmData.loading.motorways.fr && (
            <div className="bg-brand-blue/90 text-white px-4 py-2 rounded-xl shadow-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
              {t('loadingOsmLayers')}
            </div>
          )}
          {osmData.loading.tolls.fr && (
            <div className="bg-brand-orange/90 text-white px-4 py-2 rounded-xl shadow-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
              {t('loadingTolls')}
            </div>
          )}
          {osmData.loading.truckParkings.fr && (
            <div className="bg-brand-green/90 text-white px-4 py-2 rounded-xl shadow-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
              {t('loadingHGVParkings')}
            </div>
          )}
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
      >
        {isFullScreen ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('exitFullScreen')}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
            {t('immersiveMode')}
          </>
        )}
      </button>
    </div>
  );
};