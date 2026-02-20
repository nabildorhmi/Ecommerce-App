import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

// ─── MiraiTech Design Tokens ───────────────────────────────────────────────
const MIRAI_BLACK   = '#0B0B0E';
const MIRAI_SURFACE_D = '#111116';
const MIRAI_CARD_D    = '#16161C';
const MIRAI_BORDER_D  = '#1E1E28';

// Light palette tokens
const LIGHT_BG      = '#F8FAFB';
const LIGHT_PAPER   = '#FFFFFF';
const LIGHT_BORDER  = '#E5E7EB';
const LIGHT_TEXT    = '#0B0B0E';
const LIGHT_SUBTEXT = '#4B5563';
const MIRAI_CYAN    = '#00C2FF';
const MIRAI_CYAN_DK = '#0099CC';
const MIRAI_WHITE   = '#F5F7FA';
const MIRAI_GRAY    = '#9CA3AF';
const MIRAI_RED     = '#E63946';

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
        paper:   isDark ? MIRAI_SURFACE_D : LIGHT_PAPER,
      },
      primary: {
        main:        MIRAI_CYAN,
        dark:        MIRAI_CYAN_DK,
        light:       '#33CFFF',
        contrastText: MIRAI_BLACK,
      },
      secondary: {
        main:        MIRAI_RED,
        contrastText: '#FFFFFF',
      },
      text: {
        primary:   isDark ? MIRAI_WHITE   : LIGHT_TEXT,
        secondary: isDark ? MIRAI_GRAY    : LIGHT_SUBTEXT,
      },
      divider: isDark ? MIRAI_BORDER_D : LIGHT_BORDER,
      error: {
        main: MIRAI_RED,
      },
    success: {
      main: '#00E676',
    },
  },
  typography: {
    fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif',
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
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: isDark ? MIRAI_BLACK : LIGHT_BG,
          color: isDark ? MIRAI_WHITE : LIGHT_TEXT,
          scrollbarColor: isDark
            ? `${MIRAI_BORDER_D} ${MIRAI_BLACK}`
            : `${LIGHT_BORDER} ${LIGHT_BG}`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: isDark ? MIRAI_BLACK : LIGHT_BG },
          '&::-webkit-scrollbar-thumb': {
            background: isDark ? MIRAI_BORDER_D : LIGHT_BORDER,
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
          borderBottom: `1px solid ${MIRAI_BORDER_D}`,
          boxShadow: 'none',
          color: MIRAI_WHITE,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '10px 24px',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${MIRAI_CYAN} 0%, ${MIRAI_CYAN_DK} 100%)`,
          color: MIRAI_BLACK,
          boxShadow: `0 0 20px rgba(0,194,255,0.25)`,
          '&:hover': {
            background: `linear-gradient(135deg, #33CFFF 0%, ${MIRAI_CYAN} 100%)`,
            boxShadow: `0 0 30px rgba(0,194,255,0.45)`,
          },
        },
        outlinedPrimary: {
          borderColor: MIRAI_CYAN,
          color: MIRAI_CYAN,
          '&:hover': {
            borderColor: '#33CFFF',
            backgroundColor: 'rgba(0,194,255,0.08)',
            boxShadow: `0 0 16px rgba(0,194,255,0.2)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: isDark ? MIRAI_CARD_D : LIGHT_PAPER,
          border: `1px solid ${isDark ? MIRAI_BORDER_D : LIGHT_BORDER}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: isDark ? MIRAI_SURFACE_D : LIGHT_PAPER,
          border: `1px solid ${isDark ? MIRAI_BORDER_D : LIGHT_BORDER}`,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: isDark ? MIRAI_SURFACE_D : LIGHT_PAPER,
          border: `1px solid ${isDark ? MIRAI_BORDER_D : LIGHT_BORDER}`,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: 'rgba(0,194,255,0.06)',
            color: MIRAI_CYAN,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            borderBottom: `1px solid ${isDark ? MIRAI_BORDER_D : LIGHT_BORDER}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${isDark ? MIRAI_BORDER_D : LIGHT_BORDER}`,
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
            '& fieldset': { borderColor: isDark ? MIRAI_BORDER_D : LIGHT_BORDER },
            '&:hover fieldset': { borderColor: MIRAI_CYAN },
            '&.Mui-focused fieldset': {
              borderColor: MIRAI_CYAN,
              boxShadow: `0 0 0 2px rgba(0,194,255,0.15)`,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? MIRAI_BORDER_D : LIGHT_BORDER,
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: isDark ? MIRAI_BORDER_D : LIGHT_BORDER,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: isDark ? MIRAI_SURFACE_D : LIGHT_PAPER,
          border: `1px solid ${isDark ? MIRAI_BORDER_D : LIGHT_BORDER}`,
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
          backgroundColor: isDark ? MIRAI_BORDER_D : LIGHT_BORDER,
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
