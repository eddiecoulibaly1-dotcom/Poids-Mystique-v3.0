export type CorpusBook = {
  id: 'barhout' | 'idrisiyya' | 'burda' | 'ajnas' | 'jawshan' | 'toukhi';
  title: string;
  subtitle: string;
  pages: number | null;
  source: string;
  file?: string;
  available: boolean;
};

/**
 * Corpus de référence convenu pour Poids Mystique.
 * available indique que les pages sont déjà embarquées dans cette application,
 * et non que l'ouvrage est simplement répertorié.
 */
export const CORPUS: CorpusBook[] = [
  {
    id: 'barhout',
    title: 'Livre Barhout',
    subtitle: 'Celcelûtiye Kasidesi',
    pages: 34,
    source: '34 pages déjà intégrées depuis le document fourni.',
    file: 'Livre Barhout.pdf',
    available: true
  },
  {
    id: 'idrisiyya',
    title: 'Sirr Idrissiya',
    subtitle: 'الروضة السندسية في الأسماء الإدريسية السهرورية',
    pages: 66,
    source: '66 pages déjà intégrées depuis le document fourni.',
    file: 'Les Noms Idrīsiyya.pdf',
    available: true
  },
  {
    id: 'burda',
    title: 'Al-Bourda — Cheikh Samba Diagne',
    subtitle: 'La Bourdah',
    pages: 87,
    source: '87 images de pages repérées dans le dépôt Miftah-al-huruf. Leur transfert dans Poids Mystique reste à effectuer.',
    available: false
  },
  {
    id: 'ajnas',
    title: 'Kitāb al-Ajnās',
    subtitle: 'كتاب الأجناس',
    pages: null,
    source: 'Ouvrage répertorié dans le corpus convenu. Le document original reste à intégrer.',
    available: false
  },
  {
    id: 'jawshan',
    title: 'Duʿāʾ al-Jawshan al-Kabīr',
    subtitle: 'الجوشن الكبير',
    pages: null,
    source: 'Ouvrage répertorié dans le corpus convenu. Le document original reste à intégrer.',
    available: false
  },
  {
    id: 'toukhi',
    title: 'Toukhi — Utilisation des lettres et guérisons',
    subtitle: 'Document de référence',
    pages: null,
    source: 'Ouvrage répertorié dans le corpus convenu. Le document original reste à intégrer.',
    available: false
  }
];
