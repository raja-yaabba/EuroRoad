# Refactoring EuroRoad Atlas - État actuel

## Résumé

L'application est maintenant centrée sur des hubs logistiques réels et sur des statistiques OpenStreetMap chargées localement depuis `/public/data/`.

Les corridors dessinés et les contenus pédagogiques ont été retirés du code source de l'application.

## Ce qui est en place

### Chargement des données
- `src/services/dataLoader.ts` charge les fichiers OSM locaux.
- Fichiers supportés:
  - `osm_motorways_*.json`
  - `osm_tolls_*.json`
  - `osm_truck_parking_*.json`
- Les hubs sont validés avant affichage.
- Les statistiques OSM sont agrégées dans `osmData`.

### Application
- `AppContext` ne gère plus de corridors.
- `MapExplorer` n’affiche plus que les hubs.
- `DetailPanel` est hub-only.
- `DataInsights` affiche les KPIs hubs + OSM.
- `DataBadge` ne gère plus le type `educational`.
- Les types TypeScript ne contiennent plus de corridor dans l’applicatif actif.

### Interface
- La mise en page a été resserrée pour donner plus de place à la carte.
- Le dashboard utilise un KPI d’autoroutes OSM chargé depuis les fichiers locaux.

## Badges de données

Types conservés:
- `real`
- `calculated`
- `unavailable`

## Données OSM affichées

- Autoroutes
- Péages
- Parkings poids lourds
- Couverture sur 3 pays: France, Belgique, Pays-Bas

## Vérification

- Build de production: OK
- Références `educational` et `corridorsData` retirées du code source actif

