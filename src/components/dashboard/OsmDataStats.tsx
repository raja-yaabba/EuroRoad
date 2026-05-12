import React from 'react';
import { Language } from '../../types';
import { useTranslation } from '../../utils/i18n';
import { Zap, AlertCircle, CheckCircle } from 'lucide-react';

export interface OsmStatsProps {
  totalMotorways: number;
  totalTolls: number;
  totalParkings: number;
  countriesCovered: number;
  lang: Language;
}

export const OsmDataStats: React.FC<OsmStatsProps> = ({
  totalMotorways,
  totalTolls,
  totalParkings,
  countriesCovered,
  lang,
}) => {
  const { t } = useTranslation(lang);
  const hasData = totalMotorways > 0 || totalTolls > 0 || totalParkings > 0;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-4">
        {hasData ? (
          <>
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {lang === 'fr' ? '🗺️ Données OpenStreetMap en direct' : '🗺️ Real OpenStreetMap Data'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {lang === 'fr'
                  ? 'Infrastructure routière réelle extraite d\'OpenStreetMap'
                  : 'Real road infrastructure extracted from OpenStreetMap'}
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {lang === 'fr' ? '⚠️ Données OSM indisponibles' : '⚠️ OSM Data Unavailable'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {lang === 'fr'
                  ? 'Les fichiers de données n\'ont pas pu être chargés'
                  : 'Data files could not be loaded'}
              </p>
            </div>
          </>
        )}
      </div>

      {hasData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-orange-100">
            <div className="text-2xl font-extrabold text-orange-600">{totalMotorways.toLocaleString()}</div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-1">
              {lang === 'fr' ? 'Autoroutes' : 'Motorways'}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-amber-100">
            <div className="text-2xl font-extrabold text-amber-600">{totalTolls.toLocaleString()}</div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-1">
              {lang === 'fr' ? 'Péages' : 'Tolls'}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-yellow-100">
            <div className="text-2xl font-extrabold text-yellow-600">{totalParkings.toLocaleString()}</div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-1">
              {lang === 'fr' ? 'Parkings PL' : 'Truck Parkings'}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="text-2xl font-extrabold text-blue-600">{countriesCovered}</div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-1">
              {lang === 'fr' ? 'Pays couverts' : 'Countries Covered'}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-white rounded-lg border border-orange-100 text-xs text-gray-600">
        <span className="font-semibold text-gray-700">Source:</span> OpenStreetMap (Overpass API) • MIT License
      </div>
    </div>
  );
};
