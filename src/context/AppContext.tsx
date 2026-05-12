import React, { createContext, useContext, useState, useEffect } from 'react';
import { Hub, FilterState, Language } from '../types';
import { hubsData } from '../data/hubs';
import {
  loadAllMotorways,
  loadAllTolls,
  loadAllTruckParkings,
  OverpassData,
  countLoadedElements,
  filterCompleteHubs,
} from '../services/dataLoader';

interface RealDataStats {
  motorways: Record<'France' | 'Belgium' | 'Netherlands', OverpassData | null>;
  tolls: Record<'France' | 'Belgium' | 'Netherlands', OverpassData | null>;
  parkings: Record<'France' | 'Belgium' | 'Netherlands', OverpassData | null>;
  stats: {
    totalMotorways: number;
    totalTolls: number;
    totalParkings: number;
    countriesCovered: number;
  };
}

interface AppContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  hubs: Hub[];
  osmData: RealDataStats | null;
  loading: boolean;
  error: string | null;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  selectedItemType: 'hub' | null;
  setSelectedItemType: (type: 'hub' | null) => void;
  fetchRealData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('fr');
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [osmData, setOsmData] = useState<RealDataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'hub' | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    countries: ['France', 'Belgium', 'Netherlands'],
    hubTypes: ['seaport', 'urban_hub', 'border_hub', 'industrial_hub', 'inland_hub'],
    showHubs: true,
  });

  const fetchRealData = async () => {
    setLoading(true);
    try {
      // Valider et charger les hubs depuis les données statiques vérifiées
      const { valid: validatedHubs, incomplete: incompleteHubs } = filterCompleteHubs(hubsData);
      
      if (incompleteHubs.length > 0) {
        console.warn(
          `⚠️  ${incompleteHubs.length} hub(s) ont des données manquantes:`,
          incompleteHubs.map(h => ({ id: h.id, name: h.name }))
        );
      }
      
      setHubs(validatedHubs);
      console.log(`✓ ${validatedHubs.length}/${hubsData.length} hubs chargés avec données complètes`);

      // Charger les vraies données OpenStreetMap depuis /public/data
      // Ces données sont lourdes - on les charge mais on les affiche optionnellement
      const [motorways, tolls, parkings] = await Promise.all([
        loadAllMotorways().catch(() => ({
          France: null,
          Belgium: null,
          Netherlands: null,
        })),
        loadAllTolls().catch(() => ({
          France: null,
          Belgium: null,
          Netherlands: null,
        })),
        loadAllTruckParkings().catch(() => ({
          France: null,
          Belgium: null,
          Netherlands: null,
        })),
      ]);

      const stats = countLoadedElements(motorways, tolls, parkings);

      console.log('✓ Données OpenStreetMap chargées:', {
        motorways: stats.totalMotorways,
        tolls: stats.totalTolls,
        parkings: stats.totalParkings,
        countries: stats.countriesCovered,
      });

      setOsmData({
        motorways,
        tolls,
        parkings,
        stats,
      });
    } catch (err) {
      console.error('Data loading error:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        filters,
        setFilters,
        hubs,
        osmData,
        loading,
        error,
        selectedItemId,
        setSelectedItemId,
        selectedItemType,
        setSelectedItemType,
        fetchRealData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};