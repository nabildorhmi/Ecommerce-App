import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import { createMiraiTheme } from '../../app/theme';
import { useThemeStore } from '../../app/themeStore';

interface RTLProviderProps {
  children: React.ReactNode;
}

/**
 * RTLProvider — applies MiraiTech theme with French locale (LTR direction).
 * Reads dark/light mode from the Zustand themeStore.
 */
export function RTLProvider({ children }: RTLProviderProps) {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    document.documentElement.lang = 'fr';
    document.documentElement.dir = 'ltr';
  }, []);

  const theme = createMiraiTheme(mode, 'ltr');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

