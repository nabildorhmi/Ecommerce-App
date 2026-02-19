import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { Link } from 'react-router';

/**
 * MiraiTech Footer — dark, minimal, Japanese-inspired.
 */
export function Footer() {
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
          <Grid size={{ xs: 12, md: 4 }}>
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
              The future of urban mobility. Premium electric scooters engineered for performance and style.
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
          <Grid size={{ xs: 6, md: 2 }}>
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
              Products
            </Typography>
            <Stack spacing={1}>
              {['All Scooters', 'Urban Scooters', 'Off-Road', 'Long Range', 'Accessories'].map((item) => (
                <Box
                  key={item}
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
                  {item}
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Company Column */}
          <Grid size={{ xs: 6, md: 2 }}>
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
              Company
            </Typography>
            <Stack spacing={1}>
              {['About', 'Technology', 'Sustainability', 'Careers', 'Contact'].map((item) => (
                <Box
                  key={item}
                  component="span"
                  sx={{
                    fontSize: '0.82rem',
                    color: '#9CA3AF',
                    cursor: 'default',
                  }}
                >
                  {item}
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Technology highlight */}
          <Grid size={{ xs: 12, md: 4 }}>
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
              Technology
            </Typography>
            <Grid container spacing={1}>
              {[
                { label: 'Long Range Battery', sub: 'Up to 80km' },
                { label: 'Smart Display', sub: 'Connected app' },
                { label: 'Regen Braking', sub: 'Energy recovery' },
                { label: 'App Control', sub: 'iOS & Android' },
              ].map(({ label, sub }) => (
                <Grid key={label} size={{ xs: 6 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '6px',
                      border: '1px solid #1E1E28',
                      backgroundColor: '#111116',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#F5F7FA', mb: 0.25 }}>
                      {label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF' }}>
                      {sub}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: '#1E1E28', mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
            © {new Date().getFullYear()} MiraiTech. All rights reserved.
          </Typography>
          <Typography sx={{ fontFamily: 'serif', fontSize: '0.7rem', color: '#1E1E28', letterSpacing: '0.15em' }}>
            未来の移動
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
