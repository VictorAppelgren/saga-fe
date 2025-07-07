export type FocusArea = 'europe' | 'asia' | 'north america' | 'south america' | 'africa';

export type Frequency = 'hourly' | 'daily' | 'weekly' | 'monthly';

export type HistoryType = 'system' | 'theme';

export interface Periodicity {
  frequency: Frequency;
  timeOfDay: string; // HH:mm format
  timezone: string; // IANA timezone format (e.g., 'Europe/London')
}

export interface HistoryEntry {
  type: HistoryType;
  title: string;
  description: string;
  timestamp: string;
  themeId?: string;
}

export interface Theme {
  id: string;
  name: string;
  thesis: string;
  focusArea: FocusArea;
  periodicity: Periodicity;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
}

export interface UserData {
  active: boolean;
  themes: Theme[];
  settings: UserSettings;
  history?: HistoryEntry[];
}

export interface Storage {
  [userId: string]: UserData;
}
