import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import type { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { t } = useTranslation();
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const handleDecrement = () => updateQuantity(item.productId, item.quantity - 1);
  const handleIncrement = () => updateQuantity(item.productId, item.quantity + 1);
  const handleRemove = () => removeItem(item.productId);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Thumbnail */}
      {item.thumbnailUrl ? (
        <Box
          component="img"
          src={item.thumbnailUrl}
          alt={item.name}
          sx={{
            width: 64,
            height: 64,
            objectFit: 'cover',
            borderRadius: 1,
            flexShrink: 0,
          }}
        />
      ) : (
        <Box
          sx={{
            width: 64,
            height: 64,
            bgcolor: 'grey.200',
            borderRadius: 1,
            flexShrink: 0,
          }}
        />
      )}

      {/* Name + price */}
      <Stack flex={1} spacing={0.5} minWidth={0}>
        <Typography variant="body2" fontWeight={600} noWrap title={item.name}>
          {item.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatCurrency(item.price)}
        </Typography>
      </Stack>

      {/* Quantity controls */}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton
          size="small"
          onClick={handleDecrement}
          disabled={item.quantity <= 1}
          aria-label={t('cart.quantity') + ' -'}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
          {item.quantity}
        </Typography>
        <IconButton
          size="small"
          onClick={handleIncrement}
          disabled={item.quantity >= item.stockQuantity}
          aria-label={t('cart.quantity') + ' +'}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* Subtotal */}
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ minWidth: 80, textAlign: 'right' }}
      >
        {formatCurrency(item.price * item.quantity)}
      </Typography>

      {/* Remove button */}
      <IconButton
        size="small"
        onClick={handleRemove}
        aria-label={t('cart.remove')}
        color="error"
      >
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
