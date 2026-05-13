# EuroRoad Atlas 🇪🇺🛣️

**EuroRoad Atlas** est un outil d'exploration cartographique et analytique des infrastructures logistiques européennes (France, Belgique, Pays-Bas). Il transforme les données brutes d'OpenStreetMap (OSM) en une lecture stratégique des flux et des hubs de transport.

![Statut du Projet](https://img.shields.io/badge/Statut-Pr%C3%AAt%20pour%20la%20Production-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

## 🌟 Fonctionnalités

- **Carte Interactive** : Visualisation en temps réel des autoroutes, gares de péage, et parkings poids lourds (PL).
- **Tableau de Bord KPI** : Synthèse des éléments OSM exploités (nombre de segments, parkings, péages).
- **Comparateur de Hubs** : Analyse comparative de la connectivité et du rôle logistique des grandes plateformes (Ports de Rotterdam, Anvers-Bruges, Dunkerque, Haropa, etc.).
- **Bilingue (FR/EN)** : Interface entièrement localisée avec un système de traduction robuste.
- **Exploration de Données** : Détails précis sur chaque élément sélectionné (tags OSM, types de barrières, services de parking).
- **Design Premium** : Interface moderne, réactive et optimisée pour une lecture professionnelle (Glastmorphism, micro-animations).

## 🛠️ Stack Technique

- **Framework** : React 18 + Vite
- **Cartographie** : Leaflet + React-Leaflet
- **Styling** : Tailwind CSS 4
- **Iconographie** : Lucide-React
- **Type Safety** : TypeScript

## 🚀 Installation et Lancement

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- npm ou yarn

### Étapes
1. **Cloner le dépôt** :
   ```bash
   git clone [url-du-depot]
   cd EuroRoad
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer l'environnement** :
   Copiez le fichier `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```

4. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application sera disponible sur `http://localhost:5173`.

## 📊 Méthodologie et Données

### Sources
- **OpenStreetMap** : Données géographiques pour les autoroutes, péages et parkings.
- **Sources Documentées** : Données spécifiques pour les hubs logistiques (sites officiels des ports et autorités de transport).

### Logique de Calcul
- **Axes OSM calculés** : Les segments autoroutiers sont regroupés analytiquement par leurs tags `ref` et `int_ref` pour former des axes logistiques cohérents.
- **Connectivité des Hubs** : Mesurée par le nombre d'autoroutes majeures intersectant la zone d'influence du hub.

## 📝 Licence

Ce projet exploite des données OpenStreetMap sous licence **ODbL**. Le code source est fourni à titre expérimental pour l'analyse logistique.

---
*Développé pour EuroRoad Atlas — 2026*
