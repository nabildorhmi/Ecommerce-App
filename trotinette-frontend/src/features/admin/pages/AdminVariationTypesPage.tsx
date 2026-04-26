import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
  useVariationTypes,
  useCreateVariationType,
  useUpdateVariationType,
  useDeleteVariationType,
} from '../api/variations';
import type { VariationType } from '../types';

const glassSx = {
  background: 'rgba(12, 12, 20, 0.7)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0,194,255,0.09)',
  borderRadius: '18px',
  p: { xs: 2, md: 3 },
};

interface FormDialogProps {
  open: boolean;
  editTarget: VariationType | null;
  onClose: () => void;
  onSubmit: (name: string, values: string[]) => Promise<void>;
  isSubmitting: boolean;
  submitError: Error | null;
}

function FormDialog({
  open,
  editTarget,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
}: FormDialogProps) {
  const [name, setName] = useState(editTarget?.name ?? '');
  const [values, setValues] = useState<string[]>(
    editTarget?.values.map((v) => v.value) ?? ['']
  );

  const handleAddValue = () => {
    setValues([...values, '']);
  };

  const handleRemoveValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  const handleSubmit = async () => {
    const filteredValues = values.filter((v) => v.trim() !== '');
    await onSubmit(name, filteredValues);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
      <DialogTitle>
        {editTarget
          ? 'Modifier l\'attribut'
          : 'Nouvel attribut'}
      </DialogTitle>
      <DialogContent>
        <Box pt={1}>
          <TextField
            label="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            autoFocus
            margin="normal"
          />

          <Typography variant="subtitle2" mt={3} mb={1}>
            Valeurs
          </Typography>

          {values.map((value, index) => (
            <Box key={index} display="flex" gap={1} mb={1}>
              <TextField
                value={value}
                onChange={(e) => handleValueChange(index, e.target.value)}
                placeholder="Valeur"
                fullWidth
                size="small"
              />
              {values.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveValue(index)}
                  title="Supprimer"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddValue}
            size="small"
            sx={{ mt: 1 }}
          >
            Ajouter une valeur
          </Button>

          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(submitError as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? 'Une erreur est survenue'}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !name.trim()}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
        >
          {editTarget ? 'Modifier' : 'Creer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface DeleteDialogProps {
  type: VariationType | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
  isDeleting: boolean;
  deleteError: Error | null;
}

function DeleteDialog({
  type,
  onClose,
  onConfirm,
  isDeleting,
  deleteError,
}: DeleteDialogProps) {
  return (
    <Dialog
      open={Boolean(type)}
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
      <DialogTitle>Supprimer l'attribut</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer{' '}
          <strong>{type?.name}</strong>
          {' '}?
          {type?.values && type.values.length > 0 && (
            <>
              <br />
              <br />
              Ceci supprimera egalement toutes ses valeurs si elles ne sont pas utilisees.
            </>
          )}
        </DialogContentText>
        {deleteError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(deleteError as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? 'Suppression impossible. Cet attribut est peut-etre utilise par des variantes.'}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Annuler
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => type && onConfirm(type.id)}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} /> : undefined}
        >
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function AdminVariationTypesPage() {
  const { data, isLoading, error } = useVariationTypes();
  const createMutation = useCreateVariationType();
  const updateMutation = useUpdateVariationType();
  const deleteMutation = useDeleteVariationType();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VariationType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VariationType | null>(null);
  const [search, setSearch] = useState('');

  const types: VariationType[] = (data as VariationType[]) ?? [];
  const filteredTypes = types.filter((type) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const valuesText = type.values.map((v) => v.value).join(' ').toLowerCase();
    return type.name.toLowerCase().includes(q) || valuesText.includes(q);
  });

  const [typePage, setTypePage] = useState(1);
  const [typePerPage, setTypePerPage] = useState(10);
  const typeTotalPages = Math.max(1, Math.ceil(filteredTypes.length / typePerPage));
  const safeTypePage = Math.min(typePage, typeTotalPages);
  const paginatedTypes = filteredTypes.slice((safeTypePage - 1) * typePerPage, safeTypePage * typePerPage);

  const handleCreate = async (name: string, values: string[]) => {
    await createMutation.mutateAsync({ name, values });
    setFormOpen(false);
  };

  const handleUpdate = async (name: string, values: string[]) => {
    if (!editTarget) return;
    await updateMutation.mutateAsync({
      id: editTarget.id,
      data: { name, values },
    });
    setFormOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    setDeleteTarget(null);
  };

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (type: VariationType) => {
    setEditTarget(type);
    setFormOpen(true);
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
        Impossible de charger les attributs / Failed to load attributes
      </Alert>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--mirai-white)' }}>
            Attributs
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif JP", serif', fontSize: '0.75rem', color: 'rgba(0,194,255,0.2)', letterSpacing: '0.1em' }}>
            属性管理
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{
            borderRadius: '10px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #00C2FF, #0099CC)',
            '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(0,194,255,0.25)' },
            transition: 'all 0.2s ease',
          }}
        >
          Ajouter un attribut
        </Button>
      </Box>

      <Box sx={{ ...glassSx, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          Gestion des attributs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configurez les attributs et leurs valeurs pour generer les variantes produit de facon fiable.
        </Typography>
      </Box>

      <Box sx={{ ...glassSx, mb: 2 }}>
        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Rechercher (attribut, valeurs)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setTypePage(1);
            }}
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

          {search && (
            <Button size="small" variant="outlined" onClick={() => { setSearch(''); setTypePage(1); }}>
              Effacer
            </Button>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filteredTypes.length} attribut(s)
          </Typography>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ ...glassSx, p: 0, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ borderBottom: '1px solid rgba(0,194,255,0.08)', color: 'var(--mirai-gray)', fontWeight: 600, fontSize: '0.82rem' }}>Nom</TableCell>
              <TableCell sx={{ borderBottom: '1px solid rgba(0,194,255,0.08)', color: 'var(--mirai-gray)', fontWeight: 600, fontSize: '0.82rem' }}>Valeurs</TableCell>
              <TableCell align="right" sx={{ borderBottom: '1px solid rgba(0,194,255,0.08)', color: 'var(--mirai-gray)', fontWeight: 600, fontSize: '0.82rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Aucun attribut
                </TableCell>
              </TableRow>
            ) : (
              paginatedTypes.map((type) => (
                <TableRow
                  key={type.id}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(0,194,255,0.04)' },
                    '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)' },
                  }}
                >
                  <TableCell>{type.name}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {type.values.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Aucune valeur
                        </Typography>
                      ) : (
                        type.values.map((val) => (
                          <Chip key={val.id} label={val.value} size="small" />
                        ))
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => openEdit(type)}
                      title="Modifier"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteTarget(type)}
                      title="Supprimer"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel sx={{ fontSize: '0.8rem' }}>Lignes / page</InputLabel>
            <Select
              label="Lignes / page"
              value={typePerPage}
              onChange={(e) => { setTypePerPage(Number(e.target.value)); setTypePage(1); }}
              sx={{ fontSize: '0.82rem' }}
            >
              <MenuItem value={5}>5 / page</MenuItem>
              <MenuItem value={10}>10 / page</MenuItem>
              <MenuItem value={25}>25 / page</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            {filteredTypes.length} au total
          </Typography>
        </Box>
        {typeTotalPages > 1 && (
          <Pagination
            count={typeTotalPages}
            page={safeTypePage}
            onChange={(_e, p) => setTypePage(p)}
            color="primary"
            size="small"
          />
        )}
      </Box>

      {/* Create / Edit Dialog — key forces remount so useState re-initializes */}
      <FormDialog
        key={editTarget ? `edit-${editTarget.id}` : 'create'}
        open={formOpen}
        editTarget={editTarget}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
          createMutation.reset();
          updateMutation.reset();
        }}
        onSubmit={editTarget ? handleUpdate : handleCreate}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        submitError={createMutation.error || updateMutation.error}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        type={deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          deleteMutation.reset();
        }}
        onConfirm={(id) => void handleDelete(id)}
        isDeleting={deleteMutation.isPending}
        deleteError={deleteMutation.error}
      />
    </Container>
  );
}
