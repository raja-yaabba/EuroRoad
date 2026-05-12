import React from 'react';
import { Hub, Language } from '../../types';
import { useTranslation } from '../../utils/i18n';
import { DataBadge } from '../cards/DataBadge';
import { SourceBadge } from '../cards/SourceBadge';
import { Map, Info, X, AlertCircle } from 'lucide-react';

interface DetailPanelProps {
  item: Hub | null;
  lang: Language;
  onClose: () => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ item, lang, onClose }) => {
  const { t } = useTranslation(lang);

  // État vide
  if (!item) {
    return (
      <div className="w-80 bg-white border-l border-brand-border p-8 flex flex-col items-center justify-center text-center shrink-0 z-20 shadow-xl">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-blue-light to-brand-turquoise-light rounded-2xl flex items-center justify-center mb-5 shadow-inner">
          <Map className="w-10 h-10 text-brand-blue" />
        </div>
        <h2 className="text-xl font-bold text-brand-text mb-2">EuroRoad Atlas</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          {lang === 'fr' 
            ? "Sélectionnez un hub sur la carte pour explorer ses données."
            : "Select a hub on the map to explore its data."}
        </p>
        <div className="mt-6 text-xs text-brand-muted/60 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Données open source — OSM · Official Ports
        </div>
      </div>
    );
  }

  const hubItem = item as Hub;

  return (
    <div className="w-[380px] bg-white border-l border-brand-border flex flex-col h-full overflow-y-auto z-20 shadow-xl shrink-0 relative">
      {/* Header avec gradient */}
      <div className="p-6 pb-4 border-b border-brand-border sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-brand-bg text-brand-muted border border-brand-border">
              {hubItem.country}
            </span>
            <DataBadge type={item.dataType} />
          </div>
          <h2 className="text-2xl font-extrabold text-brand-text leading-tight">{item.name}</h2>
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
            {lang === 'fr' ? item.descriptionFr : item.descriptionEn}
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
          label={item.dataSource || (lang === 'fr' ? 'Source non renseignée' : 'Source not available')} 
          url={item.sourceUrl}
          reliability={item.reliability}
          lastUpdated={item.lastUpdated}
          lang={lang} 
        />
      </div>
    </div>
  );
};