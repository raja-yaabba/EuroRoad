import React from 'react';
import { FilterState, Language, Country, HubType } from '../../types';
import { useTranslation } from '../../utils/i18n';
import { 
  Settings2, RotateCcw, Box, Map, Ship, Warehouse, Factory, 
  Globe, Route, Filter, Database, Shield, Check, MapPin, Truck, Layers
} from 'lucide-react';

interface SidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  lang: Language;
}

const COUNTRIES: { code: Country; flag: string; color: string }[] = [
  { code: 'France', flag: '🇫🇷', color: 'border-brand-blue' },
  { code: 'Belgium', flag: '🇧🇪', color: 'border-brand-turquoise' },
  { code: 'Netherlands', flag: '🇳🇱', color: 'border-brand-orange' },
];

const HUB_TYPES: { type: HubType; icon: React.ElementType; label: string; color: string; bg: string }[] = [
  { type: 'seaport', icon: Ship, label: 'Port maritime', color: 'text-brand-green', bg: 'bg-brand-green-light' },
  { type: 'urban_hub', icon: Box, label: 'Hub urbain', color: 'text-brand-blue', bg: 'bg-brand-blue-light' },
  { type: 'border_hub', icon: Globe, label: 'Hub frontalier', color: 'text-brand-purple', bg: 'bg-brand-purple-light' },
  { type: 'industrial_hub', icon: Factory, label: 'Hub industriel', color: 'text-brand-orange', bg: 'bg-brand-orange-light' },
  { type: 'inland_hub', icon: Warehouse, label: 'Hub intérieur', color: 'text-brand-turquoise', bg: 'bg-brand-turquoise-light' },
];

export const Sidebar: React.FC<SidebarProps> = ({ filters, setFilters, lang }) => {
  const { t } = useTranslation(lang);

  const toggleCountry = (country: Country) => {
    setFilters(prev => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country]
    }));
  };

  const toggleHubType = (type: HubType) => {
    setFilters(prev => ({
      ...prev,
      hubTypes: prev.hubTypes.includes(type)
        ? prev.hubTypes.filter(t => t !== type)
        : [...prev.hubTypes, type]
    }));
  };

  const resetFilters = () => {
    setFilters({
      countries: ['France', 'Belgium', 'Netherlands'],
      hubTypes: ['seaport', 'urban_hub', 'border_hub', 'industrial_hub', 'inland_hub'],
      showHubs: true,
      showMotorways: true,
      showTolls: false,
      showTruckParkings: false,
      showAxes: false,
    });
  };

  return (
    <aside className="w-80 bg-white border-r border-brand-border shrink-0 flex flex-col h-full overflow-y-auto relative z-20">
      {/* Header */}
      <div className="p-5 border-b border-brand-border flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-brand-blue to-brand-turquoise rounded-lg">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-brand-text text-lg">Filtres</span>
        </div>
        <button 
          onClick={resetFilters}
          className="text-brand-muted hover:text-brand-blue transition-colors p-2 rounded-full hover:bg-brand-blue-light"
          title={t('resetFilters')}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-8">
        
        {/* 1. Pays */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" />
            {t('countries')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map(({ code, flag, color }) => {
              const isActive = filters.countries.includes(code);
              return (
                <button
                  key={code}
                  onClick={() => toggleCountry(code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${
                    isActive 
                      ? `bg-white ${color} border-current shadow-sm`
                      : 'bg-brand-bg border-brand-border text-brand-muted hover:border-brand-muted/50'
                  }`}
                >
                  <span className="text-base">{flag}</span>
                  <span>{code}</span>
                  {isActive && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Couches OSM */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2">
            <Route className="w-3.5 h-3.5" />
            Couches OSM
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, showMotorways: !prev.showMotorways }))}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filters.showMotorways
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'bg-brand-bg text-brand-muted border border-brand-border hover:border-brand-blue/50'
              }`}
            >
              <Map className="w-4 h-4" />
              Autoroutes OSM
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, showTolls: !prev.showTolls }))}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filters.showTolls
                  ? 'bg-brand-orange text-white shadow-md'
                  : 'bg-brand-bg text-brand-muted border border-brand-border hover:border-brand-orange/50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Péages OSM
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, showTruckParkings: !prev.showTruckParkings }))}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filters.showTruckParkings
                  ? 'bg-brand-turquoise text-white shadow-md'
                  : 'bg-brand-bg text-brand-muted border border-brand-border hover:border-brand-turquoise/50'
              }`}
            >
              <Truck className="w-4 h-4" />
              Parkings PL OSM
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, showAxes: !prev.showAxes }))}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filters.showAxes
                  ? 'bg-brand-green text-white shadow-md'
                  : 'bg-brand-bg text-brand-muted border border-brand-border hover:border-brand-green/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Axes OSM calculés
            </button>
          </div>
        </div>

        {/* 3. Types de hubs */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            Types de hubs
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {HUB_TYPES.map(({ type, icon: Icon, label, color, bg }) => {
              const isSelected = filters.hubTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleHubType(type)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected 
                      ? `${bg} ${color} border border-current/30`
                      : 'bg-white border border-brand-border text-brand-muted hover:border-brand-muted/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{label}</span>
                  {isSelected && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Badges data */}
        <div className="space-y-3 pt-2 border-t border-brand-border/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            Types de données
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-green-light text-brand-green border border-brand-green/30">
              🟢 Réelles - OpenStreetMap
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-blue-light text-brand-blue border border-brand-blue/30">
              🔵 Calculées depuis OpenStreetMap
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-300">
              ⚪ Indisponibles
            </span>
          </div>
        </div>
      </div>

      {/* Footer sidebar */}
      <div className="mt-auto p-4 border-t border-brand-border bg-brand-bg/30">
        <p className="text-[10px] text-brand-muted text-center">
          🔓 Données open source — OSM réel uniquement
        </p>
      </div>
    </aside>
  );
};