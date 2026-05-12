import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Hub, Language } from '../../types';
import { getAggregatedStats } from '../../utils/calculations';
import { useTranslation } from '../../utils/i18n';
import { Map as MapIcon, MapPin, Truck, Route, Shield, BarChart3, Info, Anchor, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DataInsightsProps {
  hubs: Hub[];
  lang: Language;
}

const TYPE_COLORS: Record<string, string> = {
  seaport: '#22C55E',
  urban_hub: '#3B82F6',
  border_hub: '#8B5CF6',
  industrial_hub: '#D97706',
  inland_hub: '#0891B2',
};

const COLORS = ['#3B82F6', '#8B5CF6', '#D97706', '#22C55E', '#0891B2'];

export const DataInsights: React.FC<DataInsightsProps> = ({ hubs, lang }) => {
  const { t } = useTranslation(lang);
  const { osmData } = useApp();
  const stats = useMemo(() => getAggregatedStats(hubs), [hubs]);

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
  const totalAxes = uniqueAxes.size;

  const countriesCoveredCount = (['fr', 'be', 'nl'] as const).filter(country =>
    (osmData.motorways[country]?.length || 0) > 0 ||
    (osmData.tolls[country]?.length || 0) > 0 ||
    (osmData.truckParkings[country]?.length || 0) > 0
  ).length;

  const topAxes = useMemo(() => {
    const axisMap = new Map<string, { ref: string; countries: Set<string>; count: number }>();
    
    // Check axes first
    (['fr', 'be', 'nl'] as const).forEach(country => {
      const countryLabel = country === 'fr' ? 'FR' : country === 'be' ? 'BE' : 'NL';
      (osmData.axes[country] || []).forEach(axis => {
        const key = axis.axisKey || axis.ref || 'N/A';
        if (!axisMap.has(key)) axisMap.set(key, { ref: key, countries: new Set(), count: 0 });
        const entry = axisMap.get(key)!;
        entry.countries.add(countryLabel);
        entry.count += axis.memberCount || 1;
      });
    });

    // If no axes, try to derive from motorways
    if (axisMap.size === 0) {
      (['fr', 'be', 'nl'] as const).forEach(country => {
        const countryLabel = country === 'fr' ? 'FR' : country === 'be' ? 'BE' : 'NL';
        (osmData.motorways[country] || []).forEach(way => {
          const key = way.ref || way.intRef;
          if (key) {
            if (!axisMap.has(key)) axisMap.set(key, { ref: key, countries: new Set(), count: 0 });
            const entry = axisMap.get(key)!;
            entry.countries.add(countryLabel);
            entry.count += 1;
          }
        });
      });
    }

    return [...axisMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [osmData.axes, osmData.motorways]);

  const countryData = [
    { name: 'France', value: stats.hubsByCountry.France, color: '#3B82F6' },
    { name: 'Belgique', value: stats.hubsByCountry.Belgium, color: '#8B5CF6' },
    { name: 'Pays-Bas', value: stats.hubsByCountry.Netherlands, color: '#D97706' },
  ];

  const typeData = Object.entries(stats.hubsByType).map(([key, value]) => ({
    name: t(key as any) || key,
    value,
    color: TYPE_COLORS[key] || COLORS[0],
  }));

  const reliabilityData = [
    { 
      name: 'Données réelles', 
      value: totalElements + hubs.filter(h => h.dataType === 'real').length, 
      color: '#22C55E',
      description: 'OSM + ports officiels'
    },
    { 
      name: 'Données calculées', 
      value: totalAxes + hubs.filter(h => h.dataType === 'calculated').length, 
      color: '#3B82F6',
      description: 'Axes dérivés de OSM'
    },
    { 
      name: 'Indisponible', 
      value: hubs.filter(h => h.dataType === 'unavailable').length, 
      color: '#CBD5E1',
      description: 'Information manquante'
    },
  ];

  return (
    <section className="bg-white border-t border-brand-border py-12 md:py-16 shrink-0 z-10 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Title Section */}
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-2 tracking-tight">Lecture du réseau</h2>
          <p className="text-brand-muted max-w-2xl leading-relaxed">
            Une synthèse open data des hubs, axes routiers et infrastructures observables sur le périmètre France / Belgique / Pays-Bas.
          </p>
        </div>

        {/* Synthesis Banner */}
        <div className="bg-brand-bg/50 rounded-3xl border border-brand-border p-8 md:p-10 mb-12 flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-4">
            <p className="text-lg md:text-xl text-brand-text font-medium leading-relaxed italic opacity-90">
              “EuroRoad Atlas transforme des données OpenStreetMap brutes en une lecture cartographique des infrastructures logistiques : hubs, autoroutes, péages, parkings poids lourds et axes calculés.”
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 w-full md:w-auto shrink-0">
            {[
              { label: 'Éléments OSM exploités', value: totalElements.toLocaleString('fr-FR') },
              { label: 'Hubs documentés', value: hubs.length },
              { label: 'Axes calculés', value: totalAxes },
              { label: 'Pays couverts', value: countriesCoveredCount },
            ].map((kpi, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm flex flex-col items-center text-center">
                <div className="text-2xl font-black text-brand-blue mb-1">{kpi.value}</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-brand-muted leading-tight">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Card 1 — Répartition des hubs */}
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-sm flex flex-col min-h-[340px]">
            <h3 className="text-lg font-extrabold text-brand-text mb-2">Hubs par pays</h3>
            <p className="text-xs text-brand-muted mb-6">France, Belgique et Pays-Bas sont représentés pour comparer la couverture du réseau.</p>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={countryData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} width={80} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} maxBarSize={32}>
                    {countryData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2 — Typologie des hubs */}
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-sm flex flex-col min-h-[340px]">
            <h3 className="text-lg font-extrabold text-brand-text mb-2">Typologie des hubs</h3>
            <p className="text-xs text-brand-muted mb-6">Les ports et hubs frontaliers structurent la lecture logistique du périmètre.</p>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => <span className="text-[10px] font-medium text-brand-muted">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3 — Fiabilité des données */}
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-sm flex flex-col min-h-[340px]">
            <h3 className="text-lg font-extrabold text-brand-text mb-2">Fiabilité des données</h3>
            <p className="text-xs text-brand-muted mb-6">Les axes calculés sont dérivés des tags OSM ref / int_ref et ne représentent pas des corridors officiels.</p>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={reliabilityData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {reliabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => <span className="text-[10px] font-medium text-brand-muted">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        {/* Card 4 — Top axes OSM calculés */}
        {topAxes.length > 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-sm flex flex-col min-h-[340px]">
            <h3 className="text-lg font-extrabold text-brand-text mb-2">Top axes OSM calculés</h3>
            <p className="text-xs text-brand-muted mb-6">Classement basé sur le nombre de segments OSM regroupés par référence.</p>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted uppercase font-bold tracking-wider">
                    <th className="text-left pb-2 font-black">Axe</th>
                    <th className="text-left pb-2">Pays</th>
                    <th className="text-right pb-2">Segments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/50">
                  {topAxes.map((axis, idx) => (
                    <tr key={idx} className="group">
                      <td className="py-2.5 font-black text-brand-text flex items-center gap-2">
                        {axis.ref}
                        <span className="text-[8px] bg-brand-green-light text-brand-green px-1.5 py-0.5 rounded-full font-black uppercase">OSM</span>
                      </td>
                      <td className="py-2.5 text-brand-muted">{[...axis.countries].join(', ')}</td>
                      <td className="py-2.5 text-right font-black text-brand-blue">{axis.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-brand-bg rounded-3xl p-8 border border-brand-border flex flex-col items-center justify-center text-center">
            <Route className="w-12 h-12 text-brand-muted mb-4 opacity-20" />
            <p className="text-sm font-bold text-brand-muted">Aucun axe calculé disponible</p>
          </div>
        )}
        </div>

        {/* 3 Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-brand-bg rounded-2xl p-6 border-l-4 border-l-brand-blue">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-5 h-5 text-brand-blue" />
              <h4 className="font-extrabold text-brand-text">Densité Benelux</h4>
            </div>
            <p className="text-sm text-brand-text leading-relaxed opacity-80">
              Le Benelux concentre plusieurs hubs dans une zone géographique réduite, ce qui renforce son rôle de carrefour logistique européen.
            </p>
          </div>
          <div className="bg-brand-bg rounded-2xl p-6 border-l-4 border-l-brand-turquoise">
            <div className="flex items-center gap-3 mb-3">
              <Anchor className="w-5 h-5 text-brand-turquoise" />
              <h4 className="font-extrabold text-brand-text">Rôle des ports</h4>
            </div>
            <p className="text-sm text-brand-text leading-relaxed opacity-80">
              Les ports structurent l’accès maritime et l’intermodalité du réseau, reliant les flux terrestres aux grandes routes commerciales.
            </p>
          </div>
          <div className="bg-brand-bg rounded-2xl p-6 border-l-4 border-l-brand-orange">
            <div className="flex items-center gap-3 mb-3">
              <Info className="w-5 h-5 text-brand-orange" />
              <h4 className="font-extrabold text-brand-text">Lecture open data</h4>
            </div>
            <p className="text-sm text-brand-text leading-relaxed opacity-80">
              Les données affichées restent dépendantes de la qualité de contribution OpenStreetMap, favorisant une lecture collaborative.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-8 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="text-xs font-bold text-brand-muted uppercase tracking-widest flex items-center gap-4 flex-wrap justify-center md:justify-start">
            <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Sources</span>
            <span>OpenStreetMap / Overpass API</span>
            <span>Ports officiels</span>
            <span className="text-brand-blue">Licence ODbL</span>
          </div>
          <p className="text-[10px] text-brand-muted font-medium italic">
            Aucun flux transporteur privé, coût, fréquence ou volume non sourcé n’est inventé.
          </p>
        </div>
      </div>
    </section>
  );
};
