import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

/**
 * MentionsLegalesPage — Mentions Legales
 */
export function MentionsLegalesPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h3" fontWeight="bold" mb={4} color="text.primary">
          Mentions Legales
        </Typography>

        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
              Editeur du site
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
              MiraiTech SARL<br />
              123 Bd Mohammed V, Casablanca, Maroc<br />
              Registre du commerce: XXXXXXXXX<br />
              Capital social: XXX XXX MAD<br />
              E-mail: contact@miraitech.ma
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
              Hebergeur
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
              Le site est heberge par [Nom de l'hebergeur]<br />
              Adresse: [Adresse de l'hebergeur]<br />
              Telephone: [Telephone de l'hebergeur]
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
              Propriete intellectuelle
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
              L'ensemble de ce site releve de la legislation marocaine et internationale sur le droit d'auteur et la propriete intellectuelle. Tous les droits de reproduction sont reserves, y compris pour les documents telechargeables et les representations iconographiques et photographiques.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
              Donnees personnelles
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
              Les informations collectees lors de votre commande sont destinees a MiraiTech pour le traitement de votre commande et la gestion de la relation client. Conformement a la loi, vous disposez d'un droit d'acces, de modification, de rectification et de suppression des donnees vous concernant.
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
