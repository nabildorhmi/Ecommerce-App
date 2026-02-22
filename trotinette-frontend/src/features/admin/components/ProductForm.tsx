import { useEffect, useState, useCallback, useMemo } from 'react';
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
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useAdminCategories } from '../api/categories';
import { useCreateProduct, useUpdateProduct } from '../api/products';
import { ImageUploader } from './ImageUploader';
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

// ---- Attribute presets ----
const ATTRIBUTE_PRESETS: Record<string, { key: string; value: string }[]> = {
  'Trotinettes': [
    { key: 'motor_power', value: '' },
    { key: 'max_speed', value: '' },
    { key: 'battery', value: '' },
    { key: 'range_km', value: '' },
    { key: 'weight_kg', value: '' },
  ],
  'Vetements': [
    { key: 'taille', value: '' },
    { key: 'couleur', value: '' },
    { key: 'matiere', value: '' },
  ],
  'Electronique': [
    { key: 'marque', value: '' },
    { key: 'garantie', value: '' },
    { key: 'poids_kg', value: '' },
  ],
};

// ---- Zod schema ----
const schema = z.object({
  sku: z.string().min(1, 'SKU requis').max(50),
  name: z.string().min(1, 'Nom requis').max(255),
  slug: z.string().min(1, 'Slug requis').max(255),
  description: z.string().default(''),
  price: z.number({ error: 'Prix invalide' }).min(0),
  stock_quantity: z
    .number({ error: 'Quantite invalide' })
    .int()
    .min(0),
  category_id: z.number({ error: 'Categorie requise' }).nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
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

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }, { background: [] }],
    ['link'],
    ['clean'],
  ],
};

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const isEdit = Boolean(product);
  const { data: categoriesData } = useAdminCategories();
  const categories = categoriesData?.data ?? [];

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  // Image state
  const [newImages, setNewImages] = useState<File[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [existingImages, setExistingImages] = useState(
    product?.images ?? []
  );

  // Dynamic attributes state
  const [attrRows, setAttrRows] = useState<AttrRow[]>(() => attrsToRows(product?.attributes));

  // Track manual slug edits to prevent auto-override
  const [slugManual, setSlugManual] = useState(false);

  const defaultValues: FormValues = {
    sku: product?.sku ?? '',
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product ? product.price / 100 : 0,
    stock_quantity: product?.stock_quantity ?? 0,
    category_id: product?.category_id ?? product?.category?.id ?? null,
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
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

  // Auto-generate slug from name
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

  const applyPreset = (presetName: string) => {
    const preset = ATTRIBUTE_PRESETS[presetName];
    if (!preset) return;
    // Merge: keep existing rows with values, add preset keys that don't exist yet
    const existingKeys = new Set(attrRows.map((r) => r.key.trim()).filter(Boolean));
    const newRows = [...attrRows.filter((r) => r.key.trim())];
    for (const p of preset) {
      if (!existingKeys.has(p.key)) {
        newRows.push({ ...p });
      }
    }
    setAttrRows(newRows.length > 0 ? newRows : [{ key: '', value: '' }]);
  };

  // Memoize quill modules to prevent re-renders
  const modules = useMemo(() => quillModules, []);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      sku: values.sku,
      name: values.name,
      slug: values.slug,
      description: values.description ?? '',
      price: values.price,
      stock_quantity: values.stock_quantity,
      category_id: values.category_id,
      is_active: values.is_active,
      is_featured: values.is_featured,
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
            label="Stock"
            type="number"
            inputProps={{ min: '0', step: '1' }}
            {...register('stock_quantity', { valueAsNumber: true })}
            error={Boolean(errors.stock_quantity)}
            helperText={errors.stock_quantity?.message}
            required
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
            helperText={
              errors.slug?.message ??
              'Auto-genere depuis le nom'
            }
          />

          {/* WYSIWYG Description */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Description
            </Typography>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Box
                  sx={{
                    '& .ql-container': {
                      minHeight: 150,
                      fontSize: '0.95rem',
                    },
                    '& .ql-editor': {
                      minHeight: 150,
                    },
                  }}
                >
                  <ReactQuill
                    theme="snow"
                    value={field.value}
                    onChange={field.onChange}
                    modules={modules}
                    placeholder="Description du produit..."
                  />
                </Box>
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
        </Box>

        {/* Preset buttons */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {Object.keys(ATTRIBUTE_PRESETS).map((presetName) => (
            <Chip
              key={presetName}
              label={presetName}
              onClick={() => applyPreset(presetName)}
              variant="outlined"
              size="small"
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>

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
        <Button
          startIcon={<AddIcon />}
          onClick={addAttrRow}
          size="small"
          sx={{ mt: 1 }}
        >
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
          {isLoading
            ? 'Enregistrement...'
            : isEdit
              ? 'Mettre a jour'
              : 'Creer'}
        </Button>
      </Box>
    </Box>
  );
}
