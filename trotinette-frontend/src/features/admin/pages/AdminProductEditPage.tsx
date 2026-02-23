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
    <Box p={3} maxWidth={900} mx="auto">
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => void navigate('/admin/products')}
          variant="outlined"
          size="small"
        >
          Retour / Back
        </Button>
        <Typography variant="h5" fontWeight="bold">
          {isCreate
            ? 'Nouveau produit / New Product'
            : 'Modifier le produit / Edit Product'}
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
        <>
          <ProductForm product={product} onSuccess={handleSuccess} />

          {!isCreate && productId > 0 && (
            <ProductVariantsSection productId={productId} />
          )}
        </>
      )}
    </Box>
  );
}
