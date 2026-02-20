import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Skeleton from '@mui/material/Skeleton';
import { useProducts } from '../api/products';
import { useCatalogFilters } from '../hooks/useCatalogFilters';
import { FilterBar } from '../components/FilterBar';
import { ProductCard } from '../components/ProductCard';

function ProductGridSkeleton() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
          <Skeleton variant="rectangular" sx={{ borderRadius: '8px', bgcolor: '#111116', aspectRatio: '1 / 1', mb: 1 }} />
          <Skeleton height={18} sx={{ bgcolor: '#111116', mb: 0.5 }} />
          <Skeleton height={16} width="50%" sx={{ bgcolor: '#111116' }} />
        </Grid>
      ))}
    </Grid>
  );
}

/**
 * CatalogPage — /products
 * Sidebar FilterBar + product grid + pagination.
 */
export function CatalogPage() {
  const { filters, setFilter } = useCatalogFilters();
  const { data, isLoading } = useProducts(filters);

  const products = data?.data ?? [];
  const totalPages = data?.meta?.last_page ?? 1;
  const currentPage = filters.page ?? 1;
  const total = data?.meta?.total ?? 0;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Page header */}
      <Box
        sx={{
          borderBottom: '1px solid #1E1E28',
          py: 4,
          backgroundColor: '#111116',
        }}
      >
        <Container maxWidth="xl">
          <Typography
            sx={{
              fontSize: '0.68rem',
              letterSpacing: '0.3em',
              color: '#00C2FF',
              fontWeight: 600,
              mb: 1,
              textTransform: 'uppercase',
            }}
          >
            スクーター — CATALOGUE
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" sx={{ color: '#F5F7FA', fontWeight: 800, letterSpacing: '0.04em' }}>
              {"Catalogue"}
            </Typography>
            {!isLoading && total > 0 && (
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                {`${total} produit(s) trouvé(s)`}
              </Typography>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Sidebar Filters */}
          <Grid size={{ xs: 12, md: 3, lg: 2.5 }}>
            <FilterBar />
          </Grid>

          {/* Product Grid */}
          <Grid size={{ xs: 12, md: 9, lg: 9.5 }}>
            {/* Sort bar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 2, alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', letterSpacing: '0.06em' }}>
                Trier par
              </Typography>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={filters.sort ?? '-created_at'}
                  onChange={(e) => setFilter('sort', e.target.value)}
                  sx={{
                    fontSize: '0.82rem',
                    color: '#F5F7FA',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E1E28' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00C2FF' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00C2FF' },
                    '& .MuiSvgIcon-root': { color: '#9CA3AF' },
                    backgroundColor: '#16161C',
                  }}
                >
                  <MenuItem value="-created_at" sx={{ fontSize: '0.82rem' }}>Plus récent</MenuItem>
                  <MenuItem value="created_at" sx={{ fontSize: '0.82rem' }}>Plus ancien</MenuItem>
                  <MenuItem value="price" sx={{ fontSize: '0.82rem' }}>Prix : Croissant</MenuItem>
                  <MenuItem value="-price" sx={{ fontSize: '0.82rem' }}>Prix : Décroissant</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {isLoading ? (
              <ProductGridSkeleton />
            ) : products.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 10,
                  color: '#9CA3AF',
                }}
              >
                <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: '#1E1E28', mb: 2 }}>
                  空
                </Typography>
                <Typography sx={{ color: '#9CA3AF', mb: 1 }}>
                  {"Aucun produit trouvé"}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {products.map((product) => (
                  <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3 }}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setFilter('page', String(page))}
                  color="primary"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#9CA3AF',
                      borderColor: '#1E1E28',
                      fontSize: '0.82rem',
                    },
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

