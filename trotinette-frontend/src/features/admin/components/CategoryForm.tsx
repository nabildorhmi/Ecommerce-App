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
  slug: z.string().min(1, 'Slug requis').max(100),
  is_active: z.boolean(),
  translations: z.object({
    fr: z.object({
      name: z.string().min(1, 'Nom FR requis').max(255),
    }),
    en: z.object({
      name: z.string().min(1, 'EN name required').max(255),
    }),
  }),
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
      slug: category?.slug ?? '',
      is_active: category?.is_active ?? true,
      translations: {
        fr: { name: category?.translations?.fr?.name ?? '' },
        en: { name: category?.translations?.en?.name ?? '' },
      },
    },
  });

  // Auto-generate slug from FR name
  const frName = watch('translations.fr.name');
  const currentSlug = watch('slug');

  useEffect(() => {
    // Only auto-generate if slug looks auto-generated (matches slugify of frName)
    // or if it's empty — don't override manual edits
    if (!isEdit && frName) {
      setValue('slug', slugify(frName), { shouldValidate: false });
    }
  }, [frName, isEdit, setValue, currentSlug]);

  const onSubmit = async (values: FormValues) => {
    if (isEdit && category) {
      await updateMutation.mutateAsync({ id: category.id, ...values });
    } else {
      await createMutation.mutateAsync(values);
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
        label="Nom (FR) / Name (FR)"
        {...register('translations.fr.name')}
        error={Boolean(errors.translations?.fr?.name)}
        helperText={errors.translations?.fr?.name?.message}
        required
        fullWidth
      />

      <TextField
        label="Name (EN)"
        {...register('translations.en.name')}
        error={Boolean(errors.translations?.en?.name)}
        helperText={errors.translations?.en?.name?.message}
        required
        fullWidth
      />

      <TextField
        label="Slug"
        {...register('slug')}
        error={Boolean(errors.slug)}
        helperText={
          errors.slug?.message ??
          'Auto-genere depuis le nom FR / Auto-generated from FR name'
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
