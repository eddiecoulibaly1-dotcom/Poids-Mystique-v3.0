# Base de données — Géomancie / Poids Mystique

La base de données de l'application cible **Turso (SQLite/libSQL)**, indépendamment de Supabase et d'Appwrite.

## Architecture

- **GitHub** : code source, moteur déterministe et migrations SQL versionnées.
- **Turso** : données persistantes de l'application.
- **BodeDiop** : source documentaire de référence pour les figures et les maisons.
- **Moteur géomantique** : calcule les figures et les maisons sans intervention de l'IA.
- **IA** : interprète uniquement le résultat structuré fourni par le moteur ; elle ne modifie jamais les calculs.

## Base Turso

Base actuelle : `geomancie`

L'URL de connexion est fournie par Turso sous la forme :

```text
libsql://...
```

Ne jamais commiter le token Turso dans GitHub.

## Variables d'environnement

```env
TURSO_DATABASE_URL=libsql://geomancie-...
TURSO_AUTH_TOKEN=
```

Le token est un secret et doit rester dans l'environnement local/CI, jamais dans le dépôt.

## Schéma

La migration initiale se trouve dans :

`database/migrations/001_initial_schema.sql`

Tables prévues :

- `knowledge_sources` — provenance et vérification des sources ;
- `geomancy_figures` — 16 figures canoniques et leurs attributs ;
- `geomancy_houses` — 16 maisons et leurs domaines ;
- `figure_house_interpretations` — matrice complète de 16 × 16 = 256 combinaisons ;
- `themes` — thèmes calculés par le moteur déterministe ;
- `interpretations` — interprétations produites à partir d'un thème.

Les mappings BodeDiop détaillés restent marqués comme `verified: false` tant que chaque entrée n'a pas été contrôlée contre sa source.

## Règle d'architecture

Le moteur déterministe reste indépendant de Turso. Turso stocke les données et l'historique ; il ne décide jamais du résultat d'un calcul géomantique.
