import { useState } from 'react';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Pagination from '@mui/material/Pagination';
import { useAdminUsers, useDeactivateUser } from '../api/users';
import type { AdminUser } from '../types';

interface DeactivateDialogProps {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
  isDeactivating: boolean;
}

function DeactivateDialog({
  user,
  onClose,
  onConfirm,
  isDeactivating,
}: DeactivateDialogProps) {
  return (
    <Dialog open={Boolean(user)} onClose={onClose}>
      <DialogTitle>{"Désactiver"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {"Êtes-vous sûr de vouloir désactiver cet utilisateur ?"}
          {user && (
            <>
              {' '}
              <strong>{user.name}</strong> ({user.email})
            </>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeactivating}>
          Annuler / Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => user && onConfirm(user.id)}
          disabled={isDeactivating}
          startIcon={isDeactivating ? <CircularProgress size={16} /> : undefined}
        >
          {"Désactiver"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function AdminUsersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(null);

  const { data, isLoading, error } = useAdminUsers(page);
  const deactivateMutation = useDeactivateUser();

  const users: AdminUser[] = data?.data ?? [];
  const totalPages = data?.meta?.last_page ?? 1;

  const handleDeactivate = async (id: number) => {
    await deactivateMutation.mutateAsync(id);
    setDeactivateTarget(null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Impossible de charger les utilisateurs / Failed to load users
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        {"Utilisateurs"}
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{"Nom"}</TableCell>
              <TableCell>{"E-mail"}</TableCell>
              <TableCell>{"Téléphone"}</TableCell>
              <TableCell>{"Rôle"}</TableCell>
              <TableCell>{"Statut"}</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun utilisateur / No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => void navigate(`/admin/users/${user.id}`)}
                >
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone ?? '—'}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        user.is_active
                          ? "Actif"
                          : "Inactif"
                      }
                      color={user.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {user.is_active && user.role !== 'admin' && (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeactivateTarget(user);
                        }}
                      >
                        {"Désactiver"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, p) => setPage(p)}
            color="primary"
          />
        </Box>
      )}

      <DeactivateDialog
        user={deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={(id) => void handleDeactivate(id)}
        isDeactivating={deactivateMutation.isPending}
      />
    </Box>
  );
}
