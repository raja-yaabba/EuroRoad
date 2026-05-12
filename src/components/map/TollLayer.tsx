import React, { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
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

export const TollLayer: React.FC<TollLayerProps> = ({
  country,
  enabled,
  zoom,
  selectedItemId,
  onSelectItem,
}) => {
  const { osmData, ensureOsmLayerLoaded, lang } = useApp();
  const code = COUNTRY_CODE[country];

  useEffect(() => {
    if (enabled) {
      void ensureOsmLayerLoaded('tolls', [country]);
    }
  }, [country, enabled, ensureOsmLayerLoaded, zoom]);

  const features = useMemo(() => osmData.tolls[code] || [], [code, osmData.tolls]);
  const loading = osmData.loading.tolls[code];
  const error = osmData.errors.tolls[code];

  if (!enabled || loading || error || features.length === 0) {
    return null;
  }

  if (zoom < 9) {
    return null;
  }

  const limitedFeatures = features.slice(0, 300);

  return (
    <>
      {limitedFeatures.map((feature) => {
        const selected = selectedItemId === feature.id;

        return (
          <Marker
            key={feature.id}
            position={feature.coordinates}
            icon={createMarkerIcon(selected)}
            eventHandlers={{ click: () => onSelectItem(feature.id, 'toll') }}
          >
            <Popup className="osm-popup">
              <div className="space-y-2 text-sm">
                <div className="font-bold text-brand-text">{formatTagValue(feature.name)}</div>
                <div className="text-xs text-brand-text">
                  <span className="font-semibold">Pays:</span> {country}
                </div>
                <div className="text-xs text-brand-text">
                  <span className="font-semibold">Source:</span> OpenStreetMap
                </div>
                <div className="space-y-1 border-t border-brand-border pt-2">
                  <div className="text-xs text-brand-text"><span className="font-semibold">barrier:</span> {formatTagValue(feature.tags.barrier)}</div>
                  <div className="text-xs text-brand-text"><span className="font-semibold">highway:</span> {formatTagValue(feature.tags.highway)}</div>
                  <div className="text-xs text-brand-text"><span className="font-semibold">toll:</span> {formatTagValue(feature.tags.toll)}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
