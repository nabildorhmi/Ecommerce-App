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
import PersonIcon from '@mui/icons-material/Person';
import { useAdminUser, useDeactivateUser, useActivateUser } from '../api/users';

const glassSx = {
  background: 'rgba(12, 12, 20, 0.7)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0,194,255,0.09)',
  borderRadius: '18px',
  p: { xs: 2, md: 3 },
};

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
        sx={{
          mb: 3,
          borderColor: 'rgba(0,194,255,0.3)',
          color: 'var(--mirai-gray)',
          borderRadius: '8px',
          '&:hover': { borderColor: '#00C2FF', color: '#00C2FF' },
        }}
        variant="outlined"
      >
        Retour aux utilisateurs
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--mirai-white)' }}>
          Detail utilisateur
        </Typography>
        <Typography sx={{ fontFamily: '"Noto Serif JP", serif', fontSize: '0.75rem', color: 'rgba(0,194,255,0.2)', letterSpacing: '0.1em' }}>
          ユーザー詳細
        </Typography>
      </Box>

      <Box sx={{ ...glassSx, mb: 3 }}>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
            gap={2}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(0,194,255,0.5)' }}>
                Nom
              </Typography>
              <Typography>{user.name}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(0,194,255,0.5)' }}>
                E-mail
              </Typography>
              <Typography>{user.email}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(0,194,255,0.5)' }}>
                Telephone
              </Typography>
              <Typography>{user.phone ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(0,194,255,0.5)' }}>
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
              <Typography variant="caption" sx={{ color: 'rgba(0,194,255,0.5)' }}>
                Ville
              </Typography>
              <Typography>{user.address_city ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(0,194,255,0.5)' }}>
                Adresse
              </Typography>
              <Typography>{user.address_street ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(0,194,255,0.5)' }}>
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
              <Typography variant="caption" sx={{ color: 'rgba(0,194,255,0.5)' }}>
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
      </Box>

      <Box sx={{ ...glassSx }}>
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
      </Box>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        slotProps={{
          paper: {
            sx: {
              background: 'rgba(12, 12, 20, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,194,255,0.12)',
              borderRadius: '16px',
            },
          },
        }}
      >
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
