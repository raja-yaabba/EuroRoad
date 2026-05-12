import React from 'react';
import { Language } from '../../types';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface OsmStatsProps {
  totalMotorways: number;
  totalTolls: number;
  totalParkings: number;
  totalAxes: number;
  countriesCovered: number;
  lang: Language;
}

export const OsmDataStats: React.FC<OsmStatsProps> = ({
  totalMotorways,
  totalTolls,
  totalParkings,
  totalAxes,
  countriesCovered,
  lang,
}) => {
  const { filters, osmData } = useApp();
  const hasData = totalMotorways > 0 || totalTolls > 0 || totalParkings > 0 || totalAxes > 0;
  const activeLayers = filters.showMotorways || filters.showTolls || filters.showTruckParkings || filters.showAxes;
  const anyLoading = Object.values(osmData.loading).some((layer) => Object.values(layer).some(Boolean));
  const motorwayLoading = Object.values(osmData.loading.motorways).some(Boolean);
  const errorMessages = Object.values(osmData.errors).flatMap((layer) => Object.values(layer).filter(Boolean));
  const hasNotFoundError = errorMessages.some((message) => message?.includes('Fichier introuvable'));
  const hasGeometryIssue = activeLayers && !motorwayLoading && totalMotorways === 0 && !errorMessages.length;

  const status = !activeLayers
    ? 'idle'
    : anyLoading
    ? 'loading'
    : errorMessages.length > 0
    ? 'error'
    : hasGeometryIssue
    ? 'empty'
    : 'ready';

  const statusTitle =
    status === 'idle'
      ? 'Aucune couche activée'
      : status === 'loading'
      ? 'Chargement OSM...'
      : status === 'error'
      ? hasNotFoundError
        ? 'Fichier introuvable'
        : 'Erreur de chargement OSM'
      : status === 'empty'
      ? 'Données chargées mais aucune géométrie exploitable'
      : lang === 'fr'
      ? '🗺️ Données OpenStreetMap en direct'
      : '🗺️ Real OpenStreetMap Data';

  const statusDescription =
    status === 'idle'
      ? lang === 'fr'
        ? 'Active au moins une couche pour afficher les données OSM.'
        : 'Activate at least one layer to display OSM data.'
      : status === 'loading'
      ? lang === 'fr'
        ? 'Les fichiers Overpass sont en cours de chargement.'
        : 'Overpass files are loading.'
      : status === 'error'
      ? lang === 'fr'
        ? 'Un fichier local est manquant ou inaccessible.'
        : 'A local file is missing or inaccessible.'
      : status === 'empty'
      ? lang === 'fr'
        ? 'Les données sont présentes, mais aucune géométrie exploitable n’a été trouvée.'
        : 'Data is present, but no usable geometry was found.'
      : lang === 'fr'
      ? 'Infrastructure routière réelle extraite d\'OpenStreetMap'
      : 'Real road infrastructure extracted from OpenStreetMap';

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-4">
        {status === 'ready' ? (
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{statusTitle}</h3>
          <p className="text-sm text-gray-600 mt-1">{statusDescription}</p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-brand-text shadow-sm">
        {lang === 'fr'
          ? `Autoroutes OSM : ${totalMotorways.toLocaleString()} segments`
          : `OSM motorways: ${totalMotorways.toLocaleString()} segments`}
      </div>

      {hasData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-orange-100">
            <div className="text-2xl font-extrabold text-orange-600">{totalMotorways.toLocaleString()}</div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-1">
              {lang === 'fr' ? 'Autoroutes OSM' : 'OSM motorways'}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-amber-100">
            <div className="text-2xl font-extrabold text-amber-600">{totalTolls.toLocaleString()}</div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-1">
              {lang === 'fr' ? 'Péages OSM' : 'OSM tolls'}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-yellow-100">
            <div className="text-2xl font-extrabold text-yellow-600">{totalParkings.toLocaleString()}</div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-1">
              {lang === 'fr' ? 'Parkings PL OSM' : 'OSM truck parkings'}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-100">
            <div className="text-2xl font-extrabold text-emerald-600">{totalAxes.toLocaleString()}</div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-1">
              {lang === 'fr' ? 'Axes OSM calculés' : 'Calculated OSM axes'}
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
