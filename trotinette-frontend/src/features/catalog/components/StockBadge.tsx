import Chip from '@mui/material/Chip';

interface StockBadgeProps {
  inStock: boolean;
}

export function StockBadge({ inStock }: StockBadgeProps) {
  return (
    <Chip
      label={inStock ? 'En stock' : 'Rupture de stock'}
      color={inStock ? 'success' : 'error'}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
}
