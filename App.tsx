import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  ABJAD_MAGHREBI,
  calculateAbjad,
  DEFAULT_NORMALIZATION,
  ELEMENT_BY_LETTER,
  ELEMENT_ICONS,
  ElementName,
  NormalizationSettings,
} from './src/abjad';

import {
  HistoryItem,
  clearHistory as clearStoredHistory,
  loadHistory,
  loadSettings,
  saveHistory,
  saveSettings,
  toggleFavorite,
} from './src/storage';

import { CORPUS } from './src/corpus';
import { CORPUS_PAGES } from './src/asset/corpusPages';
import { getFrenchTranslation } from './src/asset/frenchTranslations';

type Tab = 'calcul' | 'corpus' | 'methode' | 'historique';

type SourceRef = {
  corpusId: string;
  title: string;
  page?: number | null;
};

export default function App() {
  const [tab, setTab] = useState<Tab>('calcul');
  const [text, setText] = useState('محمد');
  const [settings, setSettings] =
    useState<NormalizationSettings>(DEFAULT_NORMALIZATION);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [source, setSource] = useState<SourceRef | undefined>();

  const result = useMemo(
    () => calculateAbjad(text, settings),
    [text, settings]
  );

  useEffect(() => {
    async function initialize() {
      const storedSettings = await loadSettings();

      if (storedSettings) {
        setSettings({
          ...DEFAULT_NORMALIZATION,
          ...storedSettings,
        });
      }

      const storedHistory = await loadHistory();
      setHistory(storedHistory);
    }

    initialize();
  }, []);

  async function calculateAndSave(
    input: string = text,
    sourceRef?: SourceRef
  ) {
    if (!input.trim()) {
      return;
    }

    const calculation = calculateAbjad(input, settings);

    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      input,
      calculation,
      source: sourceRef,
    };

    await saveHistory(item);

    const updatedHistory = await loadHistory();

    setHistory(updatedHistory);
    setText(input);
    setSource(sourceRef);
    setTab('calcul');
  }

  async function updateSetting<K extends keyof NormalizationSettings>(
    key: K,
    value: boolean
  ) {
    const nextSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(nextSettings);
    await saveSettings(nextSettings);
  }

  function clearHistory() {
    if (!history.length) {
      return;
    }

    Alert.alert(
      'Effacer l’historique',
      'Tous les calculs enregistrés seront supprimés.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            await clearStoredHistory();
            setHistory([]);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerLine}>
          <View>
            <Text style={styles.brand}>POIDS MYSTIQUE</Text>
            <Text style={styles.sub}>
              Calculs selon l’Abjad Maghrebi
            </Text>
          </View>

          <Text style={styles.arabicBrand}>الأوزان</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {tab === 'calcul' && (
          <Calculator
            text={text}
            setText={(value) => {
              setText(value);

              if (source) {
                setSource(undefined);
              }
            }}
            result={result}
            source={source}
            calculateAndSave={() => calculateAndSave(text, source)}
          />
        )}

        {tab === 'corpus' && (
          <Corpus
            onCalculate={(input, sourceRef) =>
              calculateAndSave(input, sourceRef)
            }
          />
        )}

        {tab === 'methode' && (
          <Method
            settings={settings}
            updateSetting={updateSetting}
          />
        )}

        {tab === 'historique' && (
          <History
            history={history}
            onSelect={(item) => {
              setText(item.input);
              setSource(item.source);
              setTab('calcul');
            }}
            onFavorite={async (id) => {
              const updated = await toggleFavorite(id);
              setHistory(updated);
            }}
            onClear={clearHistory}
          />
        )}
      </ScrollView>

      <View style={styles.nav}>
        <NavItem
          active={tab === 'calcul'}
          icon="⌁"
          label="Calcul"
          onPress={() => setTab('calcul')}
        />

        <NavItem
          active={tab === 'corpus'}
          icon="▤"
          label="Corpus"
          onPress={() => setTab('corpus')}
        />

        <NavItem
          active={tab === 'methode'}
          icon="☷"
          label="Méthode"
          onPress={() => setTab('methode')}
        />

        <NavItem
          active={tab === 'historique'}
          icon="◷"
          label="Historique"
          onPress={() => setTab('historique')}
        />
      </View>
    </SafeAreaView>
  );
}

function NavItem({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.navItem}
      accessibilityRole="button"
    >
      <Text
        style={[
          styles.navIcon,
          active && styles.navActive,
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.navText,
          active && styles.navActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Calculator({
  text,
  setText,
  result,
  source,
  calculateAndSave,
}: {
  text: string;
  setText: (value: string) => void;
  result: ReturnType<typeof calculateAbjad>;
  source?: SourceRef;
  calculateAndSave: () => void;
}) {
  const max = Math.max(result.total, 1);

  function shareResult() {
    const sourceLine = source
      ? `Source : ${source.title}${
          source.page ? ` — page ${source.page}` : ''
        }`
      : '';

    const message = [
      'Poids Mystique — Abjad Maghrebi',
      `Texte : ${result.normalized || text}`,
      `Total : ${result.total}`,
      `🔥 Feu : ${result.counts.Feu}`,
      `🌱 Terre : ${result.counts.Terre}`,
      `💨 Air : ${result.counts.Air}`,
      `💧 Eau : ${result.counts.Eau}`,
      sourceLine,
    ]
      .filter(Boolean)
      .join('\n');

    Share.share({ message });
  }

  return (
    <>
      <Card>
        <Text style={styles.eyebrow}>CALCULATEUR</Text>

        <Text style={styles.h2}>
          Poids Abjad Maghrebi
        </Text>

        <Text style={styles.note}>
          Calcul numérique brut. Aucun système Mashriqi et aucune
          interprétation religieuse n’est appliqué automatiquement.
        </Text>

        {source && <SourceChip source={source} />}

        <TextInput
          multiline
          value={text}
          onChangeText={setText}
          placeholder="Saisissez un texte arabe…"
          placeholderTextColor="#7c8d84"
          style={styles.input}
          textAlign="right"
        />

        <TouchableOpacity
          style={[
            styles.button,
            !text.trim() && styles.buttonDisabled,
          ]}
          disabled={!text.trim()}
          onPress={calculateAndSave}
        >
          <Text style={styles.buttonText}>
            Calculer et enregistrer
          </Text>
        </TouchableOpacity>
      </Card>

      <Card>
        <Text style={styles.label}>POIDS ABJAD</Text>

        <Text style={styles.total}>
          {result.total}
        </Text>

        <Text style={styles.arabic}>
          {result.normalized || '—'}
        </Text>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={shareResult}
        >
          <Text style={styles.secondaryButtonText}>
            Partager le résultat
          </Text>
        </TouchableOpacity>

        {result.ignored.length > 0 && (
          <Text style={styles.note}>
            Caractères non évalués :{' '}
            {result.ignored.join(' ')}
          </Text>
        )}
      </Card>

      <Card>
        <Text style={styles.h2}>
          Répartition élémentale
        </Text>

        <View>
          {(['Feu', 'Terre', 'Air', 'Eau'] as ElementName[]).map(
            (element) => (
              <ElementRow
                key={element}
                element={element}
                value={result.counts[element]}
                total={result.total}
                max={max}
              />
            )
          )}
        </View>
      </Card>

      <Card>
        <Text style={styles.h2}>
          Détail lettre par lettre
        </Text>

        {result.letters.length === 0 ? (
          <Text style={styles.note}>
            Aucune lettre Abjad reconnue.
          </Text>
        ) : (
          <View style={styles.letters}>
            {result.letters.map((item, index) => (
              <View
                key={`${item.letter}-${index}`}
                style={styles.letter}
              >
                <Text style={styles.big}>
                  {item.letter}
                </Text>

                <Text style={styles.small}>
                  {item.value} · {ELEMENT_ICONS[item.element]}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </>
  );
}

function ElementRow({
  element,
  value,
  total,
  max,
}: {
  element: ElementName;
  value: number;
  total: number;
  max: number;
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  const widthPercentage = Math.min(
    100,
    (value / max) * 100
  );

  return (
    <View style={styles.elementBlock}>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>
          {ELEMENT_ICONS[element]} {element}
        </Text>

        <Text style={styles.value}>
          {value} · {percentage}%
        </Text>
      </View>

      <View style={styles.bar}>
        <View
          style={[
            styles.barFill,
            {
              width: `${widthPercentage}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

function SourceChip({
  source,
}: {
  source: SourceRef;
}) {
  return (
    <View style={styles.sourceChip}>
      <Text style={styles.sourceChipIcon}>
        ◈
      </Text>

      <View style={styles.sourceChipBody}>
        <Text style={styles.sourceChipTitle}>
          {source.title}
        </Text>

        <Text style={styles.sourceChipMeta}>
          {source.page
            ? `Page ${source.page}`
            : 'Référence du corpus'}
        </Text>
      </View>
    </View>
  );
}

function Corpus({
  onCalculate,
}: {
  onCalculate: (
    input: string,
    source: SourceRef
  ) => void;
}) {
  const available = CORPUS.filter(
    (item) => item.available
  );

  const [selected, setSelected] =
    useState<string>('barhout');

  const [page, setPage] =
    useState<string>('1');

  const [passage, setPassage] =
    useState<string>('');

  const book =
    CORPUS.find(
      (item) => item.id === selected
    ) || available[0];

  const currentPage = Math.min(
    book?.pages ?? 1,
    Math.max(1, Number(page) || 1)
  );

  const pageImage =
    CORPUS_PAGES[selected]?.[currentPage];

  const french =
    getFrenchTranslation(
      selected,
      currentPage
    );

  function changePage(delta: number) {
    const nextPage = Math.min(
      book?.pages ?? 1,
      Math.max(1, currentPage + delta)
    );

    setPage(String(nextPage));
    setPassage('');
  }

  function chooseBook(id: string) {
    setSelected(id);
    setPage('1');
    setPassage('');
  }

  if (!book) {
    return (
      <Card>
        <Text style={styles.h2}>
          Corpus
        </Text>

        <Text style={styles.note}>
          Aucun document disponible.
        </Text>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Text style={styles.eyebrow}>
          CORPUS
        </Text>

        <Text style={styles.h2}>
          Bibliothèque arabe · français
        </Text>

        <Text style={styles.note}>
          Les documents fournis sont conservés
          comme pages arabes. La seule couche
          textuelle ajoutée est la traduction
          française lorsqu’elle est validée.
          Aucun autre texte de transcription
          n’est conservé.
        </Text>

        {available.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.corpus,
              item.id === selected &&
                styles.corpusSelected,
            ]}
            onPress={() =>
              chooseBook(item.id)
            }
          >
            <View style={styles.corpusTop}>
              <Text style={styles.corpusTitle}>
                {item.title}
              </Text>

              <Text style={styles.pageBadge}>
                {item.pages} p.
              </Text>
            </View>

            <Text style={styles.arabicSmall}>
              {item.subtitle}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.unavailableList}>
          <Text style={styles.smallTitle}>
            Autres corpus prévus
          </Text>

          {CORPUS.filter(
            (item) => !item.available
          ).map((item) => (
            <View
              key={item.id}
              style={styles.planned}
            >
              <Text style={styles.plannedTitle}>
                {item.title}
              </Text>

              <Text style={styles.small}>
                {item.source}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.eyebrow}>
          LECTEUR
        </Text>

        <Text style={styles.h2}>
          {book.title}
        </Text>

        <Text style={styles.arabic}>
          {book.subtitle}
        </Text>

        <View style={styles.pdfFrame}>
          {pageImage ? (
            <Image
              source={pageImage}
              style={styles.pdfImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.emptyPage}>
              <Text style={styles.note}>
                Page non disponible.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.readerPage}>
          <Text style={styles.readerLabel}>
            PAGE
          </Text>

          <TextInput
            value={page}
            onChangeText={(value) =>
              setPage(
                value.replace(
                  /[^0-9]/g,
                  ''
                )
              )
            }
            keyboardType="number-pad"
            style={styles.pageInput}
          />

          <Text style={styles.readerOf}>
            / {book.pages}
          </Text>
        </View>

        <View style={styles.readerControls}>
          <TouchableOpacity
            style={styles.pageButton}
            onPress={() =>
              changePage(-1)
            }
          >
            <Text style={styles.pageButtonText}>
              ‹
            </Text>
          </TouchableOpacity>

          <Text style={styles.currentPage}>
            Page {currentPage}
          </Text>

          <TouchableOpacity
            style={styles.pageButton}
            onPress={() =>
              changePage(1)
            }
          >
            <Text style={styles.pageButtonText}>
              ›
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card>
        <Text style={styles.eyebrow}>
          ARABE → FRANÇAIS
        </Text>

        <Text style={styles.h2}>
          Page {currentPage}
        </Text>

        {french ? (
          <View style={styles.translation}>
            <Text style={styles.translationTitle}>
              Traduction française
            </Text>

            <Text style={styles.translationText}>
              {french}
            </Text>
          </View>
        ) : (
          <View
            style={styles.translationPending}
          >
            <Text style={styles.translationTitle}>
              Traduction française
            </Text>

            <Text style={styles.note}>
              Cette page n’a pas encore de
              traduction française validée.
              Aucune autre transcription
              n’est affichée.
            </Text>
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.eyebrow}>
          CALCULER UN PASSAGE
        </Text>

        <SourceChip
          source={{
            corpusId: book.id,
            title: book.title,
            page: currentPage,
          }}
        />

        <Text style={styles.note}>
          Saisissez manuellement le passage
          arabe visible sur cette page. Le
          texte saisi sert uniquement au calcul
          et la référence du livre/page est
          enregistrée avec le résultat.
        </Text>

        <TextInput
          multiline
          value={passage}
          onChangeText={setPassage}
          placeholder="Passage arabe…"
          placeholderTextColor="#7c8d84"
          style={styles.input}
          textAlign="right"
        />

        <TouchableOpacity
          style={[
            styles.button,
            !passage.trim() &&
              styles.buttonDisabled,
          ]}
          disabled={!passage.trim()}
          onPress={() =>
            onCalculate(passage, {
              corpusId: book.id,
              title: book.title,
              page: currentPage,
            })
          }
        >
          <Text style={styles.buttonText}>
            Calculer ce passage
          </Text>
        </TouchableOpacity>
      </Card>
    </>
  );
}

function Method({
  settings,
  updateSetting,
}: {
  settings: NormalizationSettings;
  updateSetting: <
    K extends keyof NormalizationSettings
  >(
    key: K,
    value: boolean
  ) => Promise<void>;
}) {
  const elementLetters: Record<
    ElementName,
    string
  > = {
    Feu: 'ا ه ط م ف س ذ',
    Terre: 'ب و ي ن ض ت ظ',
    Air: 'ج ز ك ص ق ث غ',
    Eau: 'د ح ل ع ر خ ش',
  };

  const normalizationOptions: Array<
    [
      keyof NormalizationSettings,
      string
    ]
  > = [
    [
      'removeHarakat',
      'Retirer les signes vocaliques',
    ],
    [
      'alifVariantsToAlif',
      'أ إ آ ٱ → ا',
    ],
    [
      'taMarbutaToHa',
      'ة → ه',
    ],
    [
      'alifMaqsuraToYa',
      'ى → ي',
    ],
    [
      'countShaddaAsDouble',
      'Compter la shadda deux fois',
    ],
  ];

  return (
    <>
      <Card>
        <Text style={styles.eyebrow}>
          MÉTHODE
        </Text>

        <Text style={styles.h2}>
          Abjad Maghrebi exclusivement
        </Text>

        <Text style={styles.note}>
          Référence fixe de l’application.
          Les valeurs ci-dessous ne sont pas
          remplacées par un autre système.
        </Text>

        <View style={styles.grid}>
          {Object.entries(
            ABJAD_MAGHREBI
          ).map(([letter, value]) => {
            const element =
              ELEMENT_BY_LETTER[letter];

            return (
              <View
                style={styles.cell}
                key={letter}
              >
                <Text style={styles.big}>
                  {letter}
                </Text>

                <Text style={styles.cellValue}>
                  {value}
                </Text>

                <Text style={styles.tiny}>
                  {element
                    ? ELEMENT_ICONS[element]
                    : ''}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text style={styles.h2}>
          Éléments
        </Text>

        {(
          ['Feu', 'Terre', 'Air', 'Eau'] as ElementName[]
        ).map((element) => (
          <View
            key={element}
            style={styles.row}
          >
            <Text style={styles.rowLabel}>
              {ELEMENT_ICONS[element]} {element}
            </Text>

            <Text style={styles.value}>
              {elementLetters[element]}
            </Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.h2}>
          Normalisation
        </Text>

        {normalizationOptions.map(
          ([key, label]) => (
            <TouchableOpacity
              key={key}
              style={styles.setting}
              onPress={() =>
                updateSetting(
                  key,
                  !settings[key]
                )
              }
            >
              <Text style={styles.rowLabel}>
                {label}
              </Text>

              <Text style={styles.value}>
                {settings[key]
                  ? '✓'
                  : '○'}
              </Text>
            </TouchableOpacity>
          )
        )}
      </Card>

      <Card>
        <Text style={styles.h2}>
          Règle de séparation
        </Text>

        <Text style={styles.note}>
          Le calcul Abjad est présenté comme
          un résultat numérique transparent.
          Aucune règle de « Poids Mystique »
          dérivée n’est inventée dans le moteur
          tant qu’elle n’a pas été définie
          explicitement.
        </Text>
      </Card>
    </>
  );
}

function History({
  history,
  onSelect,
  onFavorite,
  onClear,
}: {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onFavorite: (id: string) => void;
  onClear: () => void;
}) {
  const [
    favoritesOnly,
    setFavoritesOnly,
  ] = useState(false);

  const shown = favoritesOnly
    ? history.filter(
        (item) => item.favorite
      )
    : history;

  return (
    <Card>
      <View style={styles.historyHeader}>
        <View>
          <Text style={styles.h2}>
            Historique
          </Text>

          <Text style={styles.small}>
            {shown.length} affiché(s) ·{' '}
            {history.length} total
          </Text>
        </View>

        <View style={styles.historyActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() =>
              setFavoritesOnly(
                !favoritesOnly
              )
            }
          >
            <Text style={styles.filterText}>
              {favoritesOnly
                ? 'Tous'
                : '★ Favoris'}
            </Text>
          </TouchableOpacity>

          {history.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={onClear}
            >
              <Text style={styles.clearText}>
                Effacer
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {shown.length === 0 ? (
        <Text style={styles.note}>
          {favoritesOnly
            ? 'Aucun favori enregistré.'
            : 'Aucun calcul enregistré.'}
        </Text>
      ) : (
        shown.map((item) => (
          <View
            key={item.id}
            style={styles.history}
          >
            <TouchableOpacity
              style={styles.historyMain}
              onPress={() =>
                onSelect(item)
              }
            >
              <Text style={styles.arabic}>
                {item.input}
              </Text>

              <Text style={styles.note}>
                {item.calculation.total} ·{' '}
                {new Date(
                  item.createdAt
                ).toLocaleString()}
              </Text>

              {item.source && (
                <Text
                  style={styles.sourceLine}
                >
                  ◈ {item.source.title}
                  {item.source.page
                    ? ` · p. ${item.source.page}`
                    : ''}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                onFavorite(item.id)
              }
              style={styles.favorite}
            >
              <Text
                style={styles.favoriteText}
              >
                {item.favorite
                  ? '★'
                  : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </Card>
  );
}

function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f7f3e8',
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#f7f3e8',
    borderBottomWidth: 1,
    borderBottomColor: '#e5dcc8',
  },

  headerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brand: {
    color: '#0b5747',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: 2.5,
  },

  arabicBrand: {
    color: '#b88b35',
    fontSize: 25,
  },

  sub: {
    color: '#68776f',
    marginTop: 6,
    fontSize: 13,
  },

  content: {
    padding: 16,
    paddingBottom: 108,
    gap: 14,
  },

  card: {
    backgroundColor: '#fffdf6',
    borderWidth: 1,
    borderColor: '#e3d7bd',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#8d7750',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  eyebrow: {
    color: '#b18a3a',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },

  h2: {
    color: '#124f43',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },

  label: {
    color: '#7c887f',
    letterSpacing: 1.5,
    fontSize: 12,
  },

  total: {
    color: '#0b5747',
    fontSize: 54,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 8,
  },

  arabic: {
    color: '#173f37',
    fontSize: 25,
    textAlign: 'right',
  },

  arabicSmall: {
    color: '#173f37',
    fontSize: 19,
    textAlign: 'right',
    marginTop: 6,
  },

  input: {
    minHeight: 128,
    borderWidth: 1,
    borderColor: '#d9cba9',
    borderRadius: 16,
    color: '#173f37',
    fontSize: 24,
    padding: 14,
    marginVertical: 12,
    backgroundColor: '#fffef9',
  },

  button: {
    backgroundColor: '#0b5747',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
  },

  buttonDisabled: {
    opacity: 0.45,
  },

  buttonText: {
    color: '#fffaf0',
    fontWeight: '800',
    fontSize: 16,
  },

  secondaryButton: {
    backgroundColor: '#f5f0e3',
    padding: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e3d7bd',
  },

  secondaryButtonText: {
    color: '#0b5747',
    fontWeight: '800',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee7d7',
  },

  rowLabel: {
    color: '#36544c',
    fontSize: 15,
  },

  value: {
    color: '#0b5747',
    fontWeight: '800',
    maxWidth: '70%',
    textAlign: 'right',
  },

  elementBlock: {
    marginBottom: 8,
  },

  bar: {
    height: 7,
    backgroundColor: '#eee7d7',
    borderRadius: 8,
    overflow: 'hidden',
  },

  barFill: {
    height: '100%',
    backgroundColor: '#b88b35',
    borderRadius: 8,
  },

  letters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  letter: {
    width: 72,
    backgroundColor: '#f5f0e3',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },

  big: {
    fontSize: 25,
    color: '#173f37',
  },

  small: {
    fontSize: 11,
    color: '#78847d',
  },

  tiny: {
    fontSize: 10,
    color: '#78847d',
  },

  note: {
    color: '#68776f',
    lineHeight: 21,
  },

  corpus: {
    padding: 15,
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: '#f5f0e3',
    borderWidth: 1,
    borderColor: '#e3d7bd',
  },

  corpusSelected: {
    borderColor: '#b88b35',
    backgroundColor: '#fbf6e9',
  },

  corpusTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pageBadge: {
    color: '#8c6b2c',
    fontSize: 11,
    fontWeight: '800',
  },

  corpusTitle: {
    color: '#124f43',
    fontSize: 17,
    fontWeight: '700',
  },

  unavailableList: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee7d7',
  },

  smallTitle: {
    color: '#124f43',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },

  planned: {
    paddingVertical: 9,
  },

  plannedTitle: {
    color: '#6d756f',
    fontWeight: '700',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 10,
  },

  cell: {
    width: 57,
    height: 70,
    backgroundColor: '#f5f0e3',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cellValue: {
    color: '#8c6b2c',
    fontSize: 13,
  },

  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#eee7d7',
  },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  historyActions: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },

  history: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#eee7d7',
    flexDirection: 'row',
    alignItems: 'center',
  },

  historyMain: {
    flex: 1,
  },

  pdfFrame: {
    height: 460,
    marginTop: 14,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#ece5d6',
    borderWidth: 1,
    borderColor: '#d9cba9',
  },

  pdfImage: {
    width: '100%',
    height: '100%',
  },

  emptyPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sourceLine: {
    color: '#8c6b2c',
    fontSize: 12,
    marginTop: 5,
  },

  favorite: {
    padding: 8,
    width: 44,
    alignItems: 'center',
  },

  favoriteText: {
    fontSize: 25,
    color: '#b88b35',
  },

  readerPage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },

  readerLabel: {
    color: '#7c887f',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  pageInput: {
    width: 64,
    height: 44,
    borderWidth: 1,
    borderColor: '#d9cba9',
    borderRadius: 12,
    textAlign: 'center',
    color: '#173f37',
    fontSize: 18,
    backgroundColor: '#fffef9',
  },

  readerOf: {
    color: '#68776f',
    fontSize: 16,
  },

  readerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  pageButton: {
    width: 48,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f5f0e3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e3d7bd',
  },

  pageButtonText: {
    fontSize: 28,
    color: '#0b5747',
  },

  currentPage: {
    color: '#36544c',
    fontWeight: '700',
  },

  translation: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#f7f3e8',
    borderWidth: 1,
    borderColor: '#d9cba9',
  },

  translationPending: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fbf6e9',
    borderWidth: 1,
    borderColor: '#e3d7bd',
  },

  translationTitle: {
    color: '#124f43',
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 7,
  },

  translationText: {
    color: '#36544c',
    fontSize: 16,
    lineHeight: 24,
  },

  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f5f0e3',
    borderWidth: 1,
    borderColor: '#e3d7bd',
    borderRadius: 12,
    padding: 11,
    marginTop: 8,
    marginBottom: 4,
  },

  sourceChipIcon: {
    color: '#b88b35',
    fontSize: 18,
  },

  sourceChipBody: {
    flex: 1,
  },

  sourceChipTitle: {
    color: '#124f43',
    fontWeight: '800',
  },

  sourceChipMeta: {
    color: '#78847d',
    fontSize: 11,
    marginTop: 2,
  },

  filterButton: {
    borderWidth: 1,
    borderColor: '#b88b35',
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  filterText: {
    color: '#7d6029',
    fontWeight: '800',
  },

  clearButton: {
    borderWidth: 1,
    borderColor: '#d8c7ae',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  clearText: {
    color: '#765d3c',
    fontSize: 12,
    fontWeight: '700',
  },

  nav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: '#fffdf6',
    borderTopWidth: 1,
    borderTopColor: '#ddd2b9',
    flexDirection: 'row',
    paddingBottom: 4,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    fontSize: 18,
    color: '#718078',
    marginBottom: 2,
  },

  navText: {
    color: '#718078',
    fontSize: 10,
  },

  navActive: {
    color: '#0b5747',
    fontWeight: '800',
  },
});