import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { miraiTheme } from '../../app/theme';

interface RTLProviderProps {
  children: React.ReactNode;
}

/**
 * RTLProvider — applies miraiTheme + RTL direction when Arabic locale is active.
 * Handles `document.dir` and `document.lang` on language change.
 */
export function RTLProvider({ children }: RTLProviderProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [i18n.language, isRtl]);

  const directionTheme = createTheme({
    ...miraiTheme,
    direction: isRtl ? 'rtl' : 'ltr',
  });

  return (
    <ThemeProvider theme={directionTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

