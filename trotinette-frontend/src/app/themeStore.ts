import { create } from 'zustand';

interface ThemeState {
  mode: 'dark';
}

export const useThemeStore = create<ThemeState>()(() => ({
  mode: 'dark',
}));
