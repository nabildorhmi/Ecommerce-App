import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// CRITICAL: Create caches ONCE at module level — NOT inside the component.
// Creating inside the component recreates the Emotion cache on every render,
// causing all MUI CSS rules to be re-injected into the DOM on every state change.
// See: MUI GitHub issue #33892
const rtlCache = createCache({ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] });
const ltrCache = createCache({ key: 'muiltr', stylisPlugins: [prefixer] });

interface RTLProviderProps {
  children: React.ReactNode;
}

export function RTLProvider({ children }: RTLProviderProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Synchronize document.dir and html lang on every locale change.
  // This also covers portal components: MUI Dialog/Drawer/Menu read direction
  // from the ThemeProvider (not document.dir), so the theme must be 'rtl' too.
  useEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);

  // Recreate the theme on direction change (cheap — no DOM side effects)
  const theme = useMemo(
    () => createTheme({ direction: isRTL ? 'rtl' : 'ltr' }),
    [isRTL]
  );

  return (
    <CacheProvider value={isRTL ? rtlCache : ltrCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
