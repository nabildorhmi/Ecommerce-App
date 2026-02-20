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
  attributes: z.object({
    speed: z.string().optional().default(''),
    battery: z.string().optional().default(''),
    range_km: z.string().optional().default(''),
    weight: z.string().optional().default(''),
    motor_power: z.string().optional().default(''),
  }),
});

type FormValues = z.infer<typeof schema>;

interface ProductFormProps {
  product?: AdminProduct;
  onSuccess: () => void;
}

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

  // Track manual slug edits to prevent auto-override
  const [slugManual, setSlugManual] = useState(false);

  const defaultValues: FormValues = {
    sku: product?.sku ?? '',
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product ? product.price / 100 : 0,
    stock_quantity: product?.stock_quantity ?? 0,
    category_id: product?.category_id ?? null,
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    attributes: {
      speed: String(product?.attributes?.speed ?? ''),
      battery: String(product?.attributes?.battery ?? ''),
      range_km: String(product?.attributes?.range_km ?? ''),
      weight: String(product?.attributes?.weight ?? ''),
      motor_power: String(product?.attributes?.motor_power ?? ''),
    },
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
      attributes: values.attributes,
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
            ?.response?.data?.message ?? 'Une erreur est survenue / An error occurred'}
        </Alert>
      )}

      {/* Section 1: Basic info */}
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Informations de base / Basic Info
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
            label="Prix (MAD) / Price (MAD)"
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
                <InputLabel>Categorie / Category</InputLabel>
                <Select
                  label="Categorie / Category"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const val = String(e.target.value);
                    field.onChange(val === '' ? null : Number(val));
                  }}
                >
                  <MenuItem value="">
                    <em>Aucune / None</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={String(cat.id)}>
                      {cat.translations?.fr?.name ?? cat.slug}
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
                label="Actif / Active"
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
                label="En vedette / Featured (Homepage carousel)"
              />
            )}
          />
        </Box>
      </Box>

      <Divider />

      {/* Section 2: Product Info */}
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Informations produit / Product Info
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Nom / Name"
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
              'Auto-genere depuis le nom / Auto-generated from name'
            }
          />
          <TextField
            label="Description"
            multiline
            rows={3}
            {...register('description')}
          />
        </Box>
      </Box>

      <Divider />

      {/* Section 3: Specifications */}
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Specifications
        </Typography>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <TextField
            label="Vitesse max / Max speed"
            {...register('attributes.speed')}
          />
          <TextField
            label="Batterie / Battery"
            {...register('attributes.battery')}
          />
          <TextField
            label="Autonomie (km) / Range (km)"
            {...register('attributes.range_km')}
          />
          <TextField
            label="Poids / Weight"
            {...register('attributes.weight')}
          />
          <TextField
            label="Puissance moteur / Motor power"
            {...register('attributes.motor_power')}
          />
        </Box>
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
              ? 'Mettre a jour / Update'
              : 'Creer / Create'}
        </Button>
      </Box>
    </Box>
  );
}
