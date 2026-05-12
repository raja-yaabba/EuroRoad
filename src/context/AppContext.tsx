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
  stats: OsmStats;
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
  if (typeof element.lat === 'number' && typeof element.lon === 'number') {
    return [element.lat, element.lon];
  }

  if (element.center && typeof element.center.lat === 'number' && typeof element.center.lon === 'number') {
    return [element.center.lat, element.center.lon];
  }

  if (Array.isArray(element.geometry) && element.geometry.length > 0) {
    const centroid = element.geometry.reduce(
      (accumulator, point) => [accumulator[0] + point.lat, accumulator[1] + point.lon] as [number, number],
      [0, 0]
    );
    return [centroid[0] / element.geometry.length, centroid[1] / element.geometry.length];
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

  console.log(`${code.toUpperCase()} : ${waysWithGeometry.length} ways with geometry`);

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
  stats: {
    totalMotorways: 0,
    totalTolls: 0,
    totalParkings: 0,
    totalAxes: 0,
    countriesCovered: 0,
    loaded: false,
  },
});

const countLoadedEntries = <T,>(layer: OsmCountryMap<T[]>) =>
  Object.values(layer).reduce((total, entries) => total + (entries?.length || 0), 0);

const computeStats = (osmData: RealDataStats): OsmStats => {
  const countriesCovered = (['fr', 'be', 'nl'] as OsmCountryCode[]).filter((code) =>
    [osmData.motorways, osmData.tolls, osmData.truckParkings, osmData.axes].some(
      (layer) => (layer[code]?.length || 0) > 0
    )
  ).length;

  return {
    totalMotorways: countLoadedEntries(osmData.motorways),
    totalTolls: countLoadedEntries(osmData.tolls),
    totalParkings: countLoadedEntries(osmData.truckParkings),
    totalAxes: countLoadedEntries(osmData.axes),
    countriesCovered,
    loaded: [osmData.motorways, osmData.tolls, osmData.truckParkings, osmData.axes].some((layer) =>
      Object.values(layer).some((entries) => entries !== null)
    ),
  };
};

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
    showTolls: false,
    showTruckParkings: false,
    showAxes: false,
  });
  const inFlightLoads = useRef(new Set<string>());

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

      return {
        ...nextState,
        stats: computeStats(nextState),
      };
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
      stats: computeStats(current),
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
      stats: computeStats(current),
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

  const ensureOsmLayerLoaded = async (
    layer: OsmLayerKey,
    countries: Country[]
  ) => {
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
    const motorwaysByCountry: Partial<Record<OsmCountryCode, number>> = {};

    await Promise.all(
      requestedCountries.map(async (country) => {
        const code = COUNTRY_CODES[country];

        try {
          const timestamp = new Date().toISOString();

          if (layer === 'motorways') {
            const filePath = COUNTRY_FILES[code].motorways;
            const elements = await getOverpassElements(filePath);
            const features = buildMotorwayFeatures(elements, country, code, timestamp);
            console.log(`✅ ${code.toUpperCase()} motorways: ${features.length}`);
            motorwaysByCountry[code] = features.length;
            setLayerData('motorways', code, features);
            return features;
          }

          if (layer === 'tolls') {
            const filePath = COUNTRY_FILES[code].tolls;
            const elements = await getOverpassElements(filePath);
            const features = buildPointFeatures(elements, country, 'toll', timestamp);
            setLayerData('tolls', code, features);
            return features;
          }

          if (layer === 'truckParkings') {
            const filePath = COUNTRY_FILES[code].truckParkings;
            const elements = await getOverpassElements(filePath);
            const features = buildPointFeatures(elements, country, 'truck_parking', timestamp);
            setLayerData('truckParkings', code, features);
            return features;
          }

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

    if (layer === 'motorways') {
      const waysFR = motorwaysByCountry.fr || 0;
      const waysBE = motorwaysByCountry.be || 0;
      const waysNL = motorwaysByCountry.nl || 0;
      const total = waysFR + waysBE + waysNL;
      console.log('✅ FR motorways:', waysFR);
      console.log('✅ BE motorways:', waysBE);
      console.log('✅ NL motorways:', waysNL);
      console.log('✅ TOTAL:', total);
      console.log('🔵 FR stored:', waysFR);
      console.log('🟠 BE stored:', waysBE);
      console.log('🟢 NL stored:', waysNL);
      console.log('📊 TOTAL stored:', total);
    }

    requestedCountries.forEach((country) => setLayerLoading(layer, COUNTRY_CODES[country], false));
    inFlightLoads.current.delete(loadKey);
  };

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