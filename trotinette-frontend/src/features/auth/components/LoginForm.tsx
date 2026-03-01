import { Link as RouterLink } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';

const loginSchema = z.object({
  email: z.string().email('Email invalide / Invalid email'),
  password: z.string().min(8, 'Minimum 8 caracteres / Minimum 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  error?: string | null;
}

export function LoginForm({ onSubmit, error }: LoginFormProps) {

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
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
        label={"Adresse e-mail"}
        type="email"
        autoComplete="email"
        fullWidth
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        {...register('email')}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
      />

      <TextField
        label={"Mot de passe"}
        type="password"
        autoComplete="current-password"
        fullWidth
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register('password')}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
      />

      <Box textAlign="right">
        <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ color: 'var(--mirai-gray)', '&:hover': { color: 'var(--mirai-cyan)' } }}>
          Mot de passe oublié ?
        </Link>
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        className="mirai-glow"
        sx={{
          py: 1.5,
          mt: 2,
          borderRadius: '12px',
          fontWeight: 700,
          background: 'linear-gradient(45deg, #00C2FF, #0099CC)',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-2px)' }
        }}
      >
        {"Se connecter"}
      </Button>
    </Box>
  );
}
