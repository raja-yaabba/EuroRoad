import React, { useEffect, useMemo } from 'react';
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

export const RealCorridorLayer: React.FC<RealCorridorLayerProps> = ({
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
      void ensureOsmLayerLoaded('axes', [country]);
    }
  }, [country, enabled, ensureOsmLayerLoaded, zoom]);

  const features = useMemo(() => osmData.axes[code] || [], [code, osmData.axes]);
  const loading = osmData.loading.axes[code];
  const error = osmData.errors.axes[code];

  if (!enabled || zoom < 7 || loading || error || features.length === 0) {
    return null;
  }

  return (
    <>
      {features.map((feature) => {
        const selected = selectedItemId === feature.id;

        return (
          <Polyline
            key={feature.id}
            positions={feature.coordinates}
            pathOptions={{
              color: AXIS_COLOR,
              weight: selected ? 6 : 4,
              opacity: selected ? 1 : 0.8,
              dashArray: '8 6',
              lineCap: 'round',
              lineJoin: 'round',
            }}
            eventHandlers={{
              click: () => onSelectItem(feature.id, 'axis'),
            }}
          >
            <Tooltip sticky className="rounded-xl border-none px-3 py-2 text-sm shadow-lg">
              <div className="font-bold">Axe autoroutier OSM {feature.axisKey || feature.ref || 'Donnée non renseignée'}</div>
              <div className="text-xs text-brand-muted">{feature.memberCount} segments</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-brand-blue">
                Source OSM
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-brand-blue">
                Donnée calculée depuis OpenStreetMap — regroupement par ref/int_ref.
              </div>
            </Tooltip>
          </Polyline>
        );
      })}
    </>
  );
};
