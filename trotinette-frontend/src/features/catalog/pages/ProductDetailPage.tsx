import { useState } from 'react';
import { useParams, Link } from 'react-router';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BoltIcon from '@mui/icons-material/Bolt';
import { useProduct } from '../api/products';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { ProductGallery } from '../components/ProductGallery';
import { SpecsTable } from '../components/SpecsTable';
import { StockBadge } from '../components/StockBadge';
import { TrustSignals } from '../components/TrustSignals';
import { CategoryBreadcrumb } from '../components/CategoryBreadcrumb';
import { useCartStore } from '../../cart/store';

function ProductDetailSkeleton() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 3, bgcolor: 'action.hover' }} />
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Skeleton variant="rectangular" height={440} sx={{ mb: 1.5, borderRadius: 2, bgcolor: 'action.hover' }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} variant="rectangular" width={80} height={64} sx={{ borderRadius: 1, bgcolor: 'action.hover' }} />
              ))}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Skeleton variant="text" height={48} sx={{ mb: 1, bgcolor: 'action.hover' }} />
            <Skeleton variant="text" height={40} width={140} sx={{ mb: 2, bgcolor: 'action.hover' }} />
            <Skeleton variant="rounded" width={100} height={28} sx={{ mb: 3, bgcolor: 'action.hover' }} />
            <Skeleton variant="rectangular" height={56} sx={{ mb: 1.5, borderRadius: 1, bgcolor: 'action.hover' }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1, bgcolor: 'action.hover' }} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

/**
 * ProductDetailPage — /products/:slug
 * MiraiTech dark redesign: glow price, sticky add-to-cart panel,
 * gallery, specs table, trust signals, category breadcrumb.
 */
export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useProduct(slug ?? '');
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Alert severity="warning" sx={{ mb: 3 }}>
            {"Produit introuvable"}
          </Alert>
          <Button component={Link} to="/products" variant="outlined" startIcon={<ArrowBackIcon />}>
            {"Retour au catalogue"}
          </Button>
        </Container>
      </Box>
    );
  }

  const cartItem = items.find((i) => i.productId === product.id);
  const isAtMaxStock = cartItem ? cartItem.quantity >= product.stock_quantity : false;
  const isAddDisabled = !product.in_stock || isAtMaxStock;

  const handleAddToCart = () => {
    addItem(product, product.name);
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Breadcrumb */}
        <Box sx={{ mb: 3 }}>
          <CategoryBreadcrumb category={product.category} />
        </Box>

        <Grid container spacing={{ xs: 3, md: 6 }}>
          {/* Left: Image gallery */}
          <Grid size={{ xs: 12, md: 7 }}>
            <ProductGallery images={product.images} />

            {/* Specs — displayed below gallery on desktop */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: '#00C2FF',
                    textTransform: 'uppercase',
                    mb: 1.5,
                  }}
                >
                  SPÉCIFICATIONS
                </Typography>
                <SpecsTable attributes={product.attributes} />
              </Box>
            )}
          </Grid>

          {/* Right: Sticky product info panel */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                position: { md: 'sticky' },
                top: { md: 90 },
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '12px',
                p: { xs: 2.5, md: 3.5 },
              }}
            >
              <Stack spacing={2.5}>
                {/* Category chip */}
                {product.category && (
                  <Chip
                    label={product.category.name}
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      backgroundColor: 'rgba(0,194,255,0.12)',
                      color: '#00C2FF',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  />
                )}

                {/* Product name */}
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: '1.5rem', md: '1.8rem' },
                    fontWeight: 800,
                    lineHeight: 1.2,
                    color: 'text.primary',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {product.name}
                </Typography>

                {/* Price */}
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <BoltIcon sx={{ fontSize: '1.2rem', color: '#00C2FF', mb: '-2px' }} />
                  <Typography
                    sx={{
                      fontSize: '2rem',
                      fontWeight: 800,
                      color: '#00C2FF',
                      lineHeight: 1,
                      textShadow: '0 0 20px rgba(0,194,255,0.4)',
                    }}
                  >
                    {formatCurrency(product.price)}
                  </Typography>
                </Box>

                {/* Stock status */}
                <StockBadge inStock={product.in_stock} />

                <Divider />

                {/* Description */}
                {product.description && (
                  <Typography
                    sx={{
                      fontSize: '0.88rem',
                      color: 'text.secondary',
                      lineHeight: 1.7,
                    }}
                  >
                    {product.description}
                  </Typography>
                )}

                {/* CTA Actions */}
                <Stack spacing={1.5} sx={{ pt: 0.5 }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isAddDisabled}
                    onClick={handleAddToCart}
                    startIcon={<ShoppingCartIcon />}
                    sx={{
                      py: 1.75,
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      boxShadow: isAddDisabled
                        ? 'none'
                        : '0 0 24px rgba(0,194,255,0.35)',
                    }}
                  >
                    {isAtMaxStock && product.in_stock
                      ? "Stock maximum atteint"
                      : "Ajouter au panier"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Trust signals */}
        <Box sx={{ mt: 6 }}>
          <TrustSignals />
        </Box>
      </Container>

      {/* Added to cart snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        message={"Ajouté au panier"}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
