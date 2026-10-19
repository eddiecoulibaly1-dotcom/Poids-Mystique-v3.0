import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calculation, NormalizationSettings } from './abjad';

export type HistoryItem = { id: string; createdAt: string; input: string; calculation: Calculation; source?: { corpusId: string; title: string; page?: number | null }; favorite?: boolean; };
const KEY='poids-mystique.history.v2';
const SETTINGS='poids-mystique.settings.v1';

export async function loadHistory(): Promise<HistoryItem[]> {
  const raw=await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) : [];
}
export async function saveHistory(item: HistoryItem) {
  const items=await loadHistory();
  await AsyncStorage.setItem(KEY, JSON.stringify([item,...items].slice(0,100)));
}
export async function clearHistory() { await AsyncStorage.removeItem(KEY); }

export async function toggleFavorite(id:string) {
  const items=await loadHistory();
  const next=items.map(x=>x.id===id?{...x,favorite:!x.favorite}:x);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
export async function loadSettings(): Promise<NormalizationSettings | null> {
  const raw=await AsyncStorage.getItem(SETTINGS); return raw ? JSON.parse(raw) : null;
}
export async function saveSettings(s: NormalizationSettings) { await AsyncStorage.setItem(SETTINGS, JSON.stringify(s)); }
