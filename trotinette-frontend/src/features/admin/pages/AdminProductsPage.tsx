import { useState, useDeferredValue } from 'react';
import { Link } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Container from '@mui/material/Container';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useAdminProducts, useDeleteProduct, useUpdateProduct, useClearAllProductDiscounts } from '../api/products';
import { useCategories } from '../../catalog/api/categories';
import type { AdminProduct } from '../types';

const glassSx = {
  background: 'rgba(12, 12, 20, 0.7)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0,194,255,0.09)',
  borderRadius: '18px',
  p: { xs: 2, md: 3 },
};

function formatPrice(centimes: number): string {
  return `${(centimes / 100).toFixed(2)} MAD`;
}

interface DeleteDialogProps {
  product: AdminProduct | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
  isDeleting: boolean;
}

function DeleteDialog({
  product,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteDialogProps) {
  return (
    <Dialog
      open={Boolean(product)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            background: 'rgba(12, 12, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,194,255,0.12)',
            borderRadius: '16px',
          },
        },
      }}
    >
      <DialogTitle>Supprimer le produit</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Etes-vous sur de vouloir supprimer{' '}
          <strong>{product?.name ?? product?.sku}</strong>
          {' '}? Cette action est irreversible.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Annuler
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => product && onConfirm(product.id)}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} /> : undefined}
          sx={{ borderRadius: '8px' }}
        >
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [activeFilter, setActiveFilter] = useState<'' | '1' | '0'>('');

  const deferredSearch = useDeferredValue(search);

  const params: Record<string, unknown> = { page, per_page: perPage };
  if (deferredSearch) params['filter[search]'] = deferredSearch;
  if (categoryId !== '') params['filter[category_id]'] = categoryId;
  if (activeFilter !== '') params['filter[is_active]'] = activeFilter;

  const { data, isLoading, isFetching, error } = useAdminProducts(params);
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const clearDiscountsMutation = useClearAllProductDiscounts();

  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [clearDiscountsDialogOpen, setClearDiscountsDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const products: AdminProduct[] = (data?.data as AdminProduct[]) ?? [];
  const totalPages = data?.meta?.last_page ?? 1;

  const handleToggleActive = async (product: AdminProduct) => {
    await updateMutation.mutateAsync({
      id: product.id,
      is_active: !product.is_active,
    });
  };

  const handleToggleFeatured = async (product: AdminProduct) => {
    await updateMutation.mutateAsync({
      id: product.id,
      is_featured: !product.is_featured,
    });
  };

  const handleToggleNew = async (product: AdminProduct) => {
    await updateMutation.mutateAsync({
      id: product.id,
      is_new: !product.is_new,
    });
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    setDeleteTarget(null);
  };

  const handleClearAllDiscounts = async () => {
    try {
      const result = await clearDiscountsMutation.mutateAsync() as {
        products_updated?: number;
        variants_updated?: number;
      };
      setClearDiscountsDialogOpen(false);
      setFeedback({
        type: 'success',
        message: `Remises desactivees (${result.products_updated ?? 0} produits, ${result.variants_updated ?? 0} variantes).`,
      });
    } catch {
      setFeedback({ type: 'error', message: 'Echec de la desactivation globale des remises.' });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--mirai-white)' }}>
            Produits
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif JP", serif', fontSize: '0.7rem', color: 'rgba(0,194,255,0.2)', letterSpacing: '0.1em' }}>
            製品管理
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/admin/products/create"
          sx={{
            borderRadius: '10px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #00C2FF, #0099CC)',
            '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(0,194,255,0.25)' },
            transition: 'all 0.2s ease',
          }}
        >
          Ajouter un produit
        </Button>
      </Box>

      <Box sx={{ ...glassSx, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          Organisation produits
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Utilisez les filtres pour trouver rapidement un produit, puis activez ou mettez a jour ses badges depuis le tableau.
        </Typography>
      </Box>

      <Box sx={{ ...glassSx, mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
          Filtres et actions rapides
        </Typography>
        <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
          <TextField
            size="small"
            placeholder="Rechercher (nom, SKU...)"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            sx={{ minWidth: 220 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel sx={{ fontSize: '0.82rem' }}>Categorie</InputLabel>
            <Select
              label="Categorie"
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value as number | ''); setPage(1); }}
              startAdornment={<FilterListIcon fontSize="small" sx={{ mr: 0.5, color: 'text.disabled' }} />}
            >
              <MenuItem value="">Toutes</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel sx={{ fontSize: '0.82rem' }}>Statut</InputLabel>
            <Select
              label="Statut"
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value as '' | '1' | '0'); setPage(1); }}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="1">Actifs</MenuItem>
              <MenuItem value="0">Inactifs</MenuItem>
            </Select>
          </FormControl>
          {(search || categoryId !== '' || activeFilter !== '') && (
            <Button size="small" variant="outlined" color="inherit" onClick={() => { setSearch(''); setCategoryId(''); setActiveFilter(''); setPage(1); }}>
              Effacer
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => setClearDiscountsDialogOpen(true)}
            disabled={clearDiscountsMutation.isPending}
            startIcon={clearDiscountsMutation.isPending ? <CircularProgress size={14} /> : undefined}
          >
            Desactiver toutes remises
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {data?.meta?.total ?? 0} produit(s)
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Impossible de charger les produits
        </Alert>
      )}

      <TableContainer component={Paper} elevation={0} className="mirai-glass" sx={{ borderRadius: '16px', position: 'relative' }}>
        {/* Loading overlay — shown during refetches without hiding filters */}
        {isFetching && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(12,12,20,0.55)', zIndex: 10, borderRadius: 1, backdropFilter: 'blur(2px)' }}>
            <CircularProgress size={32} />
          </Box>
        )}
        <Table size="small" sx={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ borderBottom: 'none', color: 'var(--mirai-gray)', fontWeight: 600 }}>Image</TableCell>
              <TableCell sx={{ borderBottom: 'none', color: 'var(--mirai-gray)', fontWeight: 600 }}>Nom (FR)</TableCell>
              <TableCell sx={{ borderBottom: 'none', color: 'var(--mirai-gray)', fontWeight: 600 }}>SKU</TableCell>
              <TableCell sx={{ borderBottom: 'none', color: 'var(--mirai-gray)', fontWeight: 600 }}>Prix</TableCell>
              <TableCell sx={{ borderBottom: 'none', color: 'var(--mirai-gray)', fontWeight: 600 }}>Promo</TableCell>
              <TableCell sx={{ borderBottom: 'none', color: 'var(--mirai-gray)', fontWeight: 600 }}>Stock</TableCell>
              <TableCell sx={{ borderBottom: 'none', color: 'var(--mirai-gray)', fontWeight: 600 }}>Actif</TableCell>
              <TableCell sx={{ borderBottom: 'none', color: 'var(--mirai-gray)', fontWeight: 600 }}>Vedette</TableCell>
              <TableCell sx={{ borderBottom: 'none', color: 'var(--mirai-gray)', fontWeight: 600 }}>Nouveau</TableCell>
              <TableCell sx={{ borderBottom: 'none', color: 'var(--mirai-gray)', fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} sx={{ '& td': { borderBottom: 'none', py: 1.5 } }}>
                  {Array.from({ length: 10 }).map((__, j) => (
                    <TableCell key={j}>
                      <Box sx={{ height: 20, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1, animation: 'pulse 1.5s ease-in-out infinite' }} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  Aucun produit trouvé
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const thumb = product.images?.[0]?.thumbnail;
                return (
                  <TableRow
                    key={product.id}
                    hover
                    sx={{
                      backgroundColor: 'rgba(22, 22, 28, 0.4)',
                      backdropFilter: 'blur(12px)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', backgroundColor: 'rgba(22, 22, 28, 0.7)' },
                      '& td:first-of-type': { borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' },
                      '& td:last-child': { borderTopRightRadius: '12px', borderBottomRightRadius: '12px' },
                      '& td': { borderBottom: 'none', py: 1.5 }
                    }}
                  >
                    <TableCell>
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={product.name ?? product.sku}
                          style={{
                            width: 48,
                            height: 48,
                            objectFit: 'cover',
                            borderRadius: 4,
                          }}
                        />
                      ) : (
                        <img
                          src="https://placehold.co/48x48/111116/00C2FF?text=M"
                          alt="MiraiTech"
                          style={{ width: 48, height: 48, borderRadius: 4 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {product.name ?? '—'}
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      {product.is_on_sale && product.default_variant?.promo_price ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                          <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', textDecoration: 'line-through' }}>
                            {formatPrice(product.price)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.82rem', color: '#D97A50', fontWeight: 600 }}>
                            {formatPrice(product.default_variant.promo_price)}
                          </Typography>
                        </Box>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {product.stock_quantity}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          product.is_active
                            ? 'Actif'
                            : 'Inactif'
                        }
                        color={product.is_active ? 'success' : 'default'}
                        size="small"
                        onClick={() => void handleToggleActive(product)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        title={product.is_featured ? 'Retirer de la vedette' : 'Mettre en vedette'}
                        onClick={() => void handleToggleFeatured(product)}
                        sx={{ color: product.is_featured ? '#F59E0B' : 'text.disabled' }}
                      >
                        {product.is_featured ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        title={product.is_new ? 'Retirer nouveau' : 'Marquer nouveau'}
                        onClick={() => void handleToggleNew(product)}
                        sx={{ color: product.is_new ? '#2EAD5F' : 'text.disabled' }}
                      >
                        {product.is_new ? <NewReleasesIcon fontSize="small" /> : <NewReleasesOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        component={Link}
                        to={`/admin/products/${product.id}/edit`}
                        size="small"
                        title="Modifier"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        title="Supprimer"
                        onClick={() => setDeleteTarget(product)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <DeleteDialog
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(id) => void handleDelete(id)}
        isDeleting={deleteMutation.isPending}
      />

      <Dialog
        open={clearDiscountsDialogOpen}
        onClose={() => setClearDiscountsDialogOpen(false)}
        slotProps={{
          paper: {
            sx: {
              background: 'rgba(12, 12, 20, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,194,255,0.12)',
              borderRadius: '16px',
            },
          },
        }}
      >
        <DialogTitle>Desactiver toutes les remises</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Cette action va supprimer les remises de tous les produits et de toutes les variantes. Vous pourrez ensuite reactiver des remises produit par produit.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setClearDiscountsDialogOpen(false)}
            disabled={clearDiscountsMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleClearAllDiscounts()}
            disabled={clearDiscountsMutation.isPending}
            startIcon={clearDiscountsMutation.isPending ? <CircularProgress size={16} /> : undefined}
          >
            Desactiver toutes remises
          </Button>
        </DialogActions>
      </Dialog>

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel sx={{ fontSize: '0.8rem' }}>Lignes / page</InputLabel>
            <Select
              label="Lignes / page"
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              sx={{ fontSize: '0.82rem' }}
            >
              <MenuItem value={10}>10 / page</MenuItem>
              <MenuItem value={20}>20 / page</MenuItem>
              <MenuItem value={50}>50 / page</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, p) => setPage(p)}
            color="primary"
          />
        )}
      </Box>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={feedback?.type ?? 'success'}
          onClose={() => setFeedback(null)}
          sx={{ width: '100%' }}
        >
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
