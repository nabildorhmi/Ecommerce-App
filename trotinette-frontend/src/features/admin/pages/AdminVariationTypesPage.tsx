import { useState } from 'react';
import Box from '@mui/material/Box';
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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import {
  useVariationTypes,
  useCreateVariationType,
  useUpdateVariationType,
  useDeleteVariationType,
} from '../api/variations';
import type { VariationType } from '../types';

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editTarget
          ? 'Modifier l\'attribut / Edit attribute'
          : 'Nouvel attribut / New attribute'}
      </DialogTitle>
      <DialogContent>
        <Box pt={1}>
          <TextField
            label="Nom / Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            autoFocus
            margin="normal"
          />

          <Typography variant="subtitle2" mt={3} mb={1}>
            Valeurs / Values
          </Typography>

          {values.map((value, index) => (
            <Box key={index} display="flex" gap={1} mb={1}>
              <TextField
                value={value}
                onChange={(e) => handleValueChange(index, e.target.value)}
                placeholder="Valeur / Value"
                fullWidth
                size="small"
              />
              {values.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveValue(index)}
                  title="Supprimer / Remove"
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
            Ajouter une valeur / Add value
          </Button>

          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(submitError as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? 'Une erreur est survenue / An error occurred'}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Annuler / Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !name.trim()}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
        >
          {editTarget ? 'Modifier / Update' : 'Créer / Create'}
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
    <Dialog open={Boolean(type)} onClose={onClose}>
      <DialogTitle>Supprimer l'attribut / Delete attribute</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer{' '}
          <strong>{type?.name}</strong>
          {' '}? Are you sure you want to delete this attribute?
          {type?.values && type.values.length > 0 && (
            <>
              <br />
              <br />
              Ceci supprimera également toutes ses valeurs si elles ne sont pas utilisées / This will also delete all its values if they are not in use.
            </>
          )}
        </DialogContentText>
        {deleteError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(deleteError as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? 'Suppression impossible / Deletion failed. This attribute may be in use by variants.'}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Annuler / Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => type && onConfirm(type.id)}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} /> : undefined}
        >
          Supprimer / Delete
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

  const types: VariationType[] = (data as VariationType[]) ?? [];

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
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold">
          Attributs / Attributes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
        >
          Ajouter un attribut / Add attribute
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nom / Name</TableCell>
              <TableCell>Valeurs / Values</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {types.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Aucun attribut / No attributes found
                </TableCell>
              </TableRow>
            ) : (
              types.map((type) => (
                <TableRow key={type.id} hover>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {type.values.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Aucune valeur / No values
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
                      title="Modifier / Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteTarget(type)}
                      title="Supprimer / Delete"
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
    </Box>
  );
}
