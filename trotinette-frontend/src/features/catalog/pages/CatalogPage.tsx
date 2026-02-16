import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../api/products';
import { useCatalogFilters } from '../hooks/useCatalogFilters';
import { FilterBar } from '../components/FilterBar';
import { ProductGrid } from '../components/ProductGrid';

/**
 * CatalogPage — /products
 * Composes FilterBar + ProductGrid + Pagination.
 * All filter/page state lives in the URL via useCatalogFilters.
 */
export function CatalogPage() {
  const { t } = useTranslation();
  const { filters, setFilter } = useCatalogFilters();
  const { data, isLoading } = useProducts(filters);

  const products = data?.data ?? [];
  const totalPages = data?.meta?.last_page ?? 1;
  const currentPage = filters.page ?? 1;
  const total = data?.meta?.total ?? 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('catalog.title')}
      </Typography>

      {/* Show total count when data is loaded */}
      {!isLoading && total > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('catalog.showing', { count: total })}
        </Typography>
      )}

      <FilterBar />

      <ProductGrid products={products} loading={isLoading} />

      {/* Pagination — only show if there's more than one page */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setFilter('page', String(page))}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
}
