import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Hub, Language, OsmStats } from '../../types';
import { getAggregatedStats } from '../../utils/calculations';
import { useTranslation } from '../../utils/i18n';
import { KpiCard } from './KpiCard';
import { Map, MapPin, Truck, Route, Database, BarChart2, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DataInsightsProps {
  hubs: Hub[];
  lang: Language;
  lang: Language;
}

const COLORS = ['#2563EB', '#22C55E', '#06B6D4', '#F59E0B', '#8B5CF6', '#FACC15'];

export const DataInsights: React.FC<DataInsightsProps> = ({ hubs, lang }) => {
  const { t } = useTranslation(lang);
  const { osmData } = useApp();
  const stats = useMemo(() => getAggregatedStats(hubs), [hubs]);

  const totalMotorways = (osmData.motorways.fr?.length || 0) + (osmData.motorways.be?.length || 0) + (osmData.motorways.nl?.length || 0);
  const totalTolls = (osmData.tolls.fr?.length || 0) + (osmData.tolls.be?.length || 0) + (osmData.tolls.nl?.length || 0);
  const totalParkings = (osmData.truckParkings.fr?.length || 0) + (osmData.truckParkings.be?.length || 0) + (osmData.truckParkings.nl?.length || 0);
  
  const uniqueAxes = new Set<string>();
  (['fr', 'be', 'nl'] as const).forEach(country => {
    (osmData.motorways[country] || []).forEach(way => {
      const ref = way.ref || way.intRef;
      if (ref) uniqueAxes.add(`${country}:${ref.trim()}`);
    });
  });
  const totalAxes = uniqueAxes.size;

  const countriesCovered = (['fr', 'be', 'nl'] as const).filter(country =>
    (osmData.motorways[country]?.length || 0) > 0 ||
    (osmData.tolls[country]?.length || 0) > 0 ||
    (osmData.truckParkings[country]?.length || 0) > 0
  ).length;

  const countryData = [
    { name: 'France', value: stats.hubsByCountry.France, color: '#2563EB' },
    { name: 'Belgium', value: stats.hubsByCountry.Belgium, color: '#06B6D4' },
    { name: 'Netherlands', value: stats.hubsByCountry.Netherlands, color: '#F59E0B' },
  ];

  const typeData = Object.entries(stats.hubsByType).map(([key, value]) => ({
    name: t(key as any) || key,
    value,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  }));

  const reliabilityData = [
    { name: 'Données réelles', value: stats.dataCoverage.real, color: '#22C55E' },
    { name: 'Données calculées', value: stats.dataCoverage.calculated, color: '#2563EB' },
    { name: 'Indisponible', value: stats.dataCoverage.unavailable, color: '#94A3B8' },
  ];

  const sourcesList = [
    { name: 'OpenStreetMap', count: stats.sources.osm, icon: '🗺️' },
    { name: 'Ports officiels', count: stats.sources.ports, icon: '⚓' },
  ];

  return (
    <div className="bg-white border-t border-brand-border p-6 md:p-8 shrink-0 z-10 relative shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-brand-turquoise to-brand-blue rounded-xl text-white shadow-md">
          <BarChart2 className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-extrabold text-brand-text">📊 {t('dataInsights')}</h2>
        <span className="text-xs text-brand-muted bg-brand-bg px-3 py-1 rounded-full">
          {lang === 'fr' ? 'Données open source' : 'Open data'}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <KpiCard 
          title={lang === 'fr' ? 'Autoroutes OSM' : 'OSM motorways'} 
          value={totalMotorways} 
          icon={Map} 
          colorClass="bg-brand-blue-light text-brand-blue" 
          subtitle={lang === 'fr' ? 'segments' : 'segments'}
        />
        <KpiCard 
          title={lang === 'fr' ? 'Péages OSM détectés' : 'Detected OSM tolls'} 
          value={totalTolls} 
          icon={MapPin} 
          colorClass="bg-brand-orange-light text-brand-orange" 
        />
        <KpiCard 
          title={lang === 'fr' ? 'Parkings PL détectés' : 'Detected truck parkings'} 
          value={totalParkings} 
          icon={Truck} 
          colorClass="bg-brand-turquoise-light text-brand-turquoise" 
        />
        <KpiCard 
          title={lang === 'fr' ? 'Axes OSM calculés' : 'Calculated OSM axes'} 
          value={totalAxes} 
          icon={Route} 
          colorClass="bg-brand-green-light text-brand-green" 
        />
        <KpiCard 
          title={lang === 'fr' ? 'Pays couverts' : 'Countries covered'} 
          value={countriesCovered} 
          icon={Database} 
          colorClass="bg-brand-yellow-light text-brand-orange" 
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hubs par pays */}
        <div className="bg-brand-bg rounded-2xl p-4 border border-brand-border">
          <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wide mb-4 text-center">
            🌍 {t('hubsByCountry')}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={countryData} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
              <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} width={60} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {countryData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Types de hubs */}
        <div className="bg-brand-bg rounded-2xl p-4 border border-brand-border">
          <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wide mb-4 text-center">
            🏭 {t('hubsByType')}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Fiabilité des données */}
        <div className="bg-brand-bg rounded-2xl p-4 border border-brand-border">
          <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wide mb-4 text-center">
            🛡️ Fiabilité des données
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={reliabilityData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
              >
                {reliabilityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" fontSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sources utilisées */}
      <div className="mt-6 pt-4 border-t border-brand-border">
        <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wide mb-3 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          Sources de données utilisées
        </h3>
        <div className="flex flex-wrap gap-3">
          {sourcesList.map(source => (
            <div key={source.name} className="flex items-center gap-2 bg-white border border-brand-border rounded-full px-3 py-1.5 shadow-sm">
              <span className="text-base">{source.icon}</span>
              <span className="text-xs font-medium text-brand-text">{source.name}</span>
              <span className="text-xs font-bold text-brand-blue bg-brand-blue-light px-2 py-0.5 rounded-full">{source.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
