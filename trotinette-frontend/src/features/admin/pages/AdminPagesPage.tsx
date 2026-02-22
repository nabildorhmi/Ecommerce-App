import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import EditIcon from '@mui/icons-material/Edit';
import { useAdminPages, useUpdatePage } from '../api/pages';
import type { PageData } from '../api/pages';

const pageSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
});

type PageFormData = z.infer<typeof pageSchema>;

export function AdminPagesPage() {
  const { data: pages, isLoading, error } = useAdminPages();
  const updateMutation = useUpdatePage();

  const [editTarget, setEditTarget] = useState<PageData | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
  });

  const openEdit = (page: PageData) => {
    setEditTarget(page);
    reset({ title: page.title, content: page.content });
  };

  const closeEdit = () => {
    setEditTarget(null);
  };

  const onSubmit = async (data: PageFormData) => {
    if (!editTarget) return;
    await updateMutation.mutateAsync({
      slug: editTarget.slug,
      title: data.title,
      content: data.content,
    });
    setSuccessOpen(true);
    closeEdit();
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
        Impossible de charger les pages
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Pages
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Derniere modification</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(!pages || pages.length === 0) ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aucune page
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id} hover>
                  <TableCell>{page.title}</TableCell>
                  <TableCell>{page.slug}</TableCell>
                  <TableCell>
                    {new Date(page.updated_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => openEdit(page)}
                      title="Modifier"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog
        open={Boolean(editTarget)}
        onClose={closeEdit}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Modifier la page</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            id="page-edit-form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
          >
            <TextField
              label="Titre"
              fullWidth
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
              {...register('title')}
            />
            <TextField
              label="Contenu"
              fullWidth
              multiline
              minRows={12}
              error={Boolean(errors.content)}
              helperText={errors.content?.message}
              inputProps={{ style: { fontFamily: 'monospace' } }}
              {...register('content')}
            />
            <Typography variant="caption" color="text.secondary">
              Utilisez la syntaxe Markdown pour le formatage (## pour les titres, **gras**, etc.)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Annuler</Button>
          <Button
            type="submit"
            form="page-edit-form"
            variant="contained"
            disabled={updateMutation.isPending}
            startIcon={updateMutation.isPending ? <CircularProgress size={16} /> : undefined}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          Page mise a jour
        </Alert>
      </Snackbar>
    </Box>
  );
}
