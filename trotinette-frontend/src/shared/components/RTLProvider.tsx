import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createMiraiTheme } from '../../app/theme';
import { useThemeStore } from '../../app/themeStore';

interface RTLProviderProps {
  children: React.ReactNode;
}

/**
 * RTLProvider — applies MiraiTech theme + RTL direction when Arabic locale is active.
 * Reads dark/light mode from the Zustand themeStore.
 */
export function RTLProvider({ children }: RTLProviderProps) {
  const { i18n } = useTranslation();
  const mode = useThemeStore((s) => s.mode);
  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [i18n.language, isRtl]);

  const theme = createMiraiTheme(mode, isRtl ? 'rtl' : 'ltr');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

