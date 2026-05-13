import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Polyline, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { Country, OsmCountryCode } from '../../types';
import { useApp } from '../../context/AppContext';

interface MotorwayLayerProps {
  country: Country;
  enabled: boolean;
  zoom: number;
  selectedItemId: string | null;
  onSelectItem: (id: string | null, type: 'motorway' | null) => void;
}

const isVisible = (bbox: [number, number, number, number] | undefined, bounds: L.LatLngBounds | null) => {
  if (!bounds || !bbox) return true;
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const [minLat, minLon, maxLat, maxLon] = bbox;
  return !(maxLat < sw.lat || minLat > ne.lat || maxLon < sw.lng || minLon > ne.lng);
};

const COUNTRY_COLORS: Record<Country, string> = {
  France: '#3B82F6',
  Belgium: '#D97706',
  Netherlands: '#0891B2',
};

const COUNTRY_CODE: Record<Country, OsmCountryCode> = {
  France: 'fr',
  Belgium: 'be',
  Netherlands: 'nl',
};

// Zoom-based display caps: show fewer segments at low zoom (faster), more when user zooms in
const getDisplayCap = (zoom: number, showAll: boolean): number => {
  if (!showAll) {
    if (zoom < 8) return 300;
    if (zoom < 10) return 800;
    return 2000;
  }
  if (zoom < 9) return 500;
  if (zoom < 12) return 2000;
  return 4000;
};

// Single polyline – memo prevents re-render unless its own props change
const MotowaySeg = memo(({
  positions,
  color,
  isSelected,
  onClickId,
  onSelect,
  label,
  name,
  country,
  showTooltip,
  zoom,
}: {
  positions: [number, number][];
  color: string;
  isSelected: boolean;
  onClickId: string;
  onSelect: (id: string) => void;
  label: string;
  name?: string;
  country: Country;
  showTooltip: boolean;
  zoom: number;
}) => {
  const pathOptions = useMemo(() => ({
    color,
    weight: isSelected ? 5 : (zoom < 9 ? 1.2 : 2),
    opacity: isSelected ? 0.9 : (zoom < 9 ? 0.4 : 0.6),
  }), [color, isSelected, zoom]);

  const handlers = useMemo(() => ({
    click: () => onSelect(onClickId),
    mouseover: (e: any) => { if (!isSelected) e.target.setStyle({ weight: 4, opacity: 0.85 }); },
    mouseout: (e: any) => { if (!isSelected) e.target.setStyle({ weight: 2, opacity: 0.55 }); },
  }), [onClickId, isSelected, onSelect]);

  return (
    <Polyline positions={positions} pathOptions={pathOptions} eventHandlers={handlers}>
      {/* Tooltip only when zoomed in enough — avoids 5000 DOM nodes */}
      {showTooltip && (
        <Tooltip sticky className="rounded-xl border-none px-3 py-2 text-sm shadow-lg">
          <div className="font-bold">{label}</div>
          {name && <div className="text-xs text-brand-muted">{name}</div>}
          <div className="mt-1 text-xs text-brand-text">{country} · OpenStreetMap</div>
        </Tooltip>
      )}
    </Polyline>
  );
});
MotowaySeg.displayName = 'MotowaySeg';

// ── Main layer ────────────────────────────────────────────────────────────────

export const MotorwayLayer: React.FC<MotorwayLayerProps> = memo(({
  country,
  enabled,
  zoom,
  selectedItemId,
  onSelectItem,
}) => {
  const map = useMap();
  const [bounds, setBounds] = useState<L.LatLngBounds>(map.getBounds());
  const { osmData, ensureOsmLayerLoaded, filters } = useApp();
  
  useMapEvents({
    moveend: () => setBounds(map.getBounds()),
    zoomend: () => setBounds(map.getBounds())
  });

  const code = COUNTRY_CODE[country];
  const color = COUNTRY_COLORS[country];

  useEffect(() => {
    if (enabled) void ensureOsmLayerLoaded('motorways', [country]);
  }, [country, enabled, ensureOsmLayerLoaded]);

  const features = useMemo(() => osmData.motorways[code] || [], [code, osmData.motorways]);
  const loading = osmData.loading.motorways[code];
  const error = osmData.errors.motorways[code];

  const cap = getDisplayCap(zoom, Boolean(filters.showAllMotorways));

  const displayFeatures = useMemo(() => {
    let filtered = features;
    
    if (filters.showAllMotorways && zoom >= 9) {
      // Keep all
    } else {
      // Default: only principal roads (have a ref)
      filtered = features.filter(f => f.ref || f.intRef);
    }

    // Viewport filtering
    return filtered
      .filter(f => isVisible(f.bbox, bounds))
      .slice(0, cap);
  }, [features, filters.showAllMotorways, zoom, cap, bounds]);

  // Stable callback
  const handleSelect = useCallback((id: string) => onSelectItem(id, 'motorway'), [onSelectItem]);

  // Only show tooltips when zoomed in (heavy DOM cost otherwise)
  const showTooltip = zoom >= 10;

  if (!enabled || zoom < 7 || loading || error || features.length === 0) return null;

  return (
    <>
      {displayFeatures.map(feature => {
        const positions = Array.isArray(feature.geometry)
          ? feature.geometry.map(p => [p.lat, p.lon] as [number, number])
          : feature.coordinates;
        return (
          <MotowaySeg
            key={feature.id}
            positions={positions}
            color={color}
            isSelected={selectedItemId === feature.id}
            onClickId={feature.id}
            onSelect={handleSelect}
            label={feature.ref || feature.intRef || 'N/A'}
            name={feature.name}
            country={country}
            showTooltip={showTooltip}
            zoom={zoom}
          />
        );
      })}
    </>
  );
});
MotorwayLayer.displayName = 'MotorwayLayer';
