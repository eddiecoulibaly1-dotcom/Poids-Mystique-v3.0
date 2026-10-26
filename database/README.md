# Base de données — Géomancie / Poids Mystique

La base de données de l'application cible **Appwrite TablesDB**, indépendamment de Supabase et de Turso.

## Architecture

- **GitHub** : code source, moteur déterministe et définition versionnée du schéma.
- **Appwrite** : données persistantes de l'application, permissions et éventuellement authentification.
- **BodeDiop** : source documentaire de référence pour les figures et les maisons.
- **Moteur géomantique** : calcule les figures et les maisons sans intervention de l'IA.
- **IA** : interprète uniquement le résultat structuré fourni par le moteur ; elle ne modifie jamais les calculs.

## Structure Appwrite

La définition préparatoire se trouve dans :

`database/appwrite/schema.json`

Tables prévues :

- `sources` — provenance et vérification des sources ;
- `figures` — 16 figures canoniques et leurs attributs ;
- `maisons` — 16 maisons et leurs domaines ;
- `figure_maison` — matrice complète de 16 × 16 = 256 combinaisons ;
- `themes` — thèmes calculés par le moteur déterministe ;
- `interpretations` — interprétations produites à partir d'un thème.

Les identifiants de projet, de base et de tables sont volontairement laissés à des variables d'environnement. Aucun secret ne doit être commité dans GitHub.

## Variables d'environnement

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=
EXPO_PUBLIC_APPWRITE_DATABASE_ID=
EXPO_PUBLIC_APPWRITE_SOURCES_TABLE_ID=sources
EXPO_PUBLIC_APPWRITE_FIGURES_TABLE_ID=figures
EXPO_PUBLIC_APPWRITE_HOUSES_TABLE_ID=maisons
EXPO_PUBLIC_APPWRITE_FIGURE_HOUSE_TABLE_ID=figure_maison
EXPO_PUBLIC_APPWRITE_THEMES_TABLE_ID=themes
EXPO_PUBLIC_APPWRITE_INTERPRETATIONS_TABLE_ID=interpretations
```

Pour une application Expo, seules les variables `EXPO_PUBLIC_*` nécessaires au client doivent être utilisées. **Aucune clé API serveur Appwrite ne doit être placée dans l'application mobile ou dans le dépôt GitHub.**

## Statut des données

Les mappings BodeDiop détaillés restent marqués comme `verified: false` tant que chaque entrée n'a pas été contrôlée contre sa source. Le schéma ne transforme donc pas une donnée provisoire en vérité canonique.
