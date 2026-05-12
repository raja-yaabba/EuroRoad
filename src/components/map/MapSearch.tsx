import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, X, Navigation2, Route, ParkingSquare, Euro, TrendingUp, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SelectedItemType } from '../../types';
import { hubsData } from '../../data/hubs';
import { useTranslation } from '../../utils/i18n';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  type: SelectedItemType;
  dataType: 'real' | 'calculated';
  country: string;
  // For a single point (hub, toll, parking) — [lat, lng]
  coordinates: [number, number] | null;
  // For a line / multi-segment feature — computed bounds
  bounds: [[number, number], [number, number]] | null;
  aliases?: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const normalize = (s?: string) => (s ?? '').toLowerCase().trim();
const matches = (q: string, ...fields: (string | undefined)[]) =>
  fields.some(f => normalize(f).includes(q));

/** Compute a LatLngBounds from an array of [lat, lng] coordinate pairs */
function computeBounds(coords: [number, number][]): [[number, number], [number, number]] | null {
  if (!coords.length) return null;
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const [lat, lng] of coords) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return [[minLat, minLng], [maxLat, maxLng]];
}

const TYPE_LABEL: Record<SelectedItemType, string> = {
  hub: 'Hub',
  motorway: 'Autoroute OSM',
  toll: 'Péage OSM',
  truck_parking: 'Parking PL',
  axis: 'Axe calculé',
};
const TYPE_ICON: Record<SelectedItemType, React.FC<{ className?: string }>> = {
  hub: Navigation2,
  motorway: Route,
  toll: Euro,
  truck_parking: ParkingSquare,
  axis: TrendingUp,
};
const TYPE_COLOR: Record<SelectedItemType, string> = {
  hub: 'text-brand-blue bg-brand-blue-light border-brand-blue/20',
  motorway: 'text-brand-turquoise bg-brand-turquoise-light border-brand-turquoise/20',
  toll: 'text-brand-orange bg-brand-orange-light border-brand-orange/20',
  truck_parking: 'text-brand-green bg-brand-green-light border-brand-green/20',
  axis: 'text-brand-purple bg-brand-purple-light border-brand-purple/20',
};

// ── MapPanner — inner Leaflet component (must live inside MapContainer) ───────

interface PanCommand {
  seq: number;            // monotonically increasing — changing seq re-triggers the effect
  coordinates: [number, number] | null;
  bounds: [[number, number], [number, number]] | null;
}

const MapPanner: React.FC<{ command: PanCommand | null }> = ({ command }) => {
  const map = useMap();

  useEffect(() => {
    if (!command) return;

    if (command.bounds) {
      const b = command.bounds;
      // Ensure the bounds have some area (not a single point)
      const latDiff = Math.abs(b[1][0] - b[0][0]);
      const lngDiff = Math.abs(b[1][1] - b[0][1]);
      if (latDiff > 0.001 || lngDiff > 0.001) {
        map.fitBounds(b as L.LatLngBoundsExpression, { padding: [60, 60], animate: true, maxZoom: 14 });
        return;
      }
    }

    if (command.coordinates) {
      map.flyTo(command.coordinates, 13, { animate: true, duration: 0.8 });
    }
  }, [command?.seq]); // eslint-disable-line react-hooks/exhaustive-deps — only re-run when seq changes

  return null;
};

// ── Main Search Component ─────────────────────────────────────────────────────

interface MapSearchProps {
  onSelectResult: (id: string, type: SelectedItemType) => void;
}

export const MapSearch: React.FC<MapSearchProps> = ({ onSelectResult }) => {
  const { osmData, lang } = useApp();
  const { t } = useTranslation(lang);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [panCommand, setPanCommand] = useState<PanCommand | null>(null);
  const seqRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Debounce ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Build flat search index (memoised, rebuilt only when data changes) ─────
  const searchIndex = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = [];

    // Hubs — single point coordinates
    hubsData.forEach(hub => {
      results.push({
        id: hub.id,
        label: hub.name,
        sublabel: `${t(hub.type as any)} · ${t(hub.country.toLowerCase() as any)}`,
        type: 'hub',
        dataType: 'real',
        country: hub.country,
        coordinates: hub.coordinates,   // [lat, lng]
        bounds: null,
        aliases: hub.aliases,
      });
    });

    // Axes — compute full bounds from all coordinates
    const seenAxes = new Set<string>();
    (['fr', 'be', 'nl'] as const).forEach(code => {
      const country = code === 'fr' ? 'France' : code === 'be' ? 'Belgium' : 'Netherlands';
      (osmData.axes[code] || []).forEach(axis => {
        const key = axis.axisKey || axis.ref || axis.id;
        if (seenAxes.has(key)) return;
        seenAxes.add(key);
        const coords = axis.coordinates ?? [];
        const bounds = computeBounds(coords);
        const firstCoord = coords[0] ?? null;
        results.push({
          id: axis.id,
          label: axis.axisKey || axis.ref || 'Axe N/A',
          sublabel: `${axis.memberCount ?? '?'} segments · ${t(country.toLowerCase() as any)}`,
          type: 'axis',
          dataType: 'calculated',
          country,
          coordinates: firstCoord,
          bounds,
        });
      });
    });

    // Motorways — group all segments by ref and compute combined bounds
    const motorwayMap = new Map<string, { result: SearchResult; allCoords: [number, number][] }>();
    (['fr', 'be', 'nl'] as const).forEach(code => {
      const country = code === 'fr' ? 'France' : code === 'be' ? 'Belgium' : 'Netherlands';
      (osmData.motorways[code] || []).forEach(way => {
        const key = way.ref || way.intRef;
        if (!key) return;
        const coords = way.coordinates ?? [];
        if (!motorwayMap.has(key)) {
          motorwayMap.set(key, {
            result: {
              id: way.id,
              label: key,
              sublabel: `${way.name ? way.name + ' · ' : ''}${t('motorway' as any)} · ${t(country.toLowerCase() as any)}`,
              type: 'motorway',
              dataType: 'real',
              country,
              coordinates: coords[0] ?? null,
              bounds: null,         // will be set after all segments collected
            },
            allCoords: [...coords],
          });
        } else {
          // Accumulate coordinates from all segments with the same ref
          motorwayMap.get(key)!.allCoords.push(...coords);
        }
      });
    });
    motorwayMap.forEach(({ result, allCoords }) => {
      result.bounds = computeBounds(allCoords);
      results.push(result);
    });

    // Tolls — single point
    (['fr', 'be', 'nl'] as const).forEach(code => {
      const country = code === 'fr' ? 'France' : code === 'be' ? 'Belgium' : 'Netherlands';
      (osmData.tolls[code] || []).forEach(toll => {
        const label = toll.name || toll.ref || toll.tags?.ref || `Péage ${toll.id.slice(-5)}`;
        results.push({
          id: toll.id,
          label,
          sublabel: `${t('toll' as any)} · ${t(country.toLowerCase() as any)}`,
          type: 'toll',
          dataType: 'real',
          country,
          coordinates: toll.coordinates,
          bounds: null,
        });
      });
    });

    // Truck Parkings — single point
    (['fr', 'be', 'nl'] as const).forEach(code => {
      const country = code === 'fr' ? 'France' : code === 'be' ? 'Belgium' : 'Netherlands';
      (osmData.truckParkings[code] || []).forEach(parking => {
        const label = parking.name || parking.tags?.ref || `Parking PL ${parking.id.slice(-5)}`;
        results.push({
          id: parking.id,
          label,
          sublabel: `${t('truck_parking' as any)} · ${t(country.toLowerCase() as any)}`,
          type: 'truck_parking',
          dataType: 'real',
          country,
          coordinates: parking.coordinates,
          bounds: null,
        });
      });
    });

    return results;
  }, [osmData]);

  // ── Filter by debounced query ──────────────────────────────────────────────
  const results = useMemo<SearchResult[]>(() => {
    const q = normalize(debouncedQuery);
    if (q.length < 2) return [];
    return searchIndex
      .filter(r => {
        const fieldMatch = matches(q, r.label, r.sublabel, r.country);
        const aliasMatch = r.aliases?.some(a => normalize(a).includes(q));
        return fieldMatch || aliasMatch;
      })
      .slice(0, 10);
  }, [debouncedQuery, searchIndex]);

  // ── Select handler ─────────────────────────────────────────────────────────
  const handleSelect = useCallback((result: SearchResult) => {
    // Increment seq so MapPanner's useEffect always fires, even for re-selecting the same item
    const seq = ++seqRef.current;
    setPanCommand({ seq, coordinates: result.coordinates, bounds: result.bounds });
    onSelectResult(result.id, result.type);
    setIsOpen(false);
    setQuery('');
    setDebouncedQuery('');
  }, [onSelectResult]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };
  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const showResults = isOpen && debouncedQuery.trim().length >= 2;

  return (
    <>
      {/* MapPanner must be inside MapContainer — this component is rendered inside MapExplorer's MapContainer */}
      <MapPanner command={panCommand} />

      {/* Search UI — floats above Leaflet */}
      <div
        ref={containerRef}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-[1002] w-full max-w-sm px-4"
      >
        {/* Input bar */}
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-brand-border shadow-lg px-4 py-2.5 transition-shadow focus-within:shadow-xl focus-within:border-brand-blue/40">
          <Search className="w-4 h-4 text-brand-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => debouncedQuery.trim().length >= 2 && setIsOpen(true)}
            placeholder="Rechercher : A1, E40, Rotterdam…"
            className="flex-1 text-sm font-semibold text-brand-text bg-transparent outline-none placeholder:text-brand-muted/50"
          />
          {query && (
            <button onClick={handleClear} className="text-brand-muted hover:text-brand-text transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results dropdown */}
        {showResults && (
          <div className="mt-2 bg-white rounded-2xl border border-brand-border shadow-2xl overflow-hidden">
            {results.length === 0 ? (
              <div className="px-5 py-4 text-xs text-brand-muted italic text-center">
                Aucun résultat dans les données chargées.
              </div>
            ) : (
              <ul className="divide-y divide-brand-border/40 max-h-80 overflow-auto">
                {results.map(result => {
                  const Icon = TYPE_ICON[result.type];
                  return (
                    <li key={result.id}>
                      <button
                        onClick={() => handleSelect(result)}
                        className="w-full text-left px-4 py-3 hover:bg-brand-bg transition-colors flex items-center gap-3"
                      >
                        <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center border ${TYPE_COLOR[result.type]}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-brand-text truncate">{result.label}</span>
                            {result.dataType === 'calculated' ? (
                              <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-brand-blue bg-brand-blue-light px-1.5 py-0.5 rounded-full border border-brand-blue/20">
                                Calculé
                              </span>
                            ) : (
                              <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-brand-green bg-brand-green-light px-1.5 py-0.5 rounded-full border border-brand-green/20">
                                OSM
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-brand-muted truncate">{result.sublabel}</div>
                        </div>
                        <span className="text-[10px] font-bold text-brand-muted shrink-0 hidden sm:block">
                          {TYPE_LABEL[result.type]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="px-4 py-3 border-t border-brand-border/40 bg-brand-bg/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-brand-muted/50 font-bold uppercase tracking-widest">
                  {results.length} résultat{results.length !== 1 ? 's' : ''} · données locales
                </span>
                <MapPin className="w-3 h-3 text-brand-muted/30" />
              </div>
              <p className="text-[8px] text-brand-muted/60 leading-tight italic">
                {lang === 'fr' 
                  ? "Les noms OSM sont conservés en forme source. Recherche en FR/EN/NL supportée."
                  : "OSM names kept in source form. FR/EN/NL search supported."}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
