import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuthStore } from '../../features/auth/store';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CartBadge } from '../../features/cart/components/CartBadge';
import { CartDrawer } from '../../features/cart/components/CartDrawer';

/**
 * Navbar — global top navigation bar.
 * Displays brand name, cart badge, language switcher, and auth-aware user actions.
 */
export function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    void navigate('/login');
  };

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          {/* Brand */}
          <Typography
            component={Link}
            to="/products"
            variant="h6"
            fontWeight={700}
            color="primary"
            sx={{ textDecoration: 'none', flexGrow: 1 }}
          >
            Trotinette
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Language switcher */}
            <LanguageSwitcher />

            {/* Cart badge */}
            <CartBadge onToggle={() => setDrawerOpen(true)} />

            {/* Auth-aware actions */}
            {user ? (
              <>
                {user.role === 'admin' && (
                  <IconButton
                    component={Link}
                    to="/admin"
                    aria-label={t('nav.admin')}
                    color="inherit"
                    title={t('nav.admin')}
                  >
                    <AdminPanelSettingsIcon />
                  </IconButton>
                )}
                <IconButton
                  component={Link}
                  to="/profile"
                  aria-label={t('nav.account')}
                  color="inherit"
                  title={t('nav.account')}
                >
                  <PersonOutlineIcon />
                </IconButton>
                <IconButton
                  onClick={handleLogout}
                  aria-label={t('nav.logout')}
                  color="inherit"
                  title={t('nav.logout')}
                >
                  <LogoutIcon />
                </IconButton>
              </>
            ) : (
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                size="small"
              >
                {t('nav.login')}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Cart drawer — rendered at top level so it overlays all pages */}
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
