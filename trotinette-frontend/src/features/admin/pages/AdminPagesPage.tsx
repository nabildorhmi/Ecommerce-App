import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
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
import InputAdornment from '@mui/material/InputAdornment';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MDEditor from '@uiw/react-md-editor';
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
  const [editTab, setEditTab] = useState(0);
  const [search, setSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
  });

  const contentValue = useWatch({ control, name: 'content' }) || '';

  const openEdit = (page: PageData) => {
    setEditTarget(page);
    setEditTab(0);
    reset({ title: page.title, content: page.content });
  };

  const closeEdit = () => {
    setEditTarget(null);
  };

  const filteredPages = (pages ?? []).filter((page) => {
    if (page.slug === 'site-settings') return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return page.title.toLowerCase().includes(q) || page.slug.toLowerCase().includes(q);
  });

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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Pages markdown
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          Gestion du contenu
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cette section centralise les pages markdown publiques. Modifiez le titre ou le contenu puis previsualisez avant enregistrement.
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Rechercher (titre, slug)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 260 }}
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
            <Button size="small" variant="outlined" onClick={() => setSearch('')}>
              Effacer
            </Button>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filteredPages.length} page(s)
          </Typography>
        </Box>
      </Paper>

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
            {filteredPages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aucune page trouvee
                </TableCell>
              </TableRow>
            ) : (
              filteredPages.map((page) => (
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
            <Box data-color-mode="dark">
              <Tabs
                value={editTab}
                onChange={(_e, v: number) => setEditTab(v)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}
              >
                <Tab label="Modifier" sx={{ textTransform: 'none' }} />
                <Tab label="Apercu" sx={{ textTransform: 'none' }} />
              </Tabs>
              {editTab === 0 ? (
                <MDEditor
                  value={contentValue || ''}
                  onChange={(val) => setValue('content', val ?? '', { shouldValidate: true })}
                  height={400}
                  preview="edit"
                />
              ) : (
                <Box sx={{ minHeight: 200, p: 2, '& h2': { mt: 3, mb: 1, fontWeight: 'bold', fontSize: '1.25rem' }, '& p': { color: 'text.secondary', lineHeight: 1.8, mb: 2 }, '& ul, & ol': { color: 'text.secondary', pl: 3, mb: 2 }, '& li': { mb: 0.5 }, '& table': { borderCollapse: 'collapse', width: '100%', mb: 2 }, '& th, & td': { border: '1px solid', borderColor: 'divider', p: 1 } }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentValue || ''}</ReactMarkdown>
                </Box>
              )}
              {errors.content && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                  {errors.content.message}
                </Typography>
              )}
            </Box>
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
    </Container>
  );
}
