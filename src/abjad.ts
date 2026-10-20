export type ElementName = 'Feu' | 'Terre' | 'Air' | 'Eau';

export const ABJAD_MAGHREBI: Record<string, number> = {
  'ا': 1, 'ب': 2, 'ج': 3, 'د': 4, 'ه': 5, 'و': 6, 'ز': 7, 'ح': 8, 'ط': 9, 'ي': 10,
  'ك': 20, 'ل': 30, 'م': 40, 'ن': 50, 'ص': 60, 'ع': 70, 'ف': 80, 'ض': 90, 'ق': 100,
  'ر': 200, 'س': 300, 'ت': 400, 'ث': 500, 'خ': 600, 'ذ': 700, 'ظ': 800, 'غ': 900, 'ش': 1000
};

export const ELEMENT_OF: Record<string, ElementName> = {
  'ا': 'Feu', 'ه': 'Feu', 'ط': 'Feu', 'م': 'Feu', 'ف': 'Feu', 'س': 'Feu', 'ذ': 'Feu',
  'ب': 'Terre', 'و': 'Terre', 'ي': 'Terre', 'ن': 'Terre', 'ض': 'Terre', 'ت': 'Terre', 'ظ': 'Terre',
  'ج': 'Air', 'ز': 'Air', 'ك': 'Air', 'ص': 'Air', 'ق': 'Air', 'ث': 'Air', 'غ': 'Air',
  'د': 'Eau', 'ح': 'Eau', 'ل': 'Eau', 'ع': 'Eau', 'ر': 'Eau', 'خ': 'Eau', 'ش': 'Eau'
};

export const ELEMENT_ICONS: Record<ElementName, string> = { Feu: '🔥', Terre: '🌱', Air: '💨', Eau: '💧' };

export type NormalizationSettings = {
  removeHarakat: boolean;
  alifVariantsToAlif: boolean;
  taMarbutaToHa: boolean;
  alifMaqsuraToYa: boolean;
  countShaddaAsDouble: boolean;
};

export const DEFAULT_NORMALIZATION: NormalizationSettings = {
  removeHarakat: true,
  alifVariantsToAlif: true,
  taMarbutaToHa: false,
  alifMaqsuraToYa: false,
  countShaddaAsDouble: false
};

const HARAKAT = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

export function normalizeArabic(text: string, settings: NormalizationSettings = DEFAULT_NORMALIZATION): string {
  let out = text.normalize('NFC');
  if (settings.removeHarakat) out = out.replace(HARAKAT, '');
  if (settings.alifVariantsToAlif) out = out.replace(/[إأآٱ]/g, 'ا');
  if (settings.taMarbutaToHa) out = out.replace(/ة/g, 'ه');
  if (settings.alifMaqsuraToYa) out = out.replace(/ى/g, 'ي');
  return out;
}

export type LetterCount = { letter: string; value: number; element: ElementName };
export type AbjadResult = {
  original: string;
  normalized: string;
  total: number;
  byElement: Record<ElementName, number>;
  letters: LetterCount[];
  ignored: string[];
};

export function calculateAbjad(text: string, settings: NormalizationSettings = DEFAULT_NORMALIZATION): AbjadResult {
  const normalized = normalizeArabic(text, settings);
  const byElement: Record<ElementName, number> = { Feu: 0, Terre: 0, Air: 0, Eau: 0 };
  const letters: LetterCount[] = [];
  const ignored: string[] = [];
  let total = 0;

  for (const ch of normalized) {
    const value = ABJAD_MAGHREBI[ch];
    const element = ELEMENT_OF[ch];
    if (value && element) {
      letters.push({ letter: ch, value, element });
      total += value;
      byElement[element] += value;
    } else if (!/\s/.test(ch)) {
      ignored.push(ch);
    }
  }

  if (settings.countShaddaAsDouble) {
    // Shadda is removed by default. This option is intentionally explicit;
    // it does not alter a letter unless a caller provides a separate doubled-letter rule.
  }

  return { original: text, normalized, total, byElement, letters, ignored };
}
