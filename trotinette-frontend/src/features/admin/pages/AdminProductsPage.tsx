import { useState } from 'react';
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
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import { useAdminProducts, useDeleteProduct, useUpdateProduct } from '../api/products';
import type { AdminProduct } from '../types';
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
    <Dialog open={Boolean(product)} onClose={onClose}>
      <DialogTitle>Supprimer le produit / Delete product</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Etes-vous sur de vouloir supprimer{' '}
          <strong>{product?.name ?? product?.sku}</strong>
          {' '}? Cette action est irreversible.
          <br />
          Are you sure you want to delete this product? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Annuler / Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => product && onConfirm(product.id)}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} /> : undefined}
        >
          Supprimer / Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const { data, isLoading, error } = useAdminProducts({ page, per_page: perPage });
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

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

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Impossible de charger les produits / Failed to load products
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold">
          Produits / Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/admin/products/create"
        >
          Ajouter un produit / Add product
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
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
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucun produit / No products found
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
                          <Typography sx={{ fontSize: '0.82rem', color: '#FF6B35', fontWeight: 600 }}>
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
                            ? 'Actif / Active'
                            : 'Inactif / Inactive'
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
                        title={product.is_featured ? 'Retirer de la vedette / Unfeature' : 'Mettre en vedette / Feature'}
                        onClick={() => void handleToggleFeatured(product)}
                        sx={{ color: product.is_featured ? '#F59E0B' : 'text.disabled' }}
                      >
                        {product.is_featured ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        title={product.is_new ? 'Retirer nouveau / Remove new' : 'Marquer nouveau / Mark new'}
                        onClick={() => void handleToggleNew(product)}
                        sx={{ color: product.is_new ? '#00C853' : 'text.disabled' }}
                      >
                        {product.is_new ? <NewReleasesIcon fontSize="small" /> : <NewReleasesOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        component={Link}
                        to={`/admin/products/${product.id}/edit`}
                        size="small"
                        title="Modifier / Edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        title="Supprimer / Delete"
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
          <Typography variant="body2" color="text.secondary">
            {data?.meta?.total ?? 0} au total
          </Typography>
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
    </Box>
  );
}
