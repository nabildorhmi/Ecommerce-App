import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export function PageLoader() {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}>
      <CircularProgress size={40} />
    </Box>
  );
}
