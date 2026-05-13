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

const HUB_TYPES: { type: HubType; icon: React.ElementType; labelKey: string; color: string; bg: string }[] = [
  { type: 'seaport', icon: Ship, labelKey: 'seaport', color: 'text-brand-green', bg: 'bg-brand-green-light' },
  { type: 'urban_hub', icon: Box, labelKey: 'urban_hub', color: 'text-brand-blue', bg: 'bg-brand-blue-light' },
  { type: 'border_hub', icon: Globe, labelKey: 'border_hub', color: 'text-brand-purple', bg: 'bg-brand-purple-light' },
  { type: 'industrial_hub', icon: Factory, labelKey: 'industrial_hub', color: 'text-brand-orange', bg: 'bg-brand-orange-light' },
  { type: 'inland_hub', icon: Warehouse, labelKey: 'inland_hub', color: 'text-brand-turquoise', bg: 'bg-brand-turquoise-light' },
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
      showAllMotorways: false,
      showTolls: false,
      showTruckParkings: false,
      showAxes: false,
      showAllAxes: false,
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
          <span className="font-extrabold text-brand-text text-lg">{t('filters')}</span>
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${isActive
                      ? `bg-white ${color} border-current shadow-sm`
                      : 'bg-brand-bg border-brand-border text-brand-muted hover:border-brand-muted/50'
                    }`}
                >
                  <span className="text-base">{flag}</span>
                  <span>{t(code.toLowerCase() as any)}</span>
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
            {t('mapLayers')}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {/* Motorways segmented control */}
            <div className="col-span-2 flex flex-col gap-2">
              <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border">
                <button
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    showMotorways: !prev.showMotorways,
                    showAllMotorways: false
                  }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${filters.showMotorways
                    ? 'bg-white shadow-sm text-brand-blue border border-brand-blue/10'
                    : 'text-brand-muted hover:text-brand-text'
                    }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  {t('primaryMotorways')}
                </button>
                <button
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    showAllMotorways: !prev.showAllMotorways,
                    showMotorways: false
                  }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${filters.showAllMotorways
                    ? 'bg-white shadow-sm text-brand-blue border border-brand-blue/10'
                    : 'text-brand-muted hover:text-brand-text'
                    }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {t('allMotorways')}
                </button>
              </div>
              {filters.showAllMotorways && (
                <div className="text-[8px] text-center text-amber-600 font-bold leading-tight px-2 animate-pulse">
                  {t('heavyLayerWarning')}
                </div>
              )}
            </div>

            {/* Points of interest group */}
            <div className="col-span-2 flex flex-col gap-2">
              <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border gap-1">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, showTolls: !prev.showTolls }))}
                  className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${filters.showTolls
                    ? 'bg-white shadow-sm text-brand-orange border border-brand-orange/10'
                    : 'text-brand-muted hover:text-brand-text'
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    {t('toll')}
                  </div>
                  <span className="text-[7px] font-bold opacity-60 mt-0.5">zoom ≥ 9</span>
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, showTruckParkings: !prev.showTruckParkings }))}
                  className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${filters.showTruckParkings
                    ? 'bg-white shadow-sm text-brand-turquoise border border-brand-turquoise/10'
                    : 'text-brand-muted hover:text-brand-text'
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3 h-3" />
                    {t('truck_parking')}
                  </div>
                  <span className="text-[7px] font-bold opacity-60 mt-0.5">zoom ≥ 10</span>
                </button>
              </div>
            </div>

            {/* Analytical layer group */}
            <div className="col-span-2 border-t border-brand-border/50 pt-4 flex flex-col gap-2">
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-muted mb-1 flex items-center gap-1 opacity-70">
                <Layers className="w-3 h-3" />
                {t('analyticalLayer')}
              </div>
              <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border gap-1">
                <button
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    showAxes: !prev.showAxes,
                    showAllAxes: false
                  }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${filters.showAxes
                    ? 'bg-white shadow-sm text-brand-green border border-brand-green/10'
                    : 'text-brand-muted hover:text-brand-text'
                    }`}
                >
                  <Route className="w-3.5 h-3.5" />
                  {t('osmAxesAnalysis')}
                </button>
                <button
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    showAllAxes: !prev.showAllAxes,
                    showAxes: false
                  }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${filters.showAllAxes
                    ? 'bg-white shadow-sm text-brand-green border border-brand-green/10'
                    : 'text-brand-muted hover:text-brand-text'
                    }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {t('showAllAxes')}
                </button>
              </div>
              <div className="text-[9px] text-center text-brand-muted font-medium px-2 leading-tight opacity-60">
                {t('analyticalGroupingNote')}
              </div>
            </div>

          </div>
        </div>

        {/* 3. Types de hubs */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            {t('hubTypes')}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {HUB_TYPES.map(({ type, icon: Icon, labelKey, color, bg }) => {
              const isSelected = filters.hubTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleHubType(type)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isSelected
                      ? `${bg} ${color} border border-current/30`
                      : 'bg-white border border-brand-border text-brand-muted hover:border-brand-muted/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{t(labelKey as any)}</span>
                  {isSelected && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Légende */}
        <div className="space-y-3 pt-4 border-t border-brand-border/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            {t('legend')}
          </h3>
          <div className="bg-brand-bg rounded-xl p-3 text-[10px] text-brand-muted font-medium border border-brand-border shadow-sm">
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mb-2">
              <span className="flex items-center gap-1">⚓ {t('portLabel')}</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">🏙️ {t('urbanLabel')}</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">🚧 {t('borderLabel')}</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">🏭 {t('industrialLabel')}</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">📦 {t('inlandLabel')}</span>
            </div>
            <div className="border-t border-brand-border/50 my-2"></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5"><span className="w-4 h-1 rounded-full bg-[#2563EB]"></span>{t('motorway')}</div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-1 rounded-full bg-[#0F766E]"></span>{t('osmAxesAnalysis')}</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F97316]"></span>{t('toll')}</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#14B8A6]"></span>{t('truck_parking')}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer sidebar */}
      <div className="mt-auto p-4 border-t border-brand-border bg-brand-bg/30">
        <p className="text-[10px] text-brand-muted text-center italic font-medium">
          {t('osmLicenceShort')}
        </p>
      </div>
    </aside>
  );
};