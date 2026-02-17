import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { updateProfileApi } from '../api/auth';
import { useAuthStore } from '../store';

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Minimum 2 caracteres / Minimum 2 characters')
    .max(255),
  email: z.string().email('Email invalide / Invalid email'),
  phone: z
    .string()
    .min(8, 'Minimum 8 chiffres / Minimum 8 digits')
    .max(20),
  address_city: z.string().max(255).nullable().optional(),
  address_street: z.string().max(255).nullable().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [successOpen, setSuccessOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      address_city: user?.address_city ?? '',
      address_street: user?.address_street ?? '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: ({ data: updatedUser }) => {
      useAuthStore.getState().updateUser(updatedUser);
      setSuccessOpen(true);
      setServerError(null);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Une erreur est survenue / An error occurred';
      setServerError(message);
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setServerError(null);
    await updateMutation.mutateAsync({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address_city: data.address_city ?? null,
      address_street: data.address_street ?? null,
    });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          {t('profile.title')}
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label={t('profile.name')}
            type="text"
            fullWidth
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register('name')}
          />

          <TextField
            label={t('profile.email')}
            type="email"
            fullWidth
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email')}
          />

          <TextField
            label={t('profile.phone')}
            type="tel"
            fullWidth
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            {...register('phone')}
          />

          <TextField
            label={t('profile.addressCity')}
            type="text"
            fullWidth
            error={Boolean(errors.address_city)}
            helperText={errors.address_city?.message}
            {...register('address_city')}
          />

          <TextField
            label={t('profile.addressStreet')}
            type="text"
            fullWidth
            error={Boolean(errors.address_street)}
            helperText={errors.address_street?.message}
            {...register('address_street')}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
            sx={{ mt: 1 }}
          >
            {t('profile.save')}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          {t('profile.saved')}
        </Alert>
      </Snackbar>
    </Container>
  );
}
