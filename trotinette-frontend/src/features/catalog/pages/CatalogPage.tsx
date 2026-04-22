import { useState } from 'react';
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
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/shared/animations/variants';
import { useProducts } from '../api/products';
import { useCategories } from '../api/categories';
import { useCatalogFilters } from '../hooks/useCatalogFilters';
import { FilterBar } from '../components/FilterBar';
import { ProductCard } from '../components/ProductCard';
import { PageDecor } from '@/shared/components/PageDecor';

function ProductGridSkeleton() {
  return (
    <Grid container rowSpacing={1} columnSpacing={1}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 3 }}>
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { filters, setFilter } = useCatalogFilters();
  const { data, isLoading } = useProducts(filters);
  const { data: categoriesData } = useCategories();

  const products = data?.data ?? [];
  const totalPages = data?.meta?.last_page ?? 1;
  const currentPage = filters.page ?? 1;
  const total = data?.meta?.total ?? 0;
  const categories = categoriesData?.data ?? [];

  // Active chips mapping
  const activeChips: { key: string; label: string }[] = [];
  if (filters['filter[search]']) activeChips.push({ key: 'filter[search]', label: `Recherche: ${filters['filter[search]']}` });
  if (filters['filter[min_price]']) activeChips.push({ key: 'filter[min_price]', label: `Min: ${parseInt(filters['filter[min_price]'], 10) / 100} MAD` });
  if (filters['filter[max_price]']) activeChips.push({ key: 'filter[max_price]', label: `Max: ${parseInt(filters['filter[max_price]'], 10) / 100} MAD` });
  if (filters['filter[in_stock]']) activeChips.push({ key: 'filter[in_stock]', label: 'En stock' });
  if (filters['filter[is_new]']) activeChips.push({ key: 'filter[is_new]', label: 'Nouveautés' });
  if (filters['filter[is_on_sale]']) activeChips.push({ key: 'filter[is_on_sale]', label: 'Promotions' });
  if (filters['filter[category_id]']) {
    const cat = categories.find(c => String(c.id) === filters['filter[category_id]']);
    if (cat) activeChips.push({ key: 'filter[category_id]', label: `Catégorie: ${cat.name}` });
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Futuristic side decorations */}
      <PageDecor variant="catalog" />

      {/* Page header */}
      <Box
        sx={{
          borderBottom: '1px solid rgba(0,194,255,0.1)',
          bgcolor: 'rgba(0,194,255,0.02)',
          py: 1.5,
          position: 'relative',
          overflow: 'hidden',
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

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderColor: 'rgba(0,194,255,0.2)', backgroundColor: 'rgba(0,194,255,0.03)' }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
            Comment acheter en 3 etapes
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#00C2FF', mb: 0.25 }}>1. Choisissez un modele</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Filtrez le catalogue puis ouvrez la fiche produit.</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#00C2FF', mb: 0.25 }}>2. Ajoutez au panier</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Selectionnez les variantes puis cliquez sur Ajouter au panier.</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#00C2FF', mb: 0.25 }}>3. Confirmez la commande</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Passez au checkout et validez avec paiement a la livraison.</Typography>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Sidebar Filters (Desktop) */}
          <Grid size={{ xs: 12, md: 3, lg: 2.5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <FilterBar />
          </Grid>

          {/* Product Grid */}
          <Grid size={{ xs: 12, md: 9, lg: 9.5 }}>
            {/* Sort + Per-page + Mobile Filter Toggle bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setMobileFiltersOpen(true)}
                sx={{
                  display: { md: 'none' },
                  color: '#00C2FF',
                  borderColor: 'rgba(0,194,255,0.3)',
                  '&:hover': { borderColor: '#00C2FF', backgroundColor: 'rgba(0,194,255,0.1)' }
                }}
              >
                Filtres
              </Button>

              {/* Active Chips */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: 1 }}>
                {activeChips.map((chip) => (
                  <Chip
                    key={chip.key}
                    label={chip.label}
                    onDelete={() => setFilter(chip.key, '')}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(0,194,255,0.1)',
                      color: '#00C2FF',
                      border: '1px solid rgba(0,194,255,0.2)',
                      '& .MuiChip-deleteIcon': { color: '#00C2FF', '&:hover': { color: '#fff' } }
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', letterSpacing: '0.06em', display: { xs: 'none', sm: 'block' } }}>
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
                <FormControl size="small" sx={{ minWidth: 110, display: { xs: 'none', sm: 'inline-flex' } }}>
                  <InputLabel sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Par page</InputLabel>
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
                <SearchOffIcon sx={{ fontSize: '3rem', color: 'divider', mb: 2 }} />
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                  Aucun produit trouvé
                </Typography>
                <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: '0.85rem' }}>
                  Essayez de modifier vos filtres ou explorez notre catalogue complet.
                </Typography>
                {activeChips.length > 0 && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      activeChips.forEach(chip => setFilter(chip.key, ''));
                    }}
                    sx={{ color: '#00C2FF', borderColor: 'rgba(0,194,255,0.3)' }}
                  >
                    Effacer les filtres
                  </Button>
                )}
              </Box>
            ) : (
              <motion.div
                key={products.map(p => p.id).join(',')}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <Grid container rowSpacing={2} columnSpacing={2}>
                  {products.map((product) => (
                    <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3, lg: 3 }}>
                      <motion.div variants={fadeInUp}>
                        <ProductCard product={product} />
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
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

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            bgcolor: 'background.default',
            backgroundImage: 'none',
            borderRight: '1px solid rgba(0,194,255,0.1)',
            p: 2,
            pt: 4,
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={() => setMobileFiltersOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <FilterBar isMobileOpen={() => setMobileFiltersOpen(false)} />
      </Drawer>
    </Box>
  );
}

