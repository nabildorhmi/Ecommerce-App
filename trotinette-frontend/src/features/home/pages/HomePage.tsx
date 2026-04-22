import { useRef } from 'react';
import { Link } from 'react-router';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { motion } from 'framer-motion';

import { useFeaturedProducts, useProducts } from '../../catalog/api/products';
import { ProductCard } from '../../catalog/components/ProductCard';
import { HeroSection } from '../components/HeroSection';
import { TrustBadgesSection } from '../components/TrustBadgesSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { WhyChooseUsSection } from '../components/WhyChooseUsSection';
import { AnimatedSection } from '@/shared/components/AnimatedSection';
import { useSiteSettings } from '@/shared/hooks/useSiteSettings';
import type { Product } from '../../catalog/types';

/* ════════════════════════════════════════════════════════════════════
   SECTION HEADER
   ════════════════════════════════════════════════════════════════════ */
interface SectionHeaderProps {
  subLabel: string;
  title: string;
  linkText?: string;
  linkTo?: string;
  onPrev?: () => void;
  onNext?: () => void;
}

function SectionHeader({ subLabel, title, linkText, linkTo, onPrev, onNext }: SectionHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6, mt: { xs: 6, md: 10 } }}>
      <Box>
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#00C2FF',
            textTransform: 'uppercase',
            mb: 1,
            fontFamily: '"Orbitron", sans-serif'
          }}
        >
          {subLabel}
        </Typography>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.6rem', md: '2.2rem' },
            color: '#E8ECF2',
            letterSpacing: '0.02em',
            lineHeight: 1,
            textTransform: 'uppercase',
            fontFamily: '"Orbitron", sans-serif'
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {linkText && linkTo && (
          <Button
            component={Link}
            to={linkTo}
            endIcon={<ArrowForwardIcon sx={{ fontSize: '1rem' }} />}
            sx={{
              color: '#00C2FF',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { background: 'transparent', color: '#E8ECF2' },
              p: 0,
              minWidth: 'auto',
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          >
            {linkText}
          </Button>
        )}
        {(onPrev || onNext) && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={onPrev} sx={{ border: '1px solid rgba(0,194,255,0.2)', color: '#00C2FF', '&:hover': { bgcolor: 'rgba(0,194,255,0.1)' } }}>
              <KeyboardArrowLeftIcon />
            </IconButton>
            <IconButton onClick={onNext} sx={{ border: '1px solid rgba(0,194,255,0.2)', color: '#00C2FF', '&:hover': { bgcolor: 'rgba(0,194,255,0.1)' } }}>
              <KeyboardArrowRightIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ════════════════════════════════════════════════════════════════════
   PRODUCT CAROUSEL — Shared for Featured & Nouveautés
   ════════════════════════════════════════════════════════════════════ */
interface ProductCarouselProps {
  subLabel: string;
  title: string;
  linkTo: string;
  products: Product[];
  isLoading: boolean;
}

function ProductCarouselSection({ subLabel, title, linkTo, products, isLoading }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!isLoading && products.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -350 : 350, behavior: 'smooth' });
  };

  return (
    <AnimatedSection>
      <Box component="section" sx={{ bgcolor: '#0c0c14', pt: { xs: 4, md: 6 }, pb: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Container maxWidth="xl">
          <SectionHeader
            subLabel={subLabel}
            title={title}
            linkText="Tout voir >"
            linkTo={linkTo}
            onPrev={() => scroll('left')}
            onNext={() => scroll('right')}
          />
          {isLoading ? (
            <Box sx={{ display: 'flex', gap: 3, pb: 2 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ flexShrink: 0, width: { xs: 280, sm: 300, md: 320 } }}>
                  <Skeleton variant="rectangular" height={280} sx={{ borderRadius: '16px', mb: 2 }} />
                  <Skeleton height={24} sx={{ mb: 1 }} />
                  <Skeleton height={20} width="60%" />
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              ref={scrollRef}
              sx={{
                display: 'flex', gap: 3, overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                pb: 2,
              }}
            >
              {products.map((product) => (
                <Box key={product.id} sx={{ flexShrink: 0, width: { xs: 280, sm: 300, md: 320 }, scrollSnapAlign: 'start' }}>
                  <ProductCard product={product} />
                </Box>
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </AnimatedSection>
  );
}

/* ════════════════════════════════════════════════════════════════════
   FEATURED SECTION
   ════════════════════════════════════════════════════════════════════ */
function FeaturedSection() {
  const { data, isLoading } = useFeaturedProducts();
  const products = data?.data ?? [];

  return (
    <ProductCarouselSection
      subLabel="SÉLECTION"
      title="NOS MEILLEURES VENTES"
      linkTo="/products"
      products={products}
      isLoading={isLoading}
    />
  );
}

/* ════════════════════════════════════════════════════════════════════
   NOUVEAUTÉS SECTION
   ════════════════════════════════════════════════════════════════════ */
function NouveauteSection() {
  const { data, isLoading } = useProducts({ 'filter[is_new]': '1', per_page: 8 });
  const products = data?.data ?? [];

  return (
    <ProductCarouselSection
      subLabel="NOUVELLE COLLECTION"
      title="NOS DERNIERS MODÈLES"
      linkTo="/products?filter[is_new]=1"
      products={products}
      isLoading={isLoading}
    />
  );
}

/* ════════════════════════════════════════════════════════════════════
   PROMO BANNER SECTION — dynamic from real sales
   ════════════════════════════════════════════════════════════════════ */
const MANUAL_PROMO_HEADLINE: string | null = null;

function PromoSection() {
  const { data, isLoading } = useProducts({ 'filter[is_on_sale]': '1', per_page: 24 });
  const { data: siteSettings } = useSiteSettings();
  const saleProducts = data?.data ?? [];
  const manualHeadlineFromEnv = (import.meta.env.VITE_HOME_PROMO_HEADLINE as string | undefined)?.trim();
  const manualHeadlineFromCms = siteSettings?.home_promo_headline?.trim();

  if (!isLoading && saleProducts.length === 0) {
    return null;
  }

  const biggestDiscount = saleProducts.reduce((max, product) => {
    const fromField = product.discount_percentage ?? 0;
    const fromPrice =
      product.promo_price != null && product.price > 0
        ? Math.round((1 - product.promo_price / product.price) * 100)
        : 0;
    return Math.max(max, fromField, fromPrice);
  }, 0);

  const headline =
    (manualHeadlineFromCms || manualHeadlineFromEnv || MANUAL_PROMO_HEADLINE)
    ?? (biggestDiscount > 0 ? `JUSQU'A -${biggestDiscount}%` : 'OFFRES SPECIALES');

  return (
    <AnimatedSection>
      <Box component="section" sx={{ bgcolor: '#0c0c14', pt: 4, pb: 8 }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 4,
              p: { xs: 4, md: 6 },
              borderRadius: '16px',
              border: '1px solid rgba(217,122,80,0.15)',
              background: 'linear-gradient(135deg, rgba(16,16,20,0.8) 0%, rgba(20,10,12,0.9) 100%)',
              boxShadow: '0 20px 40px rgba(199,64,77,0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle red glow blob */}
            <Box sx={{ position: 'absolute', right: -100, top: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(199,64,77,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <Box sx={{ flex: 1, zIndex: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', color: '#C7404D', textTransform: 'uppercase', mb: 1.5 }}>
                OFFRES EN COURS
              </Typography>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1,
                  mb: 2,
                  color: '#E8ECF2',
                  fontFamily: '"Orbitron", sans-serif',
                  textTransform: 'uppercase',
                }}
              >
                <Box component="span" sx={{ color: '#00C2FF' }}>
                  {headline}
                </Box>
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', color: '#8A919D', maxWidth: 450, lineHeight: 1.6, mb: 3 }}>
                Profitez des meilleures reductions disponibles actuellement sur notre catalogue.
              </Typography>
            </Box>

            <Box sx={{ flexShrink: 0, zIndex: 1 }}>
              <Button
                component={Link}
                to="/products?filter[is_on_sale]=1"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: 4, py: 1.75, fontSize: '0.9rem',
                  bgcolor: '#C7404D',
                  color: '#fff', fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(199,64,77,0.3)',
                  '&:hover': {
                    bgcolor: '#D44E5A',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(199,64,77,0.4)',
                  }
                }}
              >
                VOIR LES PROMOS
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </AnimatedSection>
  );
}

/* ════════════════════════════════════════════════════════════════════
   FOOTER CTA — with dot grid background and pulse-glow
   ════════════════════════════════════════════════════════════════════ */
function FooterCTA() {
  return (
    <AnimatedSection>
      <Box component="section" sx={{
        bgcolor: '#0c0c14', pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 12 },
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Dot grid pattern */}
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(0,194,255,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 50% 60% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 50% 60% at 50% 50%, black 30%, transparent 100%)',
        }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', mb: 2, fontFamily: '"Noto Serif JP", serif', letterSpacing: '0.4em' }}>
            未来テック
          </Typography>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '3.5rem' },
              color: '#E8ECF2',
              letterSpacing: '0.02em',
              lineHeight: 1.1,
              mb: 3,
              textTransform: 'uppercase',
              fontFamily: '"Orbitron", sans-serif'
            }}
          >
            REJOIGNEZ <Box component="span" sx={{ color: '#00C2FF', textShadow: '0 0 16px rgba(0,194,255,0.2)' }}>500+ PROPRIÉTAIRES</Box>
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: '#8A919D', maxWidth: 600, mx: 'auto', mb: 2, lineHeight: 1.6 }}>
            Garantie 2 ans, livraison express, retour 30 jours. Zéro risque, que du plaisir.
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#D4A43A', fontWeight: 600, mb: 5 }}>
            Livraison gratuite dès 2000 MAD — Offre en cours
          </Typography>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ display: 'inline-block' }}
          >
            <Button
              component={Link}
              to="/products"
              variant="contained"
              size="large"
              sx={{
                px: 5, py: 1.75, fontSize: '0.95rem',
                bgcolor: '#00C2FF',
                color: '#0c0c14', fontWeight: 800,
                boxShadow: '0 4px 14px rgba(0,194,255,0.25)',
                animation: 'pulse-glow 3s ease-in-out infinite',
                '&:hover': {
                  bgcolor: '#33CFFF',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,194,255,0.35)',
                }
              }}
            >
              TROUVER MON MODÈLE
            </Button>
          </motion.div>
        </Container>
      </Box>
    </AnimatedSection>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN HOME PAGE
   ════════════════════════════════════════════════════════════════════ */
export function HomePage() {
  return (
    <Box sx={{ bgcolor: '#0c0c14', minHeight: '100vh' }}>
      <HeroSection />
      <TrustBadgesSection />
      <FeaturedSection />
      <NouveauteSection />
      <WhyChooseUsSection />
      <PromoSection />
      <TestimonialsSection />
      <FooterCTA />
    </Box>
  );
}
