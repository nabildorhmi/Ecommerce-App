import { useRef } from 'react';
import { Link } from 'react-router';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import BoltIcon from '@mui/icons-material/Bolt';
import SpeedIcon from '@mui/icons-material/Speed';
import WifiIcon from '@mui/icons-material/Wifi';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import { useFeaturedProducts } from '../../catalog/api/products';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

// ─── Hero Section ───────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Box
      component="section"
      className="mirai-scanlines"
      sx={{
        position: 'relative',
        minHeight: { xs: '88vh', md: '92vh' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#0B0B0E',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '20%',
          left: '50%',
          width: '80vw',
          height: '80vw',
          maxWidth: 900,
          maxHeight: 900,
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(ellipse, rgba(0,194,255,0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background:
            'linear-gradient(to top, #0B0B0E 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        },
      }}
    >
      {/* Glow accent lines */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          right: '8%',
          width: 2,
          height: '30%',
          background: 'linear-gradient(to bottom, transparent, #00C2FF, transparent)',
          opacity: 0.35,
          display: { xs: 'none', md: 'block' },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '55%',
          right: '15%',
          width: 80,
          height: 2,
          background: 'linear-gradient(to right, transparent, #00C2FF)',
          opacity: 0.3,
          display: { xs: 'none', md: 'block' },
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container alignItems="center" spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Japanese katakana accent */}
            <Typography
              sx={{
                fontSize: '0.68rem',
                letterSpacing: '0.3em',
                color: '#00C2FF',
                textTransform: 'uppercase',
                fontWeight: 600,
                mb: 3,
                opacity: 0.8,
              }}
            >
              ミライテック — ELECTRIC MOBILITY
            </Typography>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.8rem', sm: '3.8rem', md: '4.8rem', lg: '5.5rem' },
                lineHeight: 0.95,
                color: '#F5F7FA',
                mb: 2,
              }}
            >
              THE FUTURE
              <Box
                component="span"
                sx={{
                  display: 'block',
                  WebkitTextStroke: '2px #00C2FF',
                  color: 'transparent',
                  textShadow: '0 0 40px rgba(0,194,255,0.3)',
                }}
              >
                OF URBAN
              </Box>
              MOBILITY
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: '#9CA3AF',
                fontWeight: 400,
                mb: 4,
                fontSize: { xs: '1rem', md: '1.15rem' },
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Power.&nbsp;&nbsp;Silence.&nbsp;&nbsp;Technology.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                component={Link}
                to="/products"
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '0.85rem',
                  letterSpacing: '0.1em',
                }}
              >
                Explore Scooters
              </Button>
              <Button
                component={Link}
                to="/products"
                variant="outlined"
                size="large"
                sx={{ px: 4, py: 1.5, fontSize: '0.85rem', letterSpacing: '0.1em' }}
              >
                Compare Models
              </Button>
            </Stack>

            {/* Stats */}
            <Stack direction="row" spacing={4} sx={{ mt: 6 }}>
              {[
                { value: '80km', label: 'Max Range' },
                { value: '45km/h', label: 'Top Speed' },
                { value: '500W', label: 'Motor Power' },
              ].map(({ value, label }) => (
                <Box key={label}>
                  <Typography
                    sx={{
                      fontSize: { xs: '1.5rem', md: '1.8rem' },
                      fontWeight: 800,
                      color: '#00C2FF',
                      lineHeight: 1,
                    }}
                  >
                    {value}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', mt: 0.5 }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Hero visual */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 500,
              }}
            >
              {/* Circular glow backdrop */}
              <Box
                sx={{
                  position: 'absolute',
                  width: 480,
                  height: 480,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0,194,255,0.08) 0%, transparent 70%)',
                  border: '1px solid rgba(0,194,255,0.08)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  width: 360,
                  height: 360,
                  borderRadius: '50%',
                  border: '1px solid rgba(0,194,255,0.06)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  width: 240,
                  height: 240,
                  borderRadius: '50%',
                  border: '1px solid rgba(0,194,255,0.1)',
                }}
              />
              {/* Scooter icon placeholder — replace with real product image */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  width: 320,
                  height: 320,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BoltIcon
                  sx={{
                    fontSize: 120,
                    color: '#00C2FF',
                    opacity: 0.15,
                    filter: 'blur(2px)',
                  }}
                />
              </Box>
              {/* Tech badges */}
              {[
                { label: 'Smart App', sub: 'Connected', top: '15%', left: '5%' },
                { label: '500W Motor', sub: 'Brushless', top: '60%', left: '0%' },
                { label: '80km Range', sub: 'Single charge', top: '20%', right: '0%' },
              ].map(({ label, sub, ...pos }) => (
                <Box
                  key={label}
                  sx={{
                    position: 'absolute',
                    ...pos,
                    backgroundColor: 'rgba(17,17,22,0.9)',
                    border: '1px solid #1E1E28',
                    borderRadius: '6px',
                    p: 1.5,
                    minWidth: 110,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#F5F7FA' }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{sub}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// ─── Featured Products Carousel ─────────────────────────────────────────────

function FeaturedCarousel() {
  const { data, isLoading } = useFeaturedProducts();
  const scrollRef = useRef<HTMLDivElement>(null);

  const products = data?.data ?? [];

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#0B0B0E' }}>
      <Container maxWidth="xl">
        {/* Section header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.68rem',
                letterSpacing: '0.3em',
                color: '#00C2FF',
                fontWeight: 600,
                mb: 1,
                textTransform: 'uppercase',
              }}
            >
              精選モデル — HANDPICKED
            </Typography>
            <Typography variant="h3" sx={{ color: '#F5F7FA', fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              Featured Models
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <IconButton
              onClick={() => scroll('left')}
              size="small"
              sx={{
                border: '1px solid #1E1E28',
                color: '#9CA3AF',
                '&:hover': { borderColor: '#00C2FF', color: '#00C2FF', backgroundColor: 'rgba(0,194,255,0.08)' },
              }}
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <IconButton
              onClick={() => scroll('right')}
              size="small"
              sx={{
                border: '1px solid #1E1E28',
                color: '#9CA3AF',
                '&:hover': { borderColor: '#00C2FF', color: '#00C2FF', backgroundColor: 'rgba(0,194,255,0.08)' },
              }}
            >
              <KeyboardArrowRightIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Scrollable row */}
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            pb: 1,
          }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ flexShrink: 0, width: { xs: 260, md: 300 } }}>
                  <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '6px', bgcolor: '#111116' }} />
                  <Skeleton height={28} sx={{ mt: 2, bgcolor: '#111116' }} />
                  <Skeleton height={20} width="60%" sx={{ bgcolor: '#111116' }} />
                </Box>
              ))
            : products.map((product) => {
                const PLACEHOLDER = 'https://placehold.co/600x400/111116/00C2FF?text=MiraiTech';
                const imageUrl = product.images.length > 0 ? product.images[0].card : PLACEHOLDER;
                return (
                  <Box
                    key={product.id}
                    component={Link}
                    to={`/products/${product.slug}`}
                    sx={{
                      flexShrink: 0,
                      width: { xs: 260, md: 300 },
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: '#16161C',
                      border: '1px solid #1E1E28',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: '#00C2FF',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 32px rgba(0,194,255,0.15)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        backgroundColor: '#111116',
                        overflow: 'hidden',
                        height: 220,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Badge */}
                      {product.attributes && (
                        <Chip
                          label="Featured"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            zIndex: 1,
                            backgroundColor: 'rgba(0,194,255,0.15)',
                            color: '#00C2FF',
                            border: '1px solid rgba(0,194,255,0.3)',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            height: 22,
                          }}
                        />
                      )}
                      <Box
                        component="img"
                        src={imageUrl}
                        alt={product.name}
                        sx={{ height: '100%', width: '100%', objectFit: 'contain', p: 2 }}
                      />
                    </Box>

                    <Box sx={{ p: 2 }}>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: '#9CA3AF',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          mb: 0.5,
                        }}
                      >
                        {product.category?.name ?? 'Scooter'}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: '#F5F7FA',
                          fontSize: '0.95rem',
                          mb: 1,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.4,
                        }}
                      >
                        {product.name}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            color: '#00C2FF',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {formatCurrency(product.price)}
                        </Typography>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: product.in_stock ? '#00E676' : '#E63946',
                            boxShadow: product.in_stock ? '0 0 8px #00E676' : 'none',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                );
              })}
        </Box>

        {/* View all CTA */}
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Button
            component={Link}
            to="/products"
            variant="outlined"
            sx={{ px: 5, py: 1.25, fontSize: '0.78rem', letterSpacing: '0.1em' }}
          >
            View All Models
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

// ─── Technology Section ──────────────────────────────────────────────────────

function TechnologySection() {
  const features = [
    {
      icon: <BatteryChargingFullIcon sx={{ fontSize: 36, color: '#00C2FF' }} />,
      title: 'Long-Range Battery',
      sub: 'Up to 80km on a single charge. Lithium-ion cells with thermal management.',
      value: '80km',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 36, color: '#00C2FF' }} />,
      title: 'Smart Display',
      sub: 'Full-color HUD with speed, range, riding mode, and battery info.',
      value: 'HUD',
    },
    {
      icon: <BoltIcon sx={{ fontSize: 36, color: '#00C2FF' }} />,
      title: 'Regenerative Braking',
      sub: 'Kinetic energy recovery system extends range by up to 15%.',
      value: '+15%',
    },
    {
      icon: <WifiIcon sx={{ fontSize: 36, color: '#00C2FF' }} />,
      title: 'App Connectivity',
      sub: 'Control, monitor, and lock your scooter from the MiraiTech app.',
      value: 'BLE',
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: '#111116',
        borderTop: '1px solid #1E1E28',
        borderBottom: '1px solid #1E1E28',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography
            sx={{
              fontSize: '0.68rem',
              letterSpacing: '0.3em',
              color: '#00C2FF',
              fontWeight: 600,
              mb: 1.5,
              textTransform: 'uppercase',
            }}
          >
            テクノロジー — INNOVATION
          </Typography>
          <Typography variant="h2" sx={{ color: '#F5F7FA', fontSize: { xs: '1.8rem', md: '2.6rem' } }}>
            Built with Purpose
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {features.map(({ icon, title, sub, value }) => (
            <Grid key={title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  backgroundColor: '#16161C',
                  border: '1px solid #1E1E28',
                  borderRadius: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: 'rgba(0,194,255,0.4)',
                    backgroundColor: '#1A1A22',
                    '&::before': { opacity: 1 },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, #00C2FF, transparent)',
                    opacity: 0,
                    transition: 'opacity 0.25s ease',
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>{icon}</Box>

                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '2rem',
                    color: 'rgba(0,194,255,0.12)',
                    position: 'absolute',
                    top: 12,
                    right: 16,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                  }}
                >
                  {value}
                </Typography>

                <Typography sx={{ fontWeight: 700, color: '#F5F7FA', mb: 1, fontSize: '1rem' }}>
                  {title}
                </Typography>
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem', lineHeight: 1.6 }}>
                  {sub}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

// ─── Why MiraiTech Section ───────────────────────────────────────────────────

function WhySection() {
  const statements = [
    { label: '設計', en: 'Designed for the Future', desc: 'Every curve, every component engineered for tomorrow.' },
    { label: '都市', en: 'Built for Cities', desc: 'Nimble, efficient, and powerful in urban environments.' },
    { label: '革新', en: 'Powered by Innovation', desc: 'Cutting-edge technology in a minimal form factor.' },
    { label: '品質', en: 'Premium Quality', desc: 'Materials and craftsmanship that stand the test of time.' },
  ];

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#0B0B0E' }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: { xs: 5, md: 8 } }}>
          <Typography
            sx={{
              fontSize: '0.68rem',
              letterSpacing: '0.3em',
              color: '#00C2FF',
              fontWeight: 600,
              mb: 1.5,
              textTransform: 'uppercase',
            }}
          >
            なぜ — WHY MIRAITECH
          </Typography>
          <Typography variant="h2" sx={{ color: '#F5F7FA', maxWidth: 480, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            The Standard of Electric Mobility
          </Typography>
        </Box>

        <Box>
          {statements.map(({ label, en, desc }, idx) => (
            <Box
              key={en}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: { xs: 2, md: 4 },
                py: { xs: 2.5, md: 3.5 },
                borderTop: idx === 0 ? '1px solid #1E1E28' : 'none',
                borderBottom: '1px solid #1E1E28',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0,194,255,0.02)',
                  '& .mirai-label': { color: '#00C2FF' },
                },
              }}
            >
              {/* Japanese label */}
              <Typography
                className="mirai-label"
                sx={{
                  fontFamily: 'serif',
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  color: '#1E1E28',
                  fontWeight: 900,
                  lineHeight: 1,
                  minWidth: { xs: 40, md: 60 },
                  transition: 'color 0.2s ease',
                }}
              >
                {label}
              </Typography>

              {/* Vertical separator */}
              <Box sx={{ width: 1, alignSelf: 'stretch', backgroundColor: '#1E1E28', flexShrink: 0 }} />

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, color: '#F5F7FA', fontSize: { xs: '1rem', md: '1.2rem' }, mb: 0.75, letterSpacing: '0.04em' }}>
                  {en}
                </Typography>
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: 480 }}>
                  {desc}
                </Typography>
              </Box>

              {/* Counter */}
              <Typography
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 900,
                  color: 'rgba(0,194,255,0.06)',
                  lineHeight: 1,
                  display: { xs: 'none', sm: 'block' },
                  letterSpacing: '-0.04em',
                }}
              >
                {String(idx + 1).padStart(2, '0')}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

// ─── Main HomePage ───────────────────────────────────────────────────────────

export function HomePage() {
  return (
    <Box>
      <HeroSection />
      <FeaturedCarousel />
      <TechnologySection />
      <WhySection />
    </Box>
  );
}
