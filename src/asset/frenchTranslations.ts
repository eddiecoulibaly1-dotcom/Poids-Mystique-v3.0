/**
 * Couche de traduction française uniquement.
 * Les pages sans traduction validée restent absentes de cette table.
 */
export const FRENCH_TRANSLATIONS: Record<string, Record<number, string>> = {
  barhout: {
    2: `J’ai commencé au nom d’Allah, mon Seigneur, en recherchant Son aide,
pour dévoiler le secret contenu dans ce qui a été enveloppé.

Et j’ai prié sur le meilleur de Sa création,
Muhammad, maître de la prière et de la parole.`,
  },
  idrisiyya: {},
};

export function getFrenchTranslation(corpusId: string, page: number): string | undefined {
  return FRENCH_TRANSLATIONS[corpusId]?.[page];
}
