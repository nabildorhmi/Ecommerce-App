import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { useCartStore } from '../../cart/store';
import { useAuthStore } from '../../auth/store';
import { usePlaceOrder } from '../api/orders';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { RegisterForm } from '../../auth/components/RegisterForm';
import { registerApi, updateProfileApi, type RegisterData } from '../../auth/api/auth';
import { MOROCCAN_CITIES } from '../../../shared/constants/moroccanCities';

const orderSchema = z.object({
  note: z.string().max(500, { message: 'Note must be 500 characters or less' }).optional(),
});
type OrderFormData = z.infer<typeof orderSchema>;

const deliverySchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(255),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Minimum 8 chiffres').max(20),
  address_city: z.string().min(1, 'Ville requise'),
  address_street: z.string().max(255).optional(),
});
type DeliveryFormData = z.infer<typeof deliverySchema>;

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
      <Box sx={{ color: 'text.disabled', mt: '2px', flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.2, display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500} color={value ? 'text.primary' : 'text.disabled'}>
          {value || ''}
        </Typography>
      </Box>
    </Stack>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const subtotalCentimes = useCartStore((s) => s.subtotalCentimes());
  const user = useAuthStore((s) => s.user);

  const [registerError, setRegisterError] = useState<string | null>(null);
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { mutate: placeOrder, isPending, error: orderError } = usePlaceOrder();

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.token, data.user);
      setRegisterError(null);
    },
    onError: (error: any) => {
      setRegisterError(error.response?.data?.message ?? 'Registration failed');
    },
  });

  const saveMutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (updatedUser) => {
      if (updatedUser?.id) {
        useAuthStore.getState().updateUser(updatedUser);
      }
      setEditingDelivery(false);
      setSaveError(null);
    },
    onError: (err: any) => {
      setSaveError(err.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    },
  });

  useEffect(() => {
    if (items.length === 0) void navigate('/products', { replace: true });
  }, [items.length, navigate]);

  const { register: registerNote, handleSubmit, formState: { errors: noteErrors } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { note: '' },
  });

  const {
    register: registerDelivery,
    handleSubmit: handleDeliverySubmit,
    control: deliveryControl,
    reset: resetDelivery,
    formState: { errors: deliveryErrors },
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      address_city: user?.address_city ?? '',
      address_street: user?.address_street ?? '',
    },
  });

  const handleRegister = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const onSubmit = (data: OrderFormData) => {
    placeOrder({
      phone: user?.phone ?? '',
      city: user?.address_city ?? '',
      items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      note: data.note || undefined,
    });
  };

  const onSaveDelivery = (data: DeliveryFormData) => {
    saveMutation.mutate({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address_city: data.address_city,
      address_street: data.address_street || null,
    });
  };

  const handleStartEdit = () => {
    resetDelivery({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      address_city: user?.address_city ?? '',
      address_street: user?.address_street ?? '',
    });
    setSaveError(null);
    setEditingDelivery(true);
  };

  const apiErrorMessage = (() => {
    if (!orderError) return null;
    const err = orderError as { response?: { data?: { message?: string } } };
    return err.response?.data?.message ?? 'Une erreur est survenue lors de la commande';
  })();

  if (items.length === 0) return null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Commande
      </Typography>

      <Stack spacing={3}>
        {/* Guest section */}
        {!user && (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Entrez vos informations
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Créez votre compte pour passer la commande  vos infos de livraison seront sauvegardées.
            </Typography>
            <RegisterForm onSubmit={handleRegister} error={registerError} />
          </Paper>
        )}

        {/* Delivery info card */}
        {user && (
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={editingDelivery ? 2 : 1.5}>
              <Typography variant="subtitle1" fontWeight={700}>
                Informations de livraison
              </Typography>
              {!editingDelivery && (
                <IconButton size="small" onClick={handleStartEdit} sx={{ color: 'text.secondary' }}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>

            {!editingDelivery ? (
              <Stack spacing={1.5}>
                <InfoRow icon={<PersonOutlineIcon fontSize="small" />} label="Nom" value={user.name} />                <InfoRow icon={<EmailOutlinedIcon fontSize="small" />} label="Email" value={user.email} />                <InfoRow icon={<PhoneOutlinedIcon fontSize="small" />} label="Téléphone" value={user.phone} />
                <InfoRow
                  icon={<LocationOnOutlinedIcon fontSize="small" />}
                  label="Pays / Ville"
                  value={`Maroc${user.address_city ? `  ${user.address_city}` : ''}`}
                />
                <InfoRow icon={<HomeOutlinedIcon fontSize="small" />} label="Adresse" value={user.address_street} />
              </Stack>
            ) : (
              <Box component="form" onSubmit={handleDeliverySubmit(onSaveDelivery)} noValidate>
                <Stack spacing={2}>
                  {saveError && <Alert severity="error">{saveError}</Alert>}

                  <TextField
                    label="Nom complet"
                    size="small"
                    fullWidth
                    error={Boolean(deliveryErrors.name)}
                    helperText={deliveryErrors.name?.message}
                    {...registerDelivery('name')}
                  />

                  <TextField
                    label="Adresse e-mail"
                    type="email"
                    size="small"
                    fullWidth
                    error={Boolean(deliveryErrors.email)}
                    helperText={deliveryErrors.email?.message}
                    {...registerDelivery('email')}
                  />

                  <TextField
                    label="Téléphone"
                    type="tel"
                    size="small"
                    fullWidth
                    error={Boolean(deliveryErrors.phone)}
                    helperText={deliveryErrors.phone?.message}
                    {...registerDelivery('phone')}
                  />

                  <FormControl fullWidth size="small">
                    <InputLabel>Pays</InputLabel>
                    <Select label="Pays" value="Maroc" readOnly>
                      <MenuItem value="Maroc">Maroc</MenuItem>
                    </Select>
                  </FormControl>

                  <Controller
                    name="address_city"
                    control={deliveryControl}
                    render={({ field }) => (
                      <FormControl fullWidth size="small" error={Boolean(deliveryErrors.address_city)}>
                        <InputLabel>Ville</InputLabel>
                        <Select
                          {...field}
                          label="Ville"
                          MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                        >
                          <MenuItem value="" disabled><em>Choisir une ville</em></MenuItem>
                          {MOROCCAN_CITIES.map((city) => (
                            <MenuItem key={city} value={city}>{city}</MenuItem>
                          ))}
                        </Select>
                        {deliveryErrors.address_city && (
                          <FormHelperText>{deliveryErrors.address_city.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />

                  <TextField
                    label="Adresse"
                    size="small"
                    fullWidth
                    error={Boolean(deliveryErrors.address_street)}
                    helperText={deliveryErrors.address_street?.message}
                    {...registerDelivery('address_street')}
                  />

                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      startIcon={<CloseIcon fontSize="small" />}
                      onClick={() => setEditingDelivery(false)}
                      sx={{ color: 'text.secondary' }}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      startIcon={
                        saveMutation.isPending
                          ? <CircularProgress size={12} color="inherit" />
                          : <CheckIcon fontSize="small" />
                      }
                      disabled={saveMutation.isPending}
                    >
                      Enregistrer
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}
          </Paper>
        )}

        {/* Order form */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            <Alert severity="info">Paiement à la livraison</Alert>

            {/* Order items */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Récapitulatif de commande
              </Typography>
              <Stack spacing={1} divider={<Divider />}>
                {items.map((item) => (
                  <Stack
                    key={item.productId}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Qté: {item.quantity} &times; {formatCurrency(item.price)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(item.price * item.quantity)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            {/* Pricing */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Sous-total</Typography>
                  <Typography variant="body2">{formatCurrency(subtotalCentimes)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Frais de livraison</Typography>
                  <Typography variant="body2" color="success.main">Gratuit</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1" fontWeight={700}>Total</Typography>
                  <Typography variant="body1" fontWeight={700} color="primary">
                    {formatCurrency(subtotalCentimes)}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>

            {/* Note */}
            <TextField
              label="Note (optionnel)"
              placeholder="Instructions de livraison, code d'accès..."
              multiline
              rows={3}
              fullWidth
              error={Boolean(noteErrors.note)}
              helperText={noteErrors.note?.message}
              inputProps={{ maxLength: 500 }}
              {...registerNote('note')}
            />

            {apiErrorMessage && <Alert severity="error">{apiErrorMessage}</Alert>}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isPending || !user || editingDelivery}
              startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {isPending ? 'Envoi en cours...' : 'Confirmer la commande'}
            </Button>

            {!user && (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Veuillez renseigner vos informations ci-dessus pour continuer
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
