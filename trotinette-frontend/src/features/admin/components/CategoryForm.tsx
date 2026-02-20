import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useCreateCategory, useUpdateCategory } from '../api/categories';
import type { AdminCategory } from '../types';

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
  name: z.string().min(1, 'Nom requis').max(255),
  slug: z.string().min(1, 'Slug requis').max(100),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface CategoryFormProps {
  category?: AdminCategory;
  onSuccess: () => void;
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const isEdit = Boolean(category);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      is_active: category?.is_active ?? true,
    },
  });

  // Auto-generate slug from name
  const nameValue = watch('name');

  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue('slug', slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, isEdit, setValue]);

  const onSubmit = async (values: FormValues) => {
    if (isEdit && category) {
      await updateMutation.mutateAsync({ id: category.id, name: values.name, slug: values.slug, is_active: values.is_active });
    } else {
      await createMutation.mutateAsync({ name: values.name, slug: values.slug, is_active: values.is_active });
    }
    onSuccess();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {mutationError && (
        <Alert severity="error">
          {(mutationError as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Une erreur est survenue / An error occurred'}
        </Alert>
      )}

      <TextField
        label="Nom"
        {...register('name')}
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        required
        fullWidth
      />

      <TextField
        label="Slug"
        {...register('slug')}
        error={Boolean(errors.slug)}
        helperText={
          errors.slug?.message ??
          'Auto-genere depuis le nom'
        }
        fullWidth
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
            label="Actif / Active"
          />
        )}
      />

      <Box display="flex" justifyContent="flex-end" gap={2}>
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
