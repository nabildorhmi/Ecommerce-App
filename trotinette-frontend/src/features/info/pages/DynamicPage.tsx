import { useState, useRef, useCallback } from 'react';
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
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
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

function useMarkdownToolbar(
  editContent: string,
  setEditContent: (v: string) => void,
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
) {
  const insert = useCallback(
    (before: string, after: string, placeholder: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = editContent.substring(start, end);
      const text = selected || placeholder;
      const newContent =
        editContent.substring(0, start) + before + text + after + editContent.substring(end);
      setEditContent(newContent);
      requestAnimationFrame(() => {
        ta.focus();
        const cursorStart = start + before.length;
        ta.setSelectionRange(cursorStart, cursorStart + text.length);
      });
    },
    [editContent, setEditContent, textareaRef],
  );

  const insertLine = useCallback(
    (prefix: string, placeholder: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const lineStart = editContent.lastIndexOf('\n', start - 1) + 1;
      const selected = editContent.substring(ta.selectionStart, ta.selectionEnd);
      const text = selected || placeholder;
      const newContent =
        editContent.substring(0, lineStart) + prefix + text + editContent.substring(lineStart + (selected ? text.length : 0));
      setEditContent(newContent);
      requestAnimationFrame(() => {
        ta.focus();
      });
    },
    [editContent, setEditContent, textareaRef],
  );

  return { insert, insertLine };
}

export function DynamicPage({ slug }: DynamicPageProps) {
  const { data: page, isLoading, error } = usePageBySlug(slug);
  const updateMutation = useUpdatePage();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'global_admin';

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTab, setEditTab] = useState(0);
  const [successOpen, setSuccessOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { insert, insertLine } = useMarkdownToolbar(editContent, setEditContent, textareaRef);

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
    <Container maxWidth="md">
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
                <Tab label="Apercu" sx={{ textTransform: 'none' }} />
              </Tabs>
              {editTab === 0 && (
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ px: 1.5, py: 0.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover' }}
                  alignItems="center"
                >
                  <Tooltip title="Gras (Ctrl+B)"><IconButton size="small" onClick={() => insert('**', '**', 'gras')}><FormatBoldIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Italique (Ctrl+I)"><IconButton size="small" onClick={() => insert('*', '*', 'italique')}><FormatItalicIcon fontSize="small" /></IconButton></Tooltip>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                  <Tooltip title="Titre H2"><IconButton size="small" onClick={() => insertLine('## ', 'Titre')}><TitleIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Citation"><IconButton size="small" onClick={() => insertLine('> ', 'citation')}><FormatQuoteIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Code"><IconButton size="small" onClick={() => insert('`', '`', 'code')}><CodeIcon fontSize="small" /></IconButton></Tooltip>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                  <Tooltip title="Liste a puces"><IconButton size="small" onClick={() => insertLine('- ', 'element')}><FormatListBulletedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Liste numerotee"><IconButton size="small" onClick={() => insertLine('1. ', 'element')}><FormatListNumberedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Lien"><IconButton size="small" onClick={() => insert('[', '](url)', 'texte')}><LinkIcon fontSize="small" /></IconButton></Tooltip>
                </Stack>
              )}
              <Box sx={{ p: 2 }}>
                {editTab === 0 ? (
                  <TextField
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    multiline
                    minRows={16}
                    fullWidth
                    placeholder="Contenu en Markdown..."
                    inputRef={textareaRef}
                    inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.9rem' } }}
                    sx={{ '& .MuiOutlinedInput-root': { p: 0 }, '& textarea': { p: 1.5 } }}
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
  );
}
