import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useVariationTypes,
  useProductVariants,
  useCreateProductVariant,
  useUpdateProductVariant,
  useDeleteProductVariant,
} from '../api/variations';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import type { ProductVariant, VariationType } from '../types';

interface ProductVariantsSectionProps {
  productId: number;
}

interface VariantFormData {
  sku: string;
  priceOverrideMad: string; // in MAD for display
  stockQuantity: string;
  isActive: boolean;
  selectedValues: Record<number, number>; // variation_type_id -> variation_value_id
}

interface VariantDialogProps {
  open: boolean;
  editTarget: ProductVariant | null;
  productId: number;
  variationTypes: VariationType[];
  onClose: () => void;
  onSubmit: (data: VariantFormData) => Promise<void>;
  isSubmitting: boolean;
  submitError: Error | null;
}

function VariantDialog({
  open,
  editTarget,
  productId,
  variationTypes,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
}: VariantDialogProps) {
  // Initialize form data
  const initialSelectedValues: Record<number, number> = {};
  if (editTarget) {
    editTarget.values.forEach((val) => {
      initialSelectedValues[val.variation_type_id] = val.id;
    });
  }

  const [formData, setFormData] = useState<VariantFormData>({
    sku: editTarget?.sku ?? '',
    priceOverrideMad: editTarget?.price_override
      ? (editTarget.price_override / 100).toFixed(2)
      : '',
    stockQuantity: editTarget?.stock_quantity.toString() ?? '0',
    isActive: editTarget?.is_active ?? true,
    selectedValues: initialSelectedValues,
  });

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  const typesWithValues = variationTypes.filter((t) => t.values.length > 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editTarget
          ? 'Modifier la variante / Edit variant'
          : 'Ajouter une variante / Add variant'}
      </DialogTitle>
      <DialogContent>
        <Box pt={1}>
          {typesWithValues.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Aucun type de variation disponible. Créez d'abord des types avec des valeurs / No variation types available. Create types with values first.
            </Alert>
          )}

          {typesWithValues.map((type) => (
            <FormControl key={type.id} fullWidth margin="normal">
              <InputLabel>{type.name}</InputLabel>
              <Select
                value={formData.selectedValues[type.id] ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selectedValues: {
                      ...formData.selectedValues,
                      [type.id]: Number(e.target.value),
                    },
                  })
                }
                label={type.name}
                required
              >
                <MenuItem value="">
                  <em>Sélectionner / Select</em>
                </MenuItem>
                {type.values.map((val) => (
                  <MenuItem key={val.id} value={val.id}>
                    {val.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}

          <TextField
            label="SKU (optionnel / optional)"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Prix (MAD) - optionnel, laissez vide pour prix de base / Price (MAD) - optional"
            type="number"
            value={formData.priceOverrideMad}
            onChange={(e) =>
              setFormData({ ...formData, priceOverrideMad: e.target.value })
            }
            fullWidth
            margin="normal"
            inputProps={{ step: '0.01', min: '0' }}
            helperText="Laissez vide pour utiliser le prix de base du produit / Leave empty to use base product price"
          />

          <TextField
            label="Stock / Stock quantity"
            type="number"
            value={formData.stockQuantity}
            onChange={(e) =>
              setFormData({ ...formData, stockQuantity: e.target.value })
            }
            fullWidth
            margin="normal"
            required
            inputProps={{ min: '0', step: '1' }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
            }
            label="Active / Active"
            sx={{ mt: 2 }}
          />

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
          disabled={isSubmitting || typesWithValues.length === 0}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
        >
          {editTarget ? 'Modifier / Update' : 'Créer / Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface DeleteDialogProps {
  variant: ProductVariant | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
  isDeleting: boolean;
  deleteError: Error | null;
}

function DeleteDialog({
  variant,
  onClose,
  onConfirm,
  isDeleting,
  deleteError,
}: DeleteDialogProps) {
  return (
    <Dialog open={Boolean(variant)} onClose={onClose}>
      <DialogTitle>Supprimer la variante / Delete variant</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer cette variante ? / Are you sure you want to delete this variant?
          {variant && (
            <>
              <br />
              <br />
              <strong>
                {variant.values.map((v) => v.value).join(' / ')}
              </strong>
            </>
          )}
        </DialogContentText>
        {deleteError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(deleteError as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? 'Suppression impossible / Deletion failed'}
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
          onClick={() => variant && onConfirm(variant.id)}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} /> : undefined}
        >
          Supprimer / Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function ProductVariantsSection({ productId }: ProductVariantsSectionProps) {
  const { data: variantsData, isLoading: variantsLoading } = useProductVariants(productId);
  const { data: typesData, isLoading: typesLoading } = useVariationTypes();
  const createMutation = useCreateProductVariant();
  const updateMutation = useUpdateProductVariant();
  const deleteMutation = useDeleteProductVariant();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductVariant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductVariant | null>(null);

  const variants: ProductVariant[] = (variantsData as ProductVariant[]) ?? [];
  const types: VariationType[] = (typesData as VariationType[]) ?? [];

  const handleCreate = async (data: VariantFormData) => {
    const variationValueIds = Object.values(data.selectedValues).filter((id) => id > 0);

    const priceOverrideCentimes = data.priceOverrideMad.trim()
      ? Math.round(parseFloat(data.priceOverrideMad) * 100)
      : null;

    await createMutation.mutateAsync({
      productId,
      data: {
        sku: data.sku.trim() || null,
        price_override: priceOverrideCentimes,
        stock_quantity: parseInt(data.stockQuantity, 10),
        is_active: data.isActive,
        variation_value_ids: variationValueIds,
      },
    });
    setDialogOpen(false);
  };

  const handleUpdate = async (data: VariantFormData) => {
    if (!editTarget) return;

    const variationValueIds = Object.values(data.selectedValues).filter((id) => id > 0);

    const priceOverrideCentimes = data.priceOverrideMad.trim()
      ? Math.round(parseFloat(data.priceOverrideMad) * 100)
      : null;

    await updateMutation.mutateAsync({
      productId,
      variantId: editTarget.id,
      data: {
        sku: data.sku.trim() || null,
        price_override: priceOverrideCentimes,
        stock_quantity: parseInt(data.stockQuantity, 10),
        is_active: data.isActive,
        variation_value_ids: variationValueIds,
      },
    });
    setDialogOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync({ productId, variantId: id });
    setDeleteTarget(null);
  };

  const openCreate = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const openEdit = (variant: ProductVariant) => {
    setEditTarget(variant);
    setDialogOpen(true);
  };

  if (variantsLoading || typesLoading) {
    return (
      <Box display="flex" justifyContent="center" py={3}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Variantes du produit / Product Variants
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={openCreate}
          size="small"
        >
          Ajouter une variante / Add variant
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Variante / Variant</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell align="right">Prix / Price</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell>Statut / Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {variants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucune variante / No variants
                </TableCell>
              </TableRow>
            ) : (
              variants.map((variant) => (
                <TableRow key={variant.id} hover>
                  <TableCell>
                    {variant.values.map((v) => v.value).join(' / ')}
                  </TableCell>
                  <TableCell>{variant.sku ?? '—'}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(variant.effective_price)}
                  </TableCell>
                  <TableCell align="right">{variant.stock_quantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={variant.is_active ? 'Active' : 'Inactive'}
                      color={variant.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => openEdit(variant)}
                      title="Modifier / Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteTarget(variant)}
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

      {/* Create / Edit Dialog */}
      <VariantDialog
        open={dialogOpen}
        editTarget={editTarget}
        productId={productId}
        variationTypes={types}
        onClose={() => {
          setDialogOpen(false);
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
        variant={deleteTarget}
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
