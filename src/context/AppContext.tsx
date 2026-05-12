import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  Country,
  FilterState,
  Hub,
  Language,
  OsmAxisFeature,
  OsmCountryCode,
  OsmLineFeature,
  OsmPointFeature,
  OsmLayerErrorState,
  OsmLayerLoadState,
  OsmStats,
  SelectedItemType,
} from '../types';
import { hubsData } from '../data/hubs';
import { filterCompleteHubs } from '../services/dataLoader';
import { loadAxisLayer } from '../services/osmLoader.ts';

const COUNTRY_CODES: Record<Country, OsmCountryCode> = {
  France: 'fr',
  Belgium: 'be',
  Netherlands: 'nl',
};

type OsmCountryMap<T> = Record<OsmCountryCode, T | null>;
type OsmLayerKey = 'motorways' | 'tolls' | 'truckParkings' | 'axes';

interface OverpassElementBase {
  id: number;
  tags?: Record<string, string>;
}

interface OverpassWayElement extends OverpassElementBase {
  type: 'way';
  geometry: Array<{ lat: number; lon: number }>;
  center?: { lat: number; lon: number };
}

interface OverpassPointElement extends OverpassElementBase {
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  geometry?: Array<{ lat: number; lon: number }>;
  center?: { lat: number; lon: number };
}

interface RealDataStats {
  motorways: OsmCountryMap<OsmLineFeature[]>;
  tolls: OsmCountryMap<OsmPointFeature[]>;
  truckParkings: OsmCountryMap<OsmPointFeature[]>;
  axes: OsmCountryMap<OsmAxisFeature[]>;
  loading: OsmLayerLoadState;
  errors: OsmLayerErrorState;
}

const createCountryMap = <T,>(): OsmCountryMap<T[]> => ({
  fr: null,
  be: null,
  nl: null,
});

const COUNTRY_FILES: Record<
  OsmCountryCode,
  {
    motorways: string;
    tolls: string;
    truckParkings: string;
  }
> = {
  fr: {
    motorways: '/data/osm_motorways_fr.json',
    tolls: '/data/osm_tolls_fr.json',
    truckParkings: '/data/osm_truck_parking_fr.json',
  },
  be: {
    motorways: '/data/osm_motorways_be.json',
    tolls: '/data/osm_tolls_be.json',
    truckParkings: '/data/osm_truck_parking_be.json',
  },
  nl: {
    motorways: '/data/osm_motorways_nl.json',
    tolls: '/data/osm_tolls_nl.json',
    truckParkings: '/data/osm_truck_parking_nl.json',
  },
};

const getOverpassElements = async (filePath: string) => {
  const response = await fetch(filePath);

  if (!response.ok) {
    throw new Error(response.status === 404 ? `Fichier introuvable: ${filePath}` : `HTTP ${response.status}: ${filePath}`);
  }

  const data = await response.json();
  return Array.isArray(data.elements) ? (data.elements as Array<OverpassElementBase & { type: string }>) : [];
};

const buildSourceUrl = (type: 'node' | 'way' | 'relation', id: number) => `https://www.openstreetmap.org/${type}/${id}`;

const toCoordinates = (points: Array<{ lat: number; lon: number }>): [number, number][] =>
  points.map((point) => [point.lat, point.lon]);

const derivePointCoordinates = (element: OverpassPointElement): [number, number] | null => {
  if (element.type === 'node' && typeof element.lat === 'number' && typeof element.lon === 'number') {
    return [element.lat, element.lon];
  }

  if (element.type === 'way' && element.center && typeof element.center.lat === 'number' && typeof element.center.lon === 'number') {
    return [element.center.lat, element.center.lon];
  }

  return null;
};

const buildMotorwayFeatures = (
  elements: Array<OverpassElementBase & { type: string }>,
  country: Country,
  code: OsmCountryCode,
  timestamp: string
): OsmLineFeature[] => {
  const waysWithGeometry = elements.filter(
    (element): element is OverpassWayElement => element.type === 'way' && Array.isArray((element as OverpassWayElement).geometry)
  );

  return waysWithGeometry.map((way) => {
    const geometry = way.geometry;
    const coordinates = toCoordinates(geometry);

    return {
      id: `${code}-motorway-${way.id}`,
      kind: 'motorway',
      osmId: way.id,
      country,
      source: 'OpenStreetMap',
      dataType: 'real',
      sourceUrl: buildSourceUrl('way', way.id),
      lastUpdated: timestamp,
      tags: way.tags || {},
      name: way.tags?.name,
      ref: way.tags?.ref,
      intRef: way.tags?.int_ref,
      highway: way.tags?.highway,
      coordinates,
      geometry,
    } satisfies OsmLineFeature;
  });
};

const buildPointFeatures = (
  elements: Array<OverpassElementBase & { type: string }>,
  country: Country,
  kind: 'toll' | 'truck_parking',
  timestamp: string
): OsmPointFeature[] => {
  const features: OsmPointFeature[] = [];

  elements.forEach((element) => {
    const tags = element.tags || {};
    const coordinates = derivePointCoordinates(element as OverpassPointElement);

    if (!coordinates) {
      return;
    }

    const feature = {
      id: `${country}-${kind}-${element.id}`,
      kind,
      osmId: element.id,
      country,
      source: 'OpenStreetMap',
      dataType: 'real',
      sourceUrl: buildSourceUrl(element.type as 'node' | 'way' | 'relation', element.id),
      lastUpdated: timestamp,
      tags,
      name: tags.name,
      ref: tags.ref,
      intRef: tags.int_ref,
      highway: tags.highway,
      toll: tags.toll,
      amenity: tags.amenity,
      parking: tags.parking,
      hgv: tags.hgv,
      openingHours: tags.opening_hours,
      coordinates,
      lat: coordinates[0],
      lon: coordinates[1],
      center: { lat: coordinates[0], lon: coordinates[1] },
      geometry: Array.isArray((element as OverpassWayElement).geometry)
        ? (element as OverpassWayElement).geometry
        : undefined,
    } as OsmPointFeature;

    features.push(feature);
  });

  return features;
};

const createEmptyOsmData = (): RealDataStats => ({
  motorways: createCountryMap<OsmLineFeature>(),
  tolls: createCountryMap<OsmPointFeature>(),
  truckParkings: createCountryMap<OsmPointFeature>(),
  axes: createCountryMap<OsmAxisFeature>(),
  loading: {
    motorways: { fr: false, be: false, nl: false },
    tolls: { fr: false, be: false, nl: false },
    truckParkings: { fr: false, be: false, nl: false },
    axes: { fr: false, be: false, nl: false },
  },
  errors: {
    motorways: { fr: null, be: null, nl: null },
    tolls: { fr: null, be: null, nl: null },
    truckParkings: { fr: null, be: null, nl: null },
    axes: { fr: null, be: null, nl: null },
  },
});



interface AppContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  hubs: Hub[];
  osmData: RealDataStats;
  loading: boolean;
  error: string | null;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  selectedItemType: SelectedItemType | null;
  setSelectedItemType: (type: SelectedItemType | null) => void;
  fetchRealData: () => Promise<void>;
  ensureOsmLayerLoaded: (layer: OsmLayerKey, countries: Country[]) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('fr');
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [osmData, setOsmData] = useState<RealDataStats>(createEmptyOsmData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<SelectedItemType | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    countries: ['France', 'Belgium', 'Netherlands'],
    hubTypes: ['seaport', 'urban_hub', 'border_hub', 'industrial_hub', 'inland_hub'],
    showHubs: true,
    showMotorways: true,
    showAllMotorways: false,
    showTolls: false,
    showTruckParkings: false,
    showAxes: true,
  });
  const inFlightLoads = useRef(new Set<string>());
  const isLoadingMotorwaysRef = useRef(false);
  const hasLoadedMotorwaysRef = useRef(false);
  const isLoadingTollsRef = useRef(false);
  const hasLoadedTollsRef = useRef(false);
  const isLoadingTruckParkingsRef = useRef(false);
  const hasLoadedTruckParkingsRef = useRef(false);

  const setLayerData = <T,>(layer: OsmLayerKey, country: OsmCountryCode, data: T[]) => {
    setOsmData((current) => {
      const nextLayer = {
        ...(current[layer] as OsmCountryMap<T[]>),
        [country]: data,
      };

      const nextState = {
        ...current,
        [layer]: nextLayer,
        loading: {
          ...current.loading,
          [layer]: {
            ...current.loading[layer],
            [country]: false,
          },
        },
        errors: {
          ...current.errors,
          [layer]: {
            ...current.errors[layer],
            [country]: null,
          },
        },
      };

      return nextState;
    });
  };

  const setLayerLoading = (layer: OsmLayerKey, country: OsmCountryCode, loadingValue: boolean) => {
    setOsmData((current) => ({
      ...current,
      loading: {
        ...current.loading,
        [layer]: {
          ...current.loading[layer],
          [country]: loadingValue,
        },
      },
    }));
  };

  const setLayerError = (layer: OsmLayerKey, country: OsmCountryCode, errorMessage: string | null) => {
    setOsmData((current) => ({
      ...current,
      errors: {
        ...current.errors,
        [layer]: {
          ...current.errors[layer],
          [country]: errorMessage,
        },
      },
    }));
  };

  const fetchRealData = async () => {
    setLoading(true);
    try {
      setOsmData(createEmptyOsmData());

      // Valider et charger les hubs depuis les données statiques vérifiées
      const { valid: validatedHubs, incomplete: incompleteHubs } = filterCompleteHubs(hubsData);
      
      if (incompleteHubs.length > 0) {
        console.warn(
          `⚠️  ${incompleteHubs.length} hub(s) ont des données manquantes:`,
          incompleteHubs.map(h => ({ id: h.id, name: h.name }))
        );
      }
      
      setHubs(validatedHubs);
      console.log(`✓ ${validatedHubs.length}/${hubsData.length} hubs chargés avec données complètes`);
    } catch (err) {
      console.error('Data loading error:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  useEffect(() => {
    fetchRealData();
  }, []);

  const loadLayer = async (
    layerKey: 'motorways' | 'tolls' | 'truckParkings',
    loadingRef: React.MutableRefObject<boolean>,
    hasLoadedRef: React.MutableRefObject<boolean>,
    kind?: 'toll' | 'truck_parking'
  ) => {
    if (loadingRef.current || hasLoadedRef.current) return;
    loadingRef.current = true;
    
    setOsmData(prev => ({
      ...prev,
      loading: { ...prev.loading, [layerKey]: { fr: true, be: true, nl: true } }
    }));

    const countries: Country[] = ['France', 'Belgium', 'Netherlands'];
    
    try {
      const results = await Promise.all(countries.map(async (country) => {
        const code = COUNTRY_CODES[country];
        try {
          const timestamp = new Date().toISOString();
          const filePath = COUNTRY_FILES[code][layerKey];
          const elements = await getOverpassElements(filePath);
          const features = layerKey === 'motorways'
            ? buildMotorwayFeatures(elements, country, code, timestamp)
            : buildPointFeatures(elements, country, kind!, timestamp);
          return { code, features };
        } catch (err) {
          console.warn(`Failed to load ${layerKey} for ${code}:`, err);
          return { code, error: true };
        }
      }));

      setOsmData(prev => {
        const nextLayer = { ...prev[layerKey] };
        let total = 0;
        results.forEach(res => {
          if (res.features) {
            nextLayer[res.code] = res.features as any;
          }
          total += (nextLayer[res.code]?.length || 0);
        });
        

        
        return {
          ...prev,
          [layerKey]: nextLayer,
          loading: { ...prev.loading, [layerKey]: { fr: false, be: false, nl: false } }
        };
      });
      hasLoadedRef.current = true;
    } finally {
      loadingRef.current = false;
    }
  };

  const loadMotorways = () => loadLayer('motorways', isLoadingMotorwaysRef, hasLoadedMotorwaysRef);
  const loadTolls = () => loadLayer('tolls', isLoadingTollsRef, hasLoadedTollsRef, 'toll');
  const loadTruckParkings = () => loadLayer('truckParkings', isLoadingTruckParkingsRef, hasLoadedTruckParkingsRef, 'truck_parking');

  const ensureOsmLayerLoaded = async (
    layer: OsmLayerKey,
    countries: Country[]
  ) => {
    if (layer === 'motorways') {
      void loadMotorways();
      return;
    }
    if (layer === 'tolls') {
      void loadTolls();
      return;
    }
    if (layer === 'truckParkings') {
      void loadTruckParkings();
      return;
    }
    const uniqueCountries = Array.from(new Set(countries));
    const requestedCountries = uniqueCountries.filter((country) => {
      const code = COUNTRY_CODES[country];
      const current = osmData[layer][code];
      const currentError = osmData.errors[layer][code];
      return current === null && !currentError;
    });

    if (requestedCountries.length === 0) {
      return;
    }

    const loadKey = `${layer}:${requestedCountries.join(',')}`;
    if (inFlightLoads.current.has(loadKey)) {
      return;
    }

    inFlightLoads.current.add(loadKey);
    requestedCountries.forEach((country) => setLayerLoading(layer, COUNTRY_CODES[country], true));
    const motorwaysByCountry: Partial<Record<OsmCountryCode, OsmLineFeature[]>> = {};

    await Promise.all(
      requestedCountries.map(async (country) => {
        const code = COUNTRY_CODES[country];

        try {
          const timestamp = new Date().toISOString();



          const result = await loadAxisLayer(country);
          setLayerData('axes', code, result.data);
          return result.data;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erreur de chargement OSM';
          setLayerData(layer, code, []);
          setLayerError(layer, code, message);
          console.warn(`Layer load failed for ${layer} ${code}:`, err);
          return null;
        }
      })
    );

    requestedCountries.forEach((country) => setLayerLoading(layer, COUNTRY_CODES[country], false));
    inFlightLoads.current.delete(loadKey);
  };

  useEffect(() => {
    void loadMotorways();
    void loadTolls();
    void loadTruckParkings();
  }, []);

  const hasLoggedTotal = useRef(false);
  useEffect(() => {
    if (
      hasLoadedMotorwaysRef.current &&
      hasLoadedTollsRef.current &&
      hasLoadedTruckParkingsRef.current &&
      !hasLoggedTotal.current
    ) {
      const totalMotorways = (osmData.motorways.fr?.length || 0) + (osmData.motorways.be?.length || 0) + (osmData.motorways.nl?.length || 0);
      const totalTolls = (osmData.tolls.fr?.length || 0) + (osmData.tolls.be?.length || 0) + (osmData.tolls.nl?.length || 0);
      const totalParkings = (osmData.truckParkings.fr?.length || 0) + (osmData.truckParkings.be?.length || 0) + (osmData.truckParkings.nl?.length || 0);
      const totalElements = totalMotorways + totalTolls + totalParkings;
      
      const uniqueAxes = new Set<string>();
      (['fr', 'be', 'nl'] as const).forEach(country => {
        (osmData.motorways[country] || []).forEach(way => {
          const ref = way.ref || way.intRef;
          if (ref) uniqueAxes.add(`${country}:${ref.trim()}`);
        });
      });
      
      console.log("OSM data loaded:", totalElements, "elements,", uniqueAxes.size, "calculated axes");
      hasLoggedTotal.current = true;
    }
  }, [osmData]);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        filters,
        setFilters,
        hubs,
        osmData,
        loading,
        error,
        selectedItemId,
        setSelectedItemId,
        selectedItemType,
        setSelectedItemType,
        fetchRealData,
        ensureOsmLayerLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};