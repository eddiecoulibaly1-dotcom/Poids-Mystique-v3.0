# Poids Mystique — v3.0.0 Release Candidate

Application React Native + Expo autonome, hors Lovable.

## Fonctionnalités
- Abjad Maghrebi exclusivement.
- Valeurs et classification élémentale verrouillées.
- Calcul brut, détail lettre par lettre et répartition élémentale.
- Normalisation arabe configurable.
- Corpus arabe + français pour Livre Barhout et Les Noms d’Idris.
- 34 pages Barhout et 66 pages Idris, sous forme d’images de pages arabes.
- Traduction française affichée uniquement lorsqu’elle est validée.
- Aucune translittération, transcription latine/turque ou OCR affiché dans le corpus.
- Référence livre/page attachée aux calculs.
- Historique et favoris locaux.
- Partage du résultat.
- Interface crème, vert profond et or.
- Emplacements préparés pour Coran, Dalā’il al-Khayrāt et Al-Burda sans contenu non autorisé.

## Vérification
```bash
npm install
npm run validate:release
```

Le test de référence est `محمد = 92` : Feu 80, Eau 12, Terre 0, Air 0.

## Lancer
```bash
npm start
```

## Android
Pour un APK de test avec EAS :
```bash
npx eas build --platform android --profile preview
```

Pour Google Play (AAB) :
```bash
npx eas build --platform android --profile production
```

Un compte Expo/EAS et une connexion réseau sont nécessaires pour ces builds distants.
