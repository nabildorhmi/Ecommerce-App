import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        {t('adminUserDetail.back')}
      </Button>

      <Typography variant="h5" fontWeight="bold" mb={3}>
        {t('adminUserDetail.title')}
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
                {t('adminUsers.name')}
              </Typography>
              <Typography>{user.name}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('adminUsers.email')}
              </Typography>
              <Typography>{user.email}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('adminUsers.phone')}
              </Typography>
              <Typography>{user.phone ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('adminUsers.role')}
              </Typography>
              <Typography>{user.role}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('profile.addressCity')}
              </Typography>
              <Typography>{user.address_city ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('profile.addressStreet')}
              </Typography>
              <Typography>{user.address_street ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('adminUsers.status')}
              </Typography>
              <Box>
                <Chip
                  label={
                    user.is_active
                      ? t('adminUsers.active')
                      : t('adminUsers.inactive')
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
                {t('adminUsers.deactivate')}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {t('adminUserDetail.orderHistory')}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography color="text.secondary">
          {t('adminUserDetail.noOrders')}
        </Typography>
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t('adminUsers.deactivate')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('adminUsers.confirmDeactivate')} <strong>{user.name}</strong>?
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
            {t('adminUsers.deactivate')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
