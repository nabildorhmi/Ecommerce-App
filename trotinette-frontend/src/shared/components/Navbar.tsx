import { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
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
import Badge from '@mui/material/Badge';
import InputBase from '@mui/material/InputBase';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import PeopleIcon from '@mui/icons-material/People';
import { useAuthStore } from '../../features/auth/store';
import { CartBadge } from '../../features/cart/components/CartBadge';
import { CartDrawer } from '../../features/cart/components/CartDrawer';
import { useCategories } from '../../features/catalog/api/categories';
import { useThemeStore } from '../../app/themeStore';
import { apiClient } from '../api/client';
import miraiLogo from '../../assets/miraiTech-Logo.png';

/**
 * MiraiTech Navbar — sticky, transparent/dark blur, dynamic categories.
 */
export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { mode, toggleMode } = useThemeStore();

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];

  // Admin pending orders count
  const { data: pendingData } = useQuery({
    queryKey: ['admin', 'orders', 'pending-count'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/orders', { params: { 'filter[status]': 'pending', per_page: 1 } });
      return res.data.meta?.total ?? 0;
    },
    enabled: user?.role === 'admin' || user?.role === 'global_admin',
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
  const pendingCount = pendingData ?? 0;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState<null | HTMLElement>(null);
  const [catMenuAnchor, setCatMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState<HTMLDivElement | null>(null);
  const handleSearchBoxRef = useCallback((el: HTMLDivElement | null) => {
    setSearchAnchorEl(el);
  }, []);

  // Search suggestions query
  const { data: suggestionsData } = useQuery({
    queryKey: ['products', 'search-suggestions', searchQuery],
    queryFn: async () => {
      const res = await apiClient.get('/products', {
        params: { 'filter[search]': searchQuery.trim(), per_page: 6 },
      });
      return res.data as { data: Array<{ id: number; name: string; slug: string; price: number; images?: { thumbnail: string }[] }> };
    },
    enabled: searchQuery.trim().length > 1,
    staleTime: 30_000,
  });
  const suggestions = suggestionsData?.data ?? [];
  const suggestionsOpen = searchFocused && searchQuery.trim().length > 1 && suggestions.length > 0;

  const handleLogout = () => {
    clearAuth();
    void navigate('/login');
  };

  const closeUserMenu = () => setUserMenuAnchor(null);
  const closeAdminMenu = () => setAdminMenuAnchor(null);
  const closeCatMenu = () => setCatMenuAnchor(null);

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      void navigate(`/products?filter[search]=${encodeURIComponent(trimmed)}`);
      setSearchQuery('');
      setSearchFocused(false);
      setMobileOpen(false);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    void navigate(`/products/${slug}`);
    setSearchQuery('');
    setSearchFocused(false);
    setMobileOpen(false);
  };

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
              sx={{ height: { xs: 25, md: 35 }, width: 'auto', display: 'block' }}
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
              TOUS LES SCOOTERS
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
                  CATÉGORIES
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
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
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
                        color: 'text.primary',
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

            {/* Desktop search */}
            <ClickAwayListener onClickAway={() => setSearchFocused(false)}>
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', position: 'relative' }}>
                <Box
                  ref={handleSearchBoxRef}
                  component="form"
                  onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleSearch(); }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'rgba(255,255,255,0.06)',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: 'divider',
                    px: 1.5,
                    py: 0.25,
                    transition: 'border-color 0.2s',
                    '&:focus-within': { borderColor: 'primary.main' },
                  }}
                >
                  <SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary', mr: 1 }} />
                  <InputBase
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    sx={{
                      fontSize: '0.8rem',
                      color: 'text.primary',
                      width: 160,
                      '& input::placeholder': { color: 'text.secondary', opacity: 1 },
                    }}
                  />
                </Box>
                <Popper
                  open={suggestionsOpen}
                  anchorEl={searchAnchorEl}
                  placement="bottom-start"
                  style={{ zIndex: 1300, minWidth: 240 }}
                >
                  <Paper
                    elevation={8}
                    sx={{
                      mt: 0.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                      overflow: 'hidden',
                      minWidth: 240,
                    }}
                  >
                    <List dense disablePadding>
                      {suggestions.map((product) => (
                        <ListItemButton
                          key={product.id}
                          onClick={() => handleSuggestionClick(product.slug)}
                          sx={{
                            py: 0.75,
                            px: 1.5,
                            gap: 1.5,
                            '&:hover': { backgroundColor: 'rgba(0,194,255,0.08)' },
                          }}
                        >
                          <Avatar
                            src={product.images?.[0]?.thumbnail}
                            alt={product.name}
                            variant="rounded"
                            sx={{ width: 36, height: 36, flexShrink: 0, bgcolor: 'rgba(255,255,255,0.06)' }}
                          />
                          <ListItemText
                            primary={product.name}
                            primaryTypographyProps={{ fontSize: '0.83rem', fontWeight: 500, noWrap: true }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Paper>
                </Popper>
              </Box>
            </ClickAwayListener>
          </Box>

          {/* ── Right Actions ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 'auto' }}>
            {/* ── Theme Toggle ── */}
            <Tooltip title={mode === 'dark' ? 'Mode clair' : 'Mode sombre'}>
              <IconButton
                onClick={toggleMode}
                size="small"
                sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', backgroundColor: 'rgba(255,255,255,0.06)' } }}
              >
                {mode === 'dark'
                  ? <LightModeRoundedIcon fontSize="small" />
                  : <DarkModeRoundedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <CartBadge onToggle={() => setDrawerOpen(true)} />

            {user ? (
              <>
                {(user.role === 'admin' || user.role === 'global_admin') && (
                  <>
                    <IconButton
                      onClick={(e) => setAdminMenuAnchor(e.currentTarget)}
                      aria-label="Administration"
                      size="small"
                      sx={{ color: 'text.secondary', '&:hover': { color: '#00C2FF' } }}
                    >
                      <Badge variant="dot" color="error" invisible={pendingCount === 0}>
                        <AdminPanelSettingsIcon sx={{ fontSize: '1.1rem' }} />
                      </Badge>
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
                          backgroundColor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                        },
                      }}
                    >
                      {(() => {
                        const menuItems = [
                          { to: '/admin/products', icon: <AssignmentIcon fontSize="small" />, label: 'Produits' },
                          { to: '/admin/categories', icon: <AssignmentIcon fontSize="small" />, label: 'Catégories' },
                          { to: '/admin/orders', icon: <Badge badgeContent={pendingCount} color="error" max={99}><ReceiptLongIcon fontSize="small" /></Badge>, label: 'Commandes' },
                        ];

                        // Add Utilisateurs menu item only for global_admin
                        if (user.role === 'global_admin') {
                          menuItems.push({ to: '/admin/users', icon: <PeopleIcon fontSize="small" />, label: 'Utilisateurs' });
                        }

                        return menuItems.map(({ to, icon, label }) => (
                          <MenuItem
                            key={to}
                            component={Link}
                            to={to}
                            onClick={closeAdminMenu}
                            sx={{
                              fontSize: '0.85rem',
                              py: 1,
                              borderLeft: '2px solid transparent',
                              color: 'text.primary',
                              '&:hover': { backgroundColor: 'rgba(0,194,255,0.08)', color: '#00C2FF', borderLeftColor: '#00C2FF' },
                            }}
                          >
                            <ListItemIcon sx={{ color: '#00C2FF', minWidth: 32 }}>{icon}</ListItemIcon>
                            <ListItemText primaryTypographyProps={{ fontSize: '0.85rem' }}>{label}</ListItemText>
                          </MenuItem>
                        ));
                      })()}
                    </Menu>
                  </>
                )}

                <IconButton
                  onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: '#00C2FF' } }}
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
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                    },
                  }}
                >
                  <MenuItem component={Link} to="/profile" onClick={closeUserMenu}
                    sx={{ fontSize: '0.85rem', py: 1, borderLeft: '2px solid transparent', color: 'text.primary', '&:hover': { color: '#00C2FF', backgroundColor: 'rgba(0,194,255,0.08)', borderLeftColor: '#00C2FF' } }}>
                    <ListItemIcon sx={{ color: '#00C2FF', minWidth: 32 }}><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '0.85rem' }}>Mon compte</ListItemText>
                  </MenuItem>
                  <MenuItem component={Link} to="/orders" onClick={closeUserMenu}
                    sx={{ fontSize: '0.85rem', py: 1, borderLeft: '2px solid transparent', color: 'text.primary', '&:hover': { color: '#00C2FF', backgroundColor: 'rgba(0,194,255,0.08)', borderLeftColor: '#00C2FF' } }}>
                    <ListItemIcon sx={{ color: '#00C2FF', minWidth: 32 }}><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '0.85rem' }}>Mes commandes</ListItemText>
                  </MenuItem>
                  <Divider sx={{ borderColor: 'divider', my: 0.5 }} />
                  <MenuItem
                    onClick={() => { closeUserMenu(); handleLogout(); }}
                    sx={{ fontSize: '0.85rem', py: 1, color: '#E63946', '&:hover': { backgroundColor: 'rgba(230,57,70,0.08)' } }}
                  >
                    <ListItemIcon sx={{ color: '#E63946', minWidth: 32 }}><LogoutIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '0.85rem', color: '#E63946' }}>Déconnexion</ListItemText>
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
                Connexion
              </Button>
            )}

            {/* Mobile hamburger */}
            <IconButton
              sx={{ display: { md: 'none' }, color: 'text.secondary', ml: 0.25 }}
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
            backgroundColor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 800, letterSpacing: '0.12em', color: '#00C2FF', fontSize: '0.9rem' }}>
            MENU
          </Typography>
          <IconButton size="small" onClick={() => setMobileOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: 'divider' }} />
        <Stack sx={{ p: 2, gap: 0.5 }}>
          {/* Mobile search */}
          <Box
            component="form"
            onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleSearch(); }}
            sx={{ display: 'flex', alignItems: 'center', bgcolor: 'action.hover', borderRadius: '6px', px: 1.5, py: 0.5, mb: suggestions.length > 0 && searchQuery.trim().length > 1 ? 0 : 1 }}
          >
            <SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary', mr: 1 }} />
            <InputBase
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ fontSize: '0.85rem', color: 'text.primary', flex: 1 }}
            />
          </Box>
          {suggestions.length > 0 && searchQuery.trim().length > 1 && (
            <Paper
              variant="outlined"
              sx={{ mb: 1, borderColor: 'divider', backgroundColor: 'background.paper', overflow: 'hidden' }}
            >
              <List dense disablePadding>
                {suggestions.map((product) => (
                  <ListItemButton
                    key={product.id}
                    onClick={() => handleSuggestionClick(product.slug)}
                    sx={{ py: 0.75, px: 1.5, gap: 1.5, '&:hover': { backgroundColor: 'rgba(0,194,255,0.08)' } }}
                  >
                    <Avatar
                      src={product.images?.[0]?.thumbnail}
                      alt={product.name}
                      variant="rounded"
                      sx={{ width: 32, height: 32, flexShrink: 0, bgcolor: 'rgba(255,255,255,0.06)' }}
                    />
                    <ListItemText
                      primary={product.name}
                      primaryTypographyProps={{ fontSize: '0.83rem', fontWeight: 500 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          )}

          <Button
            component={Link} to="/products"
            onClick={() => setMobileOpen(false)}
            fullWidth
            sx={{ justifyContent: 'flex-start', color: 'text.primary', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.06em' }}
          >
            TOUS LES SCOOTERS
          </Button>
          <Divider sx={{ borderColor: 'divider', my: 0.5 }} />
          <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', letterSpacing: '0.1em', fontWeight: 700, px: 1, pb: 0.5, textTransform: 'uppercase' }}>
            Catégories
          </Typography>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              component={Link}
              to={`/products?filter[category_id]=${cat.id}`}
              onClick={() => setMobileOpen(false)}
              fullWidth
              sx={{ justifyContent: 'flex-start', color: 'text.secondary', fontSize: '0.82rem', fontWeight: 500, pl: 2 }}
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

