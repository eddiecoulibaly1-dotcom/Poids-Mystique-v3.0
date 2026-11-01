# Poids Mystique — version indépendante

Application React Native + Expo, sans Lovable.

## Règle de calcul officielle

Le moteur utilise exclusivement les valeurs d'Abjad maghrébin définies dans `src/abjad.ts`.
Aucune valeur d'Abjad mashriqi/oriental n'est utilisée.

## Corpus actuellement embarqué

- Livre Barhout — 34 pages
- Les Noms Idrīsiyya — 66 pages

Les pages sont embarquées sous `src/asset/corpus/` et référencées exclusivement depuis `src/asset/corpusPages.ts`.

## Traductions françaises

Les PDF fournis ne contiennent pas de traduction française vérifiée. Le projet ne fabrique donc pas de traduction religieuse. `src/asset/frenchTranslations.ts` est prêt à recevoir des traductions françaises vérifiées page par page.

## Vérification

```bash
npm install
npm run typecheck
npm run test:engine
```

Les tests importent et exécutent directement `src/abjad.ts` après transpilation TypeScript. Ils ne maintiennent plus une copie indépendante de la table Abjad.

## Build Android preview

```bash
eas build --platform android --profile preview
```

Les corrections préparatoires sont développées sur `improvement/v0.3-audit`. La branche `main` reste inchangée jusqu'à validation.
