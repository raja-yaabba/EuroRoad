import { Hub, HubScore, OsmData } from '../types';

export const normalizeRef = (ref: string): string[] => {
  if (!ref) return [];
  // Split by semicolon first (common in OSM for shared segments)
  const parts = ref.split(';');
  return parts.map(p => p.replace(/\s+/g, '').toUpperCase().trim()).filter(Boolean);
};

export const calculateHubScore = (hub: Hub): HubScore => {
  let base = 30;
  let highwaysPoints = Math.min(hub.connectedHighways.length * 5, 25);
  let portPoints = hub.hasPortAccess ? 20 : 0;
  let borderPoints = hub.isBorderHub ? 10 : 0;
  
  let strategicPoints = 0;
  if (hub.strategicLevel === 'international') strategicPoints = 15;
  if (hub.strategicLevel === 'national') strategicPoints = 10;
  if (hub.strategicLevel === 'regional') strategicPoints = 5;

  let totalScore = Math.min(100, base + highwaysPoints + portPoints + borderPoints + strategicPoints);

  return {
    hubId: hub.id,
    score: totalScore,
    breakdown: {
      base,
      highways: highwaysPoints,
      portAccess: portPoints,
      border: borderPoints,
      strategic: strategicPoints
    }
  };
};

export const getAggregatedStats = (hubs: Hub[]) => {
  // Hubs par pays
  const hubsByCountry = {
    France: hubs.filter(h => h.country === 'France').length,
    Belgium: hubs.filter(h => h.country === 'Belgium').length,
    Netherlands: hubs.filter(h => h.country === 'Netherlands').length,
  };

  // Hubs par type
  const hubsByType = hubs.reduce((acc, hub) => {
    acc[hub.type] = (acc[hub.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Nombre de ports
  const portsCount = hubs.filter(h => h.type === 'seaport').length;

  // Couverture des données
  const dataCoverage = {
    real: hubs.filter(h => h.dataType === 'real').length,
    calculated: hubs.length,
    unavailable: hubs.filter(h => h.dataType === 'unavailable').length,
  };

  // Taux de couverture (pourcentage de données réelles)
  const totalDataPoints = hubs.length;
  const realDataPoints = dataCoverage.real;
  const coverageRate = totalDataPoints > 0 ? Math.round((realDataPoints / totalDataPoints) * 100) : 0;
  const realDataRate = hubs.length > 0 ? Math.round((dataCoverage.real / hubs.length) * 100) : 0;

  // Score moyen
  const avgScore = hubs.length > 0 
    ? Math.round(hubs.reduce((sum, h) => sum + calculateHubScore(h).score, 0) / hubs.length)
    : 0;

  // Sources utilisées (compilation unique)
  const allData = [...hubs];
  const sources = {
    osm: allData.filter(d => {
      const source = d.dataSource?.toLowerCase() ?? '';
      return source.includes('openstreetmap') || source.includes('osm');
    }).length,
    eurostat: allData.filter(d => (d.dataSource?.toLowerCase() ?? '').includes('eurostat')).length,
    ports: allData.filter(d => (d.dataSource?.toLowerCase() ?? '').includes('port')).length,
  };

  // Top hubs par connectivité
  const topHubsByConnectivity = [...hubs]
    .sort((a, b) => b.connectedHighways.length - a.connectedHighways.length)
    .slice(0, 5)
    .map(h => ({ name: h.name, connectivity: h.connectedHighways.length }));

  return {
    hubsByCountry,
    hubsByType,
    dataCoverage,
    coverageRate,
    realDataRate,
    avgScore,
    totalHubs: hubs.length,
    portsCount,
    sources,
    topHubsByConnectivity,
  };
};

export const computeGlobalStats = (hubs: Hub[], osmData: OsmData) => {
  const getLayerStats = (layer: keyof OsmData) => {
    const dataMap = osmData[layer] as Record<string, any[] | null>;
    const loadingMap = osmData.loading?.[layer as keyof typeof osmData.loading] as Record<string, boolean> | undefined;
    
    let total = 0;
    let isAnyLoading = false;
    let isAnyNull = false;
    
    (['fr', 'be', 'nl'] as const).forEach(code => {
      if (loadingMap?.[code]) isAnyLoading = true;
      if (dataMap[code] === null) isAnyNull = true;
      total += (dataMap[code]?.length || 0);
    });

    return {
      total,
      isLoading: isAnyLoading,
      isIdle: isAnyNull && !isAnyLoading
    };
  };

  const motorwayStats = getLayerStats('motorways');
  const tollStats = getLayerStats('tolls');
  const parkingStats = getLayerStats('truckParkings');
  const axisStats = getLayerStats('axes');

  const osmElements = motorwayStats.total + tollStats.total + parkingStats.total;

  const uniqueAxes = new Set<string>();
  (['fr', 'be', 'nl'] as const).forEach(country => {
    (osmData.motorways[country] || []).forEach(way => {
      const refs = normalizeRef(way.ref || way.intRef || '');
      refs.forEach(ref => uniqueAxes.add(`${country}:${ref}`));
    });
  });
  const totalAxes = uniqueAxes.size;

  const totalRealDocumented = osmElements + hubs.filter(h => h.dataType === 'real').length;

  return {
    osmElements,
    totalMotorways: motorwayStats.total,
    totalTolls: tollStats.total,
    totalParkings: parkingStats.total,
    totalAxes,
    totalHubs: hubs.length,
    totalRealDocumented,
    countriesCount: 3,
    states: {
      motorways: motorwayStats.isLoading ? 'loading' : (motorwayStats.isIdle ? 'idle' : 'loaded'),
      tolls: tollStats.isLoading ? 'loading' : (tollStats.isIdle ? 'idle' : 'loaded'),
      parkings: parkingStats.isLoading ? 'loading' : (parkingStats.isIdle ? 'idle' : 'loaded'),
      axes: axisStats.isLoading ? 'loading' : (axisStats.isIdle ? 'idle' : 'loaded'),
    }
  };
};