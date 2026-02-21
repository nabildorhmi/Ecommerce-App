import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import { useCartStore } from '../../cart/store';
import { useAuthStore } from '../../auth/store';
import { usePlaceOrder } from '../api/orders';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { RegisterForm } from '../../auth/components/RegisterForm';
import { registerApi, type RegisterData } from '../../auth/api/auth';

const checkoutSchema = z.object({
  phone: z.string().min(1, { error: 'Phone required' }).regex(/^\+?\d{6,15}$/, { error: 'Invalid phone number' }),
  note: z.string().max(500, { error: 'Note must be 500 characters or less' }).optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const subtotalCentimes = useCartStore((s) => s.subtotalCentimes());
  const user = useAuthStore((s) => s.user);

  const [registerError, setRegisterError] = useState<string | null>(null);
  const { mutate: placeOrder, isPending, error: orderError } = usePlaceOrder();

  // Registration mutation
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

  // Redirect to catalog if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      void navigate('/products', { replace: true });
    }
  }, [items.length, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      phone: user?.phone ?? '',
      note: '',
    },
  });

  // When user registers, pre-fill phone from new user data
  useEffect(() => {
    if (user?.phone) {
      setValue('phone', user.phone);
    }
  }, [user, setValue]);

  const handleRegister = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const totalCentimes = subtotalCentimes;

  const onSubmit = (data: CheckoutFormData) => {
    placeOrder({
      phone: data.phone,
      city: user?.address_city ?? '',
      items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      note: data.note || undefined,
    });
  };

  // Extract error message from API response
  const apiErrorMessage = (() => {
    if (!orderError) return null;
    const err = orderError as { response?: { data?: { message?: string } } };
    return err.response?.data?.message ?? "Une erreur est survenue lors de la commande";
  })();

  if (items.length === 0) {
    return null; // redirecting
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {"Commande"}
      </Typography>

      <Stack spacing={3}>
        {/* Guest info section */}
        {!user && (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {"Entrez vos informations"}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {"Veuillez renseigner vos informations pour passer votre commande"}
            </Typography>
            <RegisterForm onSubmit={handleRegister} error={registerError} />
          </Paper>
        )}

        {/* Checkout form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Stack spacing={3}>
            {/* COD notice */}
            <Alert severity="info">
              {"Paiement à la livraison"}
            </Alert>

          {/* Delivery city (read-only, from profile) */}
          {user?.address_city && (
            <TextField
              label={"Ville de livraison"}
              value={user.address_city}
              fullWidth
              disabled
              InputProps={{ readOnly: true }}
            />
          )}

          {/* Order items (read-only) */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {"Récapitulatif de commande"}
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
                    <Typography variant="body2" fontWeight={500}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {"Qté"}: {item.quantity} &times; {formatCurrency(item.price)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>

          {/* Phone number */}
          <TextField
            label={"Numéro de téléphone"}
            type="tel"
            fullWidth
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            {...register('phone')}
          />

          {/* Pricing summary */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">{"Sous-total"}</Typography>
                <Typography variant="body2">{formatCurrency(subtotalCentimes)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">{"Frais de livraison"}</Typography>
                <Typography variant="body2" color="success.main">
                  {"Gratuit"}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1" fontWeight={700}>{"Total"}</Typography>
                <Typography variant="body1" fontWeight={700} color="primary">
                  {formatCurrency(totalCentimes)}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {/* Optional note */}
          <TextField
            label={"Note (optionnel)"}
            placeholder={"Instructions de livraison, code d'accès..."}
            multiline
            rows={3}
            fullWidth
            error={Boolean(errors.note)}
            helperText={errors.note?.message}
            inputProps={{ maxLength: 500 }}
            {...register('note')}
          />

          {/* API error */}
          {apiErrorMessage && (
            <Alert severity="error">{apiErrorMessage}</Alert>
          )}

          {/* Place order button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isPending || !user}
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isPending ? "Envoi en cours..." : "Confirmer la commande"}
          </Button>

          {!user && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {"Veuillez renseigner vos informations ci-dessus pour continuer"}
            </Typography>
          )}
        </Stack>
      </Box>
      </Stack>
    </Container>
  );
}
