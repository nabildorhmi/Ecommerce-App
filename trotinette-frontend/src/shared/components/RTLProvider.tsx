import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import { createMiraiTheme } from '@/app/theme';

interface RTLProviderProps {
  children: React.ReactNode;
}

/**
 * RTLProvider — applies MiraiTech dark theme with French locale (LTR direction).
 */
export function RTLProvider({ children }: RTLProviderProps) {
  useEffect(() => {
    document.documentElement.lang = 'fr';
    document.documentElement.dir = 'ltr';
  }, []);

  const theme = createMiraiTheme('dark', 'ltr');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

