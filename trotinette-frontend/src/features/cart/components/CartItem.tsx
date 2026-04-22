import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ElectricScooterIcon from '@mui/icons-material/ElectricScooter';
import { useCartStore } from '../store';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const handleDecrement = () => updateQuantity(item.productId, item.quantity - 1, item.variantId);
  const handleIncrement = () => updateQuantity(item.productId, item.quantity + 1, item.variantId);
  const handleRemove = () => removeItem(item.productId, item.variantId);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.75,
        py: 1.75,
        borderBottom: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'divider',
      }}
    >
      {/* Thumbnail */}
      {item.thumbnailUrl ? (
        <Box
          component="img"
          src={item.thumbnailUrl}
          alt={item.name}
          sx={{
            width: 68, height: 68, objectFit: 'cover',
            borderRadius: '10px', flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        />
      ) : (
        <Box
          sx={{
            width: 68, height: 68,
            borderRadius: '10px', flexShrink: 0,
            background: 'rgba(0,194,255,0.06)',
            border: '1px solid rgba(0,194,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ElectricScooterIcon sx={{ fontSize: '1.4rem', color: 'rgba(0,194,255,0.4)' }} />
        </Box>
      )}

      {/* Name + variant + unit price */}
      <Stack flex={1} spacing={0.4} minWidth={0}>
        <Typography variant="body2" fontWeight={700} noWrap title={item.name} sx={{ color: 'text.primary' }}>
          {item.name}
        </Typography>
        {item.variantLabel && (
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }} noWrap>
            {item.variantLabel}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {formatCurrency(item.price)} / unité
        </Typography>
      </Stack>

      {/* Quantity controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
        <IconButton
          size="small"
          onClick={handleDecrement}
          disabled={item.quantity <= 1}
          aria-label="Quantité -"
          sx={{ borderRadius: 0, width: 28, height: 28, color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(0,194,255,0.08)' } }}
        >
          <RemoveIcon sx={{ fontSize: '0.85rem' }} />
        </IconButton>
        <Typography variant="body2" sx={{ minWidth: 28, textAlign: 'center', fontWeight: 700, color: 'text.primary', fontSize: '0.85rem' }}>
          {item.quantity}
        </Typography>
        <IconButton
          size="small"
          onClick={handleIncrement}
          disabled={item.quantity >= item.stockQuantity}
          aria-label="Quantité +"
          sx={{ borderRadius: 0, width: 28, height: 28, color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(0,194,255,0.08)' } }}
        >
          <AddIcon sx={{ fontSize: '0.85rem' }} />
        </IconButton>
      </Box>

      {/* Item total */}
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ minWidth: 72, textAlign: 'right', color: '#00C2FF', flexShrink: 0 }}
      >
        {formatCurrency(item.price * item.quantity)}
      </Typography>

      {/* Remove */}
      <IconButton
        size="small"
        onClick={handleRemove}
        aria-label="Supprimer"
        sx={{ color: 'text.disabled', '&:hover': { color: '#C7404D', bgcolor: 'rgba(199,64,77,0.08)' }, flexShrink: 0 }}
      >
        <DeleteOutlineIcon sx={{ fontSize: '1rem' }} />
      </IconButton>
    </Box>
  );
}
