import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useAdminDeliveryZones,
  useCreateDeliveryZone,
  useUpdateDeliveryZone,
  useDeleteDeliveryZone,
} from '../api/deliveryZones';
import type { AdminDeliveryZone } from '../api/deliveryZones';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

// ---- Zod schema ----

const deliveryZoneSchema = z.object({
  city: z.string().min(1, { message: 'City is required' }),
  city_ar: z.string().optional(),
  fee: z
    .number({ error: 'Fee must be a number' })
    .min(0, { message: 'Fee must be 0 or more' }),
  is_active: z.boolean(),
});

type DeliveryZoneFormData = z.infer<typeof deliveryZoneSchema>;

// ---- Form Dialog ----

interface FormDialogProps {
  open: boolean;
  zone: AdminDeliveryZone | null;
  onClose: () => void;
  onSuccess: () => void;
}

function FormDialog({ open, zone, onClose, onSuccess }: FormDialogProps) {
  const { t } = useTranslation();
  const createMutation = useCreateDeliveryZone();
  const updateMutation = useUpdateDeliveryZone();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeliveryZoneFormData>({
    resolver: zodResolver(deliveryZoneSchema),
    defaultValues: zone
      ? {
          city: zone.city,
          city_ar: zone.city_ar ?? '',
          fee: zone.fee / 100, // centimes -> MAD for display
          is_active: zone.is_active,
        }
      : {
          city: '',
          city_ar: '',
          fee: 0,
          is_active: true,
        },
  });

  const isEditing = Boolean(zone);
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;

  const onSubmit = async (formData: DeliveryZoneFormData) => {
    const payload = {
      city: formData.city,
      city_ar: formData.city_ar || undefined,
      fee: Math.round(formData.fee * 100), // MAD -> centimes
      is_active: formData.is_active,
    };

    if (isEditing && zone) {
      await updateMutation.mutateAsync({ id: zone.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }

    reset();
    onSuccess();
  };

  const handleClose = () => {
    reset();
    createMutation.reset();
    updateMutation.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing
          ? t('deliveryZones.edit')
          : t('deliveryZones.create')}
      </DialogTitle>
      <DialogContent>
        <Box pt={1} display="flex" flexDirection="column" gap={2}>
          <TextField
            {...register('city')}
            label={t('deliveryZones.city')}
            error={Boolean(errors.city)}
            helperText={errors.city?.message}
            size="small"
            fullWidth
            required
          />
          <TextField
            {...register('city_ar')}
            label={t('deliveryZones.cityAr')}
            error={Boolean(errors.city_ar)}
            helperText={errors.city_ar?.message}
            size="small"
            fullWidth
          />
          <TextField
            {...register('fee', { valueAsNumber: true })}
            label={t('deliveryZones.fee')}
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            error={Boolean(errors.fee)}
            helperText={errors.fee?.message}
            size="small"
            fullWidth
            required
          />
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label={field.value ? t('deliveryZones.active') : t('deliveryZones.inactive')}
              />
            )}
          />
          {mutationError && (
            <Alert severity="error">
              {(mutationError as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? 'An error occurred'}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          {t('admin.products.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit(onSubmit)()}
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={16} /> : undefined}
        >
          {t('admin.products.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---- Delete Dialog ----

interface DeleteDialogProps {
  zone: AdminDeliveryZone | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
  isDeleting: boolean;
  deleteError: Error | null;
}

function DeleteDialog({
  zone,
  onClose,
  onConfirm,
  isDeleting,
  deleteError,
}: DeleteDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={Boolean(zone)} onClose={onClose}>
      <DialogTitle>{t('deliveryZones.delete')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('deliveryZones.confirmDelete')}{' '}
          <strong>{zone?.city}</strong>?
        </DialogContentText>
        {deleteError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(deleteError as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? 'Deletion failed'}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          {t('admin.products.cancel')}
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => zone && onConfirm(zone.id)}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} /> : undefined}
        >
          {t('deliveryZones.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---- Main Page ----

export function AdminDeliveryZonesPage() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useAdminDeliveryZones();
  const deleteMutation = useDeleteDeliveryZone();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminDeliveryZone | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminDeliveryZone | null>(null);

  const zones: AdminDeliveryZone[] = (data?.data as AdminDeliveryZone[]) ?? [];

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (zone: AdminDeliveryZone) => {
    setEditTarget(zone);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    setDeleteTarget(null);
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
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load delivery zones
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
          {t('deliveryZones.title')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          {t('deliveryZones.create')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('deliveryZones.city')}</TableCell>
              <TableCell>{t('deliveryZones.cityAr')}</TableCell>
              <TableCell align="right">{t('deliveryZones.fee')}</TableCell>
              <TableCell>{t('orders.status.label')}</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No delivery zones found
                </TableCell>
              </TableRow>
            ) : (
              zones.map((zone) => (
                <TableRow key={zone.id} hover>
                  <TableCell>{zone.city}</TableCell>
                  <TableCell>{zone.city_ar ?? '—'}</TableCell>
                  <TableCell align="right">{formatCurrency(zone.fee)}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        zone.is_active
                          ? t('deliveryZones.active')
                          : t('deliveryZones.inactive')
                      }
                      color={zone.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => openEdit(zone)}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteTarget(zone)}
                      title="Delete"
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

      {/* Create / Edit Dialog */}
      <FormDialog
        open={formOpen}
        zone={editTarget}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        zone={deleteTarget}
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
