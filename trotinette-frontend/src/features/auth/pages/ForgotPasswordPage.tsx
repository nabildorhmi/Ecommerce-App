import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
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
import { forgotPasswordApi } from '../api/auth';

const forgotSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ForgotFormData) => forgotPasswordApi(data.email),
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

  const onSubmit = async (data: ForgotFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    await mutation.mutateAsync(data);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Mot de passe oublie ?
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Entrez votre adresse e-mail et nous vous enverrons un lien pour reinitialiser votre mot de passe.
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

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Adresse e-mail"
            type="email"
            autoComplete="email"
            fullWidth
            disabled={Boolean(successMessage)}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email')}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={mutation.isPending || Boolean(successMessage)}
            startIcon={mutation.isPending ? <CircularProgress size={16} /> : undefined}
          >
            Envoyer le lien
          </Button>
        </Box>

        <Box mt={3} textAlign="center">
          <Link component={RouterLink} to="/login" variant="body2">
            Retour a la connexion
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}
