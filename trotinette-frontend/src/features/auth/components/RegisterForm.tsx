import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { MOROCCAN_CITIES } from '../../../shared/constants/moroccanCities';

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
    address_city: z.string().min(1, 'Ville requise / City required'),
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

  const {
    register,
    handleSubmit,
    control,
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
        label={"Nom complet"}
        type="text"
        autoComplete="name"
        fullWidth
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        {...register('name')}
      />

      <TextField
        label={"Adresse e-mail"}
        type="email"
        autoComplete="email"
        fullWidth
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        {...register('email')}
      />

      <TextField
        label={"Téléphone"}
        type="tel"
        autoComplete="tel"
        fullWidth
        error={Boolean(errors.phone)}
        helperText={errors.phone?.message}
        {...register('phone')}
      />

      {/* Pays */}
      <FormControl fullWidth>
        <InputLabel>Pays</InputLabel>
        <Select label="Pays" value="Maroc" readOnly>
          <MenuItem value="Maroc">Maroc</MenuItem>
        </Select>
      </FormControl>

      {/* Ville */}
      <Controller
        name="address_city"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth required error={Boolean(errors.address_city)}>
            <InputLabel>Ville</InputLabel>
            <Select
              {...field}
              label="Ville"
              MenuProps={{ PaperProps: { style: { maxHeight: 320 } } }}
            >
              <MenuItem value="" disabled>
                <em>Choisir une ville</em>
              </MenuItem>
              {MOROCCAN_CITIES.map((city) => (
                <MenuItem key={city} value={city}>{city}</MenuItem>
              ))}
            </Select>
            {errors.address_city && <FormHelperText>{errors.address_city.message}</FormHelperText>}
          </FormControl>
        )}
      />

      <TextField
        label={"Mot de passe"}
        type="password"
        autoComplete="new-password"
        fullWidth
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register('password')}
      />

      <TextField
        label={"Confirmer le mot de passe"}
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
        {"S'inscrire"}
      </Button>
    </Box>
  );
}
