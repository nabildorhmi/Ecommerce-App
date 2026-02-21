import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

/**
 * ContactPage — Contactez-nous
 */
export function ContactPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h3" fontWeight="bold" mb={4} color="text.primary">
          Contactez-nous
        </Typography>

        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
              Adresse
            </Typography>
            <Typography variant="body1" color="text.secondary">
              123 Bd Mohammed V, Casablanca, Maroc
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
              Téléphone
            </Typography>
            <Typography variant="body1" color="text.secondary">
              +212 600 000 000
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
              E-mail
            </Typography>
            <Typography variant="body1" color="text.secondary">
              contact@miraitech.ma
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
              WhatsApp
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cliquez sur le bouton WhatsApp en bas à droite de la page pour nous contacter directement.
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
