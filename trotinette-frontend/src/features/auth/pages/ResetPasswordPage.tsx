import { useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import { resetPasswordApi } from '../api/auth';

const resetSchema = z
  .object({
    password: z.string().min(8, 'Minimum 8 caracteres'),
    password_confirmation: z.string().min(8, 'Minimum 8 caracteres'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ResetFormData) =>
      resetPasswordApi({
        token: token!,
        email: email!,
        password: data.password,
        password_confirmation: data.password_confirmation,
      }),
    onSuccess: (res) => {
      setSuccessMessage(res.message);
      setErrorMessage(null);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Une erreur est survenue';
      setErrorMessage(message);
    },
  });

  const onSubmit = async (data: ResetFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    await mutation.mutateAsync(data);
  };

  if (!token || !email) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Lien de reinitialisation invalide. Veuillez demander un nouveau lien.
          </Alert>
          <Box textAlign="center">
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Demander un nouveau lien
            </Link>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Reinitialiser le mot de passe
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {!successMessage && (
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="Nouveau mot de passe"
              type="password"
              autoComplete="new-password"
              fullWidth
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register('password')}
            />

            <TextField
              label="Confirmer le nouveau mot de passe"
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
              disabled={mutation.isPending}
              startIcon={mutation.isPending ? <CircularProgress size={16} /> : undefined}
            >
              Reinitialiser le mot de passe
            </Button>
          </Box>
        )}

        <Box mt={3} textAlign="center">
          <Link component={RouterLink} to="/login" variant="body2">
            Retour a la connexion
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}
