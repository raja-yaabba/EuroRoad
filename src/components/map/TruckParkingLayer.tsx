import React, { memo, useCallback, useEffect, useMemo } from 'react';
import L from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import { Country, OsmCountryCode } from '../../types';
import { useApp } from '../../context/AppContext';

interface TruckParkingLayerProps {
  country: Country;
  enabled: boolean;
  zoom: number;
  selectedItemId: string | null;
  onSelectItem: (id: string | null, type: 'truck_parking' | null) => void;
}

const createMarkerIcon = (selected: boolean) =>
  L.divIcon({
    className: 'osm-parking-marker',
    html: `<div style="
      width:${selected ? 24 : 18}px;
      height:${selected ? 24 : 18}px;
      border-radius:9999px;
      background:${selected ? '#14B8A6' : '#5EEAD4'};
      border:1.5px solid #ffffff;
      box-shadow:0 4px 12px rgba(0,0,0,0.15);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#ffffff;
      font-size:${selected ? 12 : 10}px;
      font-weight:800;
    ">P</div>`,
    iconSize: [selected ? 24 : 18, selected ? 24 : 18],
    iconAnchor: [selected ? 12 : 9, selected ? 12 : 9],
  });

const formatTagValue = (value: string | undefined, lang: string) => value || (lang === 'fr' ? 'Non renseigné' : 'Not provided');

const COUNTRY_CODE: Record<Country, OsmCountryCode> = {
  France: 'fr',
  Belgium: 'be',
  Netherlands: 'nl',
};

const getServicesText = (featureTags: Record<string, string>, lang: string) => {
  const services = [
    featureTags.service,
    featureTags.services,
    featureTags.fuel && 'fuel',
    featureTags.toilets && 'toilets',
    featureTags.shower && 'shower',
    featureTags.restaurant && 'restaurant',
    featureTags.shop && 'shop',
  ].filter(Boolean);

  if (services.length === 0) {
    return lang === 'fr' ? 'Non renseigné' : 'Not provided';
  }

  return services.join(', ');
};

export const TruckParkingLayer: React.FC<TruckParkingLayerProps> = memo((
  { country, enabled, zoom, selectedItemId, onSelectItem }
) => {
  const { osmData, ensureOsmLayerLoaded, lang } = useApp();
  const code = COUNTRY_CODE[country];

  useEffect(() => {
    if (enabled) void ensureOsmLayerLoaded('truckParkings', [country]);
  }, [country, enabled, ensureOsmLayerLoaded]);

  const features = useMemo(() => osmData.truckParkings[code] || [], [code, osmData.truckParkings]);
  const loading = osmData.loading.truckParkings[code];
  const error = osmData.errors.truckParkings[code];

  const handleSelect = useCallback((id: string) => onSelectItem(id, 'truck_parking'), [onSelectItem]);
  const showTooltip = zoom >= 11;

  if (!enabled || loading || error || features.length === 0) return null;
  if (zoom < 10) return null;

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
                <div className="font-bold">{formatTagValue(feature.name, lang)}</div>
                <div className="text-xs text-brand-muted">{country} · Parking PL</div>
              </Tooltip>
            )}
          </Marker>
        );
      })}
    </>
  );
});
TruckParkingLayer.displayName = 'TruckParkingLayer';
