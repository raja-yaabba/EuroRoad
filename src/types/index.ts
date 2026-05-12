export type Language = 'fr' | 'en';

export type DataType = 'real' | 'calculated' | 'unavailable';
export type Reliability = 'high' | 'medium' | 'partial' | 'unavailable';

export type HubType = 'seaport' | 'urban_hub' | 'border_hub' | 'industrial_hub' | 'inland_hub';
export type StrategicLevel = 'regional' | 'national' | 'international';
export type Country = 'France' | 'Belgium' | 'Netherlands';
export type OsmCountryCode = 'fr' | 'be' | 'nl';
export type OsmSelectionType = 'motorway' | 'toll' | 'truck_parking' | 'axis';
export type SelectedItemType = 'hub' | OsmSelectionType;

export interface Hub {
  id: string;
  name: string;
  country: Country;
  type: HubType;
  coordinates: [number, number]; // [lat, lng]
  connectedHighways: string[];
  logisticsRole: string;
  strategicReasoningFr: string;
  strategicReasoningEn: string;
  descriptionFr: string;
  descriptionEn: string;
  dataSource: string;
  dataType: DataType;
  sourceUrl?: string;
  lastUpdated: string;
  reliability: Reliability;
  documentationLevel: 'partial' | 'high';
  strategicLevel: StrategicLevel;
  hasPortAccess: boolean;
  isBorderHub: boolean;
}

export interface HubScore {
  hubId: string;
  score: number;
  breakdown: {
    base: number;
    highways: number;
    portAccess: number;
    border: number;
    strategic: number;
  };
}

export interface OsmStats {
  totalMotorways: number;
  totalTolls: number;
  totalParkings: number;
  totalAxes: number;
  countriesCovered: number;
  loaded: boolean;
}

export interface OsmBaseFeature {
  id: string;
  osmId: number;
  country: Country;
  source: 'OpenStreetMap';
  dataType: DataType;
  sourceUrl: string;
  lastUpdated: string;
  tags: Record<string, string>;
  name?: string;
  ref?: string;
  intRef?: string;
  highway?: string;
  toll?: string;
  amenity?: string;
  parking?: string;
  hgv?: string;
  openingHours?: string;
}

export interface OsmLineFeature extends OsmBaseFeature {
  kind: 'motorway' | 'axis';
  coordinates: [number, number][];
  geometry?: Array<{ lat: number; lon: number }>;
}

export interface OsmPointFeature extends OsmBaseFeature {
  kind: 'toll' | 'truck_parking';
  coordinates: [number, number];
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  geometry?: Array<{ lat: number; lon: number }>;
}

export interface OsmAxisFeature extends OsmLineFeature {
  kind: 'axis';
  axisKey: string;
  memberCount: number;
}

export interface FilterState {
  countries: Country[];
  hubTypes: HubType[];
  showHubs: boolean;
  showMotorways: boolean;
  showAllMotorways: boolean;
  showTolls: boolean;
  showTruckParkings: boolean;
  showAxes: boolean;
}

export interface OsmLayerLoadState {
  motorways: Record<OsmCountryCode, boolean>;
  tolls: Record<OsmCountryCode, boolean>;
  truckParkings: Record<OsmCountryCode, boolean>;
  axes: Record<OsmCountryCode, boolean>;
}

export interface OsmLayerErrorState {
  motorways: Record<OsmCountryCode, string | null>;
  tolls: Record<OsmCountryCode, string | null>;
  truckParkings: Record<OsmCountryCode, string | null>;
  axes: Record<OsmCountryCode, string | null>;
}
