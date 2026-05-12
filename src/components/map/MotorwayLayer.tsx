import React, { useEffect, useMemo } from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import { Country, OsmCountryCode } from '../../types';
import { useApp } from '../../context/AppContext';

interface MotorwayLayerProps {
  country: Country;
  enabled: boolean;
  zoom: number;
  selectedItemId: string | null;
  onSelectItem: (id: string | null, type: 'motorway' | null) => void;
}

const COUNTRY_COLORS: Record<Country, string> = {
  France: '#2563EB',
  Belgium: '#F59E0B',
  Netherlands: '#06B6D4',
};

const COUNTRY_CODE: Record<Country, OsmCountryCode> = {
  France: 'fr',
  Belgium: 'be',
  Netherlands: 'nl',
};

export const MotorwayLayer: React.FC<MotorwayLayerProps> = ({
  country,
  enabled,
  zoom,
  selectedItemId,
  onSelectItem,
}) => {
  const { osmData, ensureOsmLayerLoaded } = useApp();
  const code = COUNTRY_CODE[country];

  useEffect(() => {
    if (enabled && zoom >= 10) {
      void ensureOsmLayerLoaded('motorways', [country]);
    }
  }, [country, enabled, ensureOsmLayerLoaded, zoom]);

  const features = useMemo(() => osmData.motorways[code] || [], [code, osmData.motorways]);
  const loading = osmData.loading.motorways[code];
  const error = osmData.errors.motorways[code];
  const totalMotorways = osmData.stats.totalMotorways;
  const motorwayLoading = Object.values(osmData.loading.motorways).some(Boolean);

  if (!enabled || zoom < 10 || loading || error) {
    return null;
  }

  if (features.length === 0) {
    if (!motorwayLoading && totalMotorways === 0) {
      return (
        <div className="pointer-events-none absolute left-4 top-4 z-[1000] rounded-xl border border-brand-border bg-white/90 px-4 py-3 text-xs font-semibold text-brand-muted shadow-lg backdrop-blur-sm">
          Données chargées mais aucune géométrie exploitable
        </div>
      );
    }

    return null;
  }

  return (
    <>
      {features.map((feature) => {
        const isSelected = selectedItemId === feature.id;
        const label = feature.ref || feature.intRef || 'Donnée non renseignée';
        const positions = Array.isArray(feature.geometry)
          ? feature.geometry.map((point) => [point.lat, point.lon] as [number, number])
          : feature.coordinates;

        return (
          <Polyline
            key={feature.id}
            positions={positions}
            pathOptions={{
              color: COUNTRY_COLORS[country],
              weight: isSelected ? 6 : 4,
              opacity: isSelected ? 1 : 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }}
            eventHandlers={{
              click: () => onSelectItem(feature.id, 'motorway'),
            }}
          >
            <Tooltip sticky className="rounded-xl border-none px-3 py-2 text-sm shadow-lg">
              <div className="font-bold">{label}</div>
              <div className="text-xs text-brand-muted">{feature.name || 'Donnée non renseignée'}</div>
              <div className="mt-1 text-xs text-brand-text">Pays: {country}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-brand-blue">
                Source : OpenStreetMap
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-brand-blue">
                Type : Donnée réelle
              </div>
            </Tooltip>
          </Polyline>
        );
      })}
    </>
  );
};
