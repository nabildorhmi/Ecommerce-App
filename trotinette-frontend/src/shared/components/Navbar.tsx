import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
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
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    clearAuth();
    void navigate('/login');
  };

  const closeUserMenu = () => setUserMenuAnchor(null);
  const closeAdminMenu = () => setAdminMenuAnchor(null);

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
                {/* Admin menu */}
                {user.role === 'admin' && (
                  <>
                    <IconButton
                      onClick={(e) => setAdminMenuAnchor(e.currentTarget)}
                      aria-label={t('nav.admin')}
                      color="inherit"
                      title={t('nav.admin')}
                    >
                      <AdminPanelSettingsIcon />
                    </IconButton>
                    <Menu
                      anchorEl={adminMenuAnchor}
                      open={Boolean(adminMenuAnchor)}
                      onClose={closeAdminMenu}
                    >
                      <MenuItem
                        component={Link}
                        to="/admin/products"
                        onClick={closeAdminMenu}
                      >
                        <ListItemIcon><AssignmentIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>{t('admin.products.title')}</ListItemText>
                      </MenuItem>
                      <MenuItem
                        component={Link}
                        to="/admin/orders"
                        onClick={closeAdminMenu}
                      >
                        <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>{t('orders.ordersNav')}</ListItemText>
                      </MenuItem>
                      <MenuItem
                        component={Link}
                        to="/admin/delivery-zones"
                        onClick={closeAdminMenu}
                      >
                        <ListItemIcon><LocalShippingIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>{t('deliveryZones.title')}</ListItemText>
                      </MenuItem>
                    </Menu>
                  </>
                )}

                {/* User menu */}
                <IconButton
                  onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                  aria-label={t('nav.account')}
                  color="inherit"
                  title={t('nav.account')}
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={closeUserMenu}
                >
                  <MenuItem
                    component={Link}
                    to="/profile"
                    onClick={closeUserMenu}
                  >
                    <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>{t('nav.account')}</ListItemText>
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/orders"
                    onClick={closeUserMenu}
                  >
                    <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>{t('orders.myOrders')}</ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      closeUserMenu();
                      handleLogout();
                    }}
                  >
                    <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>{t('nav.logout')}</ListItemText>
                  </MenuItem>
                </Menu>
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
