import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import MDEditor from '@uiw/react-md-editor';
import { useAdminCategories } from '../api/categories';
import { useCreateProduct, useUpdateProduct } from '../api/products';
import { ImageUploader } from './ImageUploader';
import { useAttributeTemplates } from '../store/attributeTemplates';
import type { AdminProduct } from '../types';

// ---- Slugify helper ----
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---- Zod schema ----
const schema = z.object({
  sku: z.string().min(1, 'SKU requis').max(50),
  name: z.string().min(1, 'Nom requis').max(255),
  slug: z.string().min(1, 'Slug requis').max(255),
  description: z.string().default(''),
  price: z.number({ error: 'Prix invalide' }).min(0),
  promo_price: z.union([z.number().min(0), z.literal('')]).optional(),
  category_id: z.number({ error: 'Categorie requise' }).nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_new: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface AttrRow {
  key: string;
  value: string;
}

interface ProductFormProps {
  product?: AdminProduct;
  onSuccess: () => void;
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



// ---- Template Management Dialog ----
function TemplateDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { templates, addTemplate, removeTemplate, updateTemplate } = useAttributeTemplates();
  const [newName, setNewName] = useState('');
  const [newKeys, setNewKeys] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editKeys, setEditKeys] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    const keys = newKeys
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
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
    const keys = editKeys
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    if (editName.trim() && keys.length > 0) {
      updateTemplate(editId, editName.trim(), keys);
    }
    setEditId(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gerer les modeles de caracteristiques</DialogTitle>
      <DialogContent>
        {/* Existing templates */}
        {templates.length > 0 && (
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {templates.map((t) => (
              <Box
                key={t.id}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                {editId === t.id ? (
                  <Box display="flex" flexDirection="column" gap={1}>
                    <TextField
                      size="small"
                      label="Nom"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <TextField
                      size="small"
                      label="Attributs (separes par des virgules)"
                      value={editKeys}
                      onChange={(e) => setEditKeys(e.target.value)}
                    />
                    <Box display="flex" gap={1}>
                      <Button size="small" variant="contained" onClick={saveEdit} startIcon={<SaveIcon />}>
                        Enregistrer
                      </Button>
                      <Button size="small" onClick={() => setEditId(null)}>
                        Annuler
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography fontWeight={600} fontSize="0.9rem">
                        {t.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t.keys.join(', ')}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => startEdit(t.id)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => removeTemplate(t.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        )}

        {templates.length === 0 && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Aucun modele. Creez-en un ci-dessous.
          </Typography>
        )}

        {/* Add new template */}
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" gutterBottom>
          Nouveau modele
        </Typography>
        <Stack spacing={1.5}>
          <TextField
            size="small"
            label="Nom du modele"
            placeholder="ex: Trotinettes, Vetements, Telephones"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <TextField
            size="small"
            label="Attributs (separes par des virgules)"
            placeholder="ex: motor_power, max_speed, battery, range_km, weight_kg"
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
            Ajouter le modele
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}

// ---- Main ProductForm ----
export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const isEdit = Boolean(product);
  const { data: categoriesData } = useAdminCategories();
  const categories = categoriesData?.data ?? [];
  const { templates } = useAttributeTemplates();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  // Image state
  const [newImages, setNewImages] = useState<File[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [existingImages, setExistingImages] = useState(product?.images ?? []);

  // Dynamic attributes state
  const [attrRows, setAttrRows] = useState<AttrRow[]>(() => attrsToRows(product?.attributes));

  // Template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  // Track manual slug edits
  const [slugManual, setSlugManual] = useState(false);

  const defaultValues: FormValues = {
    sku: product?.sku ?? '',
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product ? product.price / 100 : 0,
    promo_price: product ? (product.promo_price !== null ? product.promo_price / 100 : '') : '',
    category_id: product?.category_id ?? product?.category?.id ?? null,
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    is_new: product?.is_new ?? false,
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  const name = watch('name');

  useEffect(() => {
    if (!slugManual && name) {
      setValue('slug', slugify(name), { shouldValidate: false });
    }
  }, [name, slugManual, setValue]);

  const handleDeleteExistingImage = useCallback((mediaId: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== mediaId));
    setDeletedImageIds((prev) => [...prev, mediaId]);
  }, []);

  const handleAttrChange = (index: number, field: 'key' | 'value', val: string) => {
    setAttrRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: val } : row)));
  };

  const addAttrRow = () => {
    setAttrRows((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeAttrRow = (index: number) => {
    setAttrRows((prev) => prev.filter((_, i) => i !== index));
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    const existingKeys = new Set(attrRows.map((r) => r.key.trim()).filter(Boolean));
    const newRows = [...attrRows.filter((r) => r.key.trim())];
    for (const key of template.keys) {
      if (!existingKeys.has(key)) {
        newRows.push({ key, value: '' });
      }
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
      promo_price: values.promo_price !== '' && values.promo_price != null ? values.promo_price : null,
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
    } else {
      await createMutation.mutateAsync(payload);
    }
    onSuccess();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
      sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      {mutationError && (
        <Alert severity="error">
          {(mutationError as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Une erreur est survenue'}
        </Alert>
      )}

      {/* Section 1: Basic info */}
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Informations de base
        </Typography>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <TextField
            label="SKU"
            {...register('sku')}
            error={Boolean(errors.sku)}
            helperText={errors.sku?.message}
            required
          />
          <TextField
            label="Prix (MAD)"
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            {...register('price', { valueAsNumber: true })}
            error={Boolean(errors.price)}
            helperText={errors.price?.message}
            required
          />
          <TextField
            label="Prix promo de base (MAD)"
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            {...register('promo_price', {
              setValueAs: (v) => (v === '' || v == null ? '' : Number(v))
            })}
            error={Boolean(errors.promo_price)}
            helperText={errors.promo_price?.message ?? 'Prix promo par défaut (les variantes peuvent le surcharger)'}
          />
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <FormControl error={Boolean(errors.category_id)}>
                <InputLabel>Categorie</InputLabel>
                <Select
                  label="Categorie"
                  value={field.value != null ? String(field.value) : ''}
                  onChange={(e) => {
                    const val = String(e.target.value);
                    field.onChange(val === '' ? null : Number(val));
                  }}
                >
                  <MenuItem value="">
                    <em>Aucune</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Box>
        <Box mt={2}>
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
                label="Actif"
              />
            )}
          />
        </Box>
        <Box mt={1}>
          <Controller
            name="is_featured"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="En vedette (page d'accueil)"
              />
            )}
          />
        </Box>
        <Box mt={1}>
          <Controller
            name="is_new"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Nouveau produit"
              />
            )}
          />
        </Box>
      </Box>

      <Divider />

      {/* Section 2: Product Info */}
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Informations produit
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Nom"
            {...register('name')}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            required
          />
          <TextField
            label="Slug"
            {...register('slug', {
              onChange: () => setSlugManual(true),
            })}
            error={Boolean(errors.slug)}
            helperText={errors.slug?.message ?? 'Auto-genere depuis le nom'}
          />

          {/* Markdown Description */}
          <Box data-color-mode="dark">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Description (Markdown)
            </Typography>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <MDEditor
                  value={field.value}
                  onChange={(val) => field.onChange(val ?? '')}
                  height={220}
                  preview="edit"
                />
              )}
            />
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Section 3: Dynamic Attributes */}
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            Caracteristiques
          </Typography>
          <Button
            size="small"
            startIcon={<SettingsIcon />}
            onClick={() => setTemplateDialogOpen(true)}
          >
            Gerer les modeles
          </Button>
        </Box>

        {/* Template chips */}
        {templates.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', mr: 0.5 }}>
              Appliquer:
            </Typography>
            {templates.map((t) => (
              <Chip
                key={t.id}
                label={t.name}
                onClick={() => applyTemplate(t.id)}
                variant="outlined"
                size="small"
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        )}

        {templates.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Aucun modele. Cliquez sur "Gerer les modeles" pour en creer.
          </Typography>
        )}

        {attrRows.map((row, index) => (
          <Box key={index} display="flex" gap={1} mb={1} alignItems="center">
            <TextField
              label="Cle"
              size="small"
              value={row.key}
              onChange={(e) => handleAttrChange(index, 'key', e.target.value)}
              sx={{ flex: 1 }}
              placeholder="ex: couleur, taille, poids"
            />
            <TextField
              label="Valeur"
              size="small"
              value={row.value}
              onChange={(e) => handleAttrChange(index, 'value', e.target.value)}
              sx={{ flex: 1 }}
              placeholder="ex: rouge, M, 12 kg"
            />
            <IconButton
              onClick={() => removeAttrRow(index)}
              disabled={attrRows.length <= 1}
              size="small"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} onClick={addAttrRow} size="small" sx={{ mt: 1 }}>
          Ajouter un attribut
        </Button>
      </Box>

      <Divider />

      {/* Section 4: Images */}
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Images
        </Typography>
        <ImageUploader
          existingImages={existingImages}
          onNewFiles={setNewImages}
          onDeleteImage={handleDeleteExistingImage}
        />
      </Box>

      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
        >
          {isLoading ? 'Enregistrement...' : isEdit ? 'Mettre a jour' : 'Creer'}
        </Button>
      </Box>
    
      {/* Template management dialog */}
      <TemplateDialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
      />
    </Box>
  );
}
