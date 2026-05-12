import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Hub, Language } from '../../types';
import { getAggregatedStats, computeGlobalStats } from '../../utils/calculations';
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
  const globalStats = useMemo(() => computeGlobalStats(hubs, osmData), [hubs, osmData]);

  const topAxes = useMemo(() => {
    const axisMap = new Map<string, { ref: string; countries: Set<string>; count: number }>();
    
    (['fr', 'be', 'nl'] as const).forEach(country => {
      const countryLabel = country === 'fr' ? t('france') : country === 'be' ? t('belgium') : t('netherlands');
      
      (osmData.motorways[country] || []).forEach(way => {
        const refs = (way.ref || way.intRef || '').split(';').map(r => r.replace(/\s+/g, '').toUpperCase().trim()).filter(Boolean);
        refs.forEach(ref => {
          if (!axisMap.has(ref)) axisMap.set(ref, { ref, countries: new Set(), count: 0 });
          const entry = axisMap.get(ref)!;
          entry.countries.add(countryLabel);
          entry.count += 1;
        });
      });
    });

    return [...axisMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [osmData.motorways]);

  const representativeHubs = useMemo(() => {
    const targets = ['Rotterdam', 'Antwerp', 'Amsterdam', 'Lille', 'Venlo'];
    const found = targets.map(name => hubs.find(h => h.name === name)).filter(Boolean) as Hub[];
    return found;
  }, [hubs]);

  const countryData = [
    { name: t('france'), value: stats.hubsByCountry.France, color: '#3B82F6' },
    { name: t('belgium'), value: stats.hubsByCountry.Belgium, color: '#8B5CF6' },
    { name: t('netherlands'), value: stats.hubsByCountry.Netherlands, color: '#D97706' },
  ];

  const typeData = Object.entries(stats.hubsByType).map(([key, value]) => ({
    name: t(key as any) || key,
    value,
    color: TYPE_COLORS[key] || COLORS[0],
  }));

  const reliabilityData = [
    { 
      name: 'Données réelles documentées', 
      value: globalStats.totalRealDocumented, 
      color: '#22C55E',
      description: '55 751 éléments OSM + 15 hubs documentés'
    },
    { 
      name: 'Données calculées OSM', 
      value: globalStats.totalAxes, 
      color: '#3B82F6',
      description: 'Axes dérivés des tags OSM ref / int_ref'
    },
    { 
      name: 'Éléments non exploitables', 
      value: hubs.filter(h => h.dataType === 'unavailable').length, 
      color: '#CBD5E1',
      description: 'Hors champs OSM ponctuellement non renseignés.'
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
              { label: 'Éléments OSM exploités', value: globalStats.osmElements.toLocaleString('fr-FR') },
              { label: 'Hubs documentés', value: globalStats.totalHubs },
              { label: 'Axes calculés', value: globalStats.totalAxes },
              { label: 'Pays couverts', value: globalStats.countriesCount },
            ].map((kpi, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm flex flex-col items-center text-center">
                <div className="text-2xl font-black text-brand-blue mb-1">{kpi.value}</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-brand-muted leading-tight">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Composition & Reliability Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Card OSM Composition */}
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-sm flex flex-col">
            <h3 className="text-lg font-extrabold text-brand-text mb-2">Composition OSM</h3>
            <p className="text-xs text-brand-muted mb-6">Répartition technique des {globalStats.osmElements.toLocaleString('fr-FR')} éléments exploités.</p>
            <div className="space-y-4 flex-1">
              {[
                { label: 'Segments autoroutiers', value: globalStats.totalMotorways, color: 'bg-brand-blue' },
                { label: 'Péages OSM', value: globalStats.totalTolls, color: 'bg-brand-orange' },
                { label: 'Parkings poids lourds', value: globalStats.totalParkings, color: 'bg-brand-green' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold text-brand-muted uppercase">{item.label}</span>
                    <span className="text-sm font-black text-brand-text">{item.value.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full`} 
                      style={{ width: `${(item.value / globalStats.osmElements) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-brand-muted mt-4 italic leading-tight">
                Les éléments OSM exploités proviennent des couches autoroutes, péages et parkings poids lourds.
              </p>
            </div>
          </div>

          {/* Card 2 — Typologie des hubs */}
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-sm flex flex-col">
            <h3 className="text-lg font-extrabold text-brand-text mb-2">Typologie des hubs</h3>
            <p className="text-xs text-brand-muted mb-6">Les ports et hubs frontaliers structurent la lecture logistique du périmètre.</p>
            <div className="flex-1 min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={70}
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
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-sm flex flex-col">
            <h3 className="text-lg font-extrabold text-brand-text mb-2">Fiabilité des données</h3>
            <p className="text-xs text-brand-muted mb-6">Les données réelles proviennent d'OpenStreetMap et des sources documentées. Les axes sont calculés à partir des tags OSM ref / int_ref.</p>
            <div className="flex-1 flex flex-col">
              <div className="flex-1 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reliabilityData}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {reliabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 gap-2 mt-4">
                {reliabilityData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-brand-bg/50 border border-brand-border/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-brand-muted uppercase leading-tight">{item.name}</span>
                        <span className="text-[8px] text-brand-muted/70 font-medium leading-tight">{item.description}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-brand-text">{item.value.toLocaleString('fr-FR')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hubs & Axes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Card Top Hubs */}
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-sm flex flex-col">
            <h3 className="text-lg font-extrabold text-brand-text mb-2">Top hubs logistiques</h3>
            <p className="text-xs text-brand-muted mb-6">Ces hubs structurent la lecture du réseau entre ports, frontières et distribution intérieure.</p>
            <div className="flex-1 overflow-auto">
              <div className="space-y-3">
                {representativeHubs.map((hub, idx) => (
                  <div key={idx} className="group p-3 rounded-2xl border border-brand-border hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-black text-brand-text text-sm">{hub.name}</div>
                      <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-brand-bg text-brand-muted border border-brand-border">
                        {t(hub.country.toLowerCase() as any)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-brand-muted font-medium">{t(hub.type as any)}</span>
                      <span className="text-brand-blue font-bold">Documenté · {hub.dataSource}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4 — Top axes calculés */}
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-sm flex flex-col">
            <h3 className="text-lg font-extrabold text-brand-text mb-2">Top axes OSM calculés</h3>
            <p className="text-xs text-brand-muted mb-4 leading-tight">Les références sont issues des tags OSM ref / int_ref. Certaines valeurs reflètent la structure contributive OpenStreetMap.</p>
            <div className="flex-1 space-y-3">
              {topAxes.map((axis, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-brand-bg/40 border border-brand-border/30 hover:border-brand-blue/30 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[11px] font-black text-brand-blue border border-brand-border group-hover:scale-110 transition-transform">
                      {axis.ref}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex gap-1 items-center">
                        {[...axis.countries].map(c => (
                          <span key={c} className="text-[9px] font-bold text-brand-muted px-1.5 py-0.5 rounded bg-white border border-brand-border/50">{c}</span>
                        ))}
                        <span className="ml-1 text-[8px] bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded font-black uppercase tracking-widest border border-brand-blue/20">OSM</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-brand-text">{axis.count} <span className="text-[10px] font-normal text-brand-muted uppercase">seg.</span></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-brand-muted mt-4 italic leading-tight border-t border-brand-border/30 pt-3">
              Note : Le total des axes calculés dépend de la normalisation des références OSM ref / int_ref.
            </p>
          </div>
        </div>

        {/* Connectivity Matrix Section */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 border border-brand-border shadow-sm mb-16 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-brand-text tracking-tight">Connectivité routière documentée des hubs</h3>
              <p className="text-sm text-brand-muted max-w-2xl leading-relaxed">
                Lecture de la connectivité routière des hubs documentés, à partir des autoroutes renseignées pour chaque point nodal. Cette connectivité ne mesure pas les volumes de flux, le trafic réel ou les coûts transport.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl text-[10px] font-black text-brand-blue uppercase tracking-widest">
              <Route className="w-3.5 h-3.5" />
              Focus Infrastructures
            </div>
          </div>

          <div className="overflow-x-auto -mx-8 md:mx-0">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-[10px] font-black text-brand-muted uppercase tracking-[0.15em]">
                  <th className="text-left py-4 px-4 md:px-6">Hub</th>
                  <th className="text-left py-4 px-4 md:px-6">Pays / Zone</th>
                  <th className="text-left py-4 px-4 md:px-6">Typologie</th>
                  <th className="text-left py-4 px-4 md:px-6">Autoroutes connectées</th>
                  <th className="text-center py-4 px-4 md:px-6">Connectivité</th>
                  <th className="text-right py-4 px-4 md:px-6">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {[...hubs]
                  .sort((a, b) => (b.connectedHighways?.length || 0) - (a.connectedHighways?.length || 0))
                  .slice(0, 10)
                  .map((hub, idx) => (
                    <tr key={idx} className="group hover:bg-brand-bg/40 transition-colors">
                      <td className="py-5 px-4 md:px-6 font-black text-brand-text text-sm">
                        {hub.name}
                      </td>
                      <td className="py-5 px-4 md:px-6">
                        <span className="text-[11px] font-bold text-brand-muted">{t(hub.country.toLowerCase() as any)}</span>
                      </td>
                      <td className="py-5 px-4 md:px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                          TYPE_COLORS[hub.type] ? `bg-white` : 'bg-brand-bg text-brand-muted border-brand-border'
                        }`} style={{ color: TYPE_COLORS[hub.type], borderColor: `${TYPE_COLORS[hub.type]}40` }}>
                          {t(hub.type as any)}
                        </span>
                      </td>
                      <td className="py-5 px-4 md:px-6">
                        <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                          {hub.connectedHighways && hub.connectedHighways.length > 0 ? (
                            hub.connectedHighways.map(ref => {
                              const isE = ref.startsWith('E');
                              return (
                                <span key={ref} className={`px-2 py-0.5 rounded text-[10px] font-black text-white shadow-sm border ${
                                  isE ? 'bg-brand-green border-brand-green/20' : 'bg-brand-blue border-brand-blue/20'
                                }`}>
                                  {ref}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[10px] text-brand-muted italic">Non renseigné</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-4 md:px-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-sm font-black text-brand-text">{hub.connectedHighways?.length || 0}</span>
                          <span className="text-[9px] font-bold text-brand-muted/60 uppercase">axes</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 md:px-6 text-right">
                        <span className="text-[10px] font-bold text-brand-blue bg-brand-blue-light px-2 py-1 rounded-lg border border-brand-blue/10">
                          {hub.dataSource}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 pt-6 border-t border-brand-border/40 text-[10px] text-brand-muted italic leading-relaxed">
            Note : La connectivité correspond au nombre d’axes autoroutiers renseignés dans les données du hub. Elle ne constitue pas un classement économique des plateformes logistiques.
          </div>
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
            <div className="text-[10px] text-brand-muted uppercase tracking-widest flex items-center gap-4 flex-wrap justify-center md:justify-start">
              <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Sources</span>
              <span>OpenStreetMap / Overpass API</span>
              <span>Ports officiels</span>
              <span className="text-brand-blue">Données OSM sous licence ODbL</span>
            </div>
          <p className="text-[10px] text-brand-muted font-medium italic">
            Aucun flux transporteur privé, coût, fréquence ou volume non sourcé n’est inventé.
          </p>
        </div>
      </div>
    </section>
  );
};
