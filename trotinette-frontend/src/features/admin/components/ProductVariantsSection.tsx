import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
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
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import StarIcon from '@mui/icons-material/Star';
import {
  useVariationTypes,
  useProductVariants,
  useCreateProductVariant,
  useUpdateProductVariant,
  useDeleteProductVariant,
} from '../api/variations';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { VariantGenerator } from './VariantGenerator';
import type { ProductVariant, VariationType } from '../types';

// ---------------------------------------------------------------------------
//  Constants
// ---------------------------------------------------------------------------
const PAGE_SIZE = 2;

// ---------------------------------------------------------------------------
//  Types
// ---------------------------------------------------------------------------
interface ProductVariantsSectionProps {
  productId: number;
  productSku?: string;
}

interface VariantFormData {
  sku: string;
  priceOverrideMad: string; // in MAD for display
  promoPriceMad: string;    // in MAD for display
  stockQuantity: string;
  isActive: boolean;
  selectedValues: Record<number, number>; // attribute_id -> attribute_value_id
}

// ---------------------------------------------------------------------------
//  VariantDialog — create / edit a single variant
// ---------------------------------------------------------------------------

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
  variationTypes,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
}: VariantDialogProps) {
  const isDefault = editTarget?.is_default === true;

  // Initialize form data
  const initialSelectedValues: Record<number, number> = {};
  if (editTarget) {
    editTarget.attribute_values.forEach((val) => {
      initialSelectedValues[val.attribute_id] = val.id;
    });
  }

  const [formData, setFormData] = useState<VariantFormData>({
    sku: editTarget?.sku ?? '',
    priceOverrideMad: editTarget?.price
      ? (editTarget.price / 100).toFixed(2)
      : '',
    promoPriceMad: editTarget?.promo_price
      ? (editTarget.promo_price / 100).toFixed(2)
      : '',
    stockQuantity: editTarget?.stock.toString() ?? '0',
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
        {isDefault
          ? 'Modifier la variante par défaut / Edit default variant'
          : editTarget
            ? 'Modifier la variante / Edit variant'
            : 'Ajouter une variante / Add variant'}
      </DialogTitle>
      <DialogContent>
        <Box pt={1}>
          {/* Hide attribute selectors for default variant */}
          {!isDefault && (
            <>
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
            </>
          )}

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
            label="Prix promo (MAD) - optionnel / Promo price (MAD) - optional"
            type="number"
            value={formData.promoPriceMad}
            onChange={(e) =>
              setFormData({ ...formData, promoPriceMad: e.target.value })
            }
            fullWidth
            margin="normal"
            inputProps={{ step: '0.01', min: '0' }}
            helperText="Laissez vide pour aucune promotion / Leave empty for no promotion"
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
          disabled={isSubmitting || (!isDefault && typesWithValues.length === 0)}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
        >
          {editTarget ? 'Modifier / Update' : 'Créer / Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
//  DeleteDialog
// ---------------------------------------------------------------------------

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
                {variant.attribute_values.map((v) => v.value).join(' / ')}
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

// ---------------------------------------------------------------------------
//  Variant Card — compact display for one variant
// ---------------------------------------------------------------------------

function VariantCard({
  variant,
  onEdit,
  onDelete,
}: {
  variant: ProductVariant;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isDefault = variant.is_default;
  const label = isDefault
    ? 'Par défaut / Default'
    : variant.attribute_values.map((v) => v.value).join(' / ') || '—';

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: isDefault ? 'primary.main' : undefined,
        borderWidth: isDefault ? 2 : 1,
      }}
    >
      <CardContent sx={{ pb: '12px !important', pt: 1.5 }}>
        {/* Header row */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Box display="flex" alignItems="center" gap={1}>
            {isDefault && <StarIcon fontSize="small" color="primary" />}
            <Typography variant="subtitle2" fontWeight="bold">
              {label}
            </Typography>
          </Box>
          <Box>
            <IconButton size="small" onClick={onEdit} title="Modifier / Edit">
              <EditIcon fontSize="small" />
            </IconButton>
            {!isDefault && (
              <IconButton
                size="small"
                color="error"
                onClick={onDelete}
                title="Supprimer / Delete"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Info row */}
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          {variant.sku && (
            <Typography variant="body2" color="text.secondary">
              SKU: {variant.sku}
            </Typography>
          )}
          <Typography variant="body2">
            Prix / Price: {formatCurrency(variant.effective_price)}
          </Typography>
          {variant.is_on_sale && variant.promo_price != null && (
            <Typography variant="body2" sx={{ color: '#FF6B35', fontWeight: 600 }}>
              Promo: {formatCurrency(variant.promo_price)}
            </Typography>
          )}
          <Typography variant="body2" fontWeight="bold">
            Stock: {variant.stock}
          </Typography>
          <Chip
            label={variant.is_active ? 'Active' : 'Inactive'}
            color={variant.is_active ? 'success' : 'default'}
            size="small"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
//  Main component
// ---------------------------------------------------------------------------

export function ProductVariantsSection({ productId, productSku }: ProductVariantsSectionProps) {
  const { data: variantsData, isLoading: variantsLoading } = useProductVariants(productId);
  const { data: typesData, isLoading: typesLoading } = useVariationTypes();
  const createMutation = useCreateProductVariant();
  const updateMutation = useUpdateProductVariant();
  const deleteMutation = useDeleteProductVariant();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductVariant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductVariant | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const allVariants: ProductVariant[] = (variantsData as ProductVariant[]) ?? [];
  const types: VariationType[] = (typesData as VariationType[]) ?? [];

  // ----- Separate default variant from attribute-based variants -----
  const defaultVariant = allVariants.find((v) => v.is_default) ?? null;
  const attributeVariants = allVariants.filter((v) => !v.is_default);

  // ----- Filtering -----
  const filteredVariants = useMemo(() => {
    if (!search.trim()) return attributeVariants;
    const q = search.toLowerCase();
    return attributeVariants.filter((v) => {
      const label = v.attribute_values.map((a) => a.value).join(' ');
      return (
        label.toLowerCase().includes(q) ||
        (v.sku ?? '').toLowerCase().includes(q) ||
        String(v.stock).includes(q)
      );
    });
  }, [attributeVariants, search]);

  // ----- Pagination -----
  const totalPages = Math.max(1, Math.ceil(filteredVariants.length / PAGE_SIZE));
  // Clamp page if filter changed
  const safePage = Math.min(page, totalPages - 1);
  if (safePage !== page) setPage(safePage);

  const pagedVariants = filteredVariants.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  // ----- Handlers -----
  const handleCreate = async (data: VariantFormData) => {
    const variationValueIds = Object.values(data.selectedValues).filter((id) => id > 0);

    const priceOverrideCentimes = data.priceOverrideMad.trim()
      ? Math.round(parseFloat(data.priceOverrideMad) * 100)
      : null;

    const promoPriceCentimes = data.promoPriceMad.trim()
      ? Math.round(parseFloat(data.promoPriceMad) * 100)
      : null;

    await createMutation.mutateAsync({
      productId,
      data: {
        sku: data.sku.trim() || null,
        price: priceOverrideCentimes,
        promo_price: promoPriceCentimes,
        stock: parseInt(data.stockQuantity, 10),
        is_active: data.isActive,
        attribute_value_ids: variationValueIds,
      },
    });
    setDialogOpen(false);
  };

  const handleUpdate = async (data: VariantFormData) => {
    if (!editTarget) return;

    const isDefault = editTarget.is_default;
    const variationValueIds = isDefault
      ? []
      : Object.values(data.selectedValues).filter((id) => id > 0);

    const priceOverrideCentimes = data.priceOverrideMad.trim()
      ? Math.round(parseFloat(data.priceOverrideMad) * 100)
      : null;

    const promoPriceCentimes = data.promoPriceMad.trim()
      ? Math.round(parseFloat(data.promoPriceMad) * 100)
      : null;

    const payload: Record<string, unknown> = {
      sku: data.sku.trim() || null,
      price: priceOverrideCentimes,
      promo_price: promoPriceCentimes,
      stock: parseInt(data.stockQuantity, 10),
      is_active: data.isActive,
    };

    // Only send attribute_value_ids for non-default variants
    if (!isDefault) {
      payload.attribute_value_ids = variationValueIds;
    }

    await updateMutation.mutateAsync({
      productId,
      variantId: editTarget.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: payload as any,
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
      {/* Auto-generator: select attribute values → generate all combos in one click */}
      <VariantGenerator productId={productId} productSku={productSku ?? ''} />

      {/* ——— Default variant card ——— */}
      {defaultVariant && (
        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Variante par défaut / Default Variant
          </Typography>
          <VariantCard
            variant={defaultVariant}
            onEdit={() => openEdit(defaultVariant)}
            onDelete={() => {}} // Cannot delete default — button hidden anyway
          />
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* ——— Header + search + add ——— */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2} flexWrap="wrap">
        <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }}>
          Variantes / Variants ({attributeVariants.length})
        </Typography>

        <Box display="flex" alignItems="center" gap={1} flexGrow={1} justifyContent="flex-end">
          <TextField
            size="small"
            placeholder="Rechercher / Search…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ maxWidth: 260 }}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={openCreate}
            size="small"
          >
            + Manuelle
          </Button>
        </Box>
      </Box>

      {/* ——— Variant cards (paginated) ——— */}
      {filteredVariants.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {search.trim()
              ? 'Aucun résultat / No results'
              : "Aucune variante d'attribut / No attribute variants"}
          </Typography>
        </Paper>
      ) : (
        <>
          <Stack spacing={1.5}>
            {pagedVariants.map((variant) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                onEdit={() => openEdit(variant)}
                onDelete={() => setDeleteTarget(variant)}
              />
            ))}
          </Stack>

          {/* ——— Pagination arrows ——— */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" alignItems="center" mt={2} gap={2}>
              <IconButton
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                size="small"
              >
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {safePage + 1} / {totalPages}
              </Typography>
              <IconButton
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                size="small"
              >
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </>
      )}

      {/* Create / Edit Dialog — key forces full remount so useState re-initializes */}
      <VariantDialog
        key={editTarget ? `edit-${editTarget.id}` : 'create'}
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
