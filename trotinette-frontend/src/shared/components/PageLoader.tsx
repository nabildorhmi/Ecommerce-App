import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import miraiLogo from '@/assets/miraiTech-Logo.png';

/**
 * MiraiTech branded page loader with logo, glowing spinner, and full-height layout.
 */
export function PageLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 3,
        position: 'relative',
        bgcolor: '#0c0c14',
      }}
    >
      {/* Glow ring backdrop */}
      <Box
        sx={{
          position: 'absolute',
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,194,255,0.1) 0%, transparent 70%)',
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}
      />

      {/* Logo */}
      <Box
        component="img"
        src={miraiLogo}
        alt="MiraiTech"
        sx={{
          height: 36, width: 'auto',
          opacity: 0.8,
          mb: -1,
        }}
      />

      {/* Spinner */}
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress
          size={52}
          thickness={2.5}
          sx={{
            color: 'rgba(0,194,255,0.25)',
            position: 'absolute',
          }}
          variant="determinate"
          value={100}
        />
        <CircularProgress
          size={52}
          thickness={2.5}
          sx={{
            color: '#00C2FF',
            filter: 'drop-shadow(0 0 8px rgba(0,194,255,0.6))',
          }}
        />
      </Box>

      {/* Brand text */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          sx={{
            fontFamily: '"Noto Serif JP", serif',
            fontSize: '0.55rem',
            color: 'rgba(0,194,255,0.2)',
            letterSpacing: '0.2em',
            mt: 0.5,
          }}
        >
          読み込み中
        </Typography>
      </Box>
    </Box>
  );
}
