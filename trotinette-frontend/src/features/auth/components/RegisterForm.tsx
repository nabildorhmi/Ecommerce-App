import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Minimum 2 caracteres / Minimum 2 characters')
      .max(255),
    email: z.string().email('Email invalide / Invalid email'),
    phone: z
      .string()
      .min(8, 'Minimum 8 chiffres / Minimum 8 digits')
      .max(20),
    password: z.string().min(8, 'Minimum 8 caracteres / Minimum 8 characters'),
    password_confirmation: z
      .string()
      .min(8, 'Minimum 8 caracteres / Minimum 8 characters'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas / Passwords do not match',
    path: ['password_confirmation'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  error?: string | null;
}

export function RegisterForm({ onSubmit, error }: RegisterFormProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      <TextField
        label={t('auth.name')}
        type="text"
        autoComplete="name"
        fullWidth
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        {...register('name')}
      />

      <TextField
        label={t('auth.email')}
        type="email"
        autoComplete="email"
        fullWidth
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        {...register('email')}
      />

      <TextField
        label={t('auth.phone')}
        type="tel"
        autoComplete="tel"
        fullWidth
        error={Boolean(errors.phone)}
        helperText={errors.phone?.message}
        {...register('phone')}
      />

      <TextField
        label={t('auth.password')}
        type="password"
        autoComplete="new-password"
        fullWidth
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register('password')}
      />

      <TextField
        label={t('auth.confirmPassword')}
        type="password"
        autoComplete="new-password"
        fullWidth
        error={Boolean(errors.password_confirmation)}
        helperText={errors.password_confirmation?.message}
        {...register('password_confirmation')}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
      >
        {t('auth.registerButton')}
      </Button>
    </Box>
  );
}
