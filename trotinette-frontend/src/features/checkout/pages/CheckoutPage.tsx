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
import Chip from '@mui/material/Chip';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { PageDecor } from '@/shared/components/PageDecor';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { useCartStore } from '../../cart/store';
import { useAuthStore } from '../../auth/store';
import { usePlaceOrder } from '../api/orders';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { RegisterForm } from '../../auth/components/RegisterForm';
import { registerApi, updateProfileApi, type RegisterData } from '../../auth/api/auth';
import { MOROCCAN_CITIES } from '@/shared/constants/moroccanCities';
import { useSiteSettings } from '@/shared/hooks/useSiteSettings';
import { defaultSiteSettings, getDeliveryFeeForSubtotal } from '@/shared/types/siteSettings';

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
  const { data: siteSettings } = useSiteSettings();

  const [registerError, setRegisterError] = useState<string | null>(null);
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { mutate: placeOrder, isPending, error: orderError } = usePlaceOrder();

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: async (data) => {
      useAuthStore.getState().setAuth(data.token, data.user);
      await useCartStore.getState().syncWithServer();
      setRegisterError(null);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Registration failed';
      setRegisterError(message);
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
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Erreur lors de la sauvegarde';
      setSaveError(message);
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
      items: items.map((i) => ({ product_id: i.productId, variant_id: i.variantId ?? null, quantity: i.quantity })),
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

  const pricingSettings = siteSettings ?? defaultSiteSettings;
  const deliveryFeeCentimes = getDeliveryFeeForSubtotal(pricingSettings, subtotalCentimes);
  const checkoutTotalCentimes = subtotalCentimes + deliveryFeeCentimes;

  const hasDeliveryInfo = Boolean(user?.phone && user?.address_city);
  const canSubmitOrder = Boolean(user) && hasDeliveryInfo && !editingDelivery;
  const stepStates = {
    infoDone: Boolean(user),
    deliveryDone: Boolean(user) && hasDeliveryInfo && !editingDelivery,
  };

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      <PageDecor variant="checkout" />
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Page header */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1.5 }}>
          <Typography variant="h4" fontWeight={800} color="var(--mirai-white)">
            Commande
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif JP", serif', fontSize: '0.7rem', color: 'rgba(0,194,255,0.2)', letterSpacing: '0.1em' }}>
            注文
          </Typography>
        </Box>

        {/* Progress stepper */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mb: 4, maxWidth: 480 }}>
          {[
            { step: 1, label: 'Informations', done: stepStates.infoDone, active: !stepStates.infoDone },
            { step: 2, label: 'Livraison', done: stepStates.deliveryDone, active: stepStates.infoDone && !stepStates.deliveryDone },
            { step: 3, label: 'Confirmation', done: false, active: stepStates.deliveryDone },
          ].map(({ step, label, done, active }, i) => (
            <>
              <Box key={step} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: active ? '#00C2FF' : done ? 'rgba(46,173,95,0.2)' : 'rgba(255,255,255,0.07)',
                  border: active || done ? '1px solid rgba(0,194,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: active ? '0 0 12px rgba(0,194,255,0.3)' : 'none',
                }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: active ? '#0c0c14' : done ? '#2EAD5F' : 'text.disabled' }}>{step}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.6rem', fontWeight: active ? 700 : 500, color: active ? '#00C2FF' : done ? '#2EAD5F' : 'text.disabled', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{label}</Typography>
              </Box>
              {i < 2 && <Box sx={{ flex: 1, height: 1, bgcolor: 'rgba(255,255,255,0.08)', mx: 1, mb: 2.5 }} />}
            </>
          ))}
        </Box>

        {/* Security reassurance strip */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, px: 2, py: 1.5, borderRadius: '12px', background: 'rgba(0,194,255,0.04)', border: '1px solid rgba(0,194,255,0.1)', flexWrap: 'wrap' }}>
          {[
            { icon: <LockOutlinedIcon sx={{ fontSize: '0.9rem', color: '#00C2FF' }} />, label: 'Paiement sécurisé' },
            { icon: <LocalShippingOutlinedIcon sx={{ fontSize: '0.9rem', color: '#2EAD5F' }} />, label: 'Livraison express' },
            { icon: <VerifiedUserOutlinedIcon sx={{ fontSize: '0.9rem', color: '#D4A43A' }} />, label: 'Garantie 2 ans' },
          ].map(({ icon, label }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {icon}
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
            </Box>
          ))}
        </Box>

        <Stack spacing={3}>
          {/* Guest section */}
          {!user && (
            <Paper
              elevation={0}
              className="mirai-glass"
              sx={{
                p: 3,
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, #00C2FF, transparent)',
                },
              }}
            >
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
            <Paper
              elevation={0}
              className="mirai-glass"
              sx={{
                p: 2.5,
                borderRadius: '20px',
              }}
            >
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
              <Alert
                severity="info"
                icon={<LockOutlinedIcon />}
                sx={{ borderRadius: '12px' }}
              >
                <Box>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Paiement à la livraison</Typography>
                  <Typography sx={{ fontSize: '0.78rem', opacity: 0.85 }}>Réglez en cash lors de la réception — livraison sous 2 à 5 jours ouvrés</Typography>
                </Box>
              </Alert>

              {/* Order items */}
              <Paper
                elevation={0}
                className="mirai-glass"
                sx={{
                  p: 2,
                  borderRadius: '20px',
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Récapitulatif de commande
                </Typography>
                <Stack spacing={1} divider={<Divider />}>
                  {items.map((item) => (
                    <Stack
                      key={`${item.productId}-${item.variantId ?? 'default'}`}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1.5}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                        {/* Order item thumbnail */}
                        {item.thumbnailUrl && (
                          <Box
                            component="img"
                            src={item.thumbnailUrl}
                            alt={item.name}
                            sx={{
                              width: 44, height: 44, objectFit: 'cover',
                              borderRadius: '8px', flexShrink: 0,
                              border: '1px solid rgba(255,255,255,0.07)',
                            }}
                          />
                        )}
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={500} noWrap>{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Qté: {item.quantity} &times; {formatCurrency(item.price)}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ flexShrink: 0 }}>
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              {/* Pricing */}
              <Paper
                elevation={0}
                className="mirai-glass"
                sx={{
                  p: 2,
                  borderRadius: '20px',
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Sous-total</Typography>
                    <Typography variant="body2">{formatCurrency(subtotalCentimes)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Frais de livraison</Typography>
                    <Typography variant="body2" color={deliveryFeeCentimes === 0 ? 'success.main' : 'text.primary'}>
                      {deliveryFeeCentimes === 0 ? 'Gratuit' : formatCurrency(deliveryFeeCentimes)}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body1" fontWeight={700}>Total</Typography>
                    <Typography variant="body1" fontWeight={700} color="primary">
                      {formatCurrency(checkoutTotalCentimes)}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* Note */}
              <TextField
                label="Instructions de livraison (optionnel)"
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

              {!user && (
                <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                  Creez votre compte ci-dessus pour finaliser la commande.
                </Alert>
              )}

              {user && !hasDeliveryInfo && (
                <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                  Ajoutez votre telephone et votre ville de livraison avant de confirmer.
                </Alert>
              )}

              {editingDelivery && (
                <Alert severity="info" sx={{ borderRadius: '12px' }}>
                  Enregistrez vos informations de livraison pour activer la confirmation.
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isPending || !canSubmitOrder}
                startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
                sx={{
                  py: 2,
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '0.06em',
                  bgcolor: '#00C2FF',
                  boxShadow: '0 4px 14px rgba(0,194,255,0.25)',
                  '&:hover': { bgcolor: '#33CFFF', transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,194,255,0.35)' },
                  transition: 'all 0.3s ease',
                }}
              >
                {isPending ? 'Envoi en cours...' : `Confirmer — ${formatCurrency(checkoutTotalCentimes)}`}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<ShoppingCartOutlinedIcon />}
                onClick={() => void navigate('/products')}
                sx={{
                  borderRadius: '12px',
                  borderColor: 'rgba(0,194,255,0.3)',
                  color: '#00C2FF',
                  fontWeight: 600,
                }}
              >
                Continuer mes achats
              </Button>

              {/* Final reassurance */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 0.5 }}>
                <LockOutlinedIcon sx={{ fontSize: '0.85rem', color: 'text.disabled' }} />
                <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', textAlign: 'center' }}>
                  Vos données sont protégées · Retour gratuit 30 jours
                </Typography>
              </Box>

              {/* Delivery estimate */}
              {user && !editingDelivery && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <LocalShippingOutlinedIcon sx={{ fontSize: '0.85rem', color: '#2EAD5F' }} />
                  <Typography sx={{ fontSize: '0.72rem', color: '#2EAD5F', fontWeight: 600 }}>
                    Livraison estimée sous 2-5 jours ouvrés
                  </Typography>
                </Box>
              )}

              {!user && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Chip
                    size="small"
                    label="Créez votre compte pour continuer"
                    sx={{ fontSize: '0.72rem', bgcolor: 'rgba(0,194,255,0.08)', color: '#00C2FF', border: '1px solid rgba(0,194,255,0.2)' }}
                  />
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
