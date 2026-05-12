import React from 'react';
import { Hub, Language, OsmAxisFeature, OsmLineFeature, OsmPointFeature, SelectedItemType } from '../../types';
import { useTranslation } from '../../utils/i18n';
import { DataBadge } from '../cards/DataBadge';
import { SourceBadge } from '../cards/SourceBadge';
import { Map, Info, X, AlertCircle } from 'lucide-react';

type OsmFeature = OsmLineFeature | OsmPointFeature | OsmAxisFeature;

type DetailSelection =
  | { type: 'hub'; item: Hub }
  | { type: Exclude<SelectedItemType, 'hub'>; item: OsmFeature }
  | null;

interface DetailPanelProps {
  selection: DetailSelection;
  lang: Language;
  onClose: () => void;
}

const formatValue = (value?: string) => value || 'Donnée non renseignée';

export const DetailPanel: React.FC<DetailPanelProps> = ({ selection, lang, onClose }) => {
  const { t } = useTranslation(lang);

  // État vide
  if (!selection) {
    return (
      <div className="w-80 bg-white border-l border-brand-border p-8 flex flex-col items-center justify-center text-center shrink-0 z-20 shadow-xl">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-blue-light to-brand-turquoise-light rounded-2xl flex items-center justify-center mb-5 shadow-inner">
          <Map className="w-10 h-10 text-brand-blue" />
        </div>
        <h2 className="text-xl font-bold text-brand-text mb-2">EuroRoad Atlas</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          {lang === 'fr' 
            ? "Sélectionnez un élément sur la carte pour explorer ses données."
            : "Select an item on the map to explore its data."}
        </p>
        <div className="mt-6 text-xs text-brand-muted/60 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Données open source — OSM réel uniquement
        </div>
      </div>
    );
  }

  if (selection.type === 'hub') {
    const hubItem = selection.item;

    return (
      <div className="w-[380px] bg-white border-l border-brand-border flex flex-col h-full overflow-y-auto z-20 shadow-xl shrink-0 relative">
        {/* Header avec gradient */}
        <div className="p-6 pb-4 border-b border-brand-border sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-brand-bg text-brand-muted border border-brand-border">
                {hubItem.country}
              </span>
              <DataBadge type={hubItem.dataType} />
            </div>
            <h2 className="text-2xl font-extrabold text-brand-text leading-tight">{hubItem.name}</h2>
            <span className="text-sm font-medium text-brand-muted">
              {t(hubItem.type as any)}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-brand-bg text-brand-muted transition-colors -mr-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 flex-1">
          {/* Section des infos de base */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2">
              🛣️ {lang === 'fr' ? 'Autoroutes connectées' : 'Connected highways'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {hubItem.connectedHighways.length > 0 ? (
                hubItem.connectedHighways.map(hw => (
                  <span key={hw} className="px-3 py-1.5 bg-brand-bg border border-brand-border text-brand-text font-mono text-xs font-bold rounded-lg">
                    {hw}
                  </span>
                ))
              ) : (
                <span className="text-sm text-brand-muted italic">
                  {lang === 'fr' ? 'Donnée non renseignée' : 'Data not available'}
                </span>
              )}
            </div>
          </div>

          {/* Rôle logistique */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              {lang === 'fr' ? 'Rôle logistique' : 'Logistics role'}
            </h3>
            <p className="text-sm text-brand-text leading-relaxed bg-brand-bg/50 p-3 rounded-xl">
              {lang === 'fr' ? hubItem.descriptionFr : hubItem.descriptionEn}
            </p>
          </div>

          {/* Pourquoi stratégique */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              {lang === 'fr' ? 'Importance stratégique' : 'Strategic importance'}
            </h3>
            <div className="bg-gradient-to-r from-brand-blue-light/30 to-brand-turquoise-light/30 p-3 rounded-xl border-l-4 border-brand-blue">
              <p className="text-sm text-brand-text font-medium">
                {lang === 'fr' ? hubItem.strategicReasoningFr : hubItem.strategicReasoningEn}
              </p>
            </div>
          </div>

          {/* Source badge */}
          <SourceBadge 
            label={hubItem.dataSource || (lang === 'fr' ? 'Source non renseignée' : 'Source not available')} 
            url={hubItem.sourceUrl}
            reliability={hubItem.reliability}
            lastUpdated={hubItem.lastUpdated}
            lang={lang} 
          />
        </div>
      </div>
    );
  }

  const feature = selection.item;
  const featureTypeLabel =
    selection.type === 'motorway'
      ? lang === 'fr'
        ? 'Autoroute OSM'
        : 'OSM motorway'
      : selection.type === 'toll'
      ? lang === 'fr'
        ? 'Péage OSM'
        : 'OSM toll'
      : selection.type === 'truck_parking'
      ? lang === 'fr'
        ? 'Parking PL OSM'
        : 'OSM truck parking'
      : lang === 'fr'
      ? 'Axe OSM calculé'
      : 'Calculated OSM axis';

  const dataBadgeLabel = feature.dataType === 'calculated'
    ? lang === 'fr'
      ? 'Donnée calculée depuis OpenStreetMap'
      : 'Calculated from OpenStreetMap'
    : lang === 'fr'
      ? 'Donnée réelle — OpenStreetMap'
      : 'Real data — OpenStreetMap';

  const orderedTags = [
    'name',
    'ref',
    'int_ref',
    'highway',
    'toll',
    'amenity',
    'parking',
    'hgv',
    'opening_hours',
    'service',
    'services',
    'operator',
    'operator:ref',
    'highway:ref',
  ];

  return (
    <div className="w-[380px] bg-white border-l border-brand-border flex flex-col h-full overflow-y-auto z-20 shadow-xl shrink-0 relative">
      <div className="p-6 pb-4 border-b border-brand-border sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-brand-bg text-brand-muted border border-brand-border">
              {feature.country}
            </span>
            <DataBadge type={feature.dataType} />
          </div>
          <h2 className="text-2xl font-extrabold text-brand-text leading-tight">
            {feature.name || feature.ref || feature.intRef || featureTypeLabel}
          </h2>
          <span className="text-sm font-medium text-brand-muted">{featureTypeLabel}</span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-brand-blue">
            {dataBadgeLabel}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-brand-bg text-brand-muted transition-colors -mr-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 flex flex-col gap-6 flex-1">
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">Détails</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-brand-bg/50 rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-brand-muted">Nom</div>
              <div className="font-semibold text-brand-text">{formatValue(feature.name)}</div>
            </div>
            <div className="bg-brand-bg/50 rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-brand-muted">Réf.</div>
              <div className="font-semibold text-brand-text">{formatValue(feature.ref || feature.intRef)}</div>
            </div>
            <div className="bg-brand-bg/50 rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-brand-muted">Pays</div>
              <div className="font-semibold text-brand-text">{feature.country}</div>
            </div>
            <div className="bg-brand-bg/50 rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-brand-muted">Source</div>
              <div className="font-semibold text-brand-text">OpenStreetMap</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">Tags OSM</h3>
          <div className="flex flex-wrap gap-2">
            {orderedTags
              .filter((tagName) => feature.tags[tagName])
              .map((tagName) => (
                <span
                  key={tagName}
                  className="px-3 py-1.5 rounded-lg bg-brand-bg border border-brand-border text-xs font-mono font-semibold text-brand-text"
                >
                  {tagName}: {feature.tags[tagName]}
                </span>
              ))}
            {Object.keys(feature.tags).length === 0 && (
              <span className="text-sm text-brand-muted italic">Donnée non renseignée</span>
            )}
          </div>
        </div>

        <SourceBadge 
          label="OpenStreetMap"
          url={feature.sourceUrl}
          lang={lang} 
        />
      </div>
    </div>
  );
};