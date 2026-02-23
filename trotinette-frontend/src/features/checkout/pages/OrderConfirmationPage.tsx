import { useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import type { OrderConfirmation } from '../types';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '212600000000';

interface LocationState {
  order: OrderConfirmation;
}

export function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState | null;
  const order = state?.order ?? null;

  // If accessed directly (no state) redirect to /orders
  useEffect(() => {
    if (!order) {
      void navigate('/orders', { replace: true });
    }
  }, [order, navigate]);

  if (!order) {
    return null; // redirecting
  }

  const whatsappMessage = encodeURIComponent(
    `Bonjour, j'ai passé une commande (${order.order_number}) et j'aimerais plus d'informations.`
  );
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={4} alignItems="center">
        {/* Success icon + heading */}
        <Stack alignItems="center" spacing={2}>
          <CheckCircleOutlineIcon sx={{ fontSize: 72, color: 'success.main' }} />
          <Typography variant="h4" fontWeight={700} textAlign="center">
            {"Commande confirmée !"}
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            {"Votre commande a bien été enregistrée. Nous vous contacterons pour confirmer la livraison."}
          </Typography>
        </Stack>

        {/* Order number */}
        <Paper
          variant="outlined"
          sx={{ p: 3, width: '100%', textAlign: 'center', bgcolor: 'primary.50' }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {"Numéro de commande"}
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary">
            {orderNumber ?? order.order_number}
          </Typography>
        </Paper>

        {/* Order summary */}
        <Paper variant="outlined" sx={{ p: 2, width: '100%' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {"Récapitulatif de commande"}
          </Typography>

          <Stack spacing={1} divider={<Divider />}>
            {order.items.map((item) => (
              <Stack
                key={item.product_id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {item.product_sku}
                  </Typography>
                  {item.variant_label && (
                    <Typography variant="caption" color="primary.main" display="block">
                      {item.variant_label}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {"Qté"}: {item.quantity} &times; {formatCurrency(item.unit_price)}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(item.subtotal)}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={0.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">{"Sous-total"}</Typography>
              <Typography variant="body2">{formatCurrency(order.subtotal)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">
                {"Frais de livraison"} ({order.city ?? order.delivery_zone?.city ?? '—'})
              </Typography>
              <Typography variant="body2">{formatCurrency(order.delivery_fee)}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body1" fontWeight={700}>{"Total"}</Typography>
              <Typography variant="body1" fontWeight={700} color="primary">
                {formatCurrency(order.total)}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Shop contact */}
        <Paper variant="outlined" sx={{ p: 2, width: '100%' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {"Contacter la boutique"}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              component="a"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              color="success"
              startIcon={<WhatsAppIcon />}
              fullWidth
            >
              WhatsApp
            </Button>
          </Stack>
        </Paper>

        {/* Navigation buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%">
          <Button
            component={Link}
            to="/orders"
            variant="outlined"
            fullWidth
          >
            {"Voir mes commandes"}
          </Button>
          <Button
            component={Link}
            to="/products"
            variant="contained"
            fullWidth
          >
            {"Continuer mes achats"}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
