import { useNavigate, useParams } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAdminProduct } from '../api/products';
import { ProductForm } from '../components/ProductForm';
import { ProductVariantsSection } from '../components/ProductVariantsSection';
import type { AdminProduct } from '../types';

export function AdminProductEditPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isCreate = !id;
  const productId = id ? parseInt(id, 10) : 0;

  const {
    data: productData,
    isLoading,
    error,
  } = useAdminProduct(productId);

  const product = productData?.data as AdminProduct | undefined;

  const handleSuccess = () => {
    void navigate('/admin/products');
  };

  return (
    <Box p={2} maxWidth={1400} mx="auto">
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => void navigate('/admin/products')}
          variant="outlined"
          size="small"
        >
          Retour
        </Button>
        <Typography variant="h6" fontWeight="bold">
          {isCreate
            ? 'Nouveau produit'
            : 'Modifier le produit'}
        </Typography>
      </Box>

      {!isCreate && isLoading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!isCreate && error && (
        <Alert severity="error">
          Impossible de charger le produit / Failed to load product
        </Alert>
      )}

      {(isCreate || (!isLoading && !error && product)) && (
        <Box display="flex" gap={3} flexDirection={{ xs: 'column', lg: 'row' }} alignItems="flex-start">
          <Box flex={1} minWidth={0}>
            <ProductForm product={product} onSuccess={handleSuccess} />
          </Box>

          {!isCreate && productId > 0 && (
            <Box flex={1} minWidth={0}>
              <ProductVariantsSection productId={productId} productSku={product?.sku ?? ''} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
