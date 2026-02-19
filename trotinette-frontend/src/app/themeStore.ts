import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ColorMode = 'dark' | 'light';

interface ThemeState {
  mode: ColorMode;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      toggleMode: () => set({ mode: get().mode === 'dark' ? 'light' : 'dark' }),
    }),
    { name: 'mirai-theme-mode' }
  )
);
