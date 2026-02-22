import { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import EditIcon from '@mui/icons-material/Edit';
import { usePageBySlug } from '../api/pages';
import { useUpdatePage } from '../../admin/api/pages';
import { useAuthStore } from '../../auth/store';

interface DynamicPageProps {
  slug: string;
}

export function DynamicPage({ slug }: DynamicPageProps) {
  const { data: page, isLoading, error } = usePageBySlug(slug);
  const updateMutation = useUpdatePage();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'global_admin';

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !page) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">Page non disponible</Alert>
      </Container>
    );
  }

  const handleEdit = () => {
    setEditContent(page.content);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      slug,
      title: page.title,
      content: editContent,
    });
    setIsEditing(false);
    setSuccessOpen(true);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 6, minHeight: '100vh' }}>
        <Typography variant="h3" fontWeight="bold" mb={4} color="text.primary">
          {page.title}
        </Typography>

        {isEditing ? (
          <Box>
            <ReactQuill theme="snow" value={editContent} onChange={setEditContent} />
            <Stack direction="row" spacing={2} mt={2}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={updateMutation.isPending}
                startIcon={updateMutation.isPending ? <CircularProgress size={16} /> : undefined}
              >
                Enregistrer
              </Button>
              <Button variant="outlined" onClick={handleCancel}>
                Annuler
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              '& h2': { mt: 3, mb: 1, fontWeight: 'bold', fontSize: '1.25rem' },
              '& p': { color: 'text.secondary', lineHeight: 1.8, mb: 2 },
            }}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}

        {isAdmin && !isEditing && (
          <Fab
            color="primary"
            onClick={handleEdit}
            sx={{ position: 'fixed', bottom: 24, right: 24 }}
          >
            <EditIcon />
          </Fab>
        )}
      </Box>

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
