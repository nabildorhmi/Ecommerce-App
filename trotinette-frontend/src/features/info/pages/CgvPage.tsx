import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

/**
 * CgvPage — Conditions Generales de Vente
 */
export function CgvPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h3" fontWeight="bold" mb={4} color="text.primary">
          Conditions Generales de Vente
        </Typography>

        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
              1. Objet
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
              Les presentes conditions generales de vente regissent les ventes de trottinettes electriques effectuees par MiraiTech. Toute commande implique l'acceptation sans reserve des presentes conditions.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
              2. Prix
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
              Les prix sont indiques en dirhams marocains (MAD) toutes taxes comprises. MiraiTech se reserve le droit de modifier ses prix a tout moment, mais les produits seront factures sur la base des tarifs en vigueur au moment de la validation de la commande.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
              3. Commande
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
              Les commandes sont validees apres verification de la disponibilite des produits. Vous recevrez une confirmation par telephone ou e-mail. Le paiement s'effectue a la livraison en especes.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
              4. Livraison
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
              La livraison est effectuee a l'adresse indiquee lors de la commande. Les delais de livraison sont communiques a titre indicatif. En cas de retard, aucune penalite ne pourra etre appliquee.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
              5. Retours
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
              Les retours sont possibles dans un delai de 14 jours a compter de la reception, sous reserve que le produit soit dans son emballage d'origine et en parfait etat. Les frais de retour sont a la charge du client.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold" mb={1} color="text.primary">
              6. Garantie
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
              Tous nos produits sont garantis contre les defauts de fabrication. La duree de garantie varie selon les modeles et est precisee sur la fiche produit. La garantie ne couvre pas l'usure normale ou les dommages resultant d'une utilisation inappropriee.
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
