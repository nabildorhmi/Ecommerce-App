import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import LinearProgress from '@mui/material/LinearProgress';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { useCartStore } from '../store';
import { CartItem } from './CartItem';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useSiteSettings } from '@/shared/hooks/useSiteSettings';
import { defaultSiteSettings, getDeliveryFeeForSubtotal, getFreeShippingRemaining } from '@/shared/types/siteSettings';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems());
  const subtotalCentimes = useCartStore((s) => s.subtotalCentimes());
  const { data: siteSettings } = useSiteSettings();

  const pricingSettings = siteSettings ?? defaultSiteSettings;
  const deliveryFeeCentimes = getDeliveryFeeForSubtotal(pricingSettings, subtotalCentimes);
  const freeShippingThreshold = pricingSettings.free_shipping_threshold;
  const remaining = getFreeShippingRemaining(pricingSettings, subtotalCentimes);
  const progressPct = freeShippingThreshold > 0
    ? Math.min(100, (subtotalCentimes / freeShippingThreshold) * 100)
    : 0;

  const handleCheckout = () => {
    onClose();
    void navigate('/checkout');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 440 },
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(11, 11, 14, 0.82)' : 'background.paper',
          backdropFilter: (theme) => theme.palette.mode === 'dark' ? 'blur(24px)' : 'none',
          borderLeft: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'divider',
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2.5, py: 2,
          borderBottom: '1px solid rgba(0,194,255,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25 }}>
          <ShoppingCartOutlinedIcon sx={{ fontSize: '1.1rem', color: '#00C2FF', mr: 0.5 }} />
          <Typography variant="h6" fontWeight={800} color="var(--mirai-white)">
            Panier
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif JP", serif', fontSize: '0.6rem', color: 'rgba(0,194,255,0.2)', letterSpacing: '0.1em' }}>
            カート
          </Typography>
          {totalItems > 0 && (
            <Chip
              label={totalItems}
              size="small"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(0,194,255,0.15)', color: '#00C2FF', border: '1px solid rgba(0,194,255,0.25)', ml: 0.25, minWidth: 20 }}
            />
          )}
        </Box>
        <IconButton onClick={onClose} aria-label="Fermer" sx={{ color: 'var(--mirai-gray)', position: 'relative', zIndex: 1, '&:hover': { color: 'var(--mirai-white)' } }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Free shipping progress */}
      {items.length > 0 && freeShippingThreshold > 0 && (
        <Box sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          {remaining > 0 ? (
            <Box>
              {deliveryFeeCentimes > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocalShippingOutlinedIcon sx={{ fontSize: '0.9rem', color: '#00C2FF' }} />
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 500 }}>
                    Plus que <Box component="span" sx={{ color: '#00C2FF', fontWeight: 700 }}>{formatCurrency(remaining)}</Box> pour la livraison gratuite !
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocalShippingOutlinedIcon sx={{ fontSize: '0.9rem', color: '#2EAD5F' }} />
                  <Typography sx={{ fontSize: '0.72rem', color: '#2EAD5F', fontWeight: 700 }}>
                    Livraison actuellement offerte selon vos regles de tarification.
                  </Typography>
                </Box>
              )}
              <LinearProgress
                variant="determinate"
                value={progressPct}
                sx={{ height: 5, borderRadius: 4, bgcolor: 'rgba(0,194,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00C2FF' } }}
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShippingOutlinedIcon sx={{ fontSize: '0.9rem', color: '#2EAD5F' }} />
              <Typography sx={{ fontSize: '0.72rem', color: '#2EAD5F', fontWeight: 700 }}>
                Livraison gratuite débloquée !
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1 }}>
        {items.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" spacing={2.5} sx={{ py: 10 }}>
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(0,194,255,0.06)', border: '1px solid rgba(0,194,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCartOutlinedIcon sx={{ fontSize: 36, color: 'rgba(0,194,255,0.4)' }} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>Votre panier est vide</Typography>
              <Typography color="text.secondary" variant="body2">Découvrez nos scooters électriques premium</Typography>
            </Box>
            <Button variant="outlined" size="small" onClick={() => { onClose(); void navigate('/products'); }} sx={{ letterSpacing: '0.06em', fontSize: '0.78rem' }}>
              Explorer le catalogue
            </Button>
          </Stack>
        ) : (
          <Box>
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={`${item.productId}-${item.variantId ?? 'default'}`}
                layout
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
              >
                <CartItem item={item} />
                {/* Scarcity indicator for low-stock items */}
                {item.stockQuantity <= 5 && item.stockQuantity > 0 && (
                  <Typography sx={{
                    fontSize: '0.65rem', color: '#D4A43A', fontWeight: 600,
                    px: 1, pb: 0.5, mt: -0.5,
                  }}>
                    Seulement {item.stockQuantity} restant{item.stockQuantity > 1 ? 's' : ''} en stock
                  </Typography>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          </Box>
        )}
      </Box>

      {/* Footer */}
      {items.length > 0 && (
        <Box sx={{ borderTop: '1px solid rgba(0,194,255,0.08)', px: 2.5, py: 2.5 }}>
          <Stack spacing={1.75}>
            {/* Subtotal */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary" fontWeight={500}>Sous-total ({totalItems} article{totalItems > 1 ? 's' : ''})</Typography>
              <Typography variant="body1" fontWeight={800} sx={{ color: 'var(--mirai-cyan)' }}>
                {formatCurrency(subtotalCentimes)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary" fontWeight={500}>Livraison</Typography>
              <Typography variant="body2" fontWeight={700} color={deliveryFeeCentimes === 0 ? '#2EAD5F' : 'text.primary'}>
                {deliveryFeeCentimes === 0 ? 'Gratuit' : formatCurrency(deliveryFeeCentimes)}
              </Typography>
            </Stack>

            <Divider sx={{ borderColor: 'rgba(0,194,255,0.08)' }} />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleCheckout}
              disabled={items.length === 0}
              sx={{
                py: 1.75, borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem',
                bgcolor: '#00C2FF',
                boxShadow: '0 4px 14px rgba(0,194,255,0.25)',
                '&:hover': { bgcolor: '#33CFFF', transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,194,255,0.35)' },
                transition: 'all 0.3s ease',
              }}
            >
              Commander — {formatCurrency(subtotalCentimes)}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => { onClose(); void navigate('/products'); }}
              sx={{
                borderRadius: '10px',
                color: '#00C2FF',
                borderColor: 'rgba(0,194,255,0.35)',
                '&:hover': { borderColor: '#00C2FF', backgroundColor: 'rgba(0,194,255,0.06)' },
              }}
            >
              Continuer mes achats
            </Button>

            {/* Trust signal */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
              <LockOutlinedIcon sx={{ fontSize: '0.8rem', color: 'text.disabled' }} />
              <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>
                Paiement sécurisé · Retour facile 30 jours
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}
    </Drawer>
  );
}
