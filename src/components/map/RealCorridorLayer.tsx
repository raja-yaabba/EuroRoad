import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Polyline, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { Country, OsmCountryCode } from '../../types';
import { useApp } from '../../context/AppContext';

interface RealCorridorLayerProps {
  country: Country;
  enabled: boolean;
  zoom: number;
  selectedItemId: string | null;
  onSelectItem: (id: string | null, type: 'axis' | null) => void;
}

const isVisible = (bbox: [number, number, number, number] | undefined, bounds: L.LatLngBounds | null) => {
  if (!bounds || !bbox) return true;
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const [minLat, minLon, maxLat, maxLon] = bbox;
  return !(maxLat < sw.lat || minLat > ne.lat || maxLon < sw.lng || minLon > ne.lng);
};

const AXIS_COLOR = '#0F766E';

const COUNTRY_CODE: Record<Country, OsmCountryCode> = {
  France: 'fr',
  Belgium: 'be',
  Netherlands: 'nl',
};

// Individual axis segment – memo prevents re-render unless own props change
const AxisSeg = memo(({
  positions,
  isSelected,
  onClickId,
  onSelect,
  axisKey,
  memberCount,
  showTooltip,
  zoom,
}: {
  positions: [number, number][];
  isSelected: boolean;
  onClickId: string;
  onSelect: (id: string) => void;
  axisKey: string;
  memberCount: number;
  showTooltip: boolean;
  zoom: number;
}) => {
  const pathOptions = useMemo(() => ({
    color: AXIS_COLOR,
    weight: isSelected ? 4 : (zoom < 9 ? 1.5 : 2.5),
    opacity: isSelected ? 0.9 : (zoom < 9 ? 0.3 : 0.5),
    dashArray: '10 7',
  }), [isSelected, zoom]);

  const handlers = useMemo(() => ({
    click: () => onSelect(onClickId),
    mouseover: (e: any) => { if (!isSelected) e.target.setStyle({ weight: 3, opacity: 0.75 }); },
    mouseout: (e: any) => { if (!isSelected) e.target.setStyle({ weight: 1.5, opacity: 0.3 }); },
  }), [onClickId, isSelected, onSelect]);

  return (
    <Polyline positions={positions} pathOptions={pathOptions} eventHandlers={handlers}>
      {showTooltip && (
        <Tooltip sticky className="rounded-xl border-none px-3 py-2 text-sm shadow-lg">
          <div className="font-bold">Axe {axisKey}</div>
          <div className="text-xs text-brand-muted">{memberCount} segments OSM</div>
          <div className="mt-1 text-[10px] font-bold uppercase text-brand-turquoise">Donnée calculée — OSM</div>
        </Tooltip>
      )}
    </Polyline>
  );
});
AxisSeg.displayName = 'AxisSeg';

// ── Main layer ────────────────────────────────────────────────────────────────

export const RealCorridorLayer: React.FC<RealCorridorLayerProps> = memo(({
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

  useEffect(() => {
    if (enabled) void ensureOsmLayerLoaded('axes', [country]);
  }, [country, enabled, ensureOsmLayerLoaded]);

  const features = useMemo(() => osmData.axes[code] || [], [code, osmData.axes]);
  const loading = osmData.loading.axes[code];
  const error = osmData.errors.axes[code];

  // Sort once, memoised
  const displayFeatures = useMemo(() => {
    const filtered = features.filter(f => isVisible(f.bbox, bounds));
    const sorted = [...filtered].sort((a, b) => b.memberCount - a.memberCount);
    return filters.showAllAxes ? sorted.slice(0, 200) : sorted.slice(0, 15);
  }, [features, filters.showAllAxes, bounds]);

  const handleSelect = useCallback((id: string) => onSelectItem(id, 'axis'), [onSelectItem]);

  const showTooltip = zoom >= 9;

  if (!enabled || zoom < 7 || loading || error || features.length === 0) return null;

  return (
    <>
      {displayFeatures.map(feature => (
        <AxisSeg
          key={feature.id}
          positions={feature.coordinates}
          isSelected={selectedItemId === feature.id}
          onClickId={feature.id}
          onSelect={handleSelect}
          axisKey={feature.axisKey || feature.ref || 'N/A'}
          memberCount={feature.memberCount}
          showTooltip={showTooltip}
          zoom={zoom}
        />
      ))}
    </>
  );
});
RealCorridorLayer.displayName = 'RealCorridorLayer';
