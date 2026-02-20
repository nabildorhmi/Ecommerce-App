import { useSearchParams, useNavigate } from 'react-router';
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
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import type { AdminOrderFilters } from '../api/orders';

const ORDER_STATUSES = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];

/**
 * Admin order list page with filters (status, delivery zone, date range) and pagination.
 * Filters are stored in URL search params.
 */
export function AdminOrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filters from URL
  const status = searchParams.get('status') ?? '';
  const city = searchParams.get('city') ?? '';
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
  if (city) filters['filter[city]'] = city;
  if (dateFrom) filters['filter[date_from]'] = dateFrom;
  if (dateTo) filters['filter[date_to]'] = dateTo;

  const { data, isLoading, error } = useAdminOrders(filters);

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
        {"Gestion des commandes"}
      </Typography>

      {/* Filter bar */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        {/* Status filter */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{"Statut"}</InputLabel>
          <Select
            label={"Statut"}
            value={status}
            onChange={(e) => setParam('status', e.target.value)}
          >
            <MenuItem value="">{"Tous les statuts"}</MenuItem>
            {ORDER_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* City filter */}
        <TextField
          size="small"
          label={"Ville"}
          value={city}
          onChange={(e) => setParam('city', e.target.value)}
          sx={{ minWidth: 180 }}
        />

        {/* Date from */}
        <TextField
          size="small"
          type="date"
          label={"Date de début"}
          value={dateFrom}
          onChange={(e) => setParam('date_from', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        {/* Date to */}
        <TextField
          size="small"
          type="date"
          label={"Date de fin"}
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
              <TableCell>{"N° de commande"}</TableCell>
              <TableCell>
                <TableSortLabel
                  active={isSortActive('created_at')}
                  direction={sortDirection('created_at')}
                  onClick={() => handleSort('created_at')}
                >
                  {"Date"}
                </TableSortLabel>
              </TableCell>
              <TableCell>{"Client"}</TableCell>
              <TableCell>{"Statut"}</TableCell>
              <TableCell>{"Ville"}</TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={isSortActive('total')}
                  direction={sortDirection('total')}
                  onClick={() => handleSort('total')}
                >
                  {"Total"}
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">{"Articles"}</TableCell>
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
                  <TableCell>{order.city ?? order.delivery_zone?.city ?? '—'}</TableCell>
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
