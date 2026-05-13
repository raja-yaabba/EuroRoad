import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Hub, Language } from '../../types';
import { getAggregatedStats, computeGlobalStats } from '../../utils/calculations';
import { useTranslation } from '../../utils/i18n';
import { Map as MapIcon, MapPin, Truck, Route, Shield, BarChart3, Info, Anchor, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HubComparison } from './HubComparison';

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
  }, [osmData.motorways, lang]);

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
      name: t('realDocumentedData'), 
      value: globalStats.totalRealDocumented, 
      color: '#22C55E',
      description: lang === 'fr' ? '55 751 éléments OSM + 15 hubs documentés' : '55,751 OSM elements + 15 documented hubs'
    },
    { 
      name: t('calculatedOsmData'), 
      value: globalStats.totalAxes, 
      color: '#3B82F6',
      description: t('axesOsmNote')
    },
    { 
      name: t('nonUsableElements'), 
      value: hubs.filter(h => h.dataType === 'unavailable').length, 
      color: '#CBD5E1',
      description: t('unusableNote')
    },
  ];

  return (
    <section className="bg-white border-t border-brand-border py-12 md:py-16 shrink-0 z-10 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Title Section */}
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-2 tracking-tight">{t('networkReading')}</h2>
          <p className="text-brand-muted max-w-2xl leading-relaxed">
            {t('networkSubtitle')}
          </p>
        </div>

        {/* Synthesis Banner */}
        <div className="bg-brand-bg/50 rounded-3xl border border-brand-border p-8 md:p-10 mb-12 flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-4">
            <p className="text-lg md:text-xl text-brand-text font-medium leading-relaxed italic opacity-90">
              {t('atlasTransformQuote')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 w-full md:w-auto shrink-0">
            {[
              { label: t('osmElementsUsed'), value: globalStats.osmElements.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US') },
              { label: t('documentedHubs'), value: globalStats.totalHubs },
              { label: t('calculatedAxes'), value: globalStats.totalAxes },
              { label: t('countriesCovered'), value: globalStats.countriesCount },
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
            <h3 className="text-lg font-extrabold text-brand-text mb-2">{t('osmComposition')}</h3>
            <p className="text-xs text-brand-muted mb-6">
              {t('osmCompositionSubtitle').replace('{count}', globalStats.osmElements.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US'))}
            </p>
            <div className="space-y-4 flex-1">
              {[
                { label: t('motorwaySegments'), value: globalStats.totalMotorways, color: 'bg-brand-blue' },
                { label: t('osmTolls'), value: globalStats.totalTolls, color: 'bg-brand-orange' },
                { label: t('hgvParkings'), value: globalStats.totalParkings, color: 'bg-brand-green' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold text-brand-muted uppercase">{item.label}</span>
                    <span className="text-sm font-black text-brand-text">{item.value.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}</span>
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
                {t('osmSourceNote')}
              </p>
            </div>
          </div>

          {/* Card 2 â€” Typologie des hubs */}
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-sm flex flex-col">
            <h3 className="text-lg font-extrabold text-brand-text mb-2">{t('hubTypology')}</h3>
            <p className="text-xs text-brand-muted mb-6">{t('hubTypologySubtitle')}</p>
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

          {/* Card 3 â€” FiabilitÃ© des donnÃ©es */}
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-sm flex flex-col">
            <h3 className="text-lg font-extrabold text-brand-text mb-2">{t('dataReliability')}</h3>
            <p className="text-xs text-brand-muted mb-6">{t('dataReliabilitySubtitle')}</p>
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
                    <span className="text-xs font-black text-brand-text">{item.value.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}</span>
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
            <h3 className="text-lg font-extrabold text-brand-text mb-2">{t('topLogisticsHubs')}</h3>
            <p className="text-xs text-brand-muted mb-6">{t('topHubsSubtitle')}</p>
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
                      <span className="text-brand-blue font-bold">{t('documented')} · {t(hub.dataSource as any)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4 â€” Top axes calculÃ©s */}
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-sm flex flex-col">
            <h3 className="text-lg font-extrabold text-brand-text mb-2">{t('topCalculatedAxes')}</h3>
            <p className="text-xs text-brand-muted mb-4 leading-tight">{t('topAxesSubtitle')}</p>
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
            <p className="text-[10px] text-brand-muted mt-4 italic leading-relaxed border-t border-brand-border/30 pt-3">
              {t('axesCalculationNote')}
            </p>
          </div>
        </div>

        {/* Connectivity Matrix Section */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 border border-brand-border shadow-sm mb-16 overflow-hidden">
          <div className="flex flex-col gap-4 mb-10">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-brand-text tracking-tight">{t('hubConnectivityTitle')}</h3>
                <p className="text-sm text-brand-muted max-w-2xl leading-relaxed">
                  {t('hubConnectivitySubtitle')}
                </p>
              </div>
            </div>

          {/* Interactive Hub Comparison */}
          <HubComparison lang={lang} />

          {/* Full table sub-section */}
          <div className="mt-12 pt-10 border-t border-brand-border/40">
            <h4 className="text-lg font-black text-brand-text tracking-tight mb-6">{t('hubFullTableTitle')}</h4>

          <div className="overflow-x-auto -mx-8 md:mx-0">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-[10px] font-black text-brand-muted uppercase tracking-[0.15em]">
                  <th className="text-left py-4 px-4 md:px-6">{t('colHub')}</th>
                  <th className="text-left py-4 px-4 md:px-6">{t('colCountry')}</th>
                  <th className="text-left py-4 px-4 md:px-6">{t('colTypology')}</th>
                  <th className="text-left py-4 px-4 md:px-6">{t('colConnectedMotorways')}</th>
                  <th className="text-center py-4 px-4 md:px-6">{t('colConnectivity')}</th>
                  <th className="text-right py-4 px-4 md:px-6">{t('colSource')}</th>
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
                            <span className="text-[10px] text-brand-muted italic">{t('notProvided')}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-4 md:px-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-sm font-black text-brand-text">{hub.connectedHighways?.length || 0}</span>
                          <span className="text-[9px] font-bold text-brand-muted/60 uppercase">{t('axes')}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 md:px-6 text-right">
                        <span className="text-[10px] font-bold text-brand-blue bg-brand-blue-light px-2 py-1 rounded-lg border border-brand-blue/10">
                          {t(hub.dataSource as any)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 pt-6 border-t border-brand-border/40 text-[10px] text-brand-muted italic leading-relaxed">
            {t('connectivityNote')}
          </div>
          </div>{/* end full table sub-section */}
        </div>

        {/* 3 Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-brand-bg rounded-2xl p-6 border-l-4 border-l-brand-blue">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-5 h-5 text-brand-blue" />
              <h4 className="font-extrabold text-brand-text">{t('beneluxDensity')}</h4>
            </div>
            <p className="text-sm text-brand-text leading-relaxed opacity-80">
              {t('beneluxText')}
            </p>
          </div>
          <div className="bg-brand-bg rounded-2xl p-6 border-l-4 border-l-brand-turquoise">
            <div className="flex items-center gap-3 mb-3">
              <Anchor className="w-5 h-5 text-brand-turquoise" />
              <h4 className="font-extrabold text-brand-text">{t('portRole')}</h4>
            </div>
            <p className="text-sm text-brand-text leading-relaxed opacity-80">
              {t('portRoleText')}
            </p>
          </div>
          <div className="bg-brand-bg rounded-2xl p-6 border-l-4 border-l-brand-orange">
            <div className="flex items-center gap-3 mb-3">
              <Info className="w-5 h-5 text-brand-orange" />
              <h4 className="font-extrabold text-brand-text">{t('openDataReading')}</h4>
            </div>
            <p className="text-sm text-brand-text leading-relaxed opacity-80">
              {t('openDataReadingText')}
            </p>
          </div>
        </div>


      </div>
    </section>
  );
};

