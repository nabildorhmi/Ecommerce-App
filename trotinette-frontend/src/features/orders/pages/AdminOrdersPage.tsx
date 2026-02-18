import { useSearchParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TableSortLabel from '@mui/material/TableSortLabel';
import { useAdminOrders } from '../api/orders';
import { OrderStatusChip } from '../components/OrderStatusChip';
import { useDeliveryZones } from '../../checkout/api/deliveryZones';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import type { AdminOrderFilters } from '../api/orders';

const ORDER_STATUSES = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];

/**
 * Admin order list page with filters (status, delivery zone, date range) and pagination.
 * Filters are stored in URL search params.
 */
export function AdminOrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filters from URL
  const status = searchParams.get('status') ?? '';
  const deliveryZoneId = searchParams.get('delivery_zone_id') ?? '';
  const dateFrom = searchParams.get('date_from') ?? '';
  const dateTo = searchParams.get('date_to') ?? '';
  const page = Number(searchParams.get('page') ?? '1');
  const sort = searchParams.get('sort') ?? '-created_at';

  // Build filters for query
  const filters: AdminOrderFilters = {
    page,
    sort,
  };
  if (status) filters['filter[status]'] = status;
  if (deliveryZoneId) filters['filter[delivery_zone_id]'] = deliveryZoneId;
  if (dateFrom) filters['filter[date_from]'] = dateFrom;
  if (dateTo) filters['filter[date_to]'] = dateTo;

  const { data, isLoading, error } = useAdminOrders(filters);
  const { data: zones } = useDeliveryZones();

  const orders = data?.data ?? [];
  const meta = data?.meta;

  const setParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.set('page', '1'); // reset to page 1 on filter change
      return next;
    });
  };

  const handleSort = (field: string) => {
    const isDesc = sort === `-${field}`;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('sort', isDesc ? field : `-${field}`);
      next.set('page', '1');
      return next;
    });
  };

  const sortDirection = (field: string): 'asc' | 'desc' => {
    if (sort === field) return 'asc';
    if (sort === `-${field}`) return 'desc';
    return 'desc';
  };

  const isSortActive = (field: string) =>
    sort === field || sort === `-${field}`;

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load orders
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        {t('orders.adminOrders')}
      </Typography>

      {/* Filter bar */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        {/* Status filter */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{t('orders.status.label')}</InputLabel>
          <Select
            label={t('orders.status.label')}
            value={status}
            onChange={(e) => setParam('status', e.target.value)}
          >
            <MenuItem value="">{t('orders.allStatuses')}</MenuItem>
            {ORDER_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {t(`orders.status.${s}`, { defaultValue: s })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Delivery zone filter */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>{t('orders.city')}</InputLabel>
          <Select
            label={t('orders.city')}
            value={deliveryZoneId}
            onChange={(e) => setParam('delivery_zone_id', String(e.target.value))}
          >
            <MenuItem value="">{t('orders.allCities')}</MenuItem>
            {(zones ?? []).map((zone) => (
              <MenuItem key={zone.id} value={String(zone.id)}>
                {zone.city}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date from */}
        <TextField
          size="small"
          type="date"
          label={t('orders.dateFrom')}
          value={dateFrom}
          onChange={(e) => setParam('date_from', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        {/* Date to */}
        <TextField
          size="small"
          type="date"
          label={t('orders.dateTo')}
          value={dateTo}
          onChange={(e) => setParam('date_to', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* Order table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('orders.orderNumber')}</TableCell>
              <TableCell>
                <TableSortLabel
                  active={isSortActive('created_at')}
                  direction={sortDirection('created_at')}
                  onClick={() => handleSort('created_at')}
                >
                  {t('orders.date')}
                </TableSortLabel>
              </TableCell>
              <TableCell>{t('orders.customer')}</TableCell>
              <TableCell>{t('orders.status.label')}</TableCell>
              <TableCell>{t('orders.city')}</TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={isSortActive('total')}
                  direction={sortDirection('total')}
                  onClick={() => handleSort('total')}
                >
                  {t('orders.total')}
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">{t('orders.items')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No orders found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => void navigate(`/admin/orders/${order.id}`)}
                >
                  <TableCell>{order.order_number}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{order.user?.name ?? '—'}</TableCell>
                  <TableCell>
                    <OrderStatusChip status={order.status} />
                  </TableCell>
                  <TableCell>{order.delivery_zone.city}</TableCell>
                  <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                  <TableCell align="right">{order.items.length}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {meta && (
        <TablePagination
          component="div"
          count={meta.total}
          page={page - 1}
          rowsPerPage={meta.per_page}
          rowsPerPageOptions={[]}
          onPageChange={(_e, newPage) => {
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set('page', String(newPage + 1));
              return next;
            });
          }}
        />
      )}
    </Box>
  );
}
