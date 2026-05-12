import React from 'react';
import { X, Info, Database, Calculator, BookOpen, AlertCircle, ExternalLink } from 'lucide-react';
import { Language } from '../../types';
import { useTranslation } from '../../utils/i18n';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose, lang }) => {
  const { t } = useTranslation(lang);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-brand-border flex justify-between items-center bg-gradient-to-r from-brand-blue/5 to-brand-turquoise/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-brand-blue to-brand-turquoise rounded-xl text-white shadow-md">
              <Info className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-brand-text">📖 {t('methodologyTitle')}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white hover:bg-brand-bg rounded-full text-brand-muted transition-colors border border-brand-border"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-brand-text">
          {/* Texte introductif */}
          <div className="p-4 bg-brand-blue-light/30 rounded-2xl border border-brand-blue/20">
            <p className="text-base font-medium leading-relaxed">
              {lang === 'fr' 
                ? "EuroRoad Atlas est un atlas interactif open data. Il ne mesure pas les flux privés de transporteurs et ne simule pas de coûts transport. Les données proviennent de sources ouvertes/officielles lorsqu'elles sont disponibles. Les indicateurs calculés sont distingués des données réelles."
                : "EuroRoad Atlas is an open data interactive atlas. It does not measure private carrier flows or simulate transport costs. Data comes from open/official sources when available. Calculated indicators are clearly separated from real data."}
            </p>
          </div>
          
          {/* Grille des types de données */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Réel */}
            <div className="bg-brand-green-light/30 p-4 rounded-2xl border border-brand-green/20">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-brand-green" />
                <h3 className="font-bold text-brand-green uppercase tracking-wide text-sm">Données réelles</h3>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-brand-text">
                <li>Emplacements des hubs (OSM)</li>
                <li>Tracés des autoroutes (OSM)</li>
                <li>Données portuaires officielles</li>
                <li>Statistiques Eurostat</li>
                <li>Corridors TEN-T</li>
              </ul>
            </div>
            
            {/* Calculé */}
            <div className="bg-brand-blue-light/30 p-4 rounded-2xl border border-brand-blue/20">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-5 h-5 text-brand-blue" />
                <h3 className="font-bold text-brand-blue uppercase tracking-wide text-sm">Données calculées</h3>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-brand-text">
                <li>Scores d'accessibilité (0-100)</li>
                <li>Niveaux de connectivité agrégés</li>
                <li>Indicateurs clés du dashboard</li>
                <li className="text-brand-muted italic">Ne jamais présenter comme officiel</li>
              </ul>
            </div>
            
            {/* Pédagogique */}
            <div className="bg-brand-purple-light/30 p-4 rounded-2xl border border-brand-purple/20">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-brand-purple" />
                <h3 className="font-bold text-brand-purple uppercase tracking-wide text-sm">Analyse pédagogique</h3>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-brand-text">
                <li>Corridors illustratifs</li>
                <li>Ne reflètent pas des flux privés mesurés</li>
                <li>Basés sur les infrastructures réelles</li>
              </ul>
            </div>
          </div>

          {/* Sources utilisées */}
          <div className="bg-brand-bg p-4 rounded-2xl border border-brand-border">
            <h3 className="font-bold text-brand-text mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Sources de données officielles
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold">🗺️ OSM:</span>
                <span className="text-brand-muted">OpenStreetMap / Overpass API</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">🇪🇺 TEN-T:</span>
                <span className="text-brand-muted">TENtec / European Commission</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">📊 Eurostat:</span>
                <span className="text-brand-muted">Statistiques transport macro</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">⚓ Ports:</span>
                <span className="text-brand-muted">Rotterdam, Anvers, Haropa, Dunkerque</span>
              </div>
            </div>
          </div>

          {/* Limites */}
          <div className="p-4 bg-brand-yellow-light/40 rounded-2xl border border-brand-yellow/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-brand-orange" />
              <h3 className="font-bold text-brand-orange uppercase tracking-wide text-sm">Limites</h3>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              {lang === 'fr'
                ? "EuroRoad Atlas utilise uniquement des données open source (OpenStreetMap, ports officiels). Les données de trafic réel, volumes privés, coûts et horaires ne sont pas représentés car non disponibles publiquement."
                : "EuroRoad Atlas uses only open source data (OpenStreetMap, official ports). Actual traffic data, private volumes, costs and schedules are not represented as they are not publicly available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};