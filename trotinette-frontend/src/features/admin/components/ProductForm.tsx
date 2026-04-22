import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import ImageIcon from '@mui/icons-material/Image';
import SpeedIcon from '@mui/icons-material/Speed';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import InventoryIcon from '@mui/icons-material/Inventory';
import MDEditor from '@uiw/react-md-editor';
import { useAdminCategories } from '../api/categories';
import { useCreateProduct, useUpdateProduct } from '../api/products';
import { ImageUploader } from './ImageUploader';
import { useAttributeTemplates } from '../store/attributeTemplates';
import type { AdminProduct } from '../types';

// ── Slugify helper ──
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function skuify(value: string): string {
  const base = slugify(value)
    .toUpperCase()
    .replace(/-/g, '_')
    .slice(0, 40);
  return base;
}

// ── Zod schema ──
const schema = z.object({
  sku: z.string().min(1, 'SKU requis').max(50),
  name: z.string().min(1, 'Nom requis').max(255),
  slug: z.string().min(1, 'Slug requis').max(255),
  description: z.string().default(''),
  price: z.number({ error: 'Prix invalide' }).min(0),
  discount_percentage: z.union([z.number().int().min(0).max(100), z.literal('')]).optional(),
  stock_quantity: z.union([z.number().int().min(0), z.literal('')]).optional(),
  category_id: z.number({ error: 'Catégorie requise' }).nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_new: z.boolean(),
});

type FormValues = z.input<typeof schema>;

interface AttrRow {
  key: string;
  value: string;
}

interface AttributeTemplateOption {
  id: string;
  name: string;
  keys: string[];
}

interface ProductFormProps {
  product?: AdminProduct;
  onSuccess: (productId?: number) => void;
}

function attrsToRows(attrs: Record<string, string | number> | null | undefined): AttrRow[] {
  if (!attrs || typeof attrs !== 'object') return [{ key: '', value: '' }];
  const rows = Object.entries(attrs).map(([key, value]) => ({ key, value: String(value) }));
  return rows.length > 0 ? rows : [{ key: '', value: '' }];
}

function rowsToAttrs(rows: AttrRow[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const row of rows) {
    const k = row.key.trim();
    if (k) result[k] = row.value;
  }
  return result;
}

// ── Shared section card style ──
const sectionSx = {
  background: 'rgba(18, 18, 28, 0.5)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '14px',
  p: 2.5,
};

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Box display="flex" alignItems="center" gap={1} mb={2}>
      <Box sx={{ color: '#00C2FF', display: 'flex' }}>{icon}</Box>
      <Typography
        sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--mirai-white)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ── Template Management Dialog ──
function TemplateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { templates, addTemplate, removeTemplate, updateTemplate } = useAttributeTemplates();
  const [newName, setNewName] = useState('');
  const [newKeys, setNewKeys] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editKeys, setEditKeys] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    const keys = newKeys.split(',').map((k) => k.trim()).filter(Boolean);
    if (!name || keys.length === 0) return;
    addTemplate(name, keys);
    setNewName('');
    setNewKeys('');
  };

  const startEdit = (id: string) => {
    const t = templates.find((t) => t.id === id);
    if (!t) return;
    setEditId(id);
    setEditName(t.name);
    setEditKeys(t.keys.join(', '));
  };

  const saveEdit = () => {
    if (!editId) return;
    const keys = editKeys.split(',').map((k) => k.trim()).filter(Boolean);
    if (editName.trim() && keys.length > 0) updateTemplate(editId, editName.trim(), keys);
    setEditId(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Modèles de caractéristiques</DialogTitle>
      <DialogContent>
        {templates.length > 0 && (
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {templates.map((t) => (
              <Box
                key={t.id}
                sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              >
                {editId === t.id ? (
                  <Box display="flex" flexDirection="column" gap={1}>
                    <TextField size="small" label="Nom" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <TextField size="small" label="Attributs (séparés par virgule)" value={editKeys} onChange={(e) => setEditKeys(e.target.value)} />
                    <Box display="flex" gap={1}>
                      <Button size="small" variant="contained" onClick={saveEdit} startIcon={<SaveIcon />}>Enregistrer</Button>
                      <Button size="small" onClick={() => setEditId(null)}>Annuler</Button>
                    </Box>
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography fontWeight={600} fontSize="0.9rem">{t.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{t.keys.join(', ')}</Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => startEdit(t.id)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => removeTemplate(t.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        )}
        {templates.length === 0 && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>Aucun modèle. Créez-en un ci-dessous.</Typography>
        )}

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>Nouveau modèle</Typography>
        <Stack spacing={1.5}>
          <TextField
            size="small"
            label="Nom du modèle"
            placeholder="ex: Trotinettes, Vêtements"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <TextField
            size="small"
            label="Attributs (séparés par virgule)"
            placeholder="ex: puissance_moteur, vitesse_max, autonomie_km"
            value={newKeys}
            onChange={(e) => setNewKeys(e.target.value)}
            multiline
            rows={2}
          />
          <Button
            variant="outlined"
            onClick={handleAdd}
            disabled={!newName.trim() || !newKeys.trim()}
            startIcon={<AddIcon />}
            size="small"
          >
            Ajouter le modèle
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main ProductForm ──
export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const isEdit = Boolean(product);
  const { data: categoriesData } = useAdminCategories();
  const categories = categoriesData?.data ?? [];
  const { templates } = useAttributeTemplates();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  const [newImages, setNewImages] = useState<File[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [existingImages, setExistingImages] = useState(product?.images ?? []);
  const [attrRows, setAttrRows] = useState<AttrRow[]>(() => attrsToRows(product?.attributes));
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AttributeTemplateOption | null>(null);
  const [slugManual, setSlugManual] = useState(false);
  const [skuManual, setSkuManual] = useState(Boolean(product?.sku));

  const defaultValues: FormValues = {
    sku: product?.sku ?? '',
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product ? product.price / 100 : 0,
    discount_percentage: product ? (product.discount_percentage !== null ? product.discount_percentage : '') : '',
    stock_quantity: isEdit ? '' : 0,
    category_id: product?.category_id ?? product?.category?.id ?? null,
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    is_new: product?.is_new ?? false,
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const name = useWatch({ control, name: 'name' });

  useEffect(() => {
    if (!slugManual && name) {
      setValue('slug', slugify(name), { shouldValidate: false });
    }
  }, [name, slugManual, setValue]);

  useEffect(() => {
    if (!skuManual && !isEdit && name) {
      setValue('sku', skuify(name), { shouldValidate: false });
    }
  }, [name, skuManual, isEdit, setValue]);

  const handleDeleteExistingImage = useCallback((mediaId: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== mediaId));
    setDeletedImageIds((prev) => [...prev, mediaId]);
  }, []);

  const handleAttrChange = (index: number, field: 'key' | 'value', val: string) => {
    setAttrRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: val } : row)));
  };

  const addAttrRow = () => setAttrRows((prev) => [...prev, { key: '', value: '' }]);
  const removeAttrRow = (index: number) => setAttrRows((prev) => prev.filter((_, i) => i !== index));

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    const existingKeys = new Set(attrRows.map((r) => r.key.trim()).filter(Boolean));
    const newRows = [...attrRows.filter((r) => r.key.trim())];
    for (const key of template.keys) {
      if (!existingKeys.has(key)) newRows.push({ key, value: '' });
    }
    setAttrRows(newRows.length > 0 ? newRows : [{ key: '', value: '' }]);
  };

  const onSubmit = async (values: FormValues) => {
    const payload = {
      sku: values.sku,
      name: values.name,
      slug: values.slug,
      description: values.description ?? '',
      price: values.price,
      discount_percentage: values.discount_percentage !== '' && values.discount_percentage != null ? values.discount_percentage : null,
      category_id: values.category_id,
      is_active: values.is_active,
      is_featured: values.is_featured,
      is_new: values.is_new,
      attributes: rowsToAttrs(attrRows),
      images: newImages,
      delete_images: deletedImageIds,
    };

    if (isEdit && product) {
      await updateMutation.mutateAsync({ id: product.id, ...payload });
      onSuccess();
    } else {
      const result = await createMutation.mutateAsync({
        ...payload,
        stock_quantity: values.stock_quantity === '' || values.stock_quantity == null ? 0 : values.stock_quantity,
      });
      const newProductId =
        (result as { data?: { id?: number } })?.data?.id ??
        (result as { id?: number })?.id;
      onSuccess(newProductId);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
    >
      {mutationError && (
        <Alert severity="error" sx={{ borderRadius: '10px' }}>
          {(mutationError as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Une erreur est survenue'}
        </Alert>
      )}

      {/* ── Section 1: Identification ── */}
      <Box sx={sectionSx}>
        <SectionTitle icon={<LabelImportantIcon fontSize="small" />} label="Identification" />
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }} gap={2}>
          <TextField
            label="SKU *"
            size="small"
            {...register('sku', { onChange: () => setSkuManual(true) })}
            error={Boolean(errors.sku)}
            helperText={errors.sku?.message ?? 'Auto-genere depuis le nom (modifiable)'}
          />
          <TextField
            label="Nom du produit *"
            size="small"
            {...register('name')}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />
          <TextField
            label="Slug (URL)"
            size="small"
            {...register('slug', { onChange: () => setSlugManual(true) })}
            error={Boolean(errors.slug)}
            helperText={errors.slug?.message ?? 'Auto-généré depuis le nom'}
          />
        </Box>
      </Box>

      {/* ── Section 2: Pricing & Category ── */}
      <Box sx={sectionSx}>
        <SectionTitle icon={<SpeedIcon fontSize="small" />} label="Prix & Catégorie" />
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }} gap={2}>
          <TextField
            label="Prix (MAD) *"
            size="small"
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            slotProps={{
              input: { endAdornment: <InputAdornment position="end">MAD</InputAdornment> },
            }}
            {...register('price', { valueAsNumber: true })}
            error={Boolean(errors.price)}
            helperText={errors.price?.message}
          />
          <TextField
            label="Remise (%)"
            size="small"
            type="number"
            inputProps={{ step: '1', min: '0', max: '100' }}
            slotProps={{
              input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
            }}
            {...register('discount_percentage', {
              setValueAs: (v) => (v === '' || v == null ? '' : Number(v)),
            })}
            error={Boolean(errors.discount_percentage)}
            helperText={'ex: 30 pour −30%'}
          />

          {/* Stock — only shown on create */}
          {!isEdit && (
            <TextField
              label="Stock initial"
              size="small"
              type="number"
              inputProps={{ step: '1', min: '0' }}
              slotProps={{
                input: { endAdornment: <InputAdornment position="end"><InventoryIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment> },
              }}
              {...register('stock_quantity', {
                setValueAs: (v) => (v === '' || v == null ? '' : Number(v)),
              })}
              error={Boolean(errors.stock_quantity)}
              helperText={'Quantité disponible au démarrage'}
            />
          )}

          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <FormControl error={Boolean(errors.category_id)} size="small">
                <InputLabel>Catégorie</InputLabel>
                <Select
                  label="Catégorie"
                  value={field.value != null ? String(field.value) : ''}
                  onChange={(e) => {
                    const val = String(e.target.value);
                    field.onChange(val === '' ? null : Number(val));
                  }}
                >
                  <MenuItem value=""><em>Aucune</em></MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={String(cat.id)}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Box>

        {/* Status flags */}
        <Box display="flex" gap={2} mt={2} flexWrap="wrap">
          {(['is_active', 'is_featured', 'is_new'] as const).map((fieldName) => {
            const labels: Record<string, string> = {
              is_active: 'Actif',
              is_featured: 'Vedette',
              is_new: 'Nouveau',
            };
            return (
              <Controller
                key={fieldName}
                name={fieldName}
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#00C2FF' }, '& .MuiSwitch-track': { backgroundColor: 'rgba(0,194,255,0.2)' } }}
                      />
                    }
                    label={labels[fieldName]}
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem', color: 'var(--mirai-gray)' } }}
                  />
                )}
              />
            );
          })}
        </Box>
      </Box>

      {/* ── Section 3: Description ── */}
      <Box sx={sectionSx}>
        <SectionTitle icon={<LabelImportantIcon fontSize="small" />} label="Description" />
        <Box data-color-mode="dark">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <MDEditor
                value={field.value}
                onChange={(val) => field.onChange(val ?? '')}
                height={160}
                preview="edit"
              />
            )}
          />
        </Box>
      </Box>

      {/* ── Section 4: Caractéristiques ── */}
      <Box sx={sectionSx}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <SectionTitle icon={<SpeedIcon fontSize="small" />} label="Caractéristiques" />
          <Tooltip title="Gérer les modèles de caractéristiques">
            <IconButton size="small" onClick={() => setTemplateDialogOpen(true)} sx={{ color: 'var(--mirai-gray)', '&:hover': { color: '#00C2FF' } }}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Template selector */}
        {templates.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.75 }}>
              Appliquer un modele de caracteristiques
            </Typography>
            <Autocomplete
              size="small"
              options={templates as AttributeTemplateOption[]}
              value={selectedTemplate}
              onChange={(_, newValue) => {
                setSelectedTemplate(newValue);
                if (newValue) {
                  applyTemplate(newValue.id);
                  setSelectedTemplate(null);
                }
              }}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="Aucun modele"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Modeles"
                  placeholder="Rechercher un modele..."
                />
              )}
            />
          </Box>
        )}

        {attrRows.length === 0 || (attrRows.length === 1 && !attrRows[0].key) ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1.5 }}>
            Aucune caractéristique. Ajoutez des attributs comme la vitesse, le poids, etc.
          </Typography>
        ) : null}

        <Stack spacing={1}>
          {attrRows.map((row, index) => (
            <Box key={index} display="flex" gap={1} alignItems="center">
              <TextField
                label="Clé"
                size="small"
                value={row.key}
                onChange={(e) => handleAttrChange(index, 'key', e.target.value)}
                sx={{ flex: 1 }}
                placeholder="ex: vitesse_max"
              />
              <TextField
                label="Valeur"
                size="small"
                value={row.value}
                onChange={(e) => handleAttrChange(index, 'value', e.target.value)}
                sx={{ flex: 1.5 }}
                placeholder="ex: 25 km/h"
              />
              <IconButton
                onClick={() => removeAttrRow(index)}
                disabled={attrRows.length <= 1}
                size="small"
                color="error"
                sx={{ flexShrink: 0 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
        <Button startIcon={<AddIcon />} onClick={addAttrRow} size="small" sx={{ mt: 1.5, color: 'rgba(0,194,255,0.7)' }}>
          Ajouter un attribut
        </Button>
      </Box>

      {/* ── Section 5: Images ── */}
      <Box sx={sectionSx}>
        <SectionTitle icon={<ImageIcon fontSize="small" />} label="Images" />
        <ImageUploader
          existingImages={existingImages}
          onNewFiles={setNewImages}
          onDeleteImage={handleDeleteExistingImage}
        />
      </Box>

      {/* ── Submit ── */}
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          sx={{
            borderRadius: '10px',
            fontWeight: 700,
            px: 3,
            background: 'linear-gradient(135deg, #00C2FF, #0099CC)',
            '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(0,194,255,0.3)' },
            transition: 'all 0.2s ease',
          }}
        >
          {isLoading ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer le produit →'}
        </Button>
      </Box>

      {/* Template dialog */}
      <TemplateDialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} />
    </Box>
  );
}
