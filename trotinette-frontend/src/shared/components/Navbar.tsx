import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
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
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { useAuthStore } from '../../features/auth/store';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CartBadge } from '../../features/cart/components/CartBadge';
import { CartDrawer } from '../../features/cart/components/CartDrawer';
import { useCategories } from '../../features/catalog/api/categories';
import { useThemeStore } from '../../app/themeStore';
import miraiLogo from '../../assets/miraiTech-Logo.png';

/**
 * MiraiTech Navbar — sticky, transparent/dark blur, dynamic categories.
 */
export function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { mode, toggleMode } = useThemeStore();

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState<null | HTMLElement>(null);
  const [catMenuAnchor, setCatMenuAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    clearAuth();
    void navigate('/login');
  };

  const closeUserMenu = () => setUserMenuAnchor(null);
  const closeAdminMenu = () => setAdminMenuAnchor(null);
  const closeCatMenu = () => setCatMenuAnchor(null);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 60, md: 68 }, px: { xs: 2, md: 4 } }}>
          {/* ── Brand Logo ── */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              mr: { md: 4 },
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={miraiLogo}
              alt="MiraiTech"
              sx={{ height: { xs: 75, md: 100 }, width: 'auto', display: 'block' }}
            />
          </Box>

          {/* ── Desktop Category Nav ── */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.25, flex: 1 }}>
            <Button
              component={Link}
              to="/products"
              sx={{
                color: isActive('/products') && !location.search.includes('category_id') ? '#00C2FF' : '#9CA3AF',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                px: 1.5,
                py: 0.75,
                borderRadius: '4px',
                minWidth: 'auto',
                '&:hover': { color: '#F5F7FA', backgroundColor: 'rgba(255,255,255,0.04)' },
              }}
            >
              {t('nav.allScooters', 'ALL SCOOTERS')}
            </Button>

            {categories.length > 0 && (
              <>
                <Button
                  endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.9rem !important' }} />}
                  onClick={(e) => setCatMenuAnchor(e.currentTarget)}
                  sx={{
                    color: '#9CA3AF',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '4px',
                    minWidth: 'auto',
                    '&:hover': { color: '#F5F7FA', backgroundColor: 'rgba(255,255,255,0.04)' },
                  }}
                >
                  {t('nav.categories', 'CATEGORIES')}
                </Button>
                <Menu
                  anchorEl={catMenuAnchor}
                  open={Boolean(catMenuAnchor)}
                  onClose={closeCatMenu}
                  disableScrollLock
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 220,
                      backgroundColor: '#111116',
                      border: '1px solid #1E1E28',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                    },
                  }}
                >
                  {categories.map((cat) => (
                    <MenuItem
                      key={cat.id}
                      component={Link}
                      to={`/products?filter[category_id]=${cat.id}`}
                      onClick={closeCatMenu}
                      sx={{
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: '#F5F7FA',
                        py: 1,
                        borderLeft: '2px solid transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(0,194,255,0.08)',
                          color: '#00C2FF',
                          borderLeftColor: '#00C2FF',
                        },
                      }}
                    >
                      {cat.name}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Box>

          {/* ── Right Actions ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 'auto' }}>
            {/* ── Theme Toggle ── */}
            <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton
                onClick={toggleMode}
                size="small"
                sx={{ color: '#9CA3AF', '&:hover': { color: '#F5F7FA', backgroundColor: 'rgba(255,255,255,0.06)' } }}
              >
                {mode === 'dark'
                  ? <LightModeRoundedIcon fontSize="small" />
                  : <DarkModeRoundedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <LanguageSwitcher />

            <CartBadge onToggle={() => setDrawerOpen(true)} />

            {user ? (
              <>
                {user.role === 'admin' && (
                  <>
                    <IconButton
                      onClick={(e) => setAdminMenuAnchor(e.currentTarget)}
                      aria-label={t('nav.admin')}
                      size="small"
                      sx={{ color: '#9CA3AF', '&:hover': { color: '#00C2FF' } }}
                    >
                      <AdminPanelSettingsIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                    <Menu
                      anchorEl={adminMenuAnchor}
                      open={Boolean(adminMenuAnchor)}
                      onClose={closeAdminMenu}
                      disableScrollLock
                      PaperProps={{
                        sx: {
                          mt: 1,
                          minWidth: 200,
                          backgroundColor: '#111116',
                          border: '1px solid #1E1E28',
                          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                        },
                      }}
                    >
                      {[
                        { to: '/admin/products', icon: <AssignmentIcon fontSize="small" />, label: t('admin.products.title') },
                        { to: '/admin/categories', icon: <AssignmentIcon fontSize="small" />, label: t('admin.categories.title', 'Categories') },
                        { to: '/admin/orders', icon: <ReceiptLongIcon fontSize="small" />, label: t('orders.ordersNav') },
                        { to: '/admin/delivery-zones', icon: <LocalShippingIcon fontSize="small" />, label: t('deliveryZones.title') },
                      ].map(({ to, icon, label }) => (
                        <MenuItem
                          key={to}
                          component={Link}
                          to={to}
                          onClick={closeAdminMenu}
                          sx={{
                            fontSize: '0.85rem',
                            py: 1,
                            borderLeft: '2px solid transparent',
                            '&:hover': { backgroundColor: 'rgba(0,194,255,0.08)', color: '#00C2FF', borderLeftColor: '#00C2FF' },
                          }}
                        >
                          <ListItemIcon sx={{ color: '#00C2FF', minWidth: 32 }}>{icon}</ListItemIcon>
                          <ListItemText primaryTypographyProps={{ fontSize: '0.85rem' }}>{label}</ListItemText>
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}

                <IconButton
                  onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                  size="small"
                  sx={{ color: '#9CA3AF', '&:hover': { color: '#00C2FF' } }}
                >
                  <AccountCircleIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={closeUserMenu}
                  disableScrollLock
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 190,
                      backgroundColor: '#111116',
                      border: '1px solid #1E1E28',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                    },
                  }}
                >
                  <MenuItem component={Link} to="/profile" onClick={closeUserMenu}
                    sx={{ fontSize: '0.85rem', py: 1, borderLeft: '2px solid transparent', '&:hover': { color: '#00C2FF', backgroundColor: 'rgba(0,194,255,0.08)', borderLeftColor: '#00C2FF' } }}>
                    <ListItemIcon sx={{ color: '#00C2FF', minWidth: 32 }}><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '0.85rem' }}>{t('nav.account')}</ListItemText>
                  </MenuItem>
                  <MenuItem component={Link} to="/orders" onClick={closeUserMenu}
                    sx={{ fontSize: '0.85rem', py: 1, borderLeft: '2px solid transparent', '&:hover': { color: '#00C2FF', backgroundColor: 'rgba(0,194,255,0.08)', borderLeftColor: '#00C2FF' } }}>
                    <ListItemIcon sx={{ color: '#00C2FF', minWidth: 32 }}><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '0.85rem' }}>{t('orders.myOrders')}</ListItemText>
                  </MenuItem>
                  <Divider sx={{ borderColor: '#1E1E28', my: 0.5 }} />
                  <MenuItem
                    onClick={() => { closeUserMenu(); handleLogout(); }}
                    sx={{ fontSize: '0.85rem', py: 1, color: '#E63946', '&:hover': { backgroundColor: 'rgba(230,57,70,0.08)' } }}
                  >
                    <ListItemIcon sx={{ color: '#E63946', minWidth: 32 }}><LogoutIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '0.85rem', color: '#E63946' }}>{t('nav.logout')}</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                size="small"
                sx={{ ml: 0.5, fontSize: '0.72rem', letterSpacing: '0.08em', py: 0.5, px: 1.5 }}
              >
                {t('nav.login')}
              </Button>
            )}

            {/* Mobile hamburger */}
            <IconButton
              sx={{ display: { md: 'none' }, color: '#9CA3AF', ml: 0.25 }}
              onClick={() => setMobileOpen(true)}
              size="small"
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Mobile Drawer ── */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: '#111116',
            borderLeft: '1px solid #1E1E28',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 800, letterSpacing: '0.12em', color: '#00C2FF', fontSize: '0.9rem' }}>
            MENU
          </Typography>
          <IconButton size="small" onClick={() => setMobileOpen(false)} sx={{ color: '#9CA3AF' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: '#1E1E28' }} />
        <Stack sx={{ p: 2, gap: 0.5 }}>
          <Button
            component={Link} to="/products"
            onClick={() => setMobileOpen(false)}
            fullWidth
            sx={{ justifyContent: 'flex-start', color: '#F5F7FA', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.06em' }}
          >
            ALL SCOOTERS
          </Button>
          <Divider sx={{ borderColor: '#1E1E28', my: 0.5 }} />
          <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF', letterSpacing: '0.1em', fontWeight: 700, px: 1, pb: 0.5, textTransform: 'uppercase' }}>
            Categories
          </Typography>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              component={Link}
              to={`/products?filter[category_id]=${cat.id}`}
              onClick={() => setMobileOpen(false)}
              fullWidth
              sx={{ justifyContent: 'flex-start', color: '#9CA3AF', fontSize: '0.82rem', fontWeight: 500, pl: 2 }}
            >
              {cat.name}
            </Button>
          ))}
        </Stack>
      </Drawer>

      {/* ── Cart Drawer ── */}
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

