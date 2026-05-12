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
      width:${selected ? 30 : 24}px;
      height:${selected ? 30 : 24}px;
      border-radius:9999px;
      background:${selected ? '#F97316' : '#FDBA74'};
      border:2px solid #ffffff;
      box-shadow:0 6px 18px rgba(0,0,0,0.18);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#ffffff;
      font-size:${selected ? 14 : 12}px;
      font-weight:800;
    ">€</div>`,
    iconSize: [selected ? 30 : 24, selected ? 30 : 24],
    iconAnchor: [selected ? 15 : 12, selected ? 15 : 12],
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
    if (enabled && zoom >= 10) {
      void ensureOsmLayerLoaded('tolls', [country]);
    }
  }, [country, enabled, ensureOsmLayerLoaded, zoom]);

  const features = useMemo(() => osmData.tolls[code] || [], [code, osmData.tolls]);
  const loading = osmData.loading.tolls[code];
  const error = osmData.errors.tolls[code];

  if (!enabled || zoom < 10 || loading || error || features.length === 0) {
    return null;
  }

  return (
    <>
      {features.map((feature) => {
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
                <div className="text-xs uppercase tracking-wide text-brand-muted">toll_booth</div>
                <div className="text-xs text-brand-text">
                  <span className="font-semibold">Pays:</span> {country}
                </div>
                <div className="text-xs text-brand-text">
                  <span className="font-semibold">OpenStreetMap:</span> Donnée réelle
                </div>
                <div className="space-y-1 border-t border-brand-border pt-2">
                  <div className="text-xs text-brand-text"><span className="font-semibold">ref:</span> {formatTagValue(feature.ref)}</div>
                  <div className="text-xs text-brand-text"><span className="font-semibold">int_ref:</span> {formatTagValue(feature.intRef)}</div>
                  <div className="text-xs text-brand-text"><span className="font-semibold">barrier:</span> {formatTagValue(feature.tags.barrier)}</div>
                  <div className="text-xs text-brand-text"><span className="font-semibold">operator:</span> {formatTagValue(feature.tags.operator)}</div>
                  <div className="text-xs text-brand-text"><span className="font-semibold">highway:ref:</span> {formatTagValue(feature.tags['highway:ref'])}</div>
                </div>
                <div className="text-[10px] text-brand-muted">{lang === 'fr' ? 'Donnée non renseignée' : 'Data not available'}</div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
