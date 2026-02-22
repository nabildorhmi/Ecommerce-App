import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactMarkdown from 'react-markdown';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import TitleIcon from '@mui/icons-material/Title';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import CodeIcon from '@mui/icons-material/Code';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
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
  const [previewTab, setPreviewTab] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
  });

  const contentValue = watch('content');

  const insertMd = useCallback(
    (before: string, after: string, placeholder: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = contentValue.substring(start, end);
      const text = selected || placeholder;
      const newContent =
        contentValue.substring(0, start) + before + text + after + contentValue.substring(end);
      setValue('content', newContent, { shouldValidate: true });
      requestAnimationFrame(() => {
        ta.focus();
        const cursorStart = start + before.length;
        ta.setSelectionRange(cursorStart, cursorStart + text.length);
      });
    },
    [contentValue, setValue],
  );

  const insertLine = useCallback(
    (prefix: string, placeholder: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const lineStart = contentValue.lastIndexOf('\n', start - 1) + 1;
      const selected = contentValue.substring(ta.selectionStart, ta.selectionEnd);
      const text = selected || placeholder;
      const newContent =
        contentValue.substring(0, lineStart) + prefix + text + contentValue.substring(lineStart + (selected ? text.length : 0));
      setValue('content', newContent, { shouldValidate: true });
      requestAnimationFrame(() => {
        ta.focus();
      });
    },
    [contentValue, setValue],
  );

  const openEdit = (page: PageData) => {
    setEditTarget(page);
    setPreviewTab(0);
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
            <Paper variant="outlined">
              <Tabs
                value={previewTab}
                onChange={(_e, v: number) => setPreviewTab(v)}
                sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
              >
                <Tab label="Modifier" sx={{ textTransform: 'none' }} />
                <Tab label="Apercu" sx={{ textTransform: 'none' }} />
              </Tabs>
              {previewTab === 0 && (
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ px: 1.5, py: 0.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover' }}
                  alignItems="center"
                >
                  <Tooltip title="Gras"><IconButton size="small" onClick={() => insertMd('**', '**', 'gras')}><FormatBoldIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Italique"><IconButton size="small" onClick={() => insertMd('*', '*', 'italique')}><FormatItalicIcon fontSize="small" /></IconButton></Tooltip>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                  <Tooltip title="Titre H2"><IconButton size="small" onClick={() => insertLine('## ', 'Titre')}><TitleIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Citation"><IconButton size="small" onClick={() => insertLine('> ', 'citation')}><FormatQuoteIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Code"><IconButton size="small" onClick={() => insertMd('`', '`', 'code')}><CodeIcon fontSize="small" /></IconButton></Tooltip>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                  <Tooltip title="Liste a puces"><IconButton size="small" onClick={() => insertLine('- ', 'element')}><FormatListBulletedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Liste numerotee"><IconButton size="small" onClick={() => insertLine('1. ', 'element')}><FormatListNumberedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Lien"><IconButton size="small" onClick={() => insertMd('[', '](url)', 'texte')}><LinkIcon fontSize="small" /></IconButton></Tooltip>
                </Stack>
              )}
              <Box sx={{ p: 2 }}>
                {previewTab === 0 ? (
                  <TextField
                    multiline
                    minRows={12}
                    fullWidth
                    placeholder="Contenu en Markdown..."
                    error={Boolean(errors.content)}
                    helperText={errors.content?.message}
                    inputRef={textareaRef}
                    inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.9rem' } }}
                    sx={{ '& .MuiOutlinedInput-root': { p: 0 }, '& textarea': { p: 1.5 } }}
                    {...register('content')}
                  />
                ) : (
                  <Box sx={{
                    minHeight: 200,
                    '& h2': { mt: 2, mb: 1, fontWeight: 'bold', fontSize: '1.25rem' },
                    '& p': { color: 'text.secondary', lineHeight: 1.8, mb: 2 },
                  }}>
                    <ReactMarkdown>{contentValue || ''}</ReactMarkdown>
                  </Box>
                )}
              </Box>
            </Paper>
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
