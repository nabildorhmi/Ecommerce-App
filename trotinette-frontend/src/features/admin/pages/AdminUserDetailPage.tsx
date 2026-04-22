import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAdminUser, useDeactivateUser, useActivateUser } from '../api/users';

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const userId = Number(id);
  const { data, isLoading, error } = useAdminUser(userId);
  const deactivateMutation = useDeactivateUser();
  const activateMutation = useActivateUser();

  const user = data?.data;

  const handleDeactivate = async () => {
    if (!user) return;
    try {
      await deactivateMutation.mutateAsync(user.id);
      setConfirmOpen(false);
      setFeedback({ type: 'success', message: 'Utilisateur desactive.' });
    } catch {
      setFeedback({ type: 'error', message: 'Echec de la desactivation.' });
    }
  };

  const handleActivate = async () => {
    if (!user) return;
    try {
      await activateMutation.mutateAsync(user.id);
      setFeedback({ type: 'success', message: 'Utilisateur active.' });
    } catch {
      setFeedback({ type: 'error', message: 'Echec de l activation.' });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Alert severity="error">
        Utilisateur introuvable
      </Alert>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => void navigate('/admin/users')}
        sx={{ mb: 3 }}
      >
        Retour aux utilisateurs
      </Button>

      <Typography variant="h5" fontWeight="bold" mb={3}>
        Detail utilisateur
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
            gap={2}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Nom
              </Typography>
              <Typography>{user.name}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                E-mail
              </Typography>
              <Typography>{user.email}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Telephone
              </Typography>
              <Typography>{user.phone ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Role
              </Typography>
              <Typography>
                {user.role === 'global_admin'
                  ? 'Super admin'
                  : user.role === 'admin'
                    ? 'Admin'
                    : 'Client'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Ville
              </Typography>
              <Typography>{user.address_city ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Adresse
              </Typography>
              <Typography>{user.address_street ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Statut
              </Typography>
              <Box>
                <Chip
                  label={
                    user.is_active
                      ? "Actif"
                      : "Inactif"
                  }
                  color={user.is_active ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Inscrit le
              </Typography>
              <Typography>{new Date(user.created_at).toLocaleDateString('fr-FR')}</Typography>
            </Box>
          </Box>

          {user.is_active && user.role !== 'admin' && (
            <Box mt={3}>
              <Button
                color="error"
                variant="outlined"
                onClick={() => setConfirmOpen(true)}
                disabled={deactivateMutation.isPending || activateMutation.isPending}
              >
                Desactiver
              </Button>
            </Box>
          )}

          {!user.is_active && (
            <Box mt={3}>
              <Button
                color="success"
                variant="outlined"
                onClick={() => void handleActivate()}
                disabled={deactivateMutation.isPending || activateMutation.isPending}
                startIcon={activateMutation.isPending ? <CircularProgress size={16} /> : undefined}
              >
                Activer
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Historique des commandes
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {Array.isArray(user.order_history) && user.order_history.length > 0 ? (
          <Typography color="text.secondary">
            {user.order_history.length} commande(s)
          </Typography>
        ) : (
          <Typography color="text.secondary">
            Aucune commande pour le moment
          </Typography>
        )}
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Desactiver</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Etes-vous sur de vouloir desactiver cet utilisateur ? <strong>{user.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={deactivateMutation.isPending || activateMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDeactivate()}
            disabled={deactivateMutation.isPending || activateMutation.isPending}
            startIcon={
              deactivateMutation.isPending ? (
                <CircularProgress size={16} />
              ) : undefined
            }
          >
            Desactiver
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={feedback?.type ?? 'success'}
          onClose={() => setFeedback(null)}
          sx={{ width: '100%' }}
        >
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
