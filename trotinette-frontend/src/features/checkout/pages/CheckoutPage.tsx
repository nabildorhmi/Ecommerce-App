import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import { useCartStore } from '../../cart/store';
import { useAuthStore } from '../../auth/store';
import { useDeliveryZones } from '../api/deliveryZones';
import { usePlaceOrder } from '../api/orders';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

const checkoutSchema = z.object({
  phone: z.string().min(1, { error: 'Phone required' }).regex(/^\+?\d{6,15}$/, { error: 'Invalid phone number' }),
  delivery_zone_id: z.number({ error: 'Please select a city' }).positive({ error: 'Please select a city' }),
  note: z.string().max(500, { error: 'Note must be 500 characters or less' }).optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const subtotalCentimes = useCartStore((s) => s.subtotalCentimes());
  const user = useAuthStore((s) => s.user);

  const { data: deliveryZones, isLoading: zonesLoading } = useDeliveryZones();
  const { mutate: placeOrder, isPending, error: orderError } = usePlaceOrder();

  // Redirect to catalog if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      void navigate('/products', { replace: true });
    }
  }, [items.length, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      phone: user?.phone ?? '',
      delivery_zone_id: undefined,
      note: '',
    },
  });

  const selectedZoneId = watch('delivery_zone_id');
  const selectedZone = deliveryZones?.find((z) => z.id === selectedZoneId);
  const deliveryFeeCentimes = selectedZone?.fee ?? 0;
  const totalCentimes = subtotalCentimes + deliveryFeeCentimes;

  const onSubmit = (data: CheckoutFormData) => {
    placeOrder({
      phone: data.phone,
      delivery_zone_id: data.delivery_zone_id,
      items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      note: data.note || undefined,
    });
  };

  // Extract error message from API response
  const apiErrorMessage = (() => {
    if (!orderError) return null;
    const err = orderError as { response?: { data?: { message?: string } } };
    return err.response?.data?.message ?? t('checkout.orderError', 'An error occurred placing your order');
  })();

  if (items.length === 0) {
    return null; // redirecting
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('checkout.title')}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Stack spacing={3}>
          {/* COD notice */}
          <Alert severity="info">
            {t('checkout.codNotice')}
          </Alert>

          {/* Order items (read-only) */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {t('checkout.orderSummary')}
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
                      {t('checkout.qty', 'Qty')}: {item.quantity} &times; {formatCurrency(item.price)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>

          {/* Delivery city */}
          <FormControl fullWidth error={Boolean(errors.delivery_zone_id)}>
            <InputLabel id="delivery-zone-label">
              {t('checkout.deliveryCity')}
            </InputLabel>
            <Controller
              name="delivery_zone_id"
              control={control}
              render={({ field }) => (
                <Select
                  labelId="delivery-zone-label"
                  label={t('checkout.deliveryCity')}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={zonesLoading}
                >
                  <MenuItem value="" disabled>
                    {zonesLoading ? t('common.loading', 'Loading...') : t('checkout.selectCity')}
                  </MenuItem>
                  {(deliveryZones ?? []).map((zone) => (
                    <MenuItem key={zone.id} value={zone.id}>
                      {zone.city} — {formatCurrency(zone.fee)}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.delivery_zone_id && (
              <FormHelperText>{errors.delivery_zone_id.message}</FormHelperText>
            )}
          </FormControl>

          {/* Phone number */}
          <TextField
            label={t('checkout.phone')}
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
                <Typography variant="body2">{t('checkout.subtotal')}</Typography>
                <Typography variant="body2">{formatCurrency(subtotalCentimes)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">{t('checkout.deliveryFee')}</Typography>
                <Typography variant="body2">
                  {selectedZone ? formatCurrency(deliveryFeeCentimes) : '—'}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1" fontWeight={700}>{t('checkout.total')}</Typography>
                <Typography variant="body1" fontWeight={700} color="primary">
                  {selectedZone ? formatCurrency(totalCentimes) : '—'}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {/* Optional note */}
          <TextField
            label={t('checkout.note')}
            placeholder={t('checkout.notePlaceholder')}
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
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isPending ? t('checkout.placingOrder') : t('checkout.placeOrder')}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
