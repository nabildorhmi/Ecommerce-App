import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import Box from '@mui/material/Box';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAdminUser, useDeactivateUser } from '../api/users';

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const userId = Number(id);
  const { data, isLoading, error } = useAdminUser(userId);
  const deactivateMutation = useDeactivateUser();

  const user = data?.data;

  const handleDeactivate = async () => {
    if (!user) return;
    await deactivateMutation.mutateAsync(user.id);
    setConfirmOpen(false);
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
        Utilisateur introuvable / User not found
      </Alert>
    );
  }

  return (
    <Box p={3} maxWidth="md" mx="auto">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => void navigate('/admin/users')}
        sx={{ mb: 3 }}
      >
        {"Retour aux utilisateurs"}
      </Button>

      <Typography variant="h5" fontWeight="bold" mb={3}>
        {"Détail utilisateur"}
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
                {"Nom"}
              </Typography>
              <Typography>{user.name}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {"E-mail"}
              </Typography>
              <Typography>{user.email}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {"Téléphone"}
              </Typography>
              <Typography>{user.phone ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {"Rôle"}
              </Typography>
              <Typography>{user.role}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {"Ville"}
              </Typography>
              <Typography>{user.address_city ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {"Adresse"}
              </Typography>
              <Typography>{user.address_street ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {"Statut"}
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
          </Box>

          {user.is_active && user.role !== 'admin' && (
            <Box mt={3}>
              <Button
                color="error"
                variant="outlined"
                onClick={() => setConfirmOpen(true)}
              >
                {"Désactiver"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {"Historique des commandes"}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography color="text.secondary">
          {"Aucune commande pour le moment"}
        </Typography>
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{"Désactiver"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {"Êtes-vous sûr de vouloir désactiver cet utilisateur ?"} <strong>{user.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={deactivateMutation.isPending}
          >
            Annuler / Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDeactivate()}
            disabled={deactivateMutation.isPending}
            startIcon={
              deactivateMutation.isPending ? (
                <CircularProgress size={16} />
              ) : undefined
            }
          >
            {"Désactiver"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
