import { Outlet } from 'react-router';
import Box from '@mui/material/Box';
import { Navbar } from './Navbar';

/**
 * RootLayout — wraps all routes with the Navbar.
 * Used as the root layout route in the router configuration.
 */
export function RootLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
