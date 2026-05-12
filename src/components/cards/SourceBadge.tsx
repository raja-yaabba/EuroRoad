import React from 'react';
import { FileText, ShieldCheck, ShieldAlert, Shield, MapPin, ExternalLink } from 'lucide-react';
import { Language, Reliability } from '../../types';
import { useTranslation } from '../../utils/i18n';

interface SourceBadgeProps {
  label: string;
  url?: string;
  lang: Language;
  reliability?: Reliability;
  lastUpdated?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ label, url, lang, reliability, lastUpdated }) => {
  const { t } = useTranslation(lang);

  const getReliabilityUI = () => {
    switch(reliability) {
      case 'high': return { icon: ShieldCheck, color: 'text-brand-green', bg: 'bg-brand-green-light', label: t('relHigh') };
      case 'medium': return { icon: Shield, color: 'text-brand-orange', bg: 'bg-brand-orange-light', label: t('relMedium') };
      case 'partial': return { icon: ShieldAlert, color: 'text-brand-yellow', bg: 'bg-brand-yellow-light', label: t('relPartial') };
      case 'unavailable': 
      default:
        return { icon: ShieldAlert, color: 'text-gray-400', bg: 'bg-gray-100', label: t('relUnavailable') };
    }
  }

  const isOSM = label?.toLowerCase().includes('openstreetmap') || label?.toLowerCase().includes('osm');
  const isOfficial = label?.toLowerCase().includes('port') || label?.toLowerCase().includes('tent') || label?.toLowerCase().includes('eurostat');

  const relUI = reliability ? getReliabilityUI() : null;
  const RelIcon = relUI?.icon;

  return (
    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-brand-border">
      <div className="flex items-center gap-2">
        {isOSM ? (
          <MapPin className="w-4 h-4 text-brand-green" />
        ) : isOfficial ? (
          <FileText className="w-4 h-4 text-brand-blue" />
        ) : (
          <FileText className="w-4 h-4 text-brand-muted" />
        )}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wide">{t('source')}</span>
          {url ? (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs font-semibold text-brand-blue hover:underline flex items-center gap-1"
            >
              {label}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-xs font-semibold text-brand-text">{label || (lang === 'fr' ? 'Source non renseignée' : 'Source not available')}</span>
          )}
        </div>
      </div>
      
      {reliability && relUI && RelIcon && (
        <div className="flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${relUI.bg}`}>
            <RelIcon className={`w-3.5 h-3.5 ${relUI.color}`} />
            <span className="font-semibold text-brand-text text-[10px]">{relUI.label}</span>
          </div>
          {lastUpdated && (
            <span className="text-[9px] text-brand-muted uppercase tracking-wide">
              📅 {t('updated')}: {lastUpdated}
            </span>
          )}
        </div>
      )}
    </div>
  );
};