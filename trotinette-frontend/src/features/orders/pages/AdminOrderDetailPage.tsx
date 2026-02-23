import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useAdminOrder, useTransitionOrder, useAddOrderNote } from '../api/orders';
import { apiClient } from '../../../shared/api/client';
import { OrderStatusChip } from '../components/OrderStatusChip';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

/** French labels for status transition buttons */
const STATUS_LABELS: Record<string, string> = {
  confirmed:  'Confirmer',
  dispatched: 'Expédier',
  delivered:  'Marquer livré',
  cancelled:  'Annuler',
};

/**
 * Admin order detail page.
 * Shows order header, items, summary, status transition buttons, notes, and audit log.
 */
export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const orderId = Number(id);
  const { data, isLoading, error } = useAdminOrder(orderId);

  const transitionMutation = useTransitionOrder();
  const noteMutation = useAddOrderNote();

  const [noteText, setNoteText] = useState('');
  const [transitionNote, setTransitionNote] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const order = data?.data;

  const handleTransition = async (status: string) => {
    await transitionMutation.mutateAsync({
      orderId,
      status,
      note: transitionNote || undefined,
    });
    setConfirmDialog(null);
    setTransitionNote('');
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await noteMutation.mutateAsync({ orderId, note: noteText });
    setNoteText('');
  };

  const handleDownloadInvoice = async () => {
    setDownloadingPdf(true);
    try {
      const response = await apiClient.get(`/admin/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${order?.order_number ?? orderId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloadingPdf(false);
    }
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
        {"Retour aux commandes"}
      </Button>

      {/* ── Order Header ── */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            {order.order_number}
          </Typography>
          <OrderStatusChip status={order.status} />
          <Button
            variant="outlined"
            size="small"
            startIcon={downloadingPdf ? <CircularProgress size={16} /> : <PictureAsPdfIcon />}
            onClick={() => void handleDownloadInvoice()}
            disabled={downloadingPdf}
          >
            {"Télécharger la facture"}
          </Button>
        </Box>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }}
          gap={2}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              {"Date"}
            </Typography>
            <Typography>
              {new Date(order.created_at).toLocaleString()}
            </Typography>
          </Box>
          {order.user && (
            <>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {"Client"}
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
                  {"E-mail"}
                </Typography>
                <Typography>{order.user.email}</Typography>
              </Box>
            </>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">
              {"Téléphone"}
            </Typography>
            <Typography>{order.phone}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {"Ville"}
            </Typography>
            <Typography>{order.city ?? order.delivery_zone?.city ?? '—'}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* ── Order Items ── */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {"Articles"}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>{"Nom en français"}</TableCell>
                <TableCell align="right">{"Prix"}</TableCell>
                <TableCell align="right">{"Quantité"}</TableCell>
                <TableCell align="right">{"Sous-total"}</TableCell>
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
                  <TableCell>
                    <Typography variant="body2">{item.product?.name ?? '—'}</Typography>
                    {item.variant_label && (
                      <Typography variant="caption" color="primary.main">
                        {item.variant_label}
                      </Typography>
                    )}
                  </TableCell>
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
            {"Sous-total"}: {formatCurrency(order.subtotal)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {"Frais de livraison"}: {formatCurrency(order.delivery_fee)}
          </Typography>
          <Typography fontWeight="bold" mt={0.5}>
            {"Total"}: {formatCurrency(order.total)}
          </Typography>
        </Box>
      </Paper>

      {/* ── Status Transitions ── */}
      {order.allowed_transitions.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            {"Changer le statut"}
          </Typography>

          <Box display="flex" gap={1} flexWrap="wrap">
            {order.allowed_transitions.map((targetStatus) => {
              const isCancel = targetStatus === 'cancelled';
              return (
                <Button
                  key={targetStatus}
                  variant="outlined"
                  color={isCancel ? 'error' : 'primary'}
                  disabled={transitionMutation.isPending}
                  onClick={() => setConfirmDialog(targetStatus)}
                >
                  {STATUS_LABELS[targetStatus] ?? targetStatus}
                </Button>
              );
            })}
          </Box>

          {transitionMutation.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(transitionMutation.error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? 'Transition échouée'}
            </Alert>
          )}
        </Paper>
      )}

      {/* ── Confirmation Dialog ── */}
      <Dialog
        open={Boolean(confirmDialog)}
        onClose={() => { setConfirmDialog(null); setTransitionNote(''); }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmer l'action</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {confirmDialog === 'cancelled'
              ? 'Êtes-vous sûr de vouloir annuler cette commande ?'
              : `Passer le statut à « ${STATUS_LABELS[confirmDialog ?? ''] ?? confirmDialog} » ?`}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Note (optionnel)"
            placeholder="Saisir une note..."
            value={transitionNote}
            onChange={(e) => setTransitionNote(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => { setConfirmDialog(null); setTransitionNote(''); }}
            variant="outlined"
            disabled={transitionMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={() => confirmDialog && void handleTransition(confirmDialog)}
            variant="contained"
            color={confirmDialog === 'cancelled' ? 'error' : 'primary'}
            disabled={transitionMutation.isPending}
            startIcon={transitionMutation.isPending ? <CircularProgress size={16} /> : undefined}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Order Notes ── */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {"Notes"}
        </Typography>

        {order.note && (
          <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="body2">{order.note}</Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" mb={1}>
          {"Ajouter une note"}
        </Typography>
        <Box display="flex" gap={2} alignItems="flex-start">
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder={"Saisir une note..."}
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
            {"Enregistrer"}
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
            {"Historique des statuts"}
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{"Date"}</TableCell>
                  <TableCell>{"Transition"}</TableCell>
                  <TableCell>{"Acteur"}</TableCell>
                  <TableCell>{"Note"}</TableCell>
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
