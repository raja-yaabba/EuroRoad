import { Hub, HubScore } from '../types';

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