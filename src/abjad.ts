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
const SHADDA = '\u0651';

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
  reduction: number;
  reductionSteps: number[];
  byElement: Record<ElementName, number>;
  letters: LetterCount[];
  ignored: string[];
  shaddaCount: number;
};

export function reduceNumber(value: number): { value: number; steps: number[] } {
  if (!Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
    throw new RangeError('La réduction exige un entier positif ou nul.');
  }
  const steps = [value];
  let current = value;
  while (current >= 10) {
    current = String(current).split('').reduce((sum, digit) => sum + Number(digit), 0);
    steps.push(current);
  }
  return { value: current, steps };
}

export function calculateAbjad(text: string, settings: NormalizationSettings = DEFAULT_NORMALIZATION): AbjadResult {
  // Marqueur interne : la shadda est capturée avant la suppression des harakât.
  const marker = '\\uE000';
  const prepared = text.normalize('NFC').replace(/\\u0651/g, settings.countShaddaAsDouble ? marker : '');
  const markedNormalized = normalizeArabic(prepared, settings);
  const normalized = markedNormalized.replaceAll(marker, '');
  const byElement: Record<ElementName, number> = { Feu: 0, Terre: 0, Air: 0, Eau: 0 };
  const letters: LetterCount[] = [];
  const ignored: string[] = [];
  let total = 0;
  let shaddaCount = 0;
  let previous: LetterCount | undefined;

  for (const ch of Array.from(markedNormalized)) {
    if (ch === marker) {
      if (settings.countShaddaAsDouble && previous) {
        previous.value += ABJAD_MAGHREBI[previous.letter];
        total += ABJAD_MAGHREBI[previous.letter];
        byElement[previous.element] += ABJAD_MAGHREBI[previous.letter];
        shaddaCount++;
      }
      continue;
    }
    const value = ABJAD_MAGHREBI[ch];
    const element = ELEMENT_OF[ch];
    if (value !== undefined && element) {
      previous = { letter: ch, value, element };
      letters.push(previous);
      total += value;
      byElement[element] += value;
    } else if (!/\\s/.test(ch) && !HARAKAT.test(ch)) {
      HARAKAT.lastIndex = 0;
      ignored.push(ch);
      previous = undefined;
    } else {
      HARAKAT.lastIndex = 0;
    }
  }

  const reduction = reduceNumber(total);
  return {
    original: text, normalized, total,
    reduction: reduction.value, reductionSteps: reduction.steps,
    byElement, letters, ignored, shaddaCount
  };
}
