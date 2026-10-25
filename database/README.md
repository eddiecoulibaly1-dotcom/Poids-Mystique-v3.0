# Base de données — Géomancie / Poids Mystique

La base de données de l'application est prévue sur **Turso (SQLite/libSQL)**, indépendamment de Supabase.

## Architecture

- **GitHub** : code source, moteur déterministe et migrations SQL.
- **Turso** : données persistantes de l'application.
- **BodeDiop** : source documentaire de référence pour les figures et les maisons.
- **Moteur géomantique** : calcule les figures et les maisons sans intervention de l'IA.
- **IA** : interprète uniquement le résultat structuré fourni par le moteur.

## Variables d'environnement

Ne jamais mettre de secret dans GitHub.

```env
TURSO_DATABASE_URL=libsql://votre-base.turso.io
TURSO_AUTH_TOKEN=votre_token
```

## Migration initiale

La première migration est :

`database/migrations/001_initial_schema.sql`

Elle contient les tables pour :

- figures géomantiques ;
- maisons ;
- interprétations Figure × Maison ;
- thèmes calculés ;
- interprétations IA ;
- sources documentaires ;
- métadonnées de l'application.

Les données BodeDiop détaillées restent marquées comme vérifiables tant que chaque entrée n'a pas été contrôlée contre sa source.
