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
  const { osmData, ensureOsmLayerLoaded, filters } = useApp();
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

  // Sort by memberCount descending — top 15 by default, all if showAllAxes
  const sortedFeatures = [...features].sort((a, b) => b.memberCount - a.memberCount);
  const displayFeatures = filters.showAllAxes ? sortedFeatures.slice(0, 50) : sortedFeatures.slice(0, 15);

  return (
    <>
      {displayFeatures.map((feature) => {
        const selected = selectedItemId === feature.id;

        return (
          <Polyline
            key={feature.id}
            positions={feature.coordinates}
            pathOptions={{
              color: AXIS_COLOR,
              weight: selected ? 3.5 : 1.5,
              opacity: selected ? 0.85 : 0.25,
              dashArray: '10 7',
              lineCap: 'round',
              lineJoin: 'round',
            }}
            eventHandlers={{
              click: () => onSelectItem(feature.id, 'axis'),
              mouseover: (e) => {
                if (!selected) e.target.setStyle({ weight: 4, opacity: 0.8 });
              },
              mouseout: (e) => {
                if (!selected) e.target.setStyle({ weight: 1.5, opacity: 0.25 });
              }
            }}
          >
            <Tooltip sticky className="rounded-xl border-none px-3 py-2 text-sm shadow-lg">
              <div className="font-bold">Analyse axe {feature.axisKey || feature.ref || 'N/A'}</div>
              <div className="text-xs text-brand-muted">{feature.memberCount} segments OSM regroupés</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-brand-turquoise">
                Donnée analytique — regroupement par ref/int_ref
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
