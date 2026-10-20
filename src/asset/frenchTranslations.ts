/**
 * Traductions françaises validées.
 *
 * Les deux PDF fournis ne contiennent pas de traduction française vérifiée.
 * Le lecteur n'affiche donc pas de traduction inventée. Ajouter ici uniquement
 * des traductions françaises vérifiées, indexées par livre puis par page.
 */
export const FRENCH_TRANSLATIONS: Record<string, Record<number, string>> = {
  barhout: {},
  idrisiyya: {}
};

export function getFrenchTranslation(bookId: string, page: number): string | undefined {
  return FRENCH_TRANSLATIONS[bookId]?.[page];
}
