export type Language = 'fr' | 'en';

export type DataType = 'real' | 'calculated' | 'unavailable';
export type Reliability = 'high' | 'medium' | 'partial' | 'unavailable';

export type HubType = 'seaport' | 'urban_hub' | 'border_hub' | 'industrial_hub' | 'inland_hub';
export type StrategicLevel = 'regional' | 'national' | 'international';
export type Country = 'France' | 'Belgium' | 'Netherlands';

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

export interface FilterState {
  countries: Country[];
  hubTypes: HubType[];
  showHubs: boolean;
}
