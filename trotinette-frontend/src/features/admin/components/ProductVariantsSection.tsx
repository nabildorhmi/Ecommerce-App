import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import StarsIcon from '@mui/icons-material/Stars';
import {
  useVariationTypes,
  useProductVariants,
  useCreateProductVariant,
  useUpdateProductVariant,
  useDeleteProductVariant,
} from '../api/variations';
import { useAdminProduct, useUpdateProduct } from '../api/products';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { VariantGenerator } from './VariantGenerator';
import type { ProductVariant, VariationType } from '../types';

// ---------------------------------------------------------------------------
//  Constants
// ---------------------------------------------------------------------------
const PAGE_SIZE = 8;

// ---------------------------------------------------------------------------
//  Types
// ---------------------------------------------------------------------------
interface ProductVariantsSectionProps {
  productId: number;
  productSku?: string;
  basePrice: number;
}

interface VariantFormData {
  sku: string;
  priceOverrideMad: string;
  discountPercentage: string;
  stockQuantity: string;
  isActive: boolean;
  selectedValues: Record<number, number>;
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

  const initialSelectedValues: Record<number, number> = {};
  if (editTarget) {
    editTarget.attribute_values.forEach((val) => {
      initialSelectedValues[val.attribute_id] = val.id;
    });
  }

  const typesWithValues = variationTypes.filter((t) => t.values.length > 0);
  const initialSelectedAttributeIds = typesWithValues
    .filter((type) => Boolean(initialSelectedValues[type.id]))
    .map((type) => type.id);

  const [selectedAttributeIds, setSelectedAttributeIds] = useState<number[]>(initialSelectedAttributeIds);

  const calculateDiscountPercentage = (price: number, promoPrice: number | null): string => {
    if (!promoPrice || price <= 0) return '';
    const discount = Math.round(((price - promoPrice) / price) * 100);
    return discount > 0 ? discount.toString() : '';
  };

  const [formData, setFormData] = useState<VariantFormData>({
    sku: editTarget?.sku ?? '',
    priceOverrideMad: editTarget?.price ? (editTarget.price / 100).toFixed(2) : '',
    discountPercentage: editTarget ? calculateDiscountPercentage(editTarget.effective_price, editTarget.promo_price) : '',
    stockQuantity: editTarget?.stock.toString() ?? '0',
    isActive: editTarget?.is_active ?? true,
    selectedValues: initialSelectedValues,
  });

  const selectedTypes = typesWithValues.filter((type) => selectedAttributeIds.includes(type.id));
  const hasAllRequiredSelections =
    isDefault ||
    (selectedTypes.length > 0 && selectedTypes.every((type) => Boolean(formData.selectedValues[type.id])));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { background: 'rgba(14,14,22,0.97)', border: '1px solid rgba(0,194,255,0.12)', borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: 'var(--mirai-white)', fontSize: '1rem' }}>
        {isDefault
          ? 'Modifier la variante par défaut'
          : editTarget
            ? 'Modifier la variante'
            : 'Ajouter une variante'}
      </DialogTitle>
      <DialogContent>
        <Box pt={1} display="flex" flexDirection="column" gap={2}>
          {/* Attribute selectors — hidden for default variant */}
          {!isDefault && (
            <>
              {typesWithValues.length === 0 && (
                <Alert severity="warning">
                  Aucun type de variation disponible.{' '}
                  <a href="/admin/variation-types" style={{ color: '#00C2FF' }}>
                    Créez des attributs d'abord →
                  </a>
                </Alert>
              )}
              <Autocomplete
                multiple
                size="small"
                options={typesWithValues}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={typesWithValues.filter((type) => selectedAttributeIds.includes(type.id))}
                noOptionsText="Aucun attribut"
                onChange={(_, newSelected) => {
                  const nextIds = newSelected.map((type) => type.id);
                  setSelectedAttributeIds(nextIds);
                  setFormData((prev) => {
                    const nextValues: Record<number, number> = {};
                    for (const attrId of nextIds) {
                      const picked = prev.selectedValues[attrId];
                      if (picked) nextValues[attrId] = picked;
                    }
                    return { ...prev, selectedValues: nextValues };
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Attributs a utiliser"
                    placeholder="Rechercher puis selectionner des attributs..."
                  />
                )}
              />

              {selectedTypes.map((type) => (
                <FormControl key={type.id} fullWidth size="small">
                  <InputLabel>{type.name}</InputLabel>
                  <Select
                    value={formData.selectedValues[type.id] ?? ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        selectedValues: { ...prev.selectedValues, [type.id]: Number(e.target.value) },
                      }))
                    }
                    label={type.name}
                  >
                    <MenuItem value=""><em>Selectionner...</em></MenuItem>
                    {type.values.map((val) => (
                      <MenuItem key={val.id} value={val.id}>{val.value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </>
          )}

          {/* 2-col grid for SKU + stock */}
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <TextField
              label="SKU (optionnel)"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              size="small"
            />
            <TextField
              label="Stock *"
              type="number"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              size="small"
              required
              inputProps={{ min: '0', step: '1' }}
            />
            <TextField
              label="Prix spécifique (MAD)"
              type="number"
              value={formData.priceOverrideMad}
              onChange={(e) => setFormData({ ...formData, priceOverrideMad: e.target.value })}
              size="small"
              inputProps={{ step: '0.01', min: '0' }}
              helperText="Laisser vide → prix de base"
              slotProps={{
                input: { endAdornment: <InputAdornment position="end">MAD</InputAdornment> },
              }}
            />
            <TextField
              label="Remise (%)"
              type="number"
              value={formData.discountPercentage}
              onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
              size="small"
              inputProps={{ step: '1', min: '0', max: '100' }}
              helperText="ex: 30 pour −30%"
              slotProps={{
                input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
              }}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                size="small"
              />
            }
            label="Variante active"
          />

          {submitError && (
            <Alert severity="error">
              {(submitError as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Une erreur est survenue'}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting} sx={{ color: 'var(--mirai-gray)' }}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={() => void onSubmit(formData)}
          disabled={isSubmitting || (!isDefault && (typesWithValues.length === 0 || !hasAllRequiredSelections))}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{
            borderRadius: '8px',
            background: 'linear-gradient(135deg,#00C2FF,#0099CC)',
            fontWeight: 700,
          }}
        >
          {editTarget ? 'Mettre à jour' : 'Créer'}
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

function DeleteDialog({ variant, onClose, onConfirm, isDeleting, deleteError }: DeleteDialogProps) {
  return (
    <Dialog open={Boolean(variant)} onClose={onClose}
      PaperProps={{ sx: { background: 'rgba(14,14,22,0.97)', border: '1px solid rgba(255,60,60,0.15)', borderRadius: '14px' } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: 'var(--mirai-white)' }}>Supprimer la variante</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer{' '}
          <strong>{variant?.attribute_values.map((v) => v.value).join(' / ') || 'cette variante'}</strong>{' '}?
          Cette action est irréversible.
        </DialogContentText>
        {deleteError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(deleteError as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Suppression impossible'}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isDeleting} sx={{ color: 'var(--mirai-gray)' }}>
          Annuler
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => variant && onConfirm(variant.id)}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} /> : undefined}
          sx={{ borderRadius: '8px', fontWeight: 700 }}
        >
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
//  Variant Row — compact table-style display
// ---------------------------------------------------------------------------
function VariantRow({
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
    ? 'Variante par défaut'
    : variant.attribute_values.map((v) => v.value).join(' · ') || '—';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.25,
        borderRadius: '10px',
        background: isDefault
          ? 'rgba(0,194,255,0.06)'
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isDefault ? 'rgba(0,194,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'background 0.15s',
        '&:hover': { background: isDefault ? 'rgba(0,194,255,0.1)' : 'rgba(255,255,255,0.055)' },
      }}
    >
      {/* Default star / active indicator */}
      {isDefault ? (
        <Tooltip title="Variante par défaut">
          <StarIcon sx={{ fontSize: '1rem', color: '#F59E0B', flexShrink: 0 }} />
        </Tooltip>
      ) : (
        <Tooltip title={variant.is_active ? 'Active' : 'Inactive'}>
          {variant.is_active ? (
            <CheckCircleIcon sx={{ fontSize: '1rem', color: '#22C55E', flexShrink: 0 }} />
          ) : (
            <RadioButtonUncheckedIcon sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          )}
        </Tooltip>
      )}

      {/* Label + attributes */}
      <Box flex={1} minWidth={0}>
        <Typography
          sx={{
            fontSize: '0.82rem',
            fontWeight: isDefault ? 700 : 500,
            color: isDefault ? '#00C2FF' : 'var(--mirai-white)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </Typography>
        {variant.sku && (
          <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
            {variant.sku}
          </Typography>
        )}
      </Box>

      {/* Price */}
      <Box sx={{ textAlign: 'right', minWidth: 80 }}>
        {variant.is_on_sale && variant.promo_price != null ? (
          <>
            <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled', textDecoration: 'line-through' }}>
              {formatCurrency(variant.effective_price)}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#D97A50', fontWeight: 700 }}>
              {formatCurrency(variant.promo_price)}
            </Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: '0.82rem', color: 'var(--mirai-white)' }}>
            {formatCurrency(variant.effective_price)}
          </Typography>
        )}
      </Box>

      {/* Stock badge */}
      <Chip
        label={`${variant.stock} en stock`}
        size="small"
        sx={{
          fontSize: '0.7rem',
          flexShrink: 0,
          background: variant.stock > 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          color: variant.stock > 0 ? '#22C55E' : '#EF4444',
          border: `1px solid ${variant.stock > 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
        }}
      />

      {/* Actions */}
      <Box display="flex" gap={0.5} flexShrink={0}>
        <IconButton size="small" onClick={onEdit} title="Modifier" sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#00C2FF' } }}>
          <EditIcon sx={{ fontSize: '0.9rem' }} />
        </IconButton>
        {!isDefault && (
          <IconButton size="small" onClick={onDelete} title="Supprimer" sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#EF4444' } }}>
            <DeleteIcon sx={{ fontSize: '0.9rem' }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
//  Main component
// ---------------------------------------------------------------------------
export function ProductVariantsSection({ productId, productSku, basePrice }: ProductVariantsSectionProps) {
  const { data: variantsData, isLoading: variantsLoading } = useProductVariants(productId);
  const { data: typesData, isLoading: typesLoading } = useVariationTypes();
  const { data: productData } = useAdminProduct(productId);
  const createMutation = useCreateProductVariant();
  const updateMutation = useUpdateProductVariant();
  const deleteMutation = useDeleteProductVariant();
  const updateProductMutation = useUpdateProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductVariant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductVariant | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const allVariants: ProductVariant[] = (variantsData as ProductVariant[]) ?? [];
  const types: VariationType[] = (typesData as VariationType[]) ?? [];

  const defaultVariant = allVariants.find((v) => v.is_default) ?? null;
  const attributeVariants = allVariants.filter((v) => !v.is_default);

  const filteredVariants = useMemo(() => {
    if (!search.trim()) return attributeVariants;
    const q = search.toLowerCase();
    return attributeVariants.filter((v) => {
      const label = v.attribute_values.map((a) => a.value).join(' ');
      return label.toLowerCase().includes(q) || (v.sku ?? '').toLowerCase().includes(q) || String(v.stock).includes(q);
    });
  }, [attributeVariants, search]);

  const totalPages = Math.max(1, Math.ceil(filteredVariants.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pagedVariants = filteredVariants.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  // ── Handlers ──
  const handleCreate = async (data: VariantFormData) => {
    const variationValueIds = Object.values(data.selectedValues).filter((id) => id > 0);
    const priceOverride = data.priceOverrideMad.trim() ? Math.round(parseFloat(data.priceOverrideMad) * 100) : null;

    // Calculate promo price from discount percentage
    const effectivePrice = priceOverride ?? basePrice;
    const discountPct = data.discountPercentage.trim() ? parseInt(data.discountPercentage, 10) : 0;
    const promoPrice = discountPct > 0 ? Math.round(effectivePrice * (1 - discountPct / 100)) : null;

    await createMutation.mutateAsync({
      productId,
      data: {
        sku: data.sku.trim() || null,
        price: priceOverride,
        promo_price: promoPrice,
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
    const variationValueIds = isDefault ? [] : Object.values(data.selectedValues).filter((id) => id > 0);
    const priceOverride = data.priceOverrideMad.trim() ? Math.round(parseFloat(data.priceOverrideMad) * 100) : null;

    // Calculate promo price from discount percentage
    const effectivePrice = priceOverride ?? editTarget.effective_price;
    const discountPct = data.discountPercentage.trim() ? parseInt(data.discountPercentage, 10) : 0;
    const promoPrice = discountPct > 0 ? Math.round(effectivePrice * (1 - discountPct / 100)) : null;

    const payload: Record<string, unknown> = {
      sku: data.sku.trim() || null,
      price: priceOverride,
      promo_price: promoPrice,
      stock: parseInt(data.stockQuantity, 10),
      is_active: data.isActive,
    };
    if (!isDefault) payload.attribute_value_ids = variationValueIds;

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

  const handleBulkRemoveDiscounts = async () => {
    const variantsWithDiscount = allVariants.filter((v) => v.promo_price != null);
    if (variantsWithDiscount.length === 0) return;

    if (!confirm(`Désactiver les remises pour ${variantsWithDiscount.length} variante(s) ?`)) return;

    for (const variant of variantsWithDiscount) {
      const payload: Record<string, unknown> = {
        sku: variant.sku,
        price: variant.price,
        promo_price: null,
        stock: variant.stock,
        is_active: variant.is_active,
      };
      if (!variant.is_default) {
        payload.attribute_value_ids = variant.attribute_values.map((v) => v.id);
      }

      await updateMutation.mutateAsync({
        productId,
        variantId: variant.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: payload as any,
      });
    }
  };

  const handleToggleFeatured = async () => {
    const product = productData?.data;
    if (!product) return;
    await updateProductMutation.mutateAsync({
      id: productId,
      is_featured: !product.is_featured,
    });
  };

  const handleToggleNew = async () => {
    const product = productData?.data;
    if (!product) return;
    await updateProductMutation.mutateAsync({
      id: productId,
      is_new: !product.is_new,
    });
  };

  if (variantsLoading || typesLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Auto-generator */}
      <VariantGenerator productId={productId} productSku={productSku ?? ''} />

      {/* ── Default variant ── */}
      {defaultVariant && (
        <Box mb={3}>
          <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
            Variante de base
          </Typography>
          <VariantRow
            variant={defaultVariant}
            onEdit={() => { setEditTarget(defaultVariant); setDialogOpen(true); }}
            onDelete={() => {}}
          />
        </Box>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2.5 }} />

      {/* ── Attribute variants header ── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Typography sx={{ fontWeight: 700, color: 'var(--mirai-white)', fontSize: '0.9rem' }}>
            Variantes ({attributeVariants.length})
          </Typography>
          {attributeVariants.length > 0 && (
            <Chip
              label={`${attributeVariants.filter((v) => v.is_active).length} actives`}
              size="small"
              sx={{ fontSize: '0.68rem', background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}
            />
          )}
        </Box>

        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          {attributeVariants.length > 3 && (
            <TextField
              size="small"
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              sx={{ maxWidth: 200 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: '0.9rem', color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
          {allVariants.some((v) => v.promo_price != null) && (
            <Tooltip title="Supprimer toutes les remises des variantes">
              <Button
                variant="outlined"
                startIcon={<LocalOfferIcon />}
                onClick={() => void handleBulkRemoveDiscounts()}
                size="small"
                disabled={updateMutation.isPending}
                sx={{
                  borderRadius: '8px',
                  borderColor: 'rgba(217,122,80,0.4)',
                  color: '#D97A50',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  '&:hover': { borderColor: '#D97A50', background: 'rgba(217,122,80,0.08)' },
                }}
              >
                Désactiver remises
              </Button>
            </Tooltip>
          )}
          {productData?.data && (
            <>
              <Tooltip title={productData.data.is_featured ? "Retirer du vedette" : "Marquer comme vedette"}>
                <Button
                  variant="outlined"
                  startIcon={<StarsIcon />}
                  onClick={() => void handleToggleFeatured()}
                  size="small"
                  disabled={updateProductMutation.isPending}
                  sx={{
                    borderRadius: '8px',
                    borderColor: productData.data.is_featured ? 'rgba(212,164,58,0.4)' : 'rgba(255,255,255,0.2)',
                    color: productData.data.is_featured ? '#D4A43A' : 'rgba(255,255,255,0.5)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '&:hover': {
                      borderColor: productData.data.is_featured ? '#D4A43A' : 'rgba(255,255,255,0.4)',
                      background: productData.data.is_featured ? 'rgba(212,164,58,0.08)' : 'rgba(255,255,255,0.05)'
                    },
                  }}
                >
                  {productData.data.is_featured ? '★' : '☆'} Vedette
                </Button>
              </Tooltip>
              <Tooltip title={productData.data.is_new ? "Retirer du nouveau" : "Marquer comme nouveau"}>
                <Button
                  variant="outlined"
                  startIcon={<NewReleasesIcon />}
                  onClick={() => void handleToggleNew()}
                  size="small"
                  disabled={updateProductMutation.isPending}
                  sx={{
                    borderRadius: '8px',
                    borderColor: productData.data.is_new ? 'rgba(46,173,95,0.4)' : 'rgba(255,255,255,0.2)',
                    color: productData.data.is_new ? '#2EAD5F' : 'rgba(255,255,255,0.5)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '&:hover': {
                      borderColor: productData.data.is_new ? '#2EAD5F' : 'rgba(255,255,255,0.4)',
                      background: productData.data.is_new ? 'rgba(46,173,95,0.08)' : 'rgba(255,255,255,0.05)'
                    },
                  }}
                >
                  Nouveau
                </Button>
              </Tooltip>
            </>
          )}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => { setEditTarget(null); setDialogOpen(true); }}
            size="small"
            sx={{
              borderRadius: '8px',
              borderColor: 'rgba(0,194,255,0.4)',
              color: '#00C2FF',
              fontWeight: 600,
              '&:hover': { borderColor: '#00C2FF', background: 'rgba(0,194,255,0.08)' },
            }}
          >
            Ajouter manuellement
          </Button>
        </Box>
      </Box>

      {/* ── Variants list ── */}
      {filteredVariants.length === 0 ? (
        <Box
          sx={{
            py: 5,
            textAlign: 'center',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.08)',
            borderRadius: '12px',
          }}
        >
          <StarBorderIcon sx={{ fontSize: '2rem', color: 'rgba(255,255,255,0.15)', mb: 1 }} />
          <Typography color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            {search.trim() ? 'Aucun résultat' : 'Utilisez le générateur ci-dessus pour créer des variantes automatiquement.'}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={0.75}>
          {pagedVariants.map((variant) => (
            <VariantRow
              key={variant.id}
              variant={variant}
              onEdit={() => { setEditTarget(variant); setDialogOpen(true); }}
              onDelete={() => setDeleteTarget(variant)}
            />
          ))}
        </Stack>
      )}

      {/* ── Pagination (only if needed) ── */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={2} gap={2}>
          <Button
            size="small"
            disabled={safePage === 0}
            onClick={() => setPage((p) => p - 1)}
            sx={{ color: 'var(--mirai-gray)', minWidth: 36 }}
          >
            ←
          </Button>
          <Typography sx={{ fontSize: '0.78rem', color: 'var(--mirai-gray)' }}>
            {safePage + 1} / {totalPages}
          </Typography>
          <Button
            size="small"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            sx={{ color: 'var(--mirai-gray)', minWidth: 36 }}
          >
            →
          </Button>
        </Box>
      )}

      {/* Dialogs */}
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

      <DeleteDialog
        variant={deleteTarget}
        onClose={() => { setDeleteTarget(null); deleteMutation.reset(); }}
        onConfirm={(id) => void handleDelete(id)}
        isDeleting={deleteMutation.isPending}
        deleteError={deleteMutation.error}
      />
    </Box>
  );
}
