import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import { useAdminProduct } from '../api/products';
import { ProductForm } from '../components/ProductForm';
import { ProductVariantsSection } from '../components/ProductVariantsSection';
import type { AdminProduct } from '../types';

// Glass card style reused across both tabs
const glassSx = {
  background: 'rgba(12, 12, 20, 0.7)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0,194,255,0.09)',
  borderRadius: '18px',
  p: { xs: 2, md: 3 },
};

export function AdminProductEditPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isCreate = !id;
  const productId = id ? parseInt(id, 10) : 0;

  const initialTab = isCreate ? 0 : Number(searchParams.get('tab') ?? 0);
  const [activeTab, setActiveTab] = useState(initialTab);

  const { data: productData, isLoading, error } = useAdminProduct(productId);
  const product = productData?.data as AdminProduct | undefined;

  /* Called by ProductForm after a successful save */
  const handleSuccess = (newProductId?: number) => {
    if (isCreate && newProductId) {
      // Step 2: go straight to the Variants tab of the newly created product
      void navigate(`/admin/products/${newProductId}/edit?tab=1`);
    } else {
      void navigate('/admin/products');
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, val: number) => {
    setActiveTab(val);
    if (!isCreate) setSearchParams({ tab: String(val) });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* ── Header ── */}
      <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => void navigate('/admin/products')}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'rgba(0,194,255,0.3)',
            color: 'var(--mirai-gray)',
            borderRadius: '8px',
            '&:hover': { borderColor: '#00C2FF', color: '#00C2FF' },
          }}
        >
          Retour
        </Button>

        <Box flex={1}>
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ color: 'var(--mirai-white)', lineHeight: 1.1 }}
          >
            {isCreate ? 'Nouveau produit' : (product?.name ?? (isLoading ? '...' : 'Produit'))}
          </Typography>
          {!isCreate && product?.sku && (
            <Typography sx={{ fontSize: '0.7rem', color: 'rgba(0,194,255,0.45)', mt: 0.3, fontFamily: 'monospace' }}>
              SKU: {product.sku}
            </Typography>
          )}
        </Box>

        {!isCreate && product && (
          <Chip
            label={product.is_active ? 'Actif' : 'Inactif'}
            color={product.is_active ? 'success' : 'default'}
            size="small"
          />
        )}
      </Box>

      {/* ── Create: step breadcrumb hint ── */}
      {isCreate && (
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          mb={3}
          flexWrap="wrap"
          sx={{
            background: 'rgba(0,194,255,0.05)',
            border: '1px solid rgba(0,194,255,0.12)',
            borderRadius: '12px',
            px: 2.5,
            py: 1.5,
          }}
        >
          {/* Step 1 — active */}
          <StepBadge num={1} active />
          <Typography sx={{ fontSize: '0.82rem', color: 'var(--mirai-white)', fontWeight: 700 }}>
            Informations produit
          </Typography>

          <Typography sx={{ color: 'rgba(0,194,255,0.3)', fontSize: '0.8rem' }}>→</Typography>

          {/* Step 2 — inactive */}
          <StepBadge num={2} active={false} />
          <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>
            Gérer les variantes
          </Typography>

          <Typography sx={{ ml: 'auto', fontSize: '0.72rem', color: 'rgba(0,194,255,0.5)', display: { xs: 'none', sm: 'block' } }}>
            Redirigé automatiquement après création →
          </Typography>
        </Box>
      )}

      {/* ── Edit: Tabs ── */}
      {!isCreate && (
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            mb: 3,
            borderBottom: '1px solid rgba(0,194,255,0.1)',
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(90deg,#00C2FF,#0099CC)',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              color: 'var(--mirai-gray)',
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              gap: 0.75,
            },
            '& .Mui-selected': { color: 'var(--mirai-white) !important' },
          }}
        >
          <Tab
            icon={<InfoOutlinedIcon sx={{ fontSize: '1rem' }} />}
            iconPosition="start"
            label="Informations"
            disableRipple={false}
          />
          <Tab
            icon={<TuneIcon sx={{ fontSize: '1rem' }} />}
            iconPosition="start"
            label="Variantes"
            disableRipple={false}
          />
        </Tabs>
      )}

      {/* ── Loading / Error ── */}
      {!isCreate && isLoading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}
      {!isCreate && error && (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          Impossible de charger le produit
        </Alert>
      )}

      {/* ── Tab 0 (or create): Product Form ── */}
      {(isCreate || (!isLoading && !error && product && activeTab === 0)) && (
        <Box sx={isCreate ? glassSx : {}}>
          <ProductForm
            product={isCreate ? undefined : product}
            onSuccess={handleSuccess}
          />
        </Box>
      )}

      {/* ── Tab 1: Variants ── */}
      {!isCreate && activeTab === 1 && productId > 0 && !isLoading && !error && product && (
        <Box sx={glassSx}>
          <ProductVariantsSection
            productId={productId}
            productSku={product.sku ?? ''}
            basePrice={product.price}
          />
        </Box>
      )}
    </Container>
  );
}

/* Small helper for the step indicator */
function StepBadge({ num, active }: { num: number; active: boolean }) {
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: active
          ? 'linear-gradient(135deg, #00C2FF, #0066AA)'
          : 'rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.65rem',
        fontWeight: 800,
        color: active ? '#000' : 'rgba(255,255,255,0.3)',
        flexShrink: 0,
        border: active ? 'none' : '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {num}
    </Box>
  );
}
