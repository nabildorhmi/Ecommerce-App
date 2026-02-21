import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { Link } from 'react-router';
import { useCategories } from '../../features/catalog/api/categories';

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
        borderTop: '1px solid #1E1E28',
        mt: 'auto',
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} sx={{ mb: 5 }}>
          {/* Brand Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #00C2FF 0%, #0099CC 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: 13, color: '#0B0B0E', lineHeight: 1 }}>M</Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, letterSpacing: '0.12em', color: '#F5F7FA', fontSize: '1rem' }}>
                MIRAI<Box component="span" sx={{ color: '#00C2FF' }}>TECH</Box>
              </Typography>
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
            {/* Japanese accent */}
            <Typography
              sx={{
                fontFamily: 'serif',
                fontSize: '0.75rem',
                color: '#1E1E28',
                letterSpacing: '0.2em',
              }}
            >
              ミライデッタ
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
                  transition: 'color 0.2s',
                  '&:hover': { color: '#F5F7FA' },
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
                    transition: 'color 0.2s',
                    '&:hover': { color: '#F5F7FA' },
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
                  transition: 'color 0.2s',
                  '&:hover': { color: '#F5F7FA' },
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
                  transition: 'color 0.2s',
                  '&:hover': { color: '#F5F7FA' },
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
                  transition: 'color 0.2s',
                  '&:hover': { color: '#F5F7FA' },
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
                  transition: 'color 0.2s',
                  '&:hover': { color: '#F5F7FA' },
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
          <Typography sx={{ fontFamily: 'serif', fontSize: '0.7rem', color: '#1E1E28', letterSpacing: '0.15em' }}>
            未来の移動
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
