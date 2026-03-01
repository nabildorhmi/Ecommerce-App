import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useNavigate } from 'react-router';
import { useCartStore } from '../store';
import { CartItem } from './CartItem';
import { formatCurrency } from '@/shared/utils/formatCurrency';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems());
  const subtotalCentimes = useCartStore((s) => s.subtotalCentimes());

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
          width: { xs: '100%', sm: 420 },
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(11, 11, 14, 0.75)' : 'background.paper',
          backdropFilter: (theme) => theme.palette.mode === 'dark' ? 'blur(24px)' : 'none',
          borderLeft: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'divider',
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 2,
          borderBottom: '1px solid rgba(0,194,255,0.1)',
          background: 'linear-gradient(180deg, rgba(0,194,255,0.04) 0%, transparent 100%)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(0,194,255,0.3), transparent)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h6" fontWeight={800} color="var(--mirai-white)">
            {"Panier"}
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif JP", serif', fontSize: '0.6rem', color: 'rgba(0,194,255,0.2)', letterSpacing: '0.1em' }}>
            カート
          </Typography>
          {totalItems > 0 && (
            <Typography component="span" variant="body2" sx={{ color: 'var(--mirai-cyan)', fontWeight: 700 }}>
              ({`${totalItems}`})
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} aria-label="Fermer" sx={{ color: 'var(--mirai-gray)', position: 'relative', zIndex: 1, '&:hover': { color: 'var(--mirai-white)' } }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2 }}>
        {items.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 8 }}>
            <ShoppingCartOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography color="text.secondary">{"Votre panier est vide"}</Typography>
          </Stack>
        ) : (
          <Box>
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{
        borderTop: '1px solid rgba(0,194,255,0.1)',
        background: 'linear-gradient(0deg, rgba(0,194,255,0.04) 0%, transparent 100%)',
        px: 2.5,
        py: 2
      }}>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" fontWeight={600} color="var(--mirai-gray)">
              {"Sous-total"}
            </Typography>
            <Typography variant="body1" fontWeight={800} sx={{ color: 'var(--mirai-cyan)' }}>
              {formatCurrency(subtotalCentimes)}
            </Typography>
          </Stack>
          <Divider sx={{ borderColor: 'rgba(0,194,255,0.1)' }} />
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleCheckout}
            disabled={items.length === 0}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              fontWeight: 700,
              background: 'linear-gradient(45deg, #00C2FF, #0099CC)',
              '&:hover': { transform: 'translateY(-2px)' },
              transition: 'transform 0.2s',
            }}
          >
            {"Passer la commande"}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
