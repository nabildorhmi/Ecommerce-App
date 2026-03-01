import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

// ─── MiraiTech Design Tokens ───────────────────────────────────────────────
const MIRAI_BLACK = '#0B0B0E';
const MIRAI_SURFACE = '#111116';
const MIRAI_BORDER = '#1E1E28';

// Light palette tokens
const LIGHT_BG = '#F8FAFB';
const LIGHT_PAPER = '#FFFFFF';
const LIGHT_BORDER = '#E5E7EB';
const LIGHT_TEXT = '#0B0B0E';
const LIGHT_SUBTEXT = '#4B5563';
const MIRAI_CYAN = '#00C2FF';
const MIRAI_CYAN_DK = '#0099CC';
const MIRAI_WHITE = '#F5F7FA';
const MIRAI_GRAY = '#9CA3AF';
const MIRAI_RED = '#E63946';

/**
 * Creates the MiraiTech MUI theme.
 * AppBar is ALWAYS dark (#0B0B0E) regardless of mode.
 */
export function createMiraiTheme(mode: PaletteMode = 'dark', direction: 'ltr' | 'rtl' = 'ltr') {
  const isDark = mode === 'dark';
  return createTheme({
    direction,
    palette: {
      mode,
      background: {
        default: isDark ? MIRAI_BLACK : LIGHT_BG,
        paper: isDark ? MIRAI_SURFACE : LIGHT_PAPER,
      },
      primary: {
        main: MIRAI_CYAN,
        dark: MIRAI_CYAN_DK,
        light: '#33CFFF',
        contrastText: MIRAI_BLACK,
      },
      secondary: {
        main: MIRAI_RED,
        contrastText: '#FFFFFF',
      },
      text: {
        primary: isDark ? MIRAI_WHITE : LIGHT_TEXT,
        secondary: isDark ? MIRAI_GRAY : LIGHT_SUBTEXT,
      },
      divider: isDark ? MIRAI_BORDER : LIGHT_BORDER,
      error: {
        main: MIRAI_RED,
      },
      success: {
        main: '#00E676',
      },
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      h1: {
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
      },
      h3: {
        fontWeight: 700,
        letterSpacing: '0.02em',
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '0.02em',
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? MIRAI_BLACK : LIGHT_BG,
            color: isDark ? MIRAI_WHITE : LIGHT_TEXT,
            scrollbarColor: isDark
              ? `${MIRAI_BORDER} ${MIRAI_BLACK}`
              : `${LIGHT_BORDER} ${LIGHT_BG}`,
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-track': { background: isDark ? MIRAI_BLACK : LIGHT_BG },
            '&::-webkit-scrollbar-thumb': {
              background: isDark ? MIRAI_BORDER : LIGHT_BORDER,
              borderRadius: 3,
              '&:hover': { background: MIRAI_CYAN_DK },
            },
          },
        },
      },
      // AppBar is ALWAYS black regardless of theme mode
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(11,11,14,0.92)',
            backdropFilter: 'blur(16px)',
            border: 'none',
            borderBottom: `1px solid ${MIRAI_BORDER}`,
            boxShadow: 'none',
            color: MIRAI_WHITE,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 24px',
            textTransform: 'none',
            fontWeight: 700,
            letterSpacing: '0.04em',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${MIRAI_CYAN} 0%, ${MIRAI_CYAN_DK} 100%)`,
            color: MIRAI_BLACK,
            boxShadow: `0 8px 20px rgba(0,194,255,0.25), inset 0 1px 0 rgba(255,255,255,0.4)`,
            textShadow: '0 1px 2px rgba(255,255,255,0.3)',
            '&:hover': {
              background: `linear-gradient(135deg, #33CFFF 0%, ${MIRAI_CYAN} 100%)`,
              boxShadow: `0 12px 28px rgba(0,194,255,0.45), inset 0 1px 0 rgba(255,255,255,0.6)`,
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(1px)',
              boxShadow: `0 4px 12px rgba(0,194,255,0.3)`,
            },
          },
          outlinedPrimary: {
            borderColor: 'rgba(0,194,255,0.5)',
            color: MIRAI_CYAN,
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0,194,255,0.02)',
            '&:hover': {
              borderColor: MIRAI_CYAN,
              backgroundColor: 'rgba(0,194,255,0.1)',
              boxShadow: `0 0 20px rgba(0,194,255,0.2), inset 0 0 10px rgba(0,194,255,0.1)`,
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(22, 22, 28, 0.6)' : LIGHT_PAPER,
            backdropFilter: isDark ? 'blur(16px)' : 'none',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : LIGHT_BORDER}`,
            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)',
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(17, 17, 22, 0.7)' : LIGHT_PAPER,
            backdropFilter: isDark ? 'blur(16px)' : 'none',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : LIGHT_BORDER}`,
            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? MIRAI_BORDER : LIGHT_BORDER}`,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: 'rgba(0,194,255,0.03)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            fontWeight: 600,
            letterSpacing: '0.04em',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'transparent',
              transition: 'all 0.3s ease',
              '& fieldset': {
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : LIGHT_BORDER,
                transition: 'all 0.3s ease',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(0,194,255,0.5)',
              },
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.01)',
              },
              '&.Mui-focused fieldset': {
                borderColor: MIRAI_CYAN,
                boxShadow: `0 0 12px rgba(0,194,255,0.2)`,
                borderWidth: '1px',
              },
              '&.Mui-focused': {
                backgroundColor: isDark ? 'rgba(0,194,255,0.03)' : 'transparent',
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          outlined: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? MIRAI_BORDER : LIGHT_BORDER,
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? MIRAI_BORDER : LIGHT_BORDER,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? MIRAI_SURFACE : LIGHT_PAPER,
            border: `1px solid ${isDark ? MIRAI_BORDER : LIGHT_BORDER}`,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          standardInfo: {
            backgroundColor: 'rgba(0,194,255,0.08)',
            border: `1px solid rgba(0,194,255,0.2)`,
            color: isDark ? '#00C2FF' : '#0077A8',
          },
          standardError: {
            backgroundColor: `rgba(230,57,70,0.1)`,
            border: `1px solid rgba(230,57,70,0.3)`,
            color: isDark ? '#E63946' : '#C62828',
          },
          standardSuccess: {
            backgroundColor: `rgba(0,230,118,0.08)`,
            border: `1px solid rgba(0,230,118,0.2)`,
            color: isDark ? '#00E676' : '#1B5E20',
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            '& .MuiPaginationItem-root': {
              color: isDark ? MIRAI_GRAY : LIGHT_SUBTEXT,
              '&.Mui-selected': {
                backgroundColor: MIRAI_CYAN,
                color: MIRAI_BLACK,
              },
              '&:hover': {
                backgroundColor: 'rgba(0,194,255,0.1)',
              },
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': {
              color: MIRAI_CYAN,
              '& + .MuiSwitch-track': {
                backgroundColor: MIRAI_CYAN,
              },
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? MIRAI_BORDER : LIGHT_BORDER,
          },
          bar: {
            backgroundColor: MIRAI_CYAN,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
    },
  });
}

// Default dark theme export for backward-compat
export const miraiTheme = createMiraiTheme('dark', 'ltr');
