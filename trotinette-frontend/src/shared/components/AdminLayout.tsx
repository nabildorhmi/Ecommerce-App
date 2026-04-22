import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import TuneIcon from '@mui/icons-material/Tune';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DescriptionIcon from '@mui/icons-material/Description';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StorefrontIcon from '@mui/icons-material/Storefront';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuthStore } from '@/features/auth/store';
import { apiClient } from '@/shared/api/client';
import miraiLogo from '@/assets/miraiTech-Logo.png';

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 72;
const TOPBAR_HEIGHT = 64;

const cubicEase = 'cubic-bezier(0.4, 0, 0.2, 1)';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/** Page title map derived from pathname */
function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    '/admin': 'Tableau de bord',
    '/admin/products': 'Produits',
    '/admin/products/create': 'Nouveau produit',
    '/admin/categories': 'Categories',
    '/admin/variation-types': 'Types de variations',
    '/admin/orders': 'Commandes',
    '/admin/pages': 'Pages',
    '/admin/hero-banners': 'Hero Banners',
    '/admin/users': 'Utilisateurs',
    '/admin/site-settings': 'Parametres du site',
  };

  // Exact match first
  if (map[pathname]) return map[pathname];

  // Detail/edit pages — match parent
  if (pathname.startsWith('/admin/products/')) return 'Produits';
  if (pathname.startsWith('/admin/orders/')) return 'Commandes';
  if (pathname.startsWith('/admin/users/')) return 'Utilisateurs';

  return 'Administration';
}

/**
 * AdminLayout — admin panel shell with collapsible sidebar + top bar.
 * Renders Outlet for admin page content.
 */
export function AdminLayout() {
  const theme = useTheme();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [collapsed, setCollapsed] = useState(isTablet);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [groupExpanded, setGroupExpanded] = useState<Record<string, boolean>>({
    pilotage: true,
    catalogue: true,
    contenu: true,
    parametres: true,
    administration: true,
  });

  // Pending orders count
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

  const navGroups: NavGroup[] = [
    {
      id: 'pilotage',
      label: 'Pilotage',
      items: [
        { to: '/admin', icon: <DashboardIcon />, label: 'Tableau de bord', exact: true },
        { to: '/admin/orders', icon: <ReceiptLongIcon />, label: 'Commandes', badge: pendingCount },
      ],
    },
    {
      id: 'catalogue',
      label: 'Catalogue',
      items: [
        { to: '/admin/products', icon: <Inventory2Icon />, label: 'Produits' },
        { to: '/admin/categories', icon: <CategoryIcon />, label: 'Categories' },
        { to: '/admin/variation-types', icon: <TuneIcon />, label: 'Types de variations' },
        { to: '/admin/hero-banners', icon: <ViewCarouselIcon />, label: 'Bannieres hero' },
      ],
    },
    {
      id: 'contenu',
      label: 'Contenu',
      items: [
        { to: '/admin/pages', icon: <DescriptionIcon />, label: 'Pages markdown' },
      ],
    },
    ...(user?.role === 'global_admin'
      ? [{
        id: 'parametres',
        label: 'Parametres',
        items: [
          { to: '/admin/site-settings#contact', icon: <SettingsIcon />, label: 'Contact et disponibilite' },
          { to: '/admin/site-settings#social', icon: <SettingsIcon />, label: 'Reseaux sociaux' },
          { to: '/admin/site-settings#shipping', icon: <TuneIcon />, label: 'Livraison et tarification' },
          { to: '/admin/site-settings#short-links', icon: <DescriptionIcon />, label: 'Short links dynamiques' },
        ],
      }]
      : []),
    ...(user?.role === 'global_admin'
      ? [{
        id: 'administration',
        label: 'Administration',
        items: [{ to: '/admin/users', icon: <PeopleIcon />, label: 'Utilisateurs' }],
      }]
      : []),
  ];

  const allNavItems = navGroups.flatMap((group) => group.items);

  const isItemActive = (item: NavItem) => {
    const [itemPath, itemHashRaw] = item.to.split('#');
    const itemHash = itemHashRaw ? `#${itemHashRaw}` : '';

    if (itemHash) {
      return location.pathname === itemPath && location.hash === itemHash;
    }

    if (item.exact) return location.pathname === itemPath;
    return location.pathname.startsWith(itemPath);
  };

  const toggleGroup = (groupId: string) => {
    setGroupExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const renderNavButton = (item: NavItem) => {
    const active = isItemActive(item);
    const iconEl = item.badge && item.badge > 0
      ? <Badge badgeContent={item.badge} color="error" max={99}>{item.icon}</Badge>
      : item.icon;

    const button = (
      <ListItemButton
        key={item.to}
        component={Link}
        to={item.to}
        onClick={() => isMobile && setMobileOpen(false)}
        sx={{
          mx: 1,
          mb: 0.25,
          borderRadius: '8px',
          borderLeft: '3px solid',
          borderLeftColor: active ? '#00C2FF' : 'transparent',
          backgroundColor: active ? 'rgba(0,194,255,0.08)' : 'transparent',
          boxShadow: active ? 'inset 4px 0 12px rgba(0,194,255,0.06)' : 'none',
          color: active ? '#00C2FF' : '#8A919D',
          transition: 'all 0.2s ease',
          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          px: collapsed && !isMobile ? 1.5 : 2,
          py: 1,
          minHeight: 44,
          '&:hover': {
            color: active ? '#00C2FF' : '#E8ECF2',
            backgroundColor: active ? 'rgba(0,194,255,0.08)' : 'rgba(255,255,255,0.03)',
          },
        }}
      >
        <ListItemIcon
          sx={{
            color: 'inherit',
            minWidth: collapsed && !isMobile ? 0 : 36,
            justifyContent: 'center',
          }}
        >
          {iconEl}
        </ListItemIcon>
        {(!collapsed || isMobile) && (
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: '0.82rem',
              fontWeight: active ? 600 : 500,
              whiteSpace: 'nowrap',
            }}
          />
        )}
      </ListItemButton>
    );

    return collapsed && !isMobile ? (
      <Tooltip key={item.to} title={item.label} placement="right" arrow>
        {button}
      </Tooltip>
    ) : (
      <Box key={item.to}>{button}</Box>
    );
  };

  const sidebarWidth = isMobile ? SIDEBAR_EXPANDED : (collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED);

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Logo section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: collapsed && !isMobile ? 1.5 : 2.5,
          py: 2,
          minHeight: TOPBAR_HEIGHT,
          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
        }}
      >
        <Box
          component="img"
          src={miraiLogo}
          alt="MiraiTech"
          sx={{ height: 32, width: 'auto', flexShrink: 0 }}
        />
  
      </Box>

      <Divider sx={{ borderColor: '#1d1d27' }} />

      {/* Nav items */}
      <List sx={{ flex: 1, py: 1, overflow: 'auto' }}>
        {collapsed && !isMobile
          ? allNavItems.map((item) => renderNavButton(item))
          : navGroups.map((group) => {
            const isOpen = groupExpanded[group.id] ?? true;
            return (
              <Box key={group.id} sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => toggleGroup(group.id)}
                  sx={{
                    mx: 1,
                    mb: 0.4,
                    minHeight: 34,
                    borderRadius: '8px',
                    color: '#9BA3AF',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)', color: '#E8ECF2' },
                  }}
                >
                  <ListItemText
                    primary={group.label}
                    primaryTypographyProps={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  />
                  {isOpen ? <ExpandLessIcon sx={{ fontSize: '1rem' }} /> : <ExpandMoreIcon sx={{ fontSize: '1rem' }} />}
                </ListItemButton>
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <Box>{group.items.map((item) => renderNavButton(item))}</Box>
                </Collapse>
              </Box>
            );
          })}
      </List>

      <Divider sx={{ borderColor: '#1d1d27' }} />

      {/* Retour au site */}
      <List sx={{ py: 0.5 }}>
        <Tooltip title={collapsed && !isMobile ? 'Retour au site' : ''} placement="right" arrow>
          <ListItemButton
            component={Link}
            to="/"
            sx={{
              mx: 1,
              borderRadius: '8px',
              color: '#8A919D',
              justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
              px: collapsed && !isMobile ? 1.5 : 2,
              py: 1,
              transition: 'all 0.2s ease',
              '&:hover': { color: '#E8ECF2', backgroundColor: 'rgba(255,255,255,0.03)' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: collapsed && !isMobile ? 0 : 36, justifyContent: 'center' }}>
              <StorefrontIcon />
            </ListItemIcon>
            {(!collapsed || isMobile) && (
              <ListItemText
                primary="Retour au site"
                primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 500 }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </List>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <IconButton
            onClick={() => setCollapsed((c) => !c)}
            size="small"
            sx={{
              color: '#8A919D',
              transition: 'all 0.2s',
              '&:hover': { color: '#E8ECF2', backgroundColor: 'rgba(255,255,255,0.04)' },
            }}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar — permanent on desktop, temporary on mobile */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: SIDEBAR_EXPANDED,
              backgroundColor: 'rgba(12,12,20,0.97)',
              backdropFilter: 'blur(28px)',
              borderRight: '1px solid #1d1d27',
              backgroundImage: 'none',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          PaperProps={{
            sx: {
              width: sidebarWidth,
              transition: `width 0.25s ${cubicEase}`,
              backgroundColor: 'rgba(12,12,20,0.97)',
              backdropFilter: 'blur(28px)',
              borderRight: '1px solid #1d1d27',
              borderLeft: 'none',
              backgroundImage: 'none',
              overflow: 'hidden',
            },
          }}
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            transition: `width 0.25s ${cubicEase}`,
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Right side: top bar + content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          ml: isMobile ? 0 : `${sidebarWidth}px`,
          transition: `margin-left 0.25s ${cubicEase}`,
        }}
      >
        {/* Top bar */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            ml: isMobile ? 0 : `${sidebarWidth}px`,
            width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
            transition: `margin-left 0.25s ${cubicEase}, width 0.25s ${cubicEase}`,
            background: 'rgba(12,12,20,0.92)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid #1d1d27',
            boxShadow: 'none',
          }}
        >
          <Toolbar sx={{ minHeight: TOPBAR_HEIGHT, gap: 1 }}>
            {/* Mobile hamburger */}
            {isMobile && (
              <IconButton
                onClick={() => setMobileOpen(true)}
                size="small"
                sx={{ color: '#8A919D', mr: 1, '&:hover': { color: '#E8ECF2' } }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Page title */}
            <Typography
              sx={{
                fontFamily: '"Orbitron", sans-serif',
                fontWeight: 700,
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                letterSpacing: '0.04em',
                color: '#E8ECF2',
                flex: 1,
              }}
            >
              {getPageTitle(location.pathname)}
            </Typography>

            {/* Right side actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
              {/* Pending orders notification */}
              <IconButton
                component={Link}
                to="/admin/orders"
                size="small"
                sx={{
                  color: '#8A919D',
                  transition: 'all 0.2s',
                  '&:hover': { color: '#00C2FF', backgroundColor: 'rgba(0,194,255,0.06)' },
                }}
              >
                <Badge badgeContent={pendingCount} color="error" max={99}>
                  <NotificationsIcon sx={{ fontSize: '1.15rem' }} />
                </Badge>
              </IconButton>

              {/* Retour au site button (hidden on xs) */}
              <Button
                component={Link}
                to="/"
                variant="outlined"
                size="small"
                startIcon={<StorefrontIcon sx={{ fontSize: '0.9rem !important' }} />}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  py: 0.5,
                  px: 1.5,
                  borderRadius: '20px',
                  color: '#00C2FF',
                  borderColor: 'rgba(0,194,255,0.3)',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#00C2FF',
                    backgroundColor: 'rgba(0,194,255,0.06)',
                  },
                }}
              >
                Retour au site
              </Button>

              {/* User info */}
              {user && (
                <Chip
                  icon={<AccountCircleIcon sx={{ fontSize: '1rem !important', color: '#8A919D !important' }} />}
                  label={user.name}
                  size="small"
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#E8ECF2',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main content area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            mt: `${TOPBAR_HEIGHT}px`,
            p: { xs: 2, sm: 3 },
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
