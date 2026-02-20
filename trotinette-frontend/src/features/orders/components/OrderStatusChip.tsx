import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';

type StatusColor = ChipProps['color'];

const STATUS_COLOR_MAP: Record<string, StatusColor> = {
  pending: 'warning',
  confirmed: 'info',
  dispatched: 'primary',
  delivered: 'success',
  cancelled: 'error',
};

const STATUS_LABEL_MAP: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  dispatched: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

interface OrderStatusChipProps {
  status: string;
}

/**
 * Renders a colored MUI Chip for an order status.
 * Color mapping: pending=warning, confirmed=info, dispatched=primary, delivered=success, cancelled=error.
 */
export function OrderStatusChip({ status }: OrderStatusChipProps) {
  const color: StatusColor = STATUS_COLOR_MAP[status] ?? 'default';
  const label = STATUS_LABEL_MAP[status] ?? status;

  return (
    <Chip
      label={label}
      color={color}
      size="small"
    />
  );
}
