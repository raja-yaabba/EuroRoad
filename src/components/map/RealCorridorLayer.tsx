import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import { Country, OsmCountryCode } from '../../types';
import { useApp } from '../../context/AppContext';

interface RealCorridorLayerProps {
  country: Country;
  enabled: boolean;
  zoom: number;
  selectedItemId: string | null;
  onSelectItem: (id: string | null, type: 'axis' | null) => void;
}

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
}: {
  positions: [number, number][];
  isSelected: boolean;
  onClickId: string;
  onSelect: (id: string) => void;
  axisKey: string;
  memberCount: number;
  showTooltip: boolean;
}) => {
  const pathOptions = useMemo(() => ({
    color: AXIS_COLOR,
    weight: isSelected ? 3.5 : 1.5,
    opacity: isSelected ? 0.85 : 0.3,
    dashArray: '10 7',
  }), [isSelected]);

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
  const { osmData, ensureOsmLayerLoaded, filters } = useApp();
  const code = COUNTRY_CODE[country];

  useEffect(() => {
    if (enabled) void ensureOsmLayerLoaded('axes', [country]);
  }, [country, enabled, ensureOsmLayerLoaded]);

  const features = useMemo(() => osmData.axes[code] || [], [code, osmData.axes]);
  const loading = osmData.loading.axes[code];
  const error = osmData.errors.axes[code];

  // Sort once, memoised
  const displayFeatures = useMemo(() => {
    const sorted = [...features].sort((a, b) => b.memberCount - a.memberCount);
    return filters.showAllAxes ? sorted.slice(0, 50) : sorted.slice(0, 15);
  }, [features, filters.showAllAxes]);

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
        />
      ))}
    </>
  );
});
RealCorridorLayer.displayName = 'RealCorridorLayer';
