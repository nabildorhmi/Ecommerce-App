import { createTheme } from '@mui/material/styles';

// ─── MiraiTech Design Tokens ───────────────────────────────────────────────
const MIRAI_BLACK   = '#0B0B0E';
const MIRAI_SURFACE = '#111116';
const MIRAI_CARD    = '#16161C';
const MIRAI_BORDER  = '#1E1E28';
const MIRAI_CYAN    = '#00C2FF';
const MIRAI_CYAN_DK = '#0099CC';
const MIRAI_WHITE   = '#F5F7FA';
const MIRAI_GRAY    = '#9CA3AF';
const MIRAI_RED     = '#E63946';

export const miraiTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: MIRAI_BLACK,
      paper:   MIRAI_SURFACE,
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
      primary:   MIRAI_WHITE,
      secondary: MIRAI_GRAY,
    },
    divider: MIRAI_BORDER,
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
          backgroundColor: MIRAI_BLACK,
          scrollbarColor: `${MIRAI_BORDER} ${MIRAI_BLACK}`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: MIRAI_BLACK },
          '&::-webkit-scrollbar-thumb': {
            background: MIRAI_BORDER,
            borderRadius: 3,
            '&:hover': { background: MIRAI_CYAN_DK },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(11,11,14,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${MIRAI_BORDER}`,
          boxShadow: 'none',
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
          backgroundColor: MIRAI_CARD,
          border: `1px solid ${MIRAI_BORDER}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: MIRAI_SURFACE,
          border: `1px solid ${MIRAI_BORDER}`,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: MIRAI_SURFACE,
          border: `1px solid ${MIRAI_BORDER}`,
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
            borderBottom: `1px solid ${MIRAI_BORDER}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${MIRAI_BORDER}`,
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
            '& fieldset': { borderColor: MIRAI_BORDER },
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
          '& .MuiOutlinedInput-notchedOutline': { borderColor: MIRAI_BORDER },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: MIRAI_BORDER,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: MIRAI_SURFACE,
          border: `1px solid ${MIRAI_BORDER}`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0,194,255,0.08)',
          border: `1px solid rgba(0,194,255,0.2)`,
        },
        standardError: {
          backgroundColor: `rgba(230,57,70,0.1)`,
          border: `1px solid rgba(230,57,70,0.3)`,
        },
        standardSuccess: {
          backgroundColor: `rgba(0,230,118,0.08)`,
          border: `1px solid rgba(0,230,118,0.2)`,
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            color: MIRAI_GRAY,
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
          backgroundColor: MIRAI_BORDER,
        },
        bar: {
          backgroundColor: MIRAI_CYAN,
        },
      },
    },
  },
});
