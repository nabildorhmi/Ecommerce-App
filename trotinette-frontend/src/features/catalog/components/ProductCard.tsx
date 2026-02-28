import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { Link } from 'react-router';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/111116/00C2FF?text=MiraiTech';

/**
 * MiraiTech ProductCard — premium card with shimmer, quick-view, and price badge.
 */
export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images.length > 0 ? product.images[0].card : PLACEHOLDER_IMAGE;

  return (
    <Box
      component={Link}
      to={`/products/${product.slug}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        textDecoration: 'none',
        backgroundColor: 'background.paper',
        backgroundImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15))',
        border: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '14px',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        position: 'relative',
        /* Shimmer sweep */
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          background: 'linear-gradient(105deg, transparent 40%, rgba(0,194,255,0.04) 45%, rgba(0,194,255,0.08) 50%, rgba(0,194,255,0.04) 55%, transparent 60%)',
          transform: 'translateX(-100%)',
          pointerEvents: 'none',
          zIndex: 2,
        },
        /* Gradient border pseudo */
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: '14px',
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(0,194,255,0.4) 0%, transparent 50%, rgba(0,194,255,0.1) 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        },
        '&:hover': {
          borderColor: 'transparent',
          transform: 'translateY(-8px)',
          boxShadow: '0 16px 40px rgba(0,194,255,0.12), 0 0 0 1px rgba(0,194,255,0.2)',
          '&::before': { opacity: 1 },
          '&::after': { animation: 'shimmer 0.8s ease-out forwards' },
          '& .card-img': {
            transform: 'scale(1.06)',
          },
          '& .quick-view-overlay': {
            opacity: 1,
          },
        },
      }}
    >
      {/* Image */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: 'action.hover',
          aspectRatio: '1 / 1',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Left-side badges (Vedette, PROMO, NOUVEAU) */}
        <Stack
          spacing={0.5}
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1,
          }}
        >
          {product.is_featured && (
            <Chip
              label="Vedette"
              size="small"
              sx={{
                backgroundColor: 'rgba(0,194,255,0.15)',
                color: '#00C2FF',
                border: '1px solid rgba(0,194,255,0.3)',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                height: 22,
                borderRadius: '6px',
              }}
            />
          )}
          {product.is_on_sale && (
            <Chip
              label="PROMO"
              size="small"
              sx={{
                backgroundColor: 'rgba(255,107,53,0.15)',
                color: '#FF6B35',
                border: '1px solid rgba(255,107,53,0.3)',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                height: 22,
                borderRadius: '6px',
              }}
            />
          )}
          {product.is_new && (
            <Chip
              label="NOUVEAU"
              size="small"
              sx={{
                backgroundColor: 'rgba(0,200,83,0.15)',
                color: '#00C853',
                border: '1px solid rgba(0,200,83,0.3)',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                height: 22,
                borderRadius: '6px',
              }}
            />
          )}
        </Stack>
        {!product.in_stock && (
          <Chip
            label="Rupture de stock"
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 1,
              backgroundColor: 'rgba(230,57,70,0.15)',
              color: '#E63946',
              border: '1px solid rgba(230,57,70,0.3)',
              fontSize: '0.6rem',
              fontWeight: 700,
              height: 22,
              borderRadius: '6px',
            }}
          />
        )}
        {/* Vignette Overlay */}
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 30%, rgba(11,11,14,0.5) 110%)', pointerEvents: 'none', zIndex: 0 }} />
        {/* Quick-view overlay */}
        <Box className="quick-view-overlay" sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,194,255,0.15), transparent 60%)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pb: 2,
          opacity: 0, transition: 'opacity 0.3s ease', zIndex: 1
        }}>
          <Typography sx={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em',
            color: '#F5F7FA', textTransform: 'uppercase',
            bgcolor: 'rgba(0,194,255,0.2)', backdropFilter: 'blur(8px)',
            px: 2, py: 0.5, borderRadius: '6px',
            border: '1px solid rgba(0,194,255,0.3)'
          }}>
            VOIR LE PRODUIT
          </Typography>
        </Box>
        <Box
          className="card-img"
          sx={{
            width: '100%',
            height: '100%',
            backgroundImage: `url("${imageUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {product.category && (
          <Typography
            sx={{
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: 'primary.main',
              textTransform: 'uppercase',
              fontWeight: 600,
              mb: 0.75,
            }}
          >
            {product.category.name}
          </Typography>
        )}

        <Typography
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: '0.92rem',
            mb: 1.5,
            flex: 1,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.45,
          }}
        >
          {product.name}
        </Typography>

        {/* Attributes preview — show first 3 attributes as chips */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            {Object.entries(product.attributes).slice(0, 3).map(([, value]) => (
              <Box key={String(value)} sx={{ fontSize: '0.65rem', color: 'text.secondary', bgcolor: 'action.hover', px: 1, py: 0.25, borderRadius: '4px', border: '1px solid', borderColor: 'divider' }}>
                {String(value)}
              </Box>
            ))}
          </Box>
        )}

        {/* Price + stock */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          {/* Price badge */}
          {product.is_on_sale && product.default_variant?.promo_price != null ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              <Typography
                sx={{
                  fontSize: '0.68rem',
                  color: 'text.disabled',
                  textDecoration: 'line-through',
                  fontWeight: 500,
                }}
              >
                {formatCurrency(product.price)}
              </Typography>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center',
                bgcolor: 'rgba(255,107,53,0.08)',
                border: '1px solid rgba(255,107,53,0.2)',
                borderRadius: '8px', px: 1.25, py: 0.4,
              }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: '#FF6B35',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {formatCurrency(product.default_variant.promo_price)}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{
              display: 'inline-flex', alignItems: 'center',
              bgcolor: 'rgba(0,194,255,0.08)',
              border: '1px solid rgba(0,194,255,0.2)',
              borderRadius: '8px', px: 1.25, py: 0.4,
            }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: '#00C2FF',
                  letterSpacing: '-0.02em',
                }}
              >
                {formatCurrency(product.price)}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: product.in_stock ? '#00C853' : '#E63946',
                boxShadow: product.in_stock ? '0 0 8px #00C853' : 'none',
                animation: product.in_stock ? 'pulse-dot 2s ease infinite' : 'none',
              }}
            />
            <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', fontWeight: 500 }}>
              {product.in_stock ? 'En stock' : 'Épuisé'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
