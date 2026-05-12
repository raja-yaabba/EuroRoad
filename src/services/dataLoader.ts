/**
 * Service de chargement des données réelles depuis OpenStreetMap
 * Tous les fichiers proviennent de /public/data/
 * Données extraites via Overpass API
 */

import { Hub } from '../types';

export interface OverpassNode {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

export interface OverpassWay {
  id: number;
  tags?: Record<string, string>;
  nodes?: number[];
  geometry?: Array<{ lat: number; lon: number }>;
}

export interface OverpassRelation {
  id: number;
  tags?: Record<string, string>;
  members?: Array<{ ref: number; role: string; type: string }>;
  geometry?: Array<{ lat: number; lon: number }>;
}

export interface OverpassData {
  elements: Array<OverpassNode | OverpassWay | OverpassRelation>;
}

export interface DataSource {
  type: 'motorways' | 'tolls' | 'truck_parking';
  country: 'France' | 'Belgium' | 'Netherlands';
  file: string;
  data: OverpassData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string;
}

const COUNTRIES = ['France', 'Belgium', 'Netherlands'] as const;
const DATA_TYPES = ['motorways', 'tolls', 'truck_parking'] as const;

/**
 * Valide qu'un hub a tous les champs requis pour être une donnée réelle
 */
export const validateHub = (hub: Hub): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  if (!hub.dataType) missing.push('dataType');
  if (!hub.dataSource) missing.push('dataSource');
  if (!hub.reliability) missing.push('reliability');
  if (hub.dataType === 'real' && !hub.sourceUrl) missing.push('sourceUrl');
  if (hub.dataType === 'real' && !hub.lastUpdated) missing.push('lastUpdated');

  return {
    valid: missing.length === 0,
    missing,
  };
};

/**
 * Filtre les hubs pour garder que ceux avec données complètes
 */
export const filterCompleteHubs = (hubs: Hub[]): { valid: Hub[]; incomplete: Hub[] } => {
  const valid: Hub[] = [];
  const incomplete: Hub[] = [];

  hubs.forEach((hub) => {
    const validation = validateHub(hub);
    if (validation.valid) {
      valid.push(hub);
    } else {
      incomplete.push(hub);
    }
  });

  return { valid, incomplete };
};

/**
 * Charge un fichier JSON OSM depuis /public/data
 */
export const loadOsmFile = async (
  type: 'motorways' | 'tolls' | 'truck_parking',
  country: 'France' | 'Belgium' | 'Netherlands'
): Promise<OverpassData> => {
  const countryCode = country === 'France' ? 'fr' : country === 'Belgium' ? 'be' : 'nl';
  const filename = `/data/osm_${type}_${countryCode}.json`;

  try {
    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${filename}`);
    }
    const data: OverpassData = await response.json();
    return data;
  } catch (err) {
    console.error(`Failed to load ${filename}:`, err);
    throw new Error(`Impossible de charger ${filename}`);
  }
};

/**
 * Charge tous les fichiers motorways pour tous les pays
 */
export const loadAllMotorways = async (): Promise<
  Record<'France' | 'Belgium' | 'Netherlands', OverpassData | null>
> => {
  const result = {
    France: null,
    Belgium: null,
    Netherlands: null,
  } as Record<'France' | 'Belgium' | 'Netherlands', OverpassData | null>;

  for (const country of COUNTRIES) {
    try {
      result[country] = await loadOsmFile('motorways', country);
    } catch (err) {
      console.warn(`Motorways ${country}: ${err}`);
    }
  }

  return result;
};

/**
 * Charge tous les fichiers péages pour tous les pays
 */
export const loadAllTolls = async (): Promise<
  Record<'France' | 'Belgium' | 'Netherlands', OverpassData | null>
> => {
  const result = {
    France: null,
    Belgium: null,
    Netherlands: null,
  } as Record<'France' | 'Belgium' | 'Netherlands', OverpassData | null>;

  for (const country of COUNTRIES) {
    try {
      result[country] = await loadOsmFile('tolls', country);
    } catch (err) {
      console.warn(`Tolls ${country}: ${err}`);
    }
  }

  return result;
};

/**
 * Charge tous les fichiers parkings poids lourds pour tous les pays
 */
export const loadAllTruckParkings = async (): Promise<
  Record<'France' | 'Belgium' | 'Netherlands', OverpassData | null>
> => {
  const result = {
    France: null,
    Belgium: null,
    Netherlands: null,
  } as Record<'France' | 'Belgium' | 'Netherlands', OverpassData | null>;

  for (const country of COUNTRIES) {
    try {
      result[country] = await loadOsmFile('truck_parking', country);
    } catch (err) {
      console.warn(`Truck parking ${country}: ${err}`);
    }
  }

  return result;
};

/**
 * Compte les éléments réels chargés depuis OSM
 */
export const countLoadedElements = (
  motorways: Record<string, OverpassData | null>,
  tolls: Record<string, OverpassData | null>,
  parkings: Record<string, OverpassData | null>
): {
  totalMotorways: number;
  totalTolls: number;
  totalParkings: number;
  countriesCovered: number;
} => {
  let totalMotorways = 0;
  let totalTolls = 0;
  let totalParkings = 0;
  let countriesCovered = 0;

  for (const country of COUNTRIES) {
    const hasData = motorways[country] || tolls[country] || parkings[country];
    if (hasData) countriesCovered++;

    if (motorways[country]) {
      totalMotorways += motorways[country]!.elements.length;
    }
    if (tolls[country]) {
      totalTolls += tolls[country]!.elements.length;
    }
    if (parkings[country]) {
      totalParkings += parkings[country]!.elements.length;
    }
  }

  return {
    totalMotorways,
    totalTolls,
    totalParkings,
    countriesCovered,
  };
};
