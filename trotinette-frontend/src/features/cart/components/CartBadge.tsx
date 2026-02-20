import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useCartStore } from '../store';

interface CartBadgeProps {
  onToggle: () => void;
}

export function CartBadge({ onToggle }: CartBadgeProps) {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <IconButton
      onClick={onToggle}
      aria-label="Panier"
      color="inherit"
    >
      <Badge
        badgeContent={totalItems}
        color="error"
        invisible={totalItems === 0}
      >
        <ShoppingCartOutlinedIcon />
      </Badge>
    </IconButton>
  );
}
