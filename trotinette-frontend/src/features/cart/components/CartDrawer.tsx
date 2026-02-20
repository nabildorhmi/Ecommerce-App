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
import { formatCurrency } from '../../../shared/utils/formatCurrency';

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
      PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, display: 'flex', flexDirection: 'column' } }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {"Panier"}{' '}
          {totalItems > 0 && (
            <Typography component="span" variant="body2" color="text.secondary">
              ({`${totalItems} article(s)`})
            </Typography>
          )}
        </Typography>
        <IconButton onClick={onClose} aria-label="Fermer">
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
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', px: 2, py: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" fontWeight={600}>
              {"Sous-total"}
            </Typography>
            <Typography variant="body1" fontWeight={700} color="primary">
              {formatCurrency(subtotalCentimes)}
            </Typography>
          </Stack>
          <Divider />
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleCheckout}
            disabled={items.length === 0}
          >
            {"Passer la commande"}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
