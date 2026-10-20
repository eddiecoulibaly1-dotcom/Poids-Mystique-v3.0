import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavedCalculation = {
  id: string;
  text: string;
  total: number;
  byElement: Record<string, number>;
  createdAt: string;
  source?: string;
  favorite?: boolean;
};

const KEY = '@poids-mystique/history-v1';

export async function loadHistory(): Promise<SavedCalculation[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as SavedCalculation[]; } catch { return []; }
}

export async function saveHistory(items: SavedCalculation[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}
