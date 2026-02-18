import { useTranslation } from 'react-i18next';
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

interface OrderStatusChipProps {
  status: string;
}

/**
 * Renders a colored MUI Chip for an order status.
 * Color mapping: pending=warning, confirmed=info, dispatched=primary, delivered=success, cancelled=error.
 * Label is translated via i18n key: orders.status.{status}
 */
export function OrderStatusChip({ status }: OrderStatusChipProps) {
  const { t } = useTranslation();

  const color: StatusColor = STATUS_COLOR_MAP[status] ?? 'default';

  return (
    <Chip
      label={t(`orders.status.${status}`, { defaultValue: status })}
      color={color}
      size="small"
    />
  );
}
