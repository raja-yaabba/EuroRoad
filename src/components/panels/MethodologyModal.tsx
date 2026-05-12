import React from 'react';
import { X, Info, Database, Calculator, AlertCircle, ExternalLink } from 'lucide-react';
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
          {/* Pourquoi ce projet ? */}
          <div className="p-4 bg-brand-blue-light/30 rounded-2xl border border-brand-blue/20">
            <h3 className="font-bold text-brand-blue mb-2">Pourquoi ce projet ?</h3>
            <p className="text-sm font-medium leading-relaxed">
              EuroRoad Atlas est un projet open data conçu pour explorer les infrastructures autoroutières et logistiques entre la France, la Belgique et les Pays-Bas. L'objectif est de transformer des données OpenStreetMap brutes en interface lisible : carte, filtres, couches, KPI et fiches d'exploration.
            </p>
            <p className="text-xs text-brand-muted mt-2 italic">
              Rendu Canvas Leaflet pour limiter la surcharge DOM.
            </p>
          </div>
          
          {/* Grille des types de données */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Réel */}
            <div className="bg-brand-green-light/30 p-4 rounded-2xl border border-brand-green/20">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-brand-green" />
                <h3 className="font-bold text-brand-green uppercase tracking-wide text-sm">Données réelles</h3>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-brand-text">
                <li>Emplacements des hubs (OSM)</li>
                <li>Tracés des autoroutes (OSM)</li>
                <li>Péages et parkings PL (OSM)</li>
                <li>Données portuaires officielles</li>
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
                <span className="font-bold">⚓ Ports:</span>
                <span className="text-brand-muted">Sources officielles publiques</span>
              </div>
            </div>
          </div>

          {/* Limites */}
          <div className="p-4 bg-brand-yellow-light/40 rounded-2xl border border-brand-yellow/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-brand-orange" />
              <h3 className="font-bold text-brand-orange uppercase tracking-wide text-sm">Limites</h3>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-brand-text">
              <li>Les données dépendent de la qualité OpenStreetMap</li>
              <li>Les parkings PL peuvent être incomplets selon les pays</li>
              <li>Les axes calculés ne sont pas des corridors officiels</li>
              <li>Aucun flux transporteur privé n'est mesuré</li>
              <li>Aucun coût ou volume n'est inventé</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};