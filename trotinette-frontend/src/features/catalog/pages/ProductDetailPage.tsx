import { useParams, Link } from 'react-router';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import { useProduct } from '../api/products';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { ProductGallery } from '../components/ProductGallery';
import { SpecsTable } from '../components/SpecsTable';
import { StockBadge } from '../components/StockBadge';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { TrustSignals } from '../components/TrustSignals';
import { CategoryBreadcrumb } from '../components/CategoryBreadcrumb';

function ProductDetailSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Skeleton variant="text" width={200} height={24} sx={{ mb: 2 }} />
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Skeleton variant="rectangular" height={400} sx={{ mb: 1, borderRadius: 1 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rectangular" width={80} height={60} sx={{ borderRadius: 1 }} />
            ))}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={32} width={120} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" width={90} height={24} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
        </Grid>
      </Grid>
    </Container>
  );
}

/**
 * ProductDetailPage — /products/:slug
 * Full product detail: gallery, specs table, price, stock badge,
 * WhatsApp contact button, trust signals, and category breadcrumb.
 */
export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { data: product, isLoading, isError } = useProduct(slug ?? '');

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('product.notFound')}
        </Alert>
        <Button component={Link} to="/products" variant="outlined">
          {t('product.backToCatalog')}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb navigation */}
      <CategoryBreadcrumb category={product.category} />

      <Grid container spacing={4}>
        {/* Left: Image gallery */}
        <Grid size={{ xs: 12, md: 7 }}>
          <ProductGallery images={product.images} />
        </Grid>

        {/* Right: Product info */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>
            {/* Product name */}
            <Typography variant="h4" fontWeight={700} component="h1">
              {product.name}
            </Typography>

            {/* Price */}
            <Typography variant="h5" color="primary" fontWeight={700}>
              {formatCurrency(product.price)}
            </Typography>

            {/* Stock status */}
            <Box>
              <StockBadge inStock={product.in_stock} />
            </Box>

            <Divider />

            {/* Description */}
            {product.description && (
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {product.description}
              </Typography>
            )}

            {/* Actions */}
            <Stack spacing={1.5}>
              {/* Add to cart placeholder — will be wired in Phase 4 */}
              <Button
                variant="contained"
                size="large"
                disabled={!product.in_stock}
                sx={{ py: 1.5 }}
              >
                {t('product.addToCart')}
              </Button>

              {/* WhatsApp contact */}
              <WhatsAppButton productName={product.name} />
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      {/* Specs table — full width below gallery */}
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <SpecsTable attributes={product.attributes} />
      )}

      {/* Trust signals */}
      <TrustSignals />
    </Container>
  );
}
