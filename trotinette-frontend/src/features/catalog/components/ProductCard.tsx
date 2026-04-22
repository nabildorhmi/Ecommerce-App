import { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/111116/00C2FF?text=MiraiTech';

/**
 * MiraiTech ProductCard — clean card matching lovable neo-zen style with
 * hover overlay, image zoom, glow border, and badges.
 */
export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images.length > 0 ? product.images[0].card : PLACEHOLDER_IMAGE;
  const stockQty = product.stock_quantity ?? 0;
  const isLowStock = product.in_stock && stockQty > 0 && stockQty <= 5;

  // Calculate discount percentage
  const discountPercent = product.is_on_sale && product.default_variant?.promo_price != null
    ? Math.round((1 - product.default_variant.promo_price / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{ height: '100%' }}
    >
      <Box
        component={Link}
        to={`/products/${product.slug}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          textDecoration: 'none',
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(19, 22, 35, 0.6)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'rgba(0, 194, 255, 0.3)',
            boxShadow: '0 0 20px rgba(0,194,255,0.12), 0 0 48px rgba(0,194,255,0.04)',
            '& .card-img': { transform: 'scale(1.1)' },
            '& .hover-overlay': { opacity: 1 },
          },
        }}
      >
        {/* Image Container */}
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '1 / 1',
            overflow: 'hidden',
            bgcolor: 'rgba(19, 22, 35, 0.3)',
          }}
        >
          {/* Product Image */}
          <Box
            component="img"
            className="card-img"
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              transition: 'transform 0.5s ease',
            }}
          />

          {/* Badges — top left */}
          <Stack spacing={0.5} sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
            {product.is_new && (
              <Chip
                label="NEW"
                size="small"
                sx={{
                  bgcolor: '#00C2FF',
                  color: '#0c0c14',
                  fontSize: '0.58rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  height: 22,
                  borderRadius: '4px',
                  fontFamily: '"Orbitron", sans-serif',
                }}
              />
            )}
            {product.is_on_sale && (
              <Chip
                label="PROMO"
                size="small"
                sx={{
                  bgcolor: '#C7404D',
                  color: '#fff',
                  fontSize: '0.58rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  height: 22,
                  borderRadius: '4px',
                  fontFamily: '"Orbitron", sans-serif',
                }}
              />
            )}
          </Stack>

          {/* Discount % badge — top right */}
          {discountPercent > 0 && (
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
              <Chip
                label={`-${discountPercent}%`}
                size="small"
                sx={{
                  bgcolor: 'rgba(199,64,77,0.9)',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  height: 24,
                  borderRadius: '4px',
                  fontFamily: '"Orbitron", sans-serif',
                }}
              />
            </Box>
          )}

          {/* Low stock badge — top right below discount */}
          {isLowStock && (
            <Box sx={{ position: 'absolute', top: discountPercent > 0 ? 38 : 8, right: 8, zIndex: 2 }}>
              <Tooltip title={`Plus que ${stockQty} en stock !`} placement="left">
                <Chip
                  label={`${stockQty} restants`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(212,164,58,0.85)',
                    color: '#0c0c14',
                    fontSize: '0.56rem',
                    fontWeight: 700,
                    height: 20,
                    borderRadius: '4px',
                    cursor: 'help',
                  }}
                />
              </Tooltip>
            </Box>
          )}

          {/* Out of stock overlay */}
          {!product.in_stock && (
            <Box sx={{
              position: 'absolute', inset: 0, zIndex: 3,
              bgcolor: 'rgba(12,12,20,0.6)', backdropFilter: 'blur(2px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography sx={{
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.15em',
                color: '#C7404D', textTransform: 'uppercase',
                fontFamily: '"Orbitron", sans-serif',
              }}>
                Épuisé
              </Typography>
            </Box>
          )}

          {/* Hover overlay with action button */}
          <Box
            className="hover-overlay"
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(12,12,20,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              opacity: 0,
              transition: 'opacity 0.3s ease',
              zIndex: 4,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.15)',
                bgcolor: 'rgba(19,19,27,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E8ECF2',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: '#00C2FF', color: '#0c0c14', borderColor: '#00C2FF' },
              }}
            >
              <VisibilityOutlinedIcon sx={{ fontSize: '1.1rem' }} />
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {/* Category */}
          {product.category && (
            <Typography sx={{
              fontSize: '0.6rem',
              letterSpacing: '0.12em',
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>
              {product.category.name}
            </Typography>
          )}

          {/* Name */}
          <Typography sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: '0.85rem',
            lineHeight: 1.4,
            flex: 1,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {product.name}
          </Typography>

          {/* Price */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto', pt: 0.5 }}>
            <Typography
              sx={{
                fontFamily: '"Orbitron", sans-serif',
                fontWeight: 800,
                fontSize: '0.92rem',
                color: product.is_on_sale ? '#D97A50' : '#00C2FF',
              }}
            >
              {formatCurrency(
                product.is_on_sale && product.default_variant?.promo_price != null
                  ? product.default_variant.promo_price
                  : product.price
              )}
            </Typography>
            {product.is_on_sale && product.default_variant?.promo_price != null && (
              <Typography sx={{
                fontSize: '0.72rem',
                color: 'text.disabled',
                textDecoration: 'line-through',
                fontWeight: 500,
              }}>
                {formatCurrency(product.price)}
              </Typography>
            )}
          </Box>

          <Typography sx={{
            mt: 0.6,
            fontSize: '0.68rem',
            color: 'rgba(0,194,255,0.8)',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Voir details • Acheter
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
});
