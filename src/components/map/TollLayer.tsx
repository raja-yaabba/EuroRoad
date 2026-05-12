import React, { memo, useCallback, useEffect, useMemo } from 'react';
import L from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import { Country, OsmCountryCode } from '../../types';
import { useApp } from '../../context/AppContext';

interface TollLayerProps {
  country: Country;
  enabled: boolean;
  zoom: number;
  selectedItemId: string | null;
  onSelectItem: (id: string | null, type: 'toll' | null) => void;
}

const createMarkerIcon = (selected: boolean) =>
  L.divIcon({
    className: 'osm-toll-marker',
    html: `<div style="
      width:${selected ? 24 : 18}px;
      height:${selected ? 24 : 18}px;
      border-radius:9999px;
      background:${selected ? '#F97316' : '#FDBA74'};
      border:1.5px solid #ffffff;
      box-shadow:0 4px 12px rgba(0,0,0,0.15);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#ffffff;
      font-size:${selected ? 12 : 10}px;
      font-weight:800;
    ">€</div>`,
    iconSize: [selected ? 24 : 18, selected ? 24 : 18],
    iconAnchor: [selected ? 12 : 9, selected ? 12 : 9],
  });

const formatTagValue = (value?: string) => value || 'Donnée non renseignée';

const COUNTRY_CODE: Record<Country, OsmCountryCode> = {
  France: 'fr',
  Belgium: 'be',
  Netherlands: 'nl',
};

export const TollLayer: React.FC<TollLayerProps> = memo((
  { country, enabled, zoom, selectedItemId, onSelectItem }
) => {
  const { osmData, ensureOsmLayerLoaded } = useApp();
  const code = COUNTRY_CODE[country];

  useEffect(() => {
    if (enabled) void ensureOsmLayerLoaded('tolls', [country]);
  }, [country, enabled, ensureOsmLayerLoaded]);

  const features = useMemo(() => osmData.tolls[code] || [], [code, osmData.tolls]);
  const loading = osmData.loading.tolls[code];
  const error = osmData.errors.tolls[code];

  const handleSelect = useCallback((id: string) => onSelectItem(id, 'toll'), [onSelectItem]);
  const showTooltip = zoom >= 10;

  if (!enabled || loading || error || features.length === 0) return null;
  if (zoom < 9) return null;

  return (
    <>
      {features.slice(0, 300).map(feature => {
        const selected = selectedItemId === feature.id;
        return (
          <Marker
            key={feature.id}
            position={feature.coordinates}
            icon={createMarkerIcon(selected)}
            eventHandlers={{ click: () => handleSelect(feature.id) }}
          >
            {showTooltip && (
              <Tooltip direction="top" offset={[0, -10]} className="rounded-xl border-none px-3 py-2 text-sm shadow-lg">
                <div className="font-bold">{formatTagValue(feature.name)}</div>
                <div className="text-xs text-brand-muted">{country} · OSM</div>
              </Tooltip>
            )}
          </Marker>
        );
      })}
    </>
  );
});
TollLayer.displayName = 'TollLayer';
