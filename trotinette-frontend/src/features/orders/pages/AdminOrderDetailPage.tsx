import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAdminOrder, useTransitionOrder, useAddOrderNote } from '../api/orders';
import { OrderStatusChip } from '../components/OrderStatusChip';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

/**
 * Admin order detail page.
 * Shows order header, items, summary, status transition buttons, notes, and audit log.
 */
export function AdminOrderDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const orderId = Number(id);
  const { data, isLoading, error } = useAdminOrder(orderId);

  const transitionMutation = useTransitionOrder();
  const noteMutation = useAddOrderNote();

  const [noteText, setNoteText] = useState('');
  const [transitionNote, setTransitionNote] = useState('');
  const [pendingTransition, setPendingTransition] = useState<string | null>(null);

  const order = data?.data;

  const handleTransition = async (status: string) => {
    await transitionMutation.mutateAsync({
      orderId,
      status,
      note: transitionNote || undefined,
    });
    setPendingTransition(null);
    setTransitionNote('');
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await noteMutation.mutateAsync({ orderId, note: noteText });
    setNoteText('');
  };

  if (isLoading) {
    return (
      <Box p={3} maxWidth="lg" mx="auto">
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Order not found
      </Alert>
    );
  }

  return (
    <Box p={3} maxWidth="lg" mx="auto">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => void navigate('/admin/orders')}
        sx={{ mb: 3 }}
      >
        {t('orders.backToOrders')}
      </Button>

      {/* ── Order Header ── */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            {order.order_number}
          </Typography>
          <OrderStatusChip status={order.status} />
        </Box>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }}
          gap={2}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t('orders.date')}
            </Typography>
            <Typography>
              {new Date(order.created_at).toLocaleString()}
            </Typography>
          </Box>
          {order.user && (
            <>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('orders.customer')}
                </Typography>
                <Typography
                  component={Link}
                  to={`/admin/users/${order.user.id}`}
                  sx={{ textDecoration: 'none', color: 'primary.main' }}
                >
                  {order.user.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('adminUsers.email')}
                </Typography>
                <Typography>{order.user.email}</Typography>
              </Box>
            </>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t('auth.phone')}
            </Typography>
            <Typography>{order.phone}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t('orders.city')}
            </Typography>
            <Typography>{order.delivery_zone.city}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* ── Order Items ── */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {t('orders.items')}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>{t('admin.products.frenchName')}</TableCell>
                <TableCell align="right">{t('admin.products.price')}</TableCell>
                <TableCell align="right">{t('cart.quantity')}</TableCell>
                <TableCell align="right">{t('checkout.subtotal')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {item.product_sku}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.product?.name ?? '—'}</TableCell>
                  <TableCell align="right">{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Order Summary */}
        <Box mt={2} textAlign="right">
          <Typography variant="body2" color="text.secondary">
            {t('checkout.subtotal')}: {formatCurrency(order.subtotal)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('checkout.deliveryFee')}: {formatCurrency(order.delivery_fee)}
          </Typography>
          <Typography fontWeight="bold" mt={0.5}>
            {t('checkout.total')}: {formatCurrency(order.total)}
          </Typography>
        </Box>
      </Paper>

      {/* ── Status Transitions ── */}
      {order.allowed_transitions.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            {t('orders.transitionOrder')}
          </Typography>

          {/* Optional note for transition */}
          {pendingTransition && (
            <Box mb={2}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label={t('orders.transitionNote')}
                placeholder={t('orders.notePlaceholder')}
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
                size="small"
              />
            </Box>
          )}

          <Box display="flex" gap={1} flexWrap="wrap">
            {order.allowed_transitions.map((targetStatus) => {
              const isCancel = targetStatus === 'cancelled';
              const isThisTransition = pendingTransition === targetStatus;
              return (
                <Box key={targetStatus} display="flex" gap={1}>
                  {isThisTransition ? (
                    <>
                      <Button
                        variant="contained"
                        color={isCancel ? 'error' : 'primary'}
                        disabled={transitionMutation.isPending}
                        startIcon={
                          transitionMutation.isPending ? (
                            <CircularProgress size={16} />
                          ) : undefined
                        }
                        onClick={() => void handleTransition(targetStatus)}
                      >
                        {t(`orders.status.${targetStatus}`, { defaultValue: targetStatus })} ✓
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setPendingTransition(null);
                          setTransitionNote('');
                        }}
                      >
                        {t('admin.products.cancel')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      color={isCancel ? 'error' : 'primary'}
                      disabled={transitionMutation.isPending}
                      onClick={() => setPendingTransition(targetStatus)}
                    >
                      {t(`orders.status.${targetStatus}`, { defaultValue: targetStatus })}
                    </Button>
                  )}
                </Box>
              );
            })}
          </Box>

          {transitionMutation.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(transitionMutation.error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? 'Transition failed'}
            </Alert>
          )}
        </Paper>
      )}

      {/* ── Order Notes ── */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {t('orders.orderNotes')}
        </Typography>

        {order.note && (
          <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="body2">{order.note}</Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" mb={1}>
          {t('orders.addNote')}
        </Typography>
        <Box display="flex" gap={2} alignItems="flex-start">
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder={t('orders.notePlaceholder')}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            size="small"
          />
          <Button
            variant="contained"
            onClick={() => void handleAddNote()}
            disabled={noteMutation.isPending || !noteText.trim()}
            startIcon={
              noteMutation.isPending ? <CircularProgress size={16} /> : undefined
            }
          >
            {t('orders.submitNote')}
          </Button>
        </Box>

        {noteMutation.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to add note
          </Alert>
        )}
      </Paper>

      {/* ── Audit Log ── */}
      {order.status_logs && order.status_logs.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            {t('orders.auditLog')}
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('orders.date')}</TableCell>
                  <TableCell>{t('orders.transition')}</TableCell>
                  <TableCell>{t('orders.actor')}</TableCell>
                  <TableCell>{t('orders.noteLabel')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...order.status_logs]
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {log.from_status_label
                          ? `${log.from_status_label} → ${log.to_status_label}`
                          : `→ ${log.to_status_label}`}
                      </TableCell>
                      <TableCell>
                        {log.actor_type === 'admin'
                          ? 'Admin'
                          : log.actor_type === 'customer'
                          ? 'Customer'
                          : '—'}
                      </TableCell>
                      <TableCell>{log.note ?? '—'}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
