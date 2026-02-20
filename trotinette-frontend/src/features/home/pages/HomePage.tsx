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
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ElectricScooterIcon from '@mui/icons-material/ElectricScooter';
import { useFeaturedProducts } from '../../catalog/api/products';
import { useCategories } from '../../catalog/api/categories';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

//  Hero Banner 
function HeroBanner() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0B0B0E 0%, #0d1a24 50%, #0B0B0E 100%)',
        borderBottom: '1px solid #1E1E28',
        overflow: 'hidden',
        py: { xs: 6, md: 0 },
        minHeight: { md: 420 },
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Neon glow blobs */}
      <Box sx={{ position: 'absolute', top: '-10%', right: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,194,255,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: '-20%', left: '5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,153,204,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      {/* Cyan accent line */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #00C2FF 40%, #0099CC 60%, transparent)', opacity: 0.7 }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container alignItems="center" spacing={{ xs: 4, md: 6 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ py: { xs: 0, md: 6 } }}>
              <Typography sx={{ fontSize: '0.68rem', letterSpacing: '0.3em', color: '#00C2FF', fontWeight: 600, mb: 2, textTransform: 'uppercase', opacity: 0.9 }}>
                ミライテック  MOBILITÉ ÉLECTRIQUE
              </Typography>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: '2.4rem', md: '3.6rem', lg: '4.2rem' },
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: '#F5F7FA',
                  mb: 2,
                  textTransform: 'uppercase',
                }}
              >
                L&apos;AVENIR DE LA{' '}
                <Box component="span" sx={{ color: '#00C2FF', textShadow: '0 0 30px rgba(0,194,255,0.4)' }}>
                  MOBILITÉ
                </Box>
                {' '}URBAINE
              </Typography>
              <Typography sx={{ color: '#9CA3AF', fontSize: { xs: '0.95rem', md: '1.05rem' }, mb: 4, lineHeight: 1.7, maxWidth: 480 }}>
                Scooters électriques premium conçus pour la performance, l&apos;autonomie et le style.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button component={Link} to="/products" variant="contained" size="large" sx={{ px: 4, py: 1.5, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
                  Acheter maintenant
                </Button>
                <Button component={Link} to="/products" variant="outlined" size="large" sx={{ px: 4, py: 1.5, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
                  Voir tous les modèles
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Right side visual */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <Box sx={{ position: 'relative', width: 420, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {[340, 260, 180].map((size, i) => (
                <Box key={size} sx={{ position: 'absolute', width: size, height: size, borderRadius: '50%', border: `1px solid rgba(0,194,255,${0.06 + i * 0.02})` }} />
              ))}
              <ElectricScooterIcon sx={{ fontSize: 140, color: '#00C2FF', opacity: 0.18 }} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

//  Categories Strip 
function CategoriesStrip() {
  const { data } = useCategories();
  const categories = data?.data ?? [];

  if (categories.length === 0) return null;

  return (
    <Box component="section" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="xl">
        <Box sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: 'text.secondary', textTransform: 'uppercase', whiteSpace: 'nowrap', mr: 3, flexShrink: 0 }}>
            NOS MODÈLES
          </Typography>
          <Box sx={{ width: 1, height: 24, bgcolor: 'divider', flexShrink: 0, mr: 3 }} />
          {categories.map((cat) => (
            <Button
              key={cat.id}
              component={Link}
              to={`/products?filter[category_id]=${cat.id}`}
              startIcon={<ElectricScooterIcon sx={{ fontSize: '1rem !important' }} />}
              sx={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'text.secondary',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                px: 2,
                py: 1,
                borderRadius: '4px',
                '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
              }}
            >
              {cat.name}
            </Button>
          ))}
          <Box sx={{ ml: 'auto', flexShrink: 0, pl: 2 }}>
            <Button component={Link} to="/products" size="small" sx={{ fontSize: '0.68rem', color: 'primary.main', letterSpacing: '0.08em' }} endIcon={<KeyboardArrowRightIcon fontSize="small" />}>
              TOUT VOIR
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

//  Featured Products Carousel 
function FeaturedSection() {
  const { data, isLoading } = useFeaturedProducts();
  const scrollRef = useRef<HTMLDivElement>(null);
  const products = data?.data ?? [];

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  return (
    <Box component="section" sx={{ bgcolor: 'background.default', py: { xs: 5, md: 7 } }}>
      <Container maxWidth="xl">
        {/* Section header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 4, height: 28, background: 'linear-gradient(to bottom, #00C2FF, #0099CC)', borderRadius: 2 }} />
            <Box>
              <Typography sx={{ fontSize: '0.62rem', letterSpacing: '0.25em', color: 'primary.main', fontWeight: 600, textTransform: 'uppercase', mb: 0.25 }}>
                精選モデル  HANDPICKED
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: 'text.primary', letterSpacing: '-0.01em', lineHeight: 1 }}>
                NOS SCOOTERS EN VEDETTE
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => scroll('left')} size="small" sx={{ border: '1px solid', borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'rgba(0,194,255,0.07)' } }}>
              <KeyboardArrowLeftIcon fontSize="small" />
            </IconButton>
            <IconButton onClick={() => scroll('right')} size="small" sx={{ border: '1px solid', borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'rgba(0,194,255,0.07)' } }}>
              <KeyboardArrowRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Scrollable product cards */}
        <Box
          ref={scrollRef}
          sx={{ display: 'flex', gap: 2, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, pb: 1 }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ flexShrink: 0, width: { xs: 200, sm: 220, md: 240 } }}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '8px', mb: 1.5 }} />
                  <Skeleton height={22} sx={{ mb: 0.5 }} />
                  <Skeleton height={18} width="55%" />
                </Box>
              ))
            : products.length === 0
            ? (
              <Box sx={{ py: 6, textAlign: 'center', width: '100%' }}>
                <ElectricScooterIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                  No featured products yet. Toggle products in the admin panel.
                </Typography>
              </Box>
            )
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
                      width: { xs: 200, sm: 220, md: 240 },
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      transition: 'all 0.22s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 6px 24px rgba(0,194,255,0.15)',
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative', bgcolor: 'action.hover', aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <Chip
                        label="Featured"
                        size="small"
                        sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1, bgcolor: 'rgba(0,194,255,0.14)', color: '#00C2FF', border: '1px solid rgba(0,194,255,0.3)', fontSize: '0.6rem', fontWeight: 700, height: 20 }}
                      />
                      {!product.in_stock && (
                        <Chip
                          label="Rupture"
                          size="small"
                          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: 'rgba(230,57,70,0.14)', color: '#E63946', border: '1px solid rgba(230,57,70,0.3)', fontSize: '0.6rem', fontWeight: 700, height: 20 }}
                        />
                      )}
                      <Box sx={{ height: '100%', width: '100%', backgroundImage: `url("${imageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
                    </Box>
                    <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontSize: '0.65rem', letterSpacing: '0.08em', color: 'primary.main', textTransform: 'uppercase', fontWeight: 600, mb: 0.5 }}>
                        {product.category?.name ?? 'Scooter'}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9rem', mb: 1, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4 }}>
                        {product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'primary.main', letterSpacing: '-0.02em' }}>
                          {formatCurrency(product.price)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: product.in_stock ? '#00C853' : '#E63946', boxShadow: product.in_stock ? '0 0 6px #00C853' : 'none' }} />
                          <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 500 }}>
                            {product.in_stock ? 'En stock' : 'Épuisé'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
        </Box>

        {products.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button component={Link} to="/products" variant="outlined" sx={{ px: 5, py: 1.25, fontSize: '0.78rem', letterSpacing: '0.1em' }}>
              VOIR TOUS LES MODÈLES
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

//  Promo Banners Grid 
function PromoBanners() {
  const banners = [
    { label: 'NOUVELLE COLLECTION', title: 'Scooters Urbains', sub: 'Légèreté et performance', accent: '#00C2FF', bg: 'linear-gradient(135deg, #0d1a24 0%, #0B0B0E 100%)' },
    { label: 'BEST SELLER', title: 'Prix Imbattables', sub: 'Livraison rapide partout au Maroc', accent: '#E63946', bg: 'linear-gradient(135deg, #1a0d0e 0%, #0B0B0E 100%)' },
  ];

  return (
    <Box component="section" sx={{ py: { xs: 3, md: 4 }, bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {banners.map(({ label, title, sub, accent, bg }) => (
            <Box
              key={title}
              component={Link}
              to="/products"
              sx={{
                display: 'block',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '1px solid #1E1E28',
                overflow: 'hidden',
                background: bg,
                p: { xs: 3, md: 4 },
                position: 'relative',
                minHeight: 140,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 28px ${accent}22` },
              }}
            >
              <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${accent}11 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', color: accent, textTransform: 'uppercase', mb: 1 }}>{label}</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#F5F7FA', lineHeight: 1.15, mb: 0.75, textTransform: 'uppercase' }}>{title}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{sub}</Typography>
              <Box sx={{ mt: 2.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Découvrir</Typography>
                <KeyboardArrowRightIcon sx={{ fontSize: '0.9rem', color: accent }} />
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

//  Main HomePage 
export function HomePage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <HeroBanner />
      <CategoriesStrip />
      <FeaturedSection />
      <PromoBanners />
    </Box>
  );
}
