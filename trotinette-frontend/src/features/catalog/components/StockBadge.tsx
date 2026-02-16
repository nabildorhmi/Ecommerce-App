import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';

interface StockBadgeProps {
  inStock: boolean;
}

export function StockBadge({ inStock }: StockBadgeProps) {
  const { t } = useTranslation();

  return (
    <Chip
      label={inStock ? t('catalog.inStock') : t('catalog.outOfStock')}
      color={inStock ? 'success' : 'error'}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
}
