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
import LockResetIcon from '@mui/icons-material/LockReset';
import { motion } from 'framer-motion';
import { forgotPasswordApi } from '../api/auth';
import { PageDecor } from '@/shared/components/PageDecor';

const forgotSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

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
    <Box
      sx={{
        py: 8,
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, rgba(0,194,255,0.05) 0%, rgba(12,12,20,1) 70%)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'absolute', top: '15%', left: '25%', width: 250, height: 250, background: 'rgba(0,194,255,0.04)', filter: 'blur(80px)', borderRadius: '50%' }} />
      <Box sx={{ position: 'absolute', bottom: '15%', right: '25%', width: 300, height: 300, background: 'rgba(199,64,77,0.03)', filter: 'blur(100px)', borderRadius: '50%' }} />

      <PageDecor variant="auth" />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Paper
            elevation={0}
            className="mirai-glass"
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: '24px',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{
                width: 56, height: 56, borderRadius: '16px',
                bgcolor: 'rgba(0,194,255,0.08)', border: '1px solid rgba(0,194,255,0.2)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                mb: 2,
              }}>
                <LockResetIcon sx={{ fontSize: '1.5rem', color: '#00C2FF' }} />
              </Box>
              <Typography variant="h4" fontWeight={800} color="var(--mirai-white)" letterSpacing="-0.02em">
                Mot de passe oublie ?
              </Typography>
              <Typography variant="body2" color="var(--mirai-gray)" sx={{ mt: 1 }}>
                Entrez votre e-mail pour recevoir un lien de reinitialisation
              </Typography>
            </Box>

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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={mutation.isPending || Boolean(successMessage)}
                startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
                className="mirai-glow"
                sx={{
                  py: 1.5,
                  mt: 1,
                  borderRadius: '12px',
                  fontWeight: 700,
                  bgcolor: '#00C2FF',
                  transition: 'transform 0.2s',
                  '&:hover': { bgcolor: '#33CFFF', transform: 'translateY(-2px)' },
                }}
              >
                Envoyer le lien
              </Button>
            </Box>

            <Box mt={3} textAlign="center">
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{ color: 'var(--mirai-gray)', '&:hover': { color: 'var(--mirai-cyan)' } }}
              >
                Retour a la connexion
              </Link>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
