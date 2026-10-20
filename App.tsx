import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ABJAD_MAGHREBI, calculateAbjad, DEFAULT_NORMALIZATION, ELEMENT_ICONS, type ElementName } from './src/abjad';
import { CORPUS } from './src/corpus';
import { CORPUS_PAGES } from './src/asset/corpusPages';
import { getFrenchTranslation } from './src/asset/frenchTranslations';
import { loadHistory, saveHistory, type SavedCalculation } from './src/storage';

const GREEN = '#0D2A22';
const GOLD = '#B28A3A';
const CREAM = '#F7F3E8';
const CARD = '#FFFDF7';
const TEXT = '#1E2B26';

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function ElementRow({ name, value, total }: { name: ElementName; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <View style={styles.elementRow}>
      <Text style={styles.elementName}>{ELEMENT_ICONS[name]} {name}</Text>
      <Text style={styles.elementValue}>{value} · {pct}%</Text>
    </View>
  );
}

function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={styles.header}>
      {onBack ? <Pressable onPress={onBack} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable> : <View style={{ width: 38 }} />}
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 38 }} />
    </View>
  );
}

function Calculator({ onSaved }: { onSaved: () => void }) {
  const [text, setText] = useState('');
  const [history, setHistory] = useState<SavedCalculation[]>([]);
  const result = useMemo(() => calculateAbjad(text, DEFAULT_NORMALIZATION), [text]);

  useEffect(() => { loadHistory().then(setHistory).catch(() => undefined); }, []);

  async function save() {
    if (!text.trim() || !result.total) {
      Alert.alert('Texte requis', 'Saisissez un texte arabe contenant des lettres du système maghrébin.');
      return;
    }
    const item: SavedCalculation = {
      id: Date.now().toString(), text, total: result.total, byElement: result.byElement, createdAt: new Date().toISOString()
    };
    const next = [item, ...history].slice(0, 100);
    setHistory(next);
    await saveHistory(next);
    onSaved();
    Alert.alert('Enregistré', 'Le calcul a été ajouté à l’historique.');
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>CALCUL MAGHRÉBIN</Text>
      <Text style={styles.pageTitle}>Poids Mystique</Text>
      <Text style={styles.subtitle}>Calcul transparent selon l’Abjad maghrébin officiel.</Text>
      <Card>
        <Text style={styles.label}>Texte arabe</Text>
        <TextInput value={text} onChangeText={setText} placeholder="اكتب هنا" placeholderTextColor="#A7A093" multiline textAlign="right" style={styles.input} />
        <View style={styles.totalBox}>
          <Text style={styles.smallLabel}>POIDS ABJAD</Text>
          <Text style={styles.total}>{result.total}</Text>
          <Text style={styles.normalized}>Normalisé : {result.normalized || '—'}</Text>
        </View>
        <Pressable onPress={save} style={styles.primary}><Text style={styles.primaryText}>Enregistrer le calcul</Text></Pressable>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Répartition élémentaire</Text>
        {(['Feu', 'Terre', 'Air', 'Eau'] as ElementName[]).map(e => <ElementRow key={e} name={e} value={result.byElement[e]} total={result.total} />)}
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Détail lettre par lettre</Text>
        {result.letters.length === 0 ? <Text style={styles.muted}>Les lettres reconnues apparaîtront ici.</Text> : result.letters.map((x, i) => <Text key={`${x.letter}-${i}`} style={styles.letterLine}>{x.letter}  =  {x.value}  ·  {ELEMENT_ICONS[x.element]} {x.element}</Text>)}
        {result.ignored.length > 0 && <Text style={styles.muted}>Caractères ignorés : {Array.from(new Set(result.ignored)).join(' ')}</Text>}
      </Card>
    </ScrollView>
  );
}

function Corpus({ onBack }: { onBack: () => void }) {
  const available = CORPUS.filter(b => b.available);
  const [selected, setSelected] = useState(available[0]?.id ?? 'barhout');
  const book = CORPUS.find(b => b.id === selected)!;
  const [page, setPage] = useState(1);
  const pageImage = CORPUS_PAGES[selected]?.[page];
  const french = getFrenchTranslation(selected, page);

  useEffect(() => { setPage(1); }, [selected]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Header title="Corpus" onBack={onBack} />
      <View style={styles.bookTabs}>{available.map(b => <Pressable key={b.id} onPress={() => setSelected(b.id)} style={[styles.bookTab, selected === b.id && styles.bookTabActive]}><Text style={[styles.bookTabText, selected === b.id && styles.bookTabTextActive]}>{b.title}</Text></Pressable>)}</View>
      <Text style={styles.subtitle}>{book.subtitle}</Text>
      <Card>
        {pageImage ? <Image source={pageImage} style={styles.pageImage} resizeMode="contain" /> : <Text style={styles.muted}>Page indisponible.</Text>}
        <View style={styles.pageNav}>
          <Pressable disabled={page <= 1} onPress={() => setPage(p => Math.max(1, p - 1))} style={[styles.navButton, page <= 1 && styles.disabled]}><Text style={styles.navText}>‹</Text></Pressable>
          <Text style={styles.pageNumber}>Page {page} / {book.pages}</Text>
          <Pressable disabled={page >= (book.pages ?? 1)} onPress={() => setPage(p => Math.min(book.pages ?? p, p + 1))} style={[styles.navButton, page >= (book.pages ?? 1) && styles.disabled]}><Text style={styles.navText}>›</Text></Pressable>
        </View>
        <TextInput value={String(page)} onChangeText={v => { const n = Number(v.replace(/\D/g, '')); if (n >= 1 && n <= (book.pages ?? 1)) setPage(n); }} keyboardType="number-pad" style={styles.pageInput} />
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Traduction française</Text>
        <Text style={styles.translation}>{french ?? 'Aucune traduction française vérifiée n’est embarquée pour cette page. Le texte source est conservé sans transcription ni traduction inventée.'}</Text>
      </Card>
    </ScrollView>
  );
}

function Method({ onBack }: { onBack: () => void }) {
  const letters = Object.entries(ABJAD_MAGHREBI);
  return <ScrollView contentContainerStyle={styles.content}><Header title="Méthode" onBack={onBack} /><Card><Text style={styles.cardTitle}>Abjad maghrébin officiel</Text><Text style={styles.muted}>Aucune valeur orientale/mashriqi n’est utilisée.</Text><View style={styles.table}>{letters.map(([l, v]) => <View key={l} style={styles.cell}><Text style={styles.arabic}>{l}</Text><Text style={styles.cellValue}>{v}</Text></View>)}</View></Card><Card><Text style={styles.cardTitle}>Normalisation</Text><Text style={styles.muted}>Harakat supprimées par défaut. Variantes d’alif ramenées à ا. ة et ى restent distinctes par défaut.</Text></Card></ScrollView>;
}

function History({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<SavedCalculation[]>([]);
  useEffect(() => { loadHistory().then(setItems).catch(() => undefined); }, []);
  return <ScrollView contentContainerStyle={styles.content}><Header title="Historique" onBack={onBack} />{items.length === 0 ? <Card><Text style={styles.muted}>Aucun calcul enregistré.</Text></Card> : items.map(item => <Card key={item.id}><Text style={styles.historyText} numberOfLines={2}>{item.text}</Text><Text style={styles.historyTotal}>{item.total}</Text><Text style={styles.muted}>{new Date(item.createdAt).toLocaleString()}</Text></Card>)}</ScrollView>;
}

export default function App() {
  const [screen, setScreen] = useState<'home' | 'corpus' | 'method' | 'history'>('home');
  return <SafeAreaView style={styles.safe}><StatusBar style="dark" /><View style={styles.app}>
    {screen === 'home' && <Calculator onSaved={() => undefined} />}
    {screen === 'corpus' && <Corpus onBack={() => setScreen('home')} />}
    {screen === 'method' && <Method onBack={() => setScreen('home')} />}
    {screen === 'history' && <History onBack={() => setScreen('home')} />}
    <View style={styles.bottomNav}>
      <Nav active={screen === 'home'} label="Calcul" onPress={() => setScreen('home')} />
      <Nav active={screen === 'corpus'} label="Corpus" onPress={() => setScreen('corpus')} />
      <Nav active={screen === 'method'} label="Méthode" onPress={() => setScreen('method')} />
      <Nav active={screen === 'history'} label="Historique" onPress={() => setScreen('history')} />
    </View>
  </View></SafeAreaView>;
}

function Nav({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.navItem}><Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  app: { flex: 1, backgroundColor: CREAM },
  content: { padding: 18, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EAE4D5', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 30, color: GREEN, marginTop: -4 },
  headerTitle: { color: GREEN, fontSize: 20, fontWeight: '700' },
  eyebrow: { color: GOLD, fontSize: 11, letterSpacing: 2, fontWeight: '800', marginTop: 8 },
  pageTitle: { color: GREEN, fontSize: 34, fontWeight: '800', marginTop: 4 },
  subtitle: { color: '#6B7069', fontSize: 14, lineHeight: 21, marginBottom: 16 },
  card: { backgroundColor: CARD, borderRadius: 18, borderWidth: 1, borderColor: '#E8E0D0', padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  label: { color: GREEN, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: { minHeight: 110, borderWidth: 1, borderColor: '#DED5C4', borderRadius: 14, padding: 14, color: TEXT, fontSize: 26, backgroundColor: '#FFFEFA' },
  totalBox: { marginTop: 14, padding: 18, borderRadius: 14, backgroundColor: '#F1EBDD', alignItems: 'center' },
  smallLabel: { color: GOLD, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  total: { color: GREEN, fontSize: 42, fontWeight: '800', marginVertical: 2 },
  normalized: { color: '#77766F', fontSize: 12 },
  primary: { marginTop: 14, backgroundColor: GREEN, borderRadius: 13, paddingVertical: 14, alignItems: 'center' },
  primaryText: { color: '#FFFDF7', fontWeight: '800' },
  cardTitle: { color: GREEN, fontSize: 17, fontWeight: '800', marginBottom: 12 },
  elementRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE7D9' },
  elementName: { color: TEXT, fontSize: 15, fontWeight: '600' },
  elementValue: { color: GREEN, fontWeight: '800' },
  letterLine: { color: TEXT, fontSize: 17, paddingVertical: 5, textAlign: 'right' },
  muted: { color: '#77766F', lineHeight: 20 },
  bookTabs: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  bookTab: { flex: 1, paddingVertical: 11, borderRadius: 12, borderWidth: 1, borderColor: '#D9D0BF', alignItems: 'center' },
  bookTabActive: { backgroundColor: GREEN, borderColor: GREEN },
  bookTabText: { color: GREEN, fontWeight: '700', fontSize: 12 },
  bookTabTextActive: { color: '#FFFDF7' },
  pageImage: { width: '100%', height: 560, backgroundColor: '#F0ECE3' },
  pageNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  navButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  navText: { color: '#FFFDF7', fontSize: 28, marginTop: -3 },
  pageNumber: { color: GREEN, fontWeight: '800' },
  pageInput: { alignSelf: 'center', marginTop: 10, width: 70, borderWidth: 1, borderColor: '#D9D0BF', borderRadius: 10, padding: 8, textAlign: 'center', color: GREEN },
  disabled: { opacity: 0.3 },
  translation: { color: TEXT, lineHeight: 23, fontSize: 15 },
  table: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  cell: { width: '16.66%', borderWidth: 0.5, borderColor: '#E2D9C9', paddingVertical: 8, alignItems: 'center' },
  arabic: { fontSize: 22, color: GREEN },
  cellValue: { color: '#6F6D64', fontSize: 11 },
  historyText: { fontSize: 20, color: TEXT, textAlign: 'right' },
  historyTotal: { color: GREEN, fontSize: 28, fontWeight: '800', marginTop: 6 },
  bottomNav: { position: 'absolute', left: 12, right: 12, bottom: 12, height: 64, backgroundColor: GREEN, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 4 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 56 },
  navLabel: { color: '#D5D0C3', fontSize: 11, fontWeight: '700' },
  navLabelActive: { color: '#F2D68D' }
});
