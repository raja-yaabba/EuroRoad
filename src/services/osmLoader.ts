import { Country, OsmAxisFeature, OsmLineFeature, OsmPointFeature, OsmCountryCode } from '../types';
import {
  buildRealCorridors,
  OsmRawData,
  parseMotorwayWays,
  parseTollPoints,
  parseTruckParkingPoints,
} from './osmParser';

export type OsmLayerKind = 'motorways' | 'tolls' | 'truckParkings' | 'axes';

export interface LayerLoadResult<T> {
  country: Country;
  code: OsmCountryCode;
  url: string;
  status: number;
  totalElements: number;
  waysWithGeometry: number;
  extractedCount: number;
  data: T[];
}

const COUNTRY_CODES: Record<Country, OsmCountryCode> = {
  France: 'fr',
  Belgium: 'be',
  Netherlands: 'nl',
};

const rawCache = new Map<string, Promise<OsmRawData>>();
const motorwaysCache = new Map<string, Promise<LayerLoadResult<OsmLineFeature>>>();
const tollsCache = new Map<string, Promise<LayerLoadResult<OsmPointFeature>>>();
const parkingCache = new Map<string, Promise<LayerLoadResult<OsmPointFeature>>>();
const axesCache = new Map<string, Promise<LayerLoadResult<OsmAxisFeature>>>();

const cacheKey = (layer: OsmLayerKind, country: Country) => `${layer}:${country}`;

const buildFileUrl = (layer: Exclude<OsmLayerKind, 'axes'>, code: OsmCountryCode) =>
  `/data/osm_${layer === 'truckParkings' ? 'truck_parking' : layer}_${code}.json`;

const fetchOverpassJson = async (url: string): Promise<{ status: number; data: OsmRawData }> => {
  console.log(`[OSM] fetch ${url}`);
  const response = await fetch(url);
  console.log(`[OSM] ${url} -> ${response.status}`);

  if (!response.ok) {
    throw new Error(response.status === 404 ? `Fichier introuvable: ${url}` : `HTTP ${response.status}: ${url}`);
  }

  return {
    status: response.status,
    data: (await response.json()) as OsmRawData,
  };
};

const loadRaw = async (layer: Exclude<OsmLayerKind, 'axes'>, country: Country): Promise<OsmRawData> => {
  const key = cacheKey(layer, country);
  const existing = rawCache.get(key);
  if (existing) {
    return existing;
  }

  const url = buildFileUrl(layer, COUNTRY_CODES[country]);
  const promise = fetchOverpassJson(url)
    .then(({ data }) => data)
    .catch((error) => {
      rawCache.delete(key);
      throw error;
    });

  rawCache.set(key, promise);
  return promise;
};

const buildResult = <T>(args: {
  country: Country;
  code: OsmCountryCode;
  url: string;
  status: number;
  totalElements: number;
  waysWithGeometry: number;
  data: T[];
}): LayerLoadResult<T> => ({
  country: args.country,
  code: args.code,
  url: args.url,
  status: args.status,
  totalElements: args.totalElements,
  waysWithGeometry: args.waysWithGeometry,
  extractedCount: args.data.length,
  data: args.data,
});

export const loadMotorwayLayer = async (country: Country): Promise<LayerLoadResult<OsmLineFeature>> => {
  const key = cacheKey('motorways', country);
  const existing = motorwaysCache.get(key);
  if (existing) {
    return existing;
  }

  const code = COUNTRY_CODES[country];
  const url = buildFileUrl('motorways', code);
  const promise = loadRaw('motorways', country)
    .then((rawData) => {
      const waysWithGeometry = rawData.elements.filter(
        (element) => element.type === 'way' && Array.isArray((element as { geometry?: Array<{ lat: number; lon: number }> }).geometry) && (element as { geometry?: Array<{ lat: number; lon: number }> }).geometry!.length > 0
      ).length;
      const data = parseMotorwayWays(rawData, country);
      console.log(
        `${code.toUpperCase()} : ${rawData.elements.length} éléments totaux, ${waysWithGeometry} ways avec geometry, ${data.length} polylines affichées`
      );
      return buildResult<OsmLineFeature>({
        country,
        code,
        url,
        status: 200,
        totalElements: rawData.elements.length,
        waysWithGeometry,
        data,
      });
    })
    .catch((error) => {
      motorwaysCache.delete(key);
      throw error;
    });

  motorwaysCache.set(key, promise);
  return promise;
};

export const loadTollLayer = async (country: Country): Promise<LayerLoadResult<OsmPointFeature>> => {
  const key = cacheKey('tolls', country);
  const existing = tollsCache.get(key);
  if (existing) {
    return existing;
  }

  const code = COUNTRY_CODES[country];
  const url = buildFileUrl('tolls', code);
  const promise = loadRaw('tolls', country)
    .then((rawData) => {
      const data = parseTollPoints(rawData, country);
      console.log(
        `${code.toUpperCase()} : ${rawData.elements.length} éléments totaux, ${data.length} toll markers extraits`
      );
      return buildResult<OsmPointFeature>({
        country,
        code,
        url,
        status: 200,
        totalElements: rawData.elements.length,
        waysWithGeometry: rawData.elements.filter((element) => element.type === 'way' && Boolean((element as { center?: unknown }).center)).length,
        data,
      });
    })
    .catch((error) => {
      tollsCache.delete(key);
      throw error;
    });

  tollsCache.set(key, promise);
  return promise;
};

export const loadTruckParkingLayer = async (country: Country): Promise<LayerLoadResult<OsmPointFeature>> => {
  const key = cacheKey('truckParkings', country);
  const existing = parkingCache.get(key);
  if (existing) {
    return existing;
  }

  const code = COUNTRY_CODES[country];
  const url = buildFileUrl('truckParkings', code);
  const promise = loadRaw('truckParkings', country)
    .then((rawData) => {
      const data = parseTruckParkingPoints(rawData, country);
      console.log(
        `${code.toUpperCase()} : ${rawData.elements.length} éléments totaux, ${data.length} parking markers extraits`
      );
      return buildResult<OsmPointFeature>({
        country,
        code,
        url,
        status: 200,
        totalElements: rawData.elements.length,
        waysWithGeometry: rawData.elements.filter((element) => element.type === 'way' && Boolean((element as { center?: unknown }).center)).length,
        data,
      });
    })
    .catch((error) => {
      parkingCache.delete(key);
      throw error;
    });

  parkingCache.set(key, promise);
  return promise;
};

export const loadAxisLayer = async (country: Country): Promise<LayerLoadResult<OsmAxisFeature>> => {
  const key = cacheKey('axes', country);
  const existing = axesCache.get(key);
  if (existing) {
    return existing;
  }

  const code = COUNTRY_CODES[country];
  const url = buildFileUrl('motorways', code);
  const promise = loadMotorwayLayer(country)
    .then((motorwayResult) => {
      const data = buildRealCorridors(motorwayResult.data, country);
      console.log(
        `${code.toUpperCase()} : ${motorwayResult.totalElements} éléments totaux, ${motorwayResult.waysWithGeometry} ways avec geometry, ${data.length} axes OSM calculés`
      );
      return buildResult<OsmAxisFeature>({
        country,
        code,
        url,
        status: motorwayResult.status,
        totalElements: motorwayResult.totalElements,
        waysWithGeometry: motorwayResult.waysWithGeometry,
        data,
      });
    })
    .catch((error) => {
      axesCache.delete(key);
      throw error;
    });

  axesCache.set(key, promise);
  return promise;
};

export const clearOsmLoaderCache = () => {
  rawCache.clear();
  motorwaysCache.clear();
  tollsCache.clear();
  parkingCache.clear();
  axesCache.clear();
};
