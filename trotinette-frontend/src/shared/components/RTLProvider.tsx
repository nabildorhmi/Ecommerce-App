import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const theme = createTheme();

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export function RTLProvider({ children }: AppThemeProviderProps) {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
