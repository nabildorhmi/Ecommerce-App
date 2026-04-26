import { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import Container from '@mui/material/Container';
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
import InputBase from '@mui/material/InputBase';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import { useAuthStore } from '@/features/auth/store';
import { CartBadge } from '@/features/cart/components/CartBadge';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { useCategories } from '@/features/catalog/api/categories';
import { apiClient } from '@/shared/api/client';
import miraiLogo from '@/assets/miraiTech-Logo.png';

/* ── Shared menu paper styles ── */
const menuPaperSx = {
  mt: 1,
  minWidth: 220,
  backgroundColor: 'rgba(16, 16, 22, 0.92)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 20px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,194,255,0.04)',
  borderRadius: 2,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(0,194,255,0.3), transparent)',
  },
};

const menuItemSx = {
  fontSize: '0.84rem',
  fontWeight: 500,
  py: 1,
  px: 2,
  borderLeft: '2px solid transparent',
  color: '#B0B8C4',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(0,194,255,0.06)',
    color: '#00C2FF',
    borderLeftColor: '#00C2FF',
  },
};

/**
 * MiraiTech Navbar — neo-zen glass header with refined navigation.
 */
export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];

  // Pending orders count for notification badge
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
  const pendingCount = (pendingData as number) ?? 0;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
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
  const isPromoActive = location.search.includes('is_on_sale');
  const isNewActive = location.search.includes('is_new');

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(10, 10, 16, 0.88)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 5%, rgba(0,194,255,0.15) 50%, transparent 95%)',
          },
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 64 }, gap: 1 }}>
            {/* ── Brand Logo ── */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                mr: { md: 3 },
                flexShrink: 0,
                transition: 'opacity 0.2s',
                '&:hover': { opacity: 0.85 },
              }}
            >
              <Box
                component="img"
                src={miraiLogo}
                alt="MiraiTech"
                sx={{ height: { xs: 40, md: 50 }, width: 'auto', display: 'block' }}
              />
            </Box>

            {/* ── Thin separator ── */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, width: '1px', height: 24, bgcolor: 'rgba(255,255,255,0.06)', mr: 1 }} />

            {/* ── Desktop Category Nav ── */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, flex: 1 }}>
              <Button
                component={Link}
                to="/products"
                sx={{
                  color: isActive('/products') && !location.search.includes('category_id') && !isPromoActive && !isNewActive ? '#00C2FF' : '#8A919D',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  letterSpacing: '0.1em',
                  px: 1.5,
                  py: 0.6,
                  borderRadius: '8px',
                  minWidth: 'auto',
                  transition: 'all 0.25s ease',
                  '&:hover': { color: '#E8ECF2', backgroundColor: 'rgba(255,255,255,0.04)' },
                }}
              >
                Catalogue
              </Button>

              {/* Promo pill */}
              <Button
                component={Link}
                to="/products?filter[is_on_sale]=1"
                startIcon={<LocalOfferIcon sx={{ fontSize: '0.85rem !important' }} />}
                sx={{
                  color: isPromoActive ? '#fff' : '#D97A50',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  letterSpacing: '0.08em',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '20px',
                  minWidth: 'auto',
                  border: '1px solid',
                  borderColor: isPromoActive ? '#D97A50' : 'rgba(217,122,80,0.25)',
                  backgroundColor: isPromoActive ? 'rgba(217,122,80,0.2)' : 'transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(217,122,80,0.12)',
                    borderColor: 'rgba(217,122,80,0.5)',
                  },
                }}
              >
                Promos
              </Button>

              {/* Nouveautés pill */}
              <Button
                component={Link}
                to="/products?filter[is_new]=1"
                startIcon={<FiberNewIcon sx={{ fontSize: '0.95rem !important' }} />}
                sx={{
                  color: isNewActive ? '#fff' : '#2EAD5F',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  letterSpacing: '0.08em',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '20px',
                  minWidth: 'auto',
                  border: '1px solid',
                  borderColor: isNewActive ? '#2EAD5F' : 'rgba(46,173,95,0.25)',
                  backgroundColor: isNewActive ? 'rgba(46,173,95,0.2)' : 'transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(46,173,95,0.12)',
                    borderColor: 'rgba(46,173,95,0.5)',
                  },
                }}
              >
                Nouveautés
              </Button>

              {categories.length > 0 && (
                <>
                  <Button
                    endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.85rem !important', transition: 'transform 0.2s', transform: catMenuAnchor ? 'rotate(180deg)' : 'rotate(0)' }} />}
                    onClick={(e) => setCatMenuAnchor(e.currentTarget)}
                    sx={{
                      color: '#8A919D',
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      letterSpacing: '0.1em',
                      px: 1.5,
                      py: 0.6,
                      borderRadius: '8px',
                      minWidth: 'auto',
                      transition: 'all 0.25s ease',
                      '&:hover': { color: '#E8ECF2', backgroundColor: 'rgba(255,255,255,0.04)' },
                    }}
                  >
                    Catégories
                  </Button>
                  <Menu
                    anchorEl={catMenuAnchor}
                    open={Boolean(catMenuAnchor)}
                    onClose={closeCatMenu}
                    disableScrollLock
                    PaperProps={{ sx: menuPaperSx }}
                  >
                    {categories.map((cat) => (
                      <MenuItem
                        key={cat.id}
                        component={Link}
                        to={`/products?filter[category_id]=${cat.id}`}
                        onClick={closeCatMenu}
                        sx={menuItemSx}
                      >
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {/* ── Desktop search ── */}
              <ClickAwayListener onClickAway={() => setSearchFocused(false)}>
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <Box
                    ref={handleSearchBoxRef}
                    component="form"
                    onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleSearch(); }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: searchFocused ? 'rgba(0,194,255,0.04)' : 'rgba(255,255,255,0.04)',
                      borderRadius: '24px',
                      border: '1px solid',
                      borderColor: searchFocused ? 'rgba(0,194,255,0.25)' : 'rgba(255,255,255,0.06)',
                      px: 1.5,
                      py: 0.35,
                      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      boxShadow: searchFocused ? '0 0 20px rgba(0,194,255,0.06)' : 'none',
                    }}
                  >
                    <SearchIcon sx={{ fontSize: '0.95rem', color: searchFocused ? '#00C2FF' : '#8A919D', mr: 1, transition: 'color 0.2s' }} />
                    <InputBase
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      sx={{
                        fontSize: '0.8rem',
                        color: 'text.primary',
                        width: searchFocused ? 220 : 140,
                        transition: 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        '& input::placeholder': { color: '#8A919D', opacity: 1 },
                      }}
                    />
                  </Box>
                  <Popper
                    open={suggestionsOpen}
                    anchorEl={searchAnchorEl}
                    placement="bottom-end"
                    style={{ zIndex: 1300, minWidth: 280 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        mt: 1,
                        border: '1px solid rgba(255,255,255,0.06)',
                        backgroundColor: 'rgba(16, 16, 22, 0.95)',
                        backdropFilter: 'blur(24px)',
                        overflow: 'hidden',
                        minWidth: 280,
                        borderRadius: 2,
                        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
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
                              transition: 'background 0.15s',
                              '&:hover': { backgroundColor: 'rgba(0,194,255,0.06)' },
                            }}
                          >
                            <Avatar
                              src={product.images?.[0]?.thumbnail}
                              alt={product.name}
                              variant="rounded"
                              sx={{ width: 36, height: 36, flexShrink: 0, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}
                            />
                            <ListItemText
                              primary={product.name}
                              primaryTypographyProps={{ fontSize: '0.83rem', fontWeight: 500, noWrap: true, color: '#E8ECF2' }}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
              <CartBadge onToggle={() => setDrawerOpen(true)} />

              {user ? (
                <>
                  {(user.role === 'admin' || user.role === 'global_admin') && (
                    <IconButton
                      component={Link}
                      to="/admin"
                      aria-label="Administration"
                      size="small"
                      sx={{
                        color: '#8A919D',
                        transition: 'all 0.2s',
                        '&:hover': { color: '#00C2FF', backgroundColor: 'rgba(0,194,255,0.06)' },
                      }}
                    >
                      <Badge badgeContent={pendingCount} color="error" max={99}>
                        <AdminPanelSettingsIcon sx={{ fontSize: '1.1rem' }} />
                      </Badge>
                    </IconButton>
                  )}

                  <IconButton
                    onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                    size="small"
                    sx={{
                      color: '#8A919D',
                      transition: 'all 0.2s',
                      '&:hover': { color: '#00C2FF', backgroundColor: 'rgba(0,194,255,0.06)' },
                    }}
                  >
                    <AccountCircleIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={closeUserMenu}
                    disableScrollLock
                    PaperProps={{ sx: { ...menuPaperSx, minWidth: 200 } }}
                  >
                    <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#E8ECF2', letterSpacing: '0.02em' }}>
                        {user.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: '#8A919D', mt: 0.25 }}>
                        {user.email}
                      </Typography>
                    </Box>
                    <MenuItem component={Link} to="/profile" onClick={closeUserMenu} sx={menuItemSx}>
                      <ListItemIcon sx={{ color: '#00C2FF', minWidth: 32 }}><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primaryTypographyProps={{ fontSize: '0.84rem' }}>Mon compte</ListItemText>
                    </MenuItem>
                    <MenuItem component={Link} to="/orders" onClick={closeUserMenu} sx={menuItemSx}>
                      <ListItemIcon sx={{ color: '#00C2FF', minWidth: 32 }}><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primaryTypographyProps={{ fontSize: '0.84rem' }}>Mes commandes</ListItemText>
                    </MenuItem>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)', my: 0.5 }} />
                    <MenuItem
                      onClick={() => { closeUserMenu(); handleLogout(); }}
                      sx={{ ...menuItemSx, color: '#C7404D', '&:hover': { backgroundColor: 'rgba(199,64,77,0.06)', color: '#C7404D', borderLeftColor: '#C7404D' } }}
                    >
                      <ListItemIcon sx={{ color: '#C7404D', minWidth: 32 }}><LogoutIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primaryTypographyProps={{ fontSize: '0.84rem', color: '#C7404D' }}>Déconnexion</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  size="small"
                  sx={{
                    ml: 0.5,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    py: 0.5,
                    px: 2,
                    borderRadius: '20px',
                    color: '#00C2FF',
                    border: '1px solid rgba(0,194,255,0.3)',
                    backgroundColor: 'rgba(0,194,255,0.04)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0,194,255,0.1)',
                      borderColor: '#00C2FF',
                    },
                  }}
                >
                  Connexion
                </Button>
              )}

              {/* Mobile hamburger */}
              <IconButton
                sx={{
                  display: { md: 'none' },
                  color: '#8A919D',
                  ml: 0.25,
                  transition: 'color 0.2s',
                  '&:hover': { color: '#E8ECF2' },
                }}
                onClick={() => setMobileOpen(true)}
                size="small"
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ── Mobile Drawer ── */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            backgroundColor: 'rgba(10, 10, 16, 0.96)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            borderLeft: '1px solid rgba(255,255,255,0.04)',
            backgroundImage: 'none',
          },
        }}
      >
        {/* Drawer header */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box component={Link} to="/" onClick={() => setMobileOpen(false)} sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Box component="img" src={miraiLogo} alt="MiraiTech" sx={{ height: 26, width: 'auto' }} />
          </Box>
          <IconButton size="small" onClick={() => setMobileOpen(false)} sx={{ color: '#8A919D', '&:hover': { color: '#E8ECF2' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,194,255,0.2), transparent)' }} />

        <Stack sx={{ p: 2, gap: 0.5 }}>
          {/* Mobile search */}
          <Box
            component="form"
            onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleSearch(); }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)',
              px: 1.5,
              py: 0.6,
              mb: suggestions.length > 0 && searchQuery.trim().length > 1 ? 0 : 1.5,
            }}
          >
            <SearchIcon sx={{ fontSize: '0.95rem', color: '#8A919D', mr: 1 }} />
            <InputBase
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ fontSize: '0.85rem', color: '#E8ECF2', flex: 1, '& input::placeholder': { color: '#8A919D', opacity: 1 } }}
            />
          </Box>
          {suggestions.length > 0 && searchQuery.trim().length > 1 && (
            <Paper
              elevation={0}
              sx={{ mb: 1.5, borderColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(19,19,27,0.9)', overflow: 'hidden', borderRadius: '10px' }}
            >
              <List dense disablePadding>
                {suggestions.map((product) => (
                  <ListItemButton
                    key={product.id}
                    onClick={() => handleSuggestionClick(product.slug)}
                    sx={{ py: 0.75, px: 1.5, gap: 1.5, '&:hover': { backgroundColor: 'rgba(0,194,255,0.06)' } }}
                  >
                    <Avatar
                      src={product.images?.[0]?.thumbnail}
                      alt={product.name}
                      variant="rounded"
                      sx={{ width: 32, height: 32, flexShrink: 0, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}
                    />
                    <ListItemText
                      primary={product.name}
                      primaryTypographyProps={{ fontSize: '0.83rem', fontWeight: 500, color: '#E8ECF2' }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          )}

          {/* Navigation links */}
          <Button
            component={Link} to="/products"
            onClick={() => setMobileOpen(false)}
            fullWidth
            sx={{
              justifyContent: 'flex-start',
              color: '#E8ECF2',
              fontSize: '0.84rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              py: 1,
              borderRadius: '8px',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
            }}
          >
            Catalogue
          </Button>

          {/* Promo + Nouveautés row */}
          <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
            <Button
              component={Link}
              to="/products?filter[is_on_sale]=1"
              onClick={() => setMobileOpen(false)}
              startIcon={<LocalOfferIcon sx={{ fontSize: '0.85rem !important' }} />}
              sx={{
                flex: 1,
                color: isPromoActive ? '#fff' : '#D97A50',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: isPromoActive ? '#D97A50' : 'rgba(217,122,80,0.25)',
                backgroundColor: isPromoActive ? 'rgba(217,122,80,0.2)' : 'rgba(217,122,80,0.04)',
                py: 0.8,
                '&:hover': { backgroundColor: 'rgba(217,122,80,0.12)' },
              }}
            >
              Promos
            </Button>
            <Button
              component={Link}
              to="/products?filter[is_new]=1"
              onClick={() => setMobileOpen(false)}
              startIcon={<FiberNewIcon sx={{ fontSize: '0.95rem !important' }} />}
              sx={{
                flex: 1,
                color: isNewActive ? '#fff' : '#2EAD5F',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: isNewActive ? '#2EAD5F' : 'rgba(46,173,95,0.25)',
                backgroundColor: isNewActive ? 'rgba(46,173,95,0.2)' : 'rgba(46,173,95,0.04)',
                py: 0.8,
                '&:hover': { backgroundColor: 'rgba(46,173,95,0.12)' },
              }}
            >
              Nouveautés
            </Button>
          </Box>

          <Box sx={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', my: 0.5 }} />

          <Typography sx={{ fontSize: '0.62rem', color: '#8A919D', letterSpacing: '0.15em', fontWeight: 700, px: 1, pt: 0.5, pb: 0.5, textTransform: 'uppercase' }}>
            Catégories
          </Typography>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              component={Link}
              to={`/products?filter[category_id]=${cat.id}`}
              onClick={() => setMobileOpen(false)}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: '#B0B8C4',
                fontSize: '0.82rem',
                fontWeight: 500,
                pl: 2,
                borderRadius: '6px',
                transition: 'all 0.2s',
                '&:hover': { color: '#00C2FF', backgroundColor: 'rgba(0,194,255,0.04)' },
              }}
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
