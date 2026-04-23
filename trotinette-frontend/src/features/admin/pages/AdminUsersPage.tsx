import { useState } from 'react';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
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
import Snackbar from '@mui/material/Snackbar';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import { useAdminUsers, useDeactivateUser, useUpdateUserRole, useActivateUser, useCreateUser } from '../api/users';
import { useAuthStore } from '../../auth/store';
import type { AdminUser } from '../types';

const glassSx = {
  background: 'rgba(12, 12, 20, 0.7)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0,194,255,0.09)',
  borderRadius: '18px',
  p: { xs: 2, md: 3 },
};

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
    <Dialog
      open={Boolean(user)}
      onClose={onClose}
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
          Annuler
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
  const currentUser = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'' | 'admin' | 'customer' | 'global_admin'>('');
  const [activeFilter, setActiveFilter] = useState<'' | '1' | '0'>('');
  const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer' });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const params: Record<string, string | number> = { page, per_page: perPage };
  if (search.trim()) params['filter[search]'] = search.trim();
  if (roleFilter) params['filter[role]'] = roleFilter;
  if (activeFilter) params['filter[is_active]'] = activeFilter;

  const { data, isLoading, error } = useAdminUsers(params);
  const deactivateMutation = useDeactivateUser();
  const updateRoleMutation = useUpdateUserRole();
  const activateMutation = useActivateUser();
  const createMutation = useCreateUser();

  const users: AdminUser[] = data?.data ?? [];
  const totalPages = data?.meta?.last_page ?? 1;

  const handleDeactivate = async (id: number) => {
    try {
      await deactivateMutation.mutateAsync(id);
      setDeactivateTarget(null);
      setFeedback({ type: 'success', message: 'Utilisateur desactive.' });
    } catch {
      setFeedback({ type: 'error', message: 'Echec de la desactivation.' });
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({ id: userId, role: newRole });
      setFeedback({ type: 'success', message: 'Role mis a jour.' });
    } catch {
      setFeedback({ type: 'error', message: 'Echec de la mise a jour du role.' });
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await activateMutation.mutateAsync(id);
      setFeedback({ type: 'success', message: 'Utilisateur active.' });
    } catch {
      setFeedback({ type: 'error', message: 'Echec de l activation.' });
    }
  };

  const handleCreateUser = async () => {
    try {
      await createMutation.mutateAsync(createForm);
      setCreateOpen(false);
      setCreateForm({ name: '', email: '', phone: '', password: '', role: 'customer' });
      setFeedback({ type: 'success', message: 'Utilisateur cree.' });
    } catch {
      setFeedback({ type: 'error', message: 'Echec de la creation utilisateur.' });
    }
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
        Impossible de charger les utilisateurs
      </Alert>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--mirai-white)' }}>
            Utilisateurs
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif JP", serif', fontSize: '0.75rem', color: 'rgba(0,194,255,0.2)', letterSpacing: '0.1em' }}>
            ユーザー管理
          </Typography>
        </Box>
        {currentUser?.role === 'global_admin' && (
          <Button
            variant="contained"
            onClick={() => setCreateOpen(true)}
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00C2FF, #0099CC)',
              '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(0,194,255,0.25)' },
              transition: 'all 0.2s ease',
            }}
          >
            Ajouter un utilisateur
          </Button>
        )}
      </Box>

      <Box sx={{ ...glassSx, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          Gestion des comptes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Filtrez par role ou statut pour administrer rapidement les comptes, puis ouvrez une fiche detail pour plus d actions.
        </Typography>
      </Box>

      <Box sx={{ ...glassSx, mb: 2 }}>
        <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
          <TextField
            size="small"
            placeholder="Rechercher (nom, email, telephone)"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            sx={{ minWidth: 260 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value as '' | 'admin' | 'customer' | 'global_admin'); setPage(1); }}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="global_admin">Super admin</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="customer">Client</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              label="Statut"
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value as '' | '1' | '0'); setPage(1); }}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="1">Actifs</MenuItem>
              <MenuItem value="0">Inactifs</MenuItem>
            </Select>
          </FormControl>

          {(search || roleFilter || activeFilter) && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setSearch('');
                setRoleFilter('');
                setActiveFilter('');
                setPage(1);
              }}
            >
              Effacer
            </Button>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {data?.meta?.total ?? 0} utilisateur(s)
          </Typography>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ ...glassSx, p: 0, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ borderBottom: '1px solid rgba(0,194,255,0.08)', color: 'var(--mirai-gray)', fontWeight: 600, fontSize: '0.82rem' }}>{"Nom"}</TableCell>
              <TableCell sx={{ borderBottom: '1px solid rgba(0,194,255,0.08)', color: 'var(--mirai-gray)', fontWeight: 600, fontSize: '0.82rem' }}>{"E-mail"}</TableCell>
              <TableCell sx={{ borderBottom: '1px solid rgba(0,194,255,0.08)', color: 'var(--mirai-gray)', fontWeight: 600, fontSize: '0.82rem' }}>{"Téléphone"}</TableCell>
              <TableCell sx={{ borderBottom: '1px solid rgba(0,194,255,0.08)', color: 'var(--mirai-gray)', fontWeight: 600, fontSize: '0.82rem' }}>{"Rôle"}</TableCell>
              <TableCell sx={{ borderBottom: '1px solid rgba(0,194,255,0.08)', color: 'var(--mirai-gray)', fontWeight: 600, fontSize: '0.82rem' }}>{"Statut"}</TableCell>
              <TableCell align="right" sx={{ borderBottom: '1px solid rgba(0,194,255,0.08)', color: 'var(--mirai-gray)', fontWeight: 600, fontSize: '0.82rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun utilisateur trouve
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(0,194,255,0.04)' },
                    '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)' },
                  }}
                  key={user.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => void navigate(`/admin/users/${user.id}`)}
                >
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone ?? '—'}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {currentUser?.role === 'global_admin' && user.role !== 'global_admin' ? (
                      <FormControl size="small" variant="standard">
                        <Select
                          value={user.role}
                          onChange={(e) => void handleRoleChange(user.id, e.target.value)}
                          sx={{ fontSize: '0.875rem' }}
                        >
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="customer">Client</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="body2">
                        {user.role === 'global_admin'
                          ? 'Super admin'
                          : user.role === 'admin'
                            ? 'Admin'
                            : 'Client'}
                      </Typography>
                    )}
                  </TableCell>
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
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      {!user.is_active && currentUser?.role === 'global_admin' && (
                        <Button
                          size="small"
                          color="success"
                          variant="outlined"
                          onClick={() => void handleActivate(user.id)}
                        >
                          Activer
                        </Button>
                      )}
                      {user.is_active && currentUser?.role === 'global_admin' && user.role !== 'global_admin' && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => setDeactivateTarget(user)}
                        >
                          {"Désactiver"}
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel sx={{ fontSize: '0.8rem' }}>Lignes / page</InputLabel>
            <Select
              label="Lignes / page"
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              sx={{ fontSize: '0.82rem' }}
            >
              <MenuItem value={10}>10 / page</MenuItem>
              <MenuItem value={25}>25 / page</MenuItem>
              <MenuItem value={50}>50 / page</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            {data?.meta?.total ?? 0} au total
          </Typography>
        </Box>
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, p) => setPage(p)}
            color="primary"
          />
        )}
      </Box>

      <DeactivateDialog
        user={deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={(id) => void handleDeactivate(id)}
        isDeactivating={deactivateMutation.isPending}
      />

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="xs"
        fullWidth
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
        <DialogTitle>Ajouter un utilisateur</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Nom" value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} fullWidth size="small" required />
          <TextField label="E-mail" type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} fullWidth size="small" required />
          <TextField label="Telephone" value={createForm.phone} onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))} fullWidth size="small" />
          <TextField label="Mot de passe" type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} fullWidth size="small" required />
          <FormControl size="small" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select label="Role" value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}>
              <MenuItem value="customer">Client</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={() => void handleCreateUser()} disabled={createMutation.isPending || !createForm.name || !createForm.email || !createForm.password}>
            {createMutation.isPending ? <CircularProgress size={20} /> : 'Creer'}
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
          onClose={() => setFeedback(null)}
          severity={feedback?.type ?? 'success'}
          sx={{ width: '100%' }}
        >
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
