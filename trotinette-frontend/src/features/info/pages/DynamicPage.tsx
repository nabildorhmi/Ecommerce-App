import ReactMarkdown from 'react-markdown';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { usePageBySlug } from '../api/pages';

interface DynamicPageProps {
  slug: string;
}

export function DynamicPage({ slug }: DynamicPageProps) {
  const { data: page, isLoading, error } = usePageBySlug(slug);

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

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 6, minHeight: '100vh' }}>
        <Typography variant="h3" fontWeight="bold" mb={4} color="text.primary">
          {page.title}
        </Typography>
        <Box
          sx={{
            '& h2': { mt: 3, mb: 1, fontWeight: 'bold', fontSize: '1.25rem' },
            '& p': { color: 'text.secondary', lineHeight: 1.8, mb: 2 },
          }}
        >
          <ReactMarkdown>{page.content}</ReactMarkdown>
        </Box>
      </Box>
    </Container>
  );
}
