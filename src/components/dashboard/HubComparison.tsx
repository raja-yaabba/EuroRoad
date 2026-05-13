import React, { useState } from 'react';
import { Hub, Language } from '../../types';
import { hubsData } from '../../data/hubs';
import { useTranslation } from '../../utils/i18n';

interface HubComparisonProps {
  lang: Language;
}

const TYPE_COLORS: Record<string, string> = {
  seaport: '#22C55E',
  urban_hub: '#2563EB',
  border_hub: '#A855F7',
  industrial_hub: '#FB923C',
  inland_hub: '#06B6D4',
};

const HubCard: React.FC<{ hub: Hub; label: string; lang: Language }> = ({ hub, lang, label }) => {
  const { t } = useTranslation(lang);
  const color = TYPE_COLORS[hub.type] ?? '#64748B';

  return (
    <div className="flex-1 bg-white border border-brand-border rounded-3xl p-6 md:p-8 flex flex-col gap-5 shadow-sm min-w-0">
      {/* Label Hub A / Hub B */}
      <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">{label}</div>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h4 className="text-2xl font-black text-brand-text leading-tight">{hub.name}</h4>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-brand-muted">{t(hub.country.toLowerCase() as any)}</span>
          <span className="text-brand-border">·</span>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-white"
            style={{ color, borderColor: `${color}40` }}
          >
            {t(hub.type as any)}
          </span>
        </div>
      </div>

      {/* Connectivity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
            {lang === 'fr' ? 'Connectivité routière documentée' : 'Documented road connectivity'}
          </span>
          <span className="text-lg font-black text-brand-text">
            {hub.connectedHighways?.length ?? 0}
            <span className="text-xs font-bold text-brand-muted ml-1">{t('axes')}</span>
          </span>
        </div>
        {/* Bar */}
        <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, ((hub.connectedHighways?.length ?? 0) / 10) * 100)}%`, backgroundColor: color }}
          />
        </div>
        {/* Highway badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {hub.connectedHighways && hub.connectedHighways.length > 0 ? (
            hub.connectedHighways.map(ref => {
              const isE = ref.startsWith('E');
              return (
                <span
                  key={ref}
                  className={`px-2 py-0.5 rounded text-[10px] font-black text-white shadow-sm border ${
                    isE ? 'bg-brand-green border-brand-green/20' : 'bg-brand-blue border-brand-blue/20'
                  }`}
                >
                  {ref}
                </span>
              );
            })
          ) : (
            <span className="text-[10px] text-brand-muted italic">{t('notProvided')}</span>
          )}
        </div>
      </div>

      {/* Source */}
      <div className="mt-auto pt-4 border-t border-brand-border/40 flex items-center justify-between">
        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">{t('colSource')}</span>
        <span className="text-[10px] font-bold text-brand-blue bg-brand-blue-light px-2.5 py-1 rounded-lg border border-brand-blue/10">
          {t(hub.dataSource as any)}
        </span>
      </div>
    </div>
  );
};

export const HubComparison: React.FC<HubComparisonProps> = ({ lang }) => {
  const { t } = useTranslation(lang);

  const defaultA = hubsData.find(h => h.id === 'paris') ?? hubsData[0];
  const defaultB = hubsData.find(h => h.id === 'rotterdam') ?? hubsData[1];

  const [hubAId, setHubAId] = useState<string>(defaultA.id);
  const [hubBId, setHubBId] = useState<string>(defaultB.id);

  const hubA = hubsData.find(h => h.id === hubAId) ?? defaultA;
  const hubB = hubsData.find(h => h.id === hubBId) ?? defaultB;

  const axesA = hubA.connectedHighways?.length ?? 0;
  const axesB = hubB.connectedHighways?.length ?? 0;
  const diff = Math.abs(axesA - axesB);

  // Generate synthesis sentence
  const getSynthesisAxes = (): string => {
    if (axesA === axesB) {
      return lang === 'fr'
        ? `Les deux hubs présentent le même nombre d'axes routiers documentés (${axesA}). La comparaison reste descriptive et ne mesure pas l'intensité réelle des flux.`
        : `Both hubs have the same number of documented road axes (${axesA}). This comparison is descriptive and does not measure actual flow intensity.`;
    }
    const more = axesA > axesB ? hubA.name : hubB.name;
    const less = axesA > axesB ? hubB.name : hubA.name;
    return lang === 'fr'
      ? `${more} dispose de ${diff} axe${diff > 1 ? 's' : ''} routier${diff > 1 ? 's' : ''} documenté${diff > 1 ? 's' : ''} de plus que ${less}. Cette différence reflète uniquement les axes renseignés dans les données disponibles.`
      : `${more} has ${diff} more documented road ax${diff > 1 ? 'es' : 'is'} than ${less}. This difference reflects only the axes recorded in the available data.`;
  };

  const getSynthesisType = (): string => {
    if (hubA.type === hubB.type) {
      return lang === 'fr'
        ? `Les deux hubs appartiennent à la même typologie : ${t(hubA.type as any)}.`
        : `Both hubs share the same type: ${t(hubA.type as any)}.`;
    }
    return lang === 'fr'
      ? `Les deux hubs jouent des rôles différents dans le réseau : ${t(hubA.type as any)} d'un côté, ${t(hubB.type as any)} de l'autre.`
      : `The two hubs play different roles in the network: ${t(hubA.type as any)} on one side, ${t(hubB.type as any)} on the other.`;
  };

  const selectClass = "bg-white border-2 border-brand-border rounded-2xl px-4 py-3 text-sm font-bold text-brand-text w-full appearance-none cursor-pointer focus:outline-none focus:border-brand-blue transition-colors hover:border-brand-blue/40";

  return (
    <div className="flex flex-col gap-8">
      {/* Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted pl-1">
            {lang === 'fr' ? 'Hub A' : 'Hub A'}
          </label>
          <div className="relative">
            <select
              value={hubAId}
              onChange={e => setHubAId(e.target.value)}
              className={selectClass}
            >
              {hubsData.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted">▾</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted pl-1">
            {lang === 'fr' ? 'Hub B' : 'Hub B'}
          </label>
          <div className="relative">
            <select
              value={hubBId}
              onChange={e => setHubBId(e.target.value)}
              className={selectClass}
            >
              {hubsData.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted">▾</div>
          </div>
        </div>
      </div>

      {/* Side-by-side cards */}
      <div className="flex flex-col md:flex-row gap-6">
        <HubCard hub={hubA} label="Hub A" lang={lang} />
        {/* Divider on desktop */}
        <div className="hidden md:flex flex-col items-center justify-center gap-3 shrink-0">
          <div className="w-px h-full bg-brand-border" />
          <span className="bg-brand-bg text-brand-muted text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border border-brand-border shrink-0">
            vs
          </span>
          <div className="w-px h-full bg-brand-border" />
        </div>
        <HubCard hub={hubB} label="Hub B" lang={lang} />
      </div>

      {/* Auto-synthesis */}
      <div className="bg-brand-blue/5 border border-brand-blue/15 rounded-2xl p-6 space-y-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-3">
          {lang === 'fr' ? 'Synthèse automatique' : 'Automatic summary'}
        </div>
        <p className="text-sm text-brand-text font-medium leading-relaxed">{getSynthesisAxes()}</p>
        <p className="text-sm text-brand-muted leading-relaxed">{getSynthesisType()}</p>
      </div>

      {/* Prudence note */}
      <p className="text-[10px] text-brand-muted italic leading-relaxed border-t border-brand-border/40 pt-4">
        {lang === 'fr'
          ? "Note : la connectivité correspond au nombre d'axes autoroutiers renseignés dans les données du hub. Elle ne constitue pas un classement économique des plateformes logistiques."
          : "Note: connectivity refers to the number of motorway axes documented for each hub. It does not constitute an economic ranking of logistics platforms."}
      </p>
    </div>
  );
};
