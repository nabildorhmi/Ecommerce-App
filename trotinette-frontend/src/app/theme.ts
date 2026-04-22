import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

// ─── MiraiTech Design Tokens (Neo-Zen palette) ─────────────────────────────
const MIRAI_BLACK = '#0c0c14';
const MIRAI_SURFACE = '#13131b';
const MIRAI_BORDER = '#1d1d27';

// Light palette tokens
const LIGHT_BG = '#F8FAFB';
const LIGHT_PAPER = '#FFFFFF';
const LIGHT_BORDER = '#E5E7EB';
const LIGHT_TEXT = '#0c0c14';
const LIGHT_SUBTEXT = '#4B5563';
const MIRAI_CYAN = '#00C2FF';
const MIRAI_CYAN_DK = '#0099CC';
const MIRAI_WHITE = '#E8ECF2';
const MIRAI_GRAY = '#8A919D';
const MIRAI_RED = '#C7404D';

/**
 * Creates the MiraiTech MUI theme.
 * AppBar is ALWAYS dark regardless of mode.
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
        fontFamily: '"Orbitron", sans-serif',
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      },
      h2: {
        fontFamily: '"Orbitron", sans-serif',
        fontWeight: 700,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
      },
      h3: {
        fontFamily: '"Orbitron", sans-serif',
        fontWeight: 700,
        letterSpacing: '0.02em',
      },
      h4: {
        fontFamily: '"Orbitron", sans-serif',
        fontWeight: 700,
        letterSpacing: '0.02em',
      },
      h5: {
        fontFamily: '"Orbitron", sans-serif',
        fontWeight: 600,
      },
      h6: {
        fontFamily: '"Orbitron", sans-serif',
        fontWeight: 600,
      },
      button: {
        fontFamily: '"Orbitron", sans-serif',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 10,
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
            backgroundColor: 'rgba(12,12,20,0.92)',
            backdropFilter: 'blur(24px)',
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
            borderRadius: 10,
            padding: '10px 24px',
            textTransform: 'none',
            fontWeight: 700,
            letterSpacing: '0.05em',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          },
          containedPrimary: {
            backgroundColor: MIRAI_CYAN,
            color: MIRAI_BLACK,
            boxShadow: `0 4px 14px rgba(0,194,255,0.25)`,
            '&:hover': {
              backgroundColor: '#33CFFF',
              boxShadow: `0 6px 20px rgba(0,194,255,0.35)`,
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(1px)',
              boxShadow: `0 2px 8px rgba(0,194,255,0.15)`,
            },
          },
          outlinedPrimary: {
            borderColor: 'rgba(0,194,255,0.35)',
            color: MIRAI_CYAN,
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0,194,255,0.02)',
            '&:hover': {
              borderColor: MIRAI_CYAN,
              backgroundColor: 'rgba(0,194,255,0.06)',
              boxShadow: `0 0 20px rgba(0,194,255,0.1), inset 0 0 10px rgba(0,194,255,0.05)`,
              transform: 'translateY(-2px)',
            },
          },
          sizeLarge: {
            padding: '14px 32px',
            fontSize: '0.95rem',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(19, 19, 27, 0.55)' : LIGHT_PAPER,
            backdropFilter: isDark ? 'blur(24px)' : 'none',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : LIGHT_BORDER}`,
            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)',
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.06)',
            transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '&:hover': {
              boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.35)' : '0 8px 28px rgba(0,0,0,0.12)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(19, 19, 27, 0.65)' : LIGHT_PAPER,
            backdropFilter: isDark ? 'blur(24px)' : 'none',
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
            borderRadius: 6,
            fontWeight: 600,
            letterSpacing: '0.04em',
            transition: 'all 0.2s ease',
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
                boxShadow: `0 0 16px rgba(0,194,255,0.1)`,
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
            backgroundColor: `rgba(199,64,77,0.1)`,
            border: `1px solid rgba(199,64,77,0.3)`,
            color: isDark ? '#C7404D' : '#C62828',
          },
          standardSuccess: {
            backgroundColor: `rgba(0,230,118,0.08)`,
            border: `1px solid rgba(0,230,118,0.2)`,
            color: isDark ? '#00E676' : '#1B5E20',
          },
          standardWarning: {
            backgroundColor: `rgba(212,164,58,0.08)`,
            border: `1px solid rgba(212,164,58,0.25)`,
            color: isDark ? '#D4A43A' : '#7A5500',
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            '& .MuiPaginationItem-root': {
              color: isDark ? MIRAI_GRAY : LIGHT_SUBTEXT,
              borderRadius: 8,
              '&.Mui-selected': {
                backgroundColor: MIRAI_CYAN,
                color: MIRAI_BLACK,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,194,255,0.2)',
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
            borderRadius: 4,
          },
          bar: {
            backgroundColor: MIRAI_CYAN,
            borderRadius: 4,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'all 0.2s ease',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? 'rgba(12,12,20,0.97)' : LIGHT_PAPER,
            backdropFilter: 'blur(28px)',
            borderLeft: `1px solid ${isDark ? MIRAI_BORDER : LIGHT_BORDER}`,
            backgroundImage: isDark
              ? 'linear-gradient(to bottom, rgba(0,194,255,0.02), transparent 30%)'
              : 'none',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#1E1E28' : LIGHT_TEXT,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : LIGHT_BORDER}`,
            fontSize: '0.78rem',
            borderRadius: 8,
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            '& .MuiSnackbarContent-root': {
              backgroundColor: isDark ? '#1E1E28' : LIGHT_TEXT,
              border: `1px solid rgba(0,194,255,0.2)`,
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              color: isDark ? MIRAI_WHITE : '#fff',
            },
          },
        },
      },
    },
  });
}

// Default dark theme export for backward-compat
export const miraiTheme = createMiraiTheme('dark', 'ltr');
