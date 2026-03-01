import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit';
import MDEditor from '@uiw/react-md-editor';
import { PageDecor } from '@/shared/components/PageDecor';
import { usePageBySlug } from '../api/pages';
import { useUpdatePage } from '../../admin/api/pages';
import { useAuthStore } from '../../auth/store';

interface DynamicPageProps {
  slug: string;
}

const markdownStyles = {
  '& h2': { mt: 3, mb: 1, fontWeight: 'bold', fontSize: '1.25rem' },
  '& p': { color: 'text.secondary', lineHeight: 1.8, mb: 2 },
  '& ul, & ol': { color: 'text.secondary', pl: 3, mb: 2 },
  '& li': { mb: 0.5 },
};



export function DynamicPage({ slug }: DynamicPageProps) {
  const { data: page, isLoading, error } = usePageBySlug(slug);
  const updateMutation = useUpdatePage();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'global_admin';

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTab, setEditTab] = useState(0);
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
    setEditTab(0);
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
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <PageDecor variant="info" />
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
      <Box sx={{ py: 6, minHeight: '100vh' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Typography variant="h3" fontWeight="bold" color="text.primary">
            {page.title}
          </Typography>
          {isAdmin && !isEditing && (
            <IconButton onClick={handleEdit} title="Modifier la page" color="primary">
              <EditIcon />
            </IconButton>
          )}
        </Box>

        {isEditing ? (
          <Box>
            <Paper variant="outlined" sx={{ mb: 2 }}>
              <Tabs
                value={editTab}
                onChange={(_e, v: number) => setEditTab(v)}
                sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
              >
                <Tab label="Modifier" sx={{ textTransform: 'none' }} />
                <Tab label="Aperçu" sx={{ textTransform: 'none' }} />
              </Tabs>
              <Box sx={{ p: 2 }} data-color-mode="dark">
                {editTab === 0 ? (
                  <MDEditor
                    value={editContent}
                    onChange={(val) => setEditContent(val ?? '')}
                    height={400}
                    preview="edit"
                  />
                ) : (
                  <Box sx={{ minHeight: 200, ...markdownStyles }}>
                    <ReactMarkdown>{editContent}</ReactMarkdown>
                  </Box>
                )}
              </Box>
            </Paper>
            <Stack direction="row" spacing={2}>
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
          <Box sx={markdownStyles}>
            <ReactMarkdown>{page.content}</ReactMarkdown>
          </Box>
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
    </Box>
  );
}
