import { Country, OsmAxisFeature, OsmLineFeature, OsmPointFeature } from '../types';

/**
 * Fix Mojibake: UTF-8 string that was incorrectly decoded as Latin-1.
 * e.g. "CarolorÃ©gienne" → "Carolorégienne"
 * Strategy: re-encode each char as Latin-1 byte, then decode the byte
 * sequence as UTF-8.
 */
export const fixMojibake = (s: string): string => {
  try {
    // Convert each character to its Latin-1 byte value
    const bytes = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) {
      bytes[i] = s.charCodeAt(i) & 0xff;
    }
    // Re-interpret those bytes as UTF-8
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    // Only use the decoded version if it's visually different (avoids double-fixing ASCII)
    return decoded !== s && decoded.length <= s.length ? decoded : s;
  } catch {
    return s;
  }
};

export const fixTagValues = (tags: Record<string, string>): Record<string, string> => {
  const fixed: Record<string, string> = {};
  for (const [k, v] of Object.entries(tags)) {
    fixed[k] = typeof v === 'string' ? fixMojibake(v) : v;
  }
  return fixed;
};

export interface OsmRawNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

export interface OsmRawWay {
  type: 'way';
  id: number;
  tags?: Record<string, string>;
  nodes?: number[];
  geometry?: Array<{ lat: number; lon: number }>;
  center?: { lat: number; lon: number };
}

export interface OsmRawRelation {
  type: 'relation';
  id: number;
  tags?: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>;
  center?: { lat: number; lon: number };
}

export interface OsmRawData {
  version?: number;
  generator?: string;
  osm3s?: {
    timestamp_osm_base?: string;
  };
  elements: Array<OsmRawNode | OsmRawWay | OsmRawRelation>;
}

const RELEVANT_TAGS = [
  'name',
  'ref',
  'int_ref',
  'nat_ref',
  'highway',
  'toll',
  'amenity',
  'parking',
  'hgv',
  'opening_hours',
  'service',
  'services',
  'barrier',
  'operator',
  'operator:ref',
  'highway:ref',
  'country',
  'network',
] as const;

const DEFAULT_TIMESTAMP = new Date().toISOString();

const pickRelevantTags = (tags?: Record<string, string>) => {
  if (!tags) return {} as Record<string, string>;

  // Apply mojibake fix to all tag values (corrects UTF-8 mis-decoded as Latin-1)
  const fixedTags = fixTagValues(tags);

  return Object.fromEntries(
    Object.entries(fixedTags).filter(([key]) => RELEVANT_TAGS.includes(key as (typeof RELEVANT_TAGS)[number]))
  ) as Record<string, string>;
};

const getTimestamp = (rawData: OsmRawData) => rawData.osm3s?.timestamp_osm_base || DEFAULT_TIMESTAMP;

const toCoordinates = (geometry?: Array<{ lat: number; lon: number }>): [number, number][] => {
  if (!geometry?.length) {
    return [];
  }

  return geometry.map((point) => [point.lat, point.lon] as [number, number]);
};

const toPointCoordinate = (lat?: number, lon?: number): [number, number] | null => {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return null;
  }

  return [lat, lon];
};

const distanceToSegment = (
  point: [number, number],
  start: [number, number],
  end: [number, number]
) => {
  const [px, py] = point;
  const [sx, sy] = start;
  const [ex, ey] = end;
  const dx = ex - sx;
  const dy = ey - sy;

  if (dx === 0 && dy === 0) {
    return Math.hypot(px - sx, py - sy);
  }

  const t = Math.max(0, Math.min(1, ((px - sx) * dx + (py - sy) * dy) / (dx * dx + dy * dy)));
  const closestX = sx + t * dx;
  const closestY = sy + t * dy;
  return Math.hypot(px - closestX, py - closestY);
};

const simplifyDouglasPeucker = (points: [number, number][], tolerance = 0.0004): [number, number][] => {
  if (points.length <= 2) {
    return points;
  }

  let maxDistance = 0;
  let index = 0;

  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = distanceToSegment(points[i], points[0], points[points.length - 1]);
    if (distance > maxDistance) {
      index = i;
      maxDistance = distance;
    }
  }

  if (maxDistance <= tolerance) {
    return [points[0], points[points.length - 1]];
  }

  const left = simplifyDouglasPeucker(points.slice(0, index + 1), tolerance);
  const right = simplifyDouglasPeucker(points.slice(index), tolerance);

  return [...left.slice(0, -1), ...right];
};

const normalizeRouteKey = (tags: Record<string, string>) => {
  const key = tags.ref || tags.int_ref;
  return key?.trim() || null;
};

const buildSourceUrl = (kind: string, osmId: number) => `https://www.openstreetmap.org/${kind}/${osmId}`;

const formatFeature = <T extends OsmLineFeature | OsmPointFeature>(
  base: Omit<T, 'source' | 'sourceUrl' | 'lastUpdated' | 'tags' | 'name' | 'ref' | 'intRef' | 'highway' | 'toll' | 'amenity' | 'parking' | 'hgv' | 'openingHours'> & {
    osmId: number;
    country: Country;
    sourceUrl: string;
    lastUpdated: string;
    dataType: 'real' | 'calculated' | 'unavailable';
  },
  tags: Record<string, string>
): T => ({
  ...base,
  source: 'OpenStreetMap' as const,
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
} as unknown as T);

export const parseMotorwayWays = (rawData: OsmRawData, country: Country): OsmLineFeature[] => {
  const timestamp = getTimestamp(rawData);

  return rawData.elements
    .filter((element): element is OsmRawWay => element.type === 'way')
    .filter((way) => typeof way.tags?.highway === 'string' && way.tags.highway.includes('motorway'))
    .map((way) => {
      const coordinates = simplifyDouglasPeucker(toCoordinates(way.geometry));
      if (coordinates.length < 2) {
        return null;
      }

      const tags = pickRelevantTags(way.tags);
      return formatFeature<OsmLineFeature>(
        {
          id: `${country}-motorway-${way.id}`,
          kind: 'motorway',
          osmId: way.id,
          country,
          coordinates,
          dataType: 'real',
          sourceUrl: buildSourceUrl('way', way.id),
          lastUpdated: timestamp,
        },
        tags
      );
    })
    .filter((feature): feature is OsmLineFeature => Boolean(feature));
};

export const parseTollPoints = (rawData: OsmRawData, country: Country): OsmPointFeature[] => {
  const timestamp = getTimestamp(rawData);

  return rawData.elements
    .map((element) => {
      const tags = pickRelevantTags(element.tags);
      const isTollBooth = tags.barrier === 'toll_booth' || tags.toll === 'yes' || tags.toll === 'booth';

      if (!isTollBooth) {
        return null;
      }

      if (element.type === 'node') {
        const coordinates = toPointCoordinate(element.lat, element.lon);
        if (!coordinates) {
          console.warn(`[OSM] toll ignored (missing coordinates): ${country} #${element.id}`);
          return null;
        }

        return formatFeature<OsmPointFeature>(
          {
            id: `${country}-toll-${element.id}`,
            kind: 'toll',
            osmId: element.id,
            country,
            coordinates,
            dataType: 'real',
            sourceUrl: buildSourceUrl('node', element.id),
            lastUpdated: timestamp,
          },
          tags
        );
      }

      if (element.type === 'way' && element.geometry?.length) {
        const coordinates = element.center
          ? toPointCoordinate(element.center.lat, element.center.lon)
          : null;
        if (!coordinates) {
          console.warn(`[OSM] toll ignored (missing coordinates): ${country} way #${element.id}`);
          return null;
        }

        return formatFeature<OsmPointFeature>(
          {
            id: `${country}-toll-${element.id}`,
            kind: 'toll',
            osmId: element.id,
            country,
            coordinates,
            dataType: 'real',
            sourceUrl: buildSourceUrl('way', element.id),
            lastUpdated: timestamp,
          },
          tags
        );
      }

      return null;
    })
    .filter((feature): feature is OsmPointFeature => Boolean(feature));
};

export const parseTruckParkingPoints = (rawData: OsmRawData, country: Country): OsmPointFeature[] => {
  const timestamp = getTimestamp(rawData);

  return rawData.elements
    .map((element) => {
      const tags = pickRelevantTags(element.tags);
      const isParking = tags.amenity === 'parking' && (Boolean(tags.hgv) || Boolean(tags.parking));

      if (!isParking) {
        return null;
      }

      if (element.type === 'node') {
        const coordinates = toPointCoordinate(element.lat, element.lon);
        if (!coordinates) {
          console.warn(`[OSM] parking ignored (missing coordinates): ${country} #${element.id}`);
          return null;
        }

        return formatFeature<OsmPointFeature>(
          {
            id: `${country}-parking-${element.id}`,
            kind: 'truck_parking',
            osmId: element.id,
            country,
            coordinates,
            dataType: 'real',
            sourceUrl: buildSourceUrl('node', element.id),
            lastUpdated: timestamp,
          },
          tags
        );
      }

      const coordinates = element.center
        ? toPointCoordinate(element.center.lat, element.center.lon)
        : null;
      if (!coordinates) {
        console.warn(`[OSM] parking ignored (missing coordinates): ${country} ${element.type} #${element.id}`);
        return null;
      }

      return formatFeature<OsmPointFeature>(
        {
          id: `${country}-parking-${element.id}`,
          kind: 'truck_parking',
          osmId: element.id,
          country,
          coordinates,
          dataType: 'real',
          sourceUrl: buildSourceUrl(element.type, element.id),
          lastUpdated: timestamp,
        },
        tags
      );
    })
    .filter((feature): feature is OsmPointFeature => Boolean(feature));
};

export const buildRealCorridors = (motorways: OsmLineFeature[], country: Country): OsmAxisFeature[] => {
  const grouped = new Map<string, OsmLineFeature[]>();

  motorways.forEach((feature) => {
    const routeKey = normalizeRouteKey(feature.tags);
    if (!routeKey) {
      return;
    }

    const key = `${country}:${routeKey}`;
    const current = grouped.get(key) || [];
    current.push(feature);
    grouped.set(key, current);
  });

  return Array.from(grouped.entries()).map(([key, features]) => {
    const coordinates = features.flatMap((feature) => feature.coordinates);
    const simplified = simplifyDouglasPeucker(coordinates);
    const representative = features.find((feature) => feature.ref || feature.intRef) || features[0];
    const axisKey = representative.ref || representative.intRef || key.split(':').slice(1).join(':');

    const baseAxis = formatFeature<OsmLineFeature>(
      {
        id: `axis-${key.replace(/[^a-zA-Z0-9]+/g, '-')}`,
        kind: 'motorway',
        osmId: representative.osmId,
        country,
        coordinates: simplified.length >= 2 ? simplified : coordinates,
        dataType: 'calculated',
        sourceUrl: representative.sourceUrl,
        lastUpdated: representative.lastUpdated,
      },
      representative.tags
    );

    return {
      ...baseAxis,
      kind: 'axis' as const,
      coordinates: simplified.length >= 2 ? simplified : coordinates,
      axisKey,
      memberCount: features.length,
    } as OsmAxisFeature;
  });
};
