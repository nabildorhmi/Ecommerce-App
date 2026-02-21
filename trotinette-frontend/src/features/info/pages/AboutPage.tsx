import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

/**
 * AboutPage — A propos de MiraiTech
 */
export function AboutPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h3" fontWeight="bold" mb={4} color="text.primary">
          A propos de MiraiTech
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={3} lineHeight={1.8}>
          MiraiTech est une entreprise innovante basée à Casablanca, Maroc, spécialisée dans la conception et la distribution de trottinettes électriques premium. Notre mission est de révolutionner la mobilité urbaine en offrant des solutions de transport écologiques, performantes et élégantes.
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={3} lineHeight={1.8}>
          Chaque trottinette MiraiTech est conçue avec une attention particulière portée à la qualité, la sécurité et l'innovation technologique. Nous utilisons des matériaux de haute qualité et intégrons les dernières avancées en matière de batteries longue portée, de moteurs puissants et de systèmes de contrôle intelligents.
        </Typography>

        <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
          Notre équipe passionnée s'engage à fournir une expérience client exceptionnelle, de la sélection du produit à la livraison et au service après-vente. Nous croyons en un avenir où la mobilité urbaine est à la fois durable, accessible et agréable.
        </Typography>
      </Container>
    </Box>
  );
}
