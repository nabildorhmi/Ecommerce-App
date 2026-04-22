import { useState } from 'react';
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
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Container from '@mui/material/Container';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {
  useAdminCategories,
  useDeleteCategory,
  useUpdateCategory,
} from '../api/categories';
import { CategoryForm } from '../components/CategoryForm';
import type { AdminCategory } from '../types';

interface DeleteDialogProps {
  category: AdminCategory | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
  isDeleting: boolean;
  deleteError: Error | null;
}

function DeleteDialog({
  category,
  onClose,
  onConfirm,
  isDeleting,
  deleteError,
}: DeleteDialogProps) {
  const hasProducts =
    category?.product_count !== undefined && category.product_count > 0;

  return (
    <Dialog open={Boolean(category)} onClose={onClose}>
      <DialogTitle>Supprimer la categorie</DialogTitle>
      <DialogContent>
        {hasProducts && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Cette categorie contient {category?.product_count} produit(s). La suppression sera bloquee.
          </Alert>
        )}
        <DialogContentText>
          Etes-vous sur de vouloir supprimer{' '}
          <strong>{category?.name ?? category?.slug}</strong>
          {' '}?
        </DialogContentText>
        {deleteError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(deleteError as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? 'Suppression impossible'}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Annuler
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => category && onConfirm(category.id)}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} /> : undefined}
        >
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function AdminCategoriesPage() {
  const { data, isLoading, error } = useAdminCategories();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [search, setSearch] = useState('');

  const categories: AdminCategory[] = (data?.data as AdminCategory[]) ?? [];
  const filteredCategories = categories.filter((cat) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return cat.name.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q);
  });

  const [catPage, setCatPage] = useState(1);
  const [catPerPage, setCatPerPage] = useState(10);
  const catTotalPages = Math.max(1, Math.ceil(filteredCategories.length / catPerPage));
  const safeCatPage = Math.min(catPage, catTotalPages);
  const paginatedCategories = filteredCategories.slice((safeCatPage - 1) * catPerPage, safeCatPage * catPerPage);

  const handleToggleActive = async (cat: AdminCategory) => {
    await updateMutation.mutateAsync({
      id: cat.id,
      is_active: !cat.is_active,
    });
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    setDeleteTarget(null);
  };

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (cat: AdminCategory) => {
    setEditTarget(cat);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditTarget(null);
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
        Impossible de charger les categories / Failed to load categories
      </Alert>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold">
          Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
        >
          Ajouter une categorie
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          Gestion des categories
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Organisez votre catalogue par famille de produits. Activez ou desactivez rapidement une categorie depuis le tableau.
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Rechercher (nom, slug)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCatPage(1);
            }}
            sx={{ minWidth: 240 }}
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

          {search && (
            <Button size="small" variant="outlined" onClick={() => { setSearch(''); setCatPage(1); }}>
              Effacer
            </Button>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filteredCategories.length} categorie(s)
          </Typography>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aucune categorie
                </TableCell>
              </TableRow>
            ) : (
              paginatedCategories.map((cat) => (
                <TableRow key={cat.id} hover>
                  <TableCell>{cat.name ?? '—'}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        cat.is_active ? 'Actif' : 'Inactif'
                      }
                      color={cat.is_active ? 'success' : 'default'}
                      size="small"
                      onClick={() => void handleToggleActive(cat)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => openEdit(cat)}
                      title="Modifier"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteTarget(cat)}
                      title="Supprimer"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel sx={{ fontSize: '0.8rem' }}>Lignes / page</InputLabel>
            <Select
              label="Lignes / page"
              value={catPerPage}
              onChange={(e) => { setCatPerPage(Number(e.target.value)); setCatPage(1); }}
              sx={{ fontSize: '0.82rem' }}
            >
              <MenuItem value={5}>5 / page</MenuItem>
              <MenuItem value={10}>10 / page</MenuItem>
              <MenuItem value={25}>25 / page</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            {filteredCategories.length} au total
          </Typography>
        </Box>
        {catTotalPages > 1 && (
          <Pagination
            count={catTotalPages}
            page={safeCatPage}
            onChange={(_e, p) => setCatPage(p)}
            color="primary"
            size="small"
          />
        )}
      </Box>

      {/* Create / Edit Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editTarget
            ? 'Modifier la categorie'
            : 'Nouvelle categorie'}
        </DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <CategoryForm
              category={editTarget ?? undefined}
              onSuccess={handleFormSuccess}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        category={deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          deleteMutation.reset();
        }}
        onConfirm={(id) => void handleDelete(id)}
        isDeleting={deleteMutation.isPending}
        deleteError={deleteMutation.error}
      />
    </Container>
  );
}
