import { Outlet } from 'react-router';
import Box from '@mui/material/Box';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * RootLayout — wraps all routes with Navbar + Footer.
 */
export function RootLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}

