export type CorpusBook = {
  id: 'quran' | 'dalail' | 'burda' | 'barhout' | 'idrisiyya';
  title: string;
  subtitle: string;
  pages: number | null;
  source: string;
  file?: string;
  available: boolean;
};

export const CORPUS: CorpusBook[] = [
  {
    id: 'quran',
    title: 'Coran',
    subtitle: 'القرآن الكريم',
    pages: null,
    source: 'Corpus à intégrer depuis une édition autorisée.',
    available: false,
  },

  {
    id: 'dalail',
    title: 'Dalā’il al-Khayrāt',
    subtitle: 'دلائل الخيرات',
    pages: null,
    source: 'Corpus à intégrer depuis une édition autorisée.',
    available: false,
  },

  {
    id: 'burda',
    title: 'Al-Burda',
    subtitle: 'قصيدة البردة',
    pages: null,
    source: 'Corpus à intégrer depuis une édition autorisée.',
    available: false,
  },

  {
    id: 'barhout',
    title: 'Livre Barhout',
    subtitle: 'Celcelûtiye Kasidesi',
    pages: 34,
    source: 'PDF fourni par l’utilisateur.',
    file: 'Livre Barhout.pdf',
    available: true,
  },

  {
    id: 'idrisiyya',
    title: 'Les Noms Idrīsiyya',
    subtitle: 'الروضة السندسية في الأسماء الإدريسية السهروردية',
    pages: 66,
    source: 'PDF fourni par l’utilisateur.',
    file: 'Les Noms Idrīsiyya.pdf',
    available: true,
  },
];