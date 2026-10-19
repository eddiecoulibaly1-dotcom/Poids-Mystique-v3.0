export type ElementName = 'Feu' | 'Terre' | 'Air' | 'Eau';

export const ABJAD_MAGHREBI: Record<string, number> = {
  ا:1, ب:2, ج:3, د:4, ه:5, و:6, ز:7, ح:8, ط:9, ي:10,
  ك:20, ل:30, م:40, ن:50, ص:60, ع:70, ف:80, ض:90, ق:100,
  ر:200, س:300, ت:400, ث:500, خ:600, ذ:700, ظ:800, غ:900, ش:1000
};

export const ELEMENT_BY_LETTER: Record<string, ElementName> = {
  ا:'Feu', ه:'Feu', ط:'Feu', م:'Feu', ف:'Feu', س:'Feu', ذ:'Feu',
  ب:'Terre', و:'Terre', ي:'Terre', ن:'Terre', ض:'Terre', ت:'Terre', ظ:'Terre',
  ج:'Air', ز:'Air', ك:'Air', ص:'Air', ق:'Air', ث:'Air', غ:'Air',
  د:'Eau', ح:'Eau', ل:'Eau', ع:'Eau', ر:'Eau', خ:'Eau', ش:'Eau'
};

export const ELEMENT_ICONS: Record<ElementName, string> = { Feu:'🔥', Terre:'🌱', Air:'💨', Eau:'💧' };

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
const ALIF_VARIANTS = /[أإآٱ]/g;
const SHADDA = '\u0651';

export function normalizeArabic(input: string, s = DEFAULT_NORMALIZATION): string {
  let text = input.normalize('NFC');
  // Keep shadda only when the user explicitly requests double counting.
  if (s.removeHarakat) {
    text = text.replace(s.countShaddaAsDouble ? /[\u0610-\u061A\u064B-\u064F\u0650-\u065F\u0670\u06D6-\u06ED]/g : HARAKAT, '');
  }
  if (s.alifVariantsToAlif) text = text.replace(ALIF_VARIANTS, 'ا');
  if (s.taMarbutaToHa) text = text.replace(/ة/g, 'ه');
  if (s.alifMaqsuraToYa) text = text.replace(/ى/g, 'ي');
  return text;
}

export type LetterResult = { letter: string; value: number; element: ElementName };
export type Calculation = {
  normalized: string;
  total: number;
  counts: Record<ElementName, number>;
  letters: LetterResult[];
  ignored: string[];
};

export function calculateAbjad(input: string, settings = DEFAULT_NORMALIZATION): Calculation {
  const normalized = normalizeArabic(input, settings);
  const letters: LetterResult[] = [];
  const ignored: string[] = [];
  const counts: Record<ElementName, number> = { Feu:0, Terre:0, Air:0, Eau:0 };
  let total = 0;

  let previousArabicLetter: string | null = null;
  for (const ch of normalized) {
    if (ch === SHADDA) {
      if (settings.countShaddaAsDouble && previousArabicLetter) {
        const value = ABJAD_MAGHREBI[previousArabicLetter];
        const element = ELEMENT_BY_LETTER[previousArabicLetter];
        if (value && element) {
          letters.push({ letter: previousArabicLetter, value, element });
          total += value;
          counts[element] += value;
        }
      } else {
        ignored.push(ch);
      }
      continue;
    }
    const value = ABJAD_MAGHREBI[ch];
    const element = ELEMENT_BY_LETTER[ch];
    if (value && element) {
      letters.push({ letter: ch, value, element });
      total += value;
      counts[element] += value;
      previousArabicLetter = ch;
    } else if (!/\s/.test(ch)) {
      ignored.push(ch);
    }
  }
  return { normalized, total, counts, letters, ignored };
}
