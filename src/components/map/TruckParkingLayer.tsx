import React, { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
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
      width:${selected ? 30 : 24}px;
      height:${selected ? 30 : 24}px;
      border-radius:9999px;
      background:${selected ? '#14B8A6' : '#5EEAD4'};
      border:2px solid #ffffff;
      box-shadow:0 6px 18px rgba(0,0,0,0.18);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#ffffff;
      font-size:${selected ? 14 : 12}px;
      font-weight:800;
    ">P</div>`,
    iconSize: [selected ? 30 : 24, selected ? 30 : 24],
    iconAnchor: [selected ? 15 : 12, selected ? 15 : 12],
  });

const formatTagValue = (value?: string) => value || 'Donnée non renseignée';

const COUNTRY_CODE: Record<Country, OsmCountryCode> = {
  France: 'fr',
  Belgium: 'be',
  Netherlands: 'nl',
};

const getServicesText = (featureTags: Record<string, string>) => {
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
    return 'Donnée non renseignée';
  }

  return services.join(', ');
};

export const TruckParkingLayer: React.FC<TruckParkingLayerProps> = ({
  country,
  enabled,
  zoom,
  selectedItemId,
  onSelectItem,
}) => {
  const { osmData, ensureOsmLayerLoaded } = useApp();
  const code = COUNTRY_CODE[country];

  useEffect(() => {
    if (enabled) {
      void ensureOsmLayerLoaded('truckParkings', [country]);
    }
  }, [country, enabled, ensureOsmLayerLoaded, zoom]);

  const features = useMemo(() => osmData.truckParkings[code] || [], [code, osmData.truckParkings]);
  const loading = osmData.loading.truckParkings[code];
  const error = osmData.errors.truckParkings[code];

  if (!enabled || loading || error || features.length === 0) {
    return null;
  }

  if (zoom < 8) {
    return (
      <div className="pointer-events-none absolute left-4 bottom-14 z-[1000] rounded-xl border border-brand-border bg-white/90 px-4 py-3 text-xs font-semibold text-amber-600 shadow-lg backdrop-blur-sm">
        Zoomez pour afficher les parkings PL
      </div>
    );
  }

  const limitedFeatures = features.slice(0, 1500);

  return (
    <>
      {limitedFeatures.map((feature) => {
        const selected = selectedItemId === feature.id;

        return (
          <Marker
            key={feature.id}
            position={feature.coordinates}
            icon={createMarkerIcon(selected)}
            eventHandlers={{ click: () => onSelectItem(feature.id, 'truck_parking') }}
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
                  <div className="text-xs text-brand-text"><span className="font-semibold">hgv:</span> {formatTagValue(feature.hgv)}</div>
                  <div className="text-xs text-brand-text"><span className="font-semibold">parking:</span> {formatTagValue(feature.parking)}</div>
                  {feature.openingHours && (
                    <div className="text-xs text-brand-text"><span className="font-semibold">opening_hours:</span> {feature.openingHours}</div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
