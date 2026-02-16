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
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAdminProducts, useDeleteProduct, useUpdateProduct } from '../api/products';
import type { AdminProduct } from '../types';

function formatPrice(centimes: number): string {
  return `${(centimes / 100).toFixed(2)} MAD`;
}

interface InlineStockEditorProps {
  product: AdminProduct;
}

function InlineStockEditor({ product }: InlineStockEditorProps) {
  const updateMutation = useUpdateProduct();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(product.stock_quantity));

  const save = async () => {
    const qty = parseInt(value, 10);
    if (!isNaN(qty) && qty >= 0 && qty !== product.stock_quantity) {
      await updateMutation.mutateAsync({
        id: product.id,
        stock_quantity: qty,
      });
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <TextField
        size="small"
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void save();
          if (e.key === 'Escape') setEditing(false);
        }}
        inputProps={{ min: 0, style: { width: 60 } }}
        autoFocus
      />
    );
  }

  return (
    <Box
      component="span"
      onClick={() => setEditing(true)}
      sx={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
      title="Cliquer pour modifier / Click to edit"
    >
      {updateMutation.isPending ? (
        <CircularProgress size={14} />
      ) : (
        product.stock_quantity
      )}
    </Box>
  );
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
          <strong>{product?.translations?.fr?.name ?? product?.sku}</strong>
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
  const { data, isLoading, error } = useAdminProducts();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  const products: AdminProduct[] = (data?.data as AdminProduct[]) ?? [];

  const handleToggleActive = async (product: AdminProduct) => {
    await updateMutation.mutateAsync({
      id: product.id,
      is_active: !product.is_active,
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

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Nom (FR) / Name (FR)</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Prix / Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Actif / Active</TableCell>
              <TableCell align="right">Actions</TableCell>
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
                const thumb = product.images?.[0]?.thumbnail_url;
                return (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={product.translations?.fr?.name ?? product.sku}
                          style={{
                            width: 48,
                            height: 48,
                            objectFit: 'cover',
                            borderRadius: 4,
                          }}
                        />
                      ) : (
                        <Box
                          width={48}
                          height={48}
                          bgcolor="grey.100"
                          borderRadius={1}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Typography variant="caption" color="text.disabled">
                            No img
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.translations?.fr?.name ?? '—'}
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <InlineStockEditor product={product} />
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
    </Box>
  );
}
