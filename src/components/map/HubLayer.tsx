import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Hub, Language, SelectedItemType } from '../../types';
import { hubsData } from '../../data/hubs';

interface HubLayerProps {
  lang: Language;
  filters: {
    showHubs: boolean;
    countries: string[];
    hubTypes: string[];
  };
  selectedItemId: string | null;
  onSelectItem: (id: string | null, type: SelectedItemType | null) => void;
  getHubIcon: (type: Hub['type'], isSelected: boolean) => L.DivIcon;
  t: (key: any) => string;
}

export const HubLayer: React.FC<HubLayerProps> = memo(({
  lang,
  filters,
  selectedItemId,
  onSelectItem,
  getHubIcon,
  t
}) => {
  const map = useMap();
  const [bounds, setBounds] = useState<L.LatLngBounds>(map.getBounds());

  useMapEvents({
    moveend: () => setBounds(map.getBounds()),
    zoomend: () => setBounds(map.getBounds())
  });

  const filteredHubs = useMemo(() => {
    if (!filters.showHubs) return [];
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    return hubsData.filter(h =>
      filters.countries.includes(h.country) &&
      filters.hubTypes.includes(h.type) &&
      h.coordinates[0] >= sw.lat && h.coordinates[0] <= ne.lat &&
      h.coordinates[1] >= sw.lng && h.coordinates[1] <= ne.lng
    );
  }, [filters, bounds]);

  return (
    <>
      {filteredHubs.map(hub => {
        const isSelected = selectedItemId === hub.id;
        return (
          <Marker
            key={hub.id}
            position={hub.coordinates}
            icon={getHubIcon(hub.type, isSelected)}
            eventHandlers={{ click: () => onSelectItem(hub.id, 'hub') }}
          >
            <Tooltip offset={[0, -20]} className="border-none shadow-lg rounded-xl px-3 py-2 text-sm">
              <div className="font-bold">{hub.name}</div>
              <div className="text-xs text-brand-muted">{t(hub.type)}</div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
});

HubLayer.displayName = 'HubLayer';
