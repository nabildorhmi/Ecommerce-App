import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Skeleton from '@mui/material/Skeleton';
import { useProducts } from '../api/products';
import { useCatalogFilters } from '../hooks/useCatalogFilters';
import { FilterBar } from '../components/FilterBar';
import { ProductCard } from '../components/ProductCard';
import { PageDecor } from '@/shared/components/PageDecor';

function ProductGridSkeleton() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Skeleton variant="rectangular" sx={{ borderRadius: '8px', bgcolor: 'action.hover', aspectRatio: '1 / 1', mb: 1 }} />
          <Skeleton height={18} sx={{ bgcolor: 'action.hover', mb: 0.5 }} />
          <Skeleton height={16} width="50%" sx={{ bgcolor: 'action.hover' }} />
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
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Futuristic side decorations */}
      <PageDecor variant="catalog" />

      {/* Page header */}
      <Box
        sx={{
          borderBottom: '1px solid rgba(0,194,255,0.1)',
          background: 'linear-gradient(135deg, rgba(0,194,255,0.04) 0%, transparent 50%, rgba(230,57,70,0.02) 100%)',
          py: 2.5,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(0,194,255,0.3), transparent)',
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Typography
              sx={{
                fontSize: '0.68rem',
                letterSpacing: '0.3em',
                color: '#00C2FF',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              スクーター — CATALOGUE
            </Typography>
            <Typography sx={{ fontFamily: '"Noto Serif JP", serif', fontSize: '0.6rem', color: 'rgba(0,194,255,0.15)', letterSpacing: '0.1em' }}>
              製品一覧
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '0.04em' }}>
              {"Catalogue"}
            </Typography>
            {!isLoading && total > 0 && (
              <Typography variant="body2" sx={{ color: 'var(--mirai-cyan)', fontWeight: 600 }}>
                {`${total} produit(s)`}
              </Typography>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 2.5 }}>
        <Grid container spacing={2}>
          {/* Sidebar Filters */}
          <Grid size={{ xs: 12, md: 3, lg: 2.5 }}>
            <FilterBar />
          </Grid>

          {/* Product Grid */}
          <Grid size={{ xs: 12, md: 9, lg: 9.5 }}>
            {/* Sort + Per-page bar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', letterSpacing: '0.06em' }}>
                Trier par
              </Typography>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={filters.sort ?? '-created_at'}
                  onChange={(e) => setFilter('sort', e.target.value)}
                  sx={{
                    fontSize: '0.82rem',
                    color: 'text.primary',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'divider' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,194,255,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00C2FF' },
                    '& .MuiSvgIcon-root': { color: 'text.secondary' },
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'background.paper',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <MenuItem value="-created_at" sx={{ fontSize: '0.82rem' }}>Plus récent</MenuItem>
                  <MenuItem value="created_at" sx={{ fontSize: '0.82rem' }}>Plus ancien</MenuItem>
                  <MenuItem value="price" sx={{ fontSize: '0.82rem' }}>Prix : Croissant</MenuItem>
                  <MenuItem value="-price" sx={{ fontSize: '0.82rem' }}>Prix : Décroissant</MenuItem>
                </Select>
              </FormControl>

              {/* Per-page selector */}
              <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel sx={{ fontSize: '0.8rem' }}>Par page</InputLabel>
                <Select
                  label="Par page"
                  value={String(filters.per_page ?? 12)}
                  onChange={(e) => {
                    setFilter('per_page', e.target.value);
                    setFilter('page', '1');
                  }}
                  sx={{
                    fontSize: '0.82rem',
                    color: 'text.primary',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'divider' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,194,255,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00C2FF' },
                    '& .MuiSvgIcon-root': { color: 'text.secondary' },
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'background.paper',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <MenuItem value="12" sx={{ fontSize: '0.82rem' }}>12 / page</MenuItem>
                  <MenuItem value="24" sx={{ fontSize: '0.82rem' }}>24 / page</MenuItem>
                  <MenuItem value="48" sx={{ fontSize: '0.82rem' }}>48 / page</MenuItem>
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
                  color: 'text.secondary',
                }}
              >
                <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: 'divider', mb: 2 }}>
                  空
                </Typography>
                <Typography sx={{ color: 'text.secondary', mb: 1 }}>
                  {"Aucun produit trouvé"}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {products.map((product) => (
                  <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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
                      color: 'text.secondary',
                      borderColor: 'divider',
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

