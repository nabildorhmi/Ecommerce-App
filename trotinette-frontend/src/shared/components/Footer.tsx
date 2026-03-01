import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { Link } from 'react-router';
import { useCategories } from '@/features/catalog/api/categories';
import miraiLogo from '@/assets/miraiTech-Logo.png';

/**
 * MiraiTech Footer — dark, minimal, Japanese-inspired.
 */
export function Footer() {
  const { data } = useCategories();
  const categories = data?.data ?? [];
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#0B0B0E',
        mt: 'auto',
        pt: 0,
        pb: 3,
        position: 'relative',
        overflow: 'hidden',
        /* Subtle scan-line overlay */
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,194,255,0.015) 2px, rgba(0,194,255,0.015) 4px)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      {/* Gradient top border — sharper neon */}
      <Box sx={{ height: 1, background: 'linear-gradient(90deg, transparent 0%, #E63946 20%, #00C2FF 50%, #0099CC 80%, transparent 100%)', mb: 6, position: 'relative', zIndex: 1, boxShadow: '0 0 12px rgba(0,194,255,0.3)' }} />
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} sx={{ mb: 5 }}>
          {/* Brand Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                component="img"
                src={miraiLogo}
                alt="MiraiTech"
                sx={{ height: 35, width: 'auto' }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{ color: '#9CA3AF', lineHeight: 1.7, maxWidth: 280, mb: 2 }}
            >
              L'avenir de la mobilité urbaine. Scooters électriques premium conçus pour la performance et le style.
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#9CA3AF', fontSize: '0.82rem', lineHeight: 1.7, maxWidth: 280, mb: 2 }}
            >
              123 Bd Mohammed V, Casablanca, Maroc
            </Typography>
            {/* Japanese accent — visible now */}
            <Typography
              sx={{
                fontFamily: '"Noto Serif JP", serif',
                fontSize: '0.85rem',
                color: 'rgba(0,194,255,0.15)',
                letterSpacing: '0.25em',
                mt: 1,
              }}
            >
              ミライテック — 未来の技術
            </Typography>
          </Grid>

          {/* Products Column */}
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#00C2FF',
                textTransform: 'uppercase',
                mb: 2,
              }}
            >
              Produits
            </Typography>
            <Stack spacing={1}>
              <Box
                component={Link}
                to="/products"
                sx={{
                  fontSize: '0.82rem',
                  color: '#9CA3AF',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': { color: '#00C2FF', transform: 'translateX(4px)' },
                }}
              >
                Tous les produits
              </Box>
              {categories.map((cat) => (
                <Box
                  key={cat.id}
                  component={Link}
                  to={`/products?filter[category_id]=${cat.id}`}
                  sx={{
                    fontSize: '0.82rem',
                    color: '#9CA3AF',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': { color: '#00C2FF', transform: 'translateX(4px)' },
                  }}
                >
                  {cat.name}
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Company Column */}
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#00C2FF',
                textTransform: 'uppercase',
                mb: 2,
              }}
            >
              Société
            </Typography>
            <Stack spacing={1}>
              <Box
                component={Link}
                to="/a-propos"
                sx={{
                  fontSize: '0.82rem',
                  color: '#9CA3AF',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': { color: '#00C2FF', transform: 'translateX(4px)' },
                }}
              >
                A propos
              </Box>
              <Box
                component={Link}
                to="/contact"
                sx={{
                  fontSize: '0.82rem',
                  color: '#9CA3AF',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': { color: '#00C2FF', transform: 'translateX(4px)' },
                }}
              >
                Contact
              </Box>
              <Box
                component={Link}
                to="/cgv"
                sx={{
                  fontSize: '0.82rem',
                  color: '#9CA3AF',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': { color: '#00C2FF', transform: 'translateX(4px)' },
                }}
              >
                Conditions generales de vente
              </Box>
              <Box
                component={Link}
                to="/mentions-legales"
                sx={{
                  fontSize: '0.82rem',
                  color: '#9CA3AF',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': { color: '#00C2FF', transform: 'translateX(4px)' },
                }}
              >
                Mentions legales
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: '#1E1E28', mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
            © {new Date().getFullYear()} MiraiTech. Tous droits réservés.
          </Typography>
          <Typography sx={{ fontFamily: '"Noto Serif JP", serif', fontSize: '0.8rem', color: 'rgba(0,194,255,0.12)', letterSpacing: '0.15em' }}>
            未来の移動 · FUTURE MOBILITY
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
