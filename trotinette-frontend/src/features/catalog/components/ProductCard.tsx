import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { Link } from 'react-router';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/111116/00C2FF?text=MiraiTech';

/**
 * MiraiTech ProductCard — dark card with neon-cyan hover glow.
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
        backgroundColor: '#16161C',
        border: '1px solid #1E1E28',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        '&:hover': {
          borderColor: '#00C2FF',
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 32px rgba(0,194,255,0.15)',
          '& .card-img': {
            transform: 'scale(1.04)',
          },
        },
      }}
    >
      {/* Image */}
      <Box
        sx={{
          position: 'relative',
          backgroundColor: '#111116',
          height: 220,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {product.is_featured && (
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
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              height: 20,
            }}
          />
        )}
        {!product.in_stock && (
          <Chip
            label="Out of Stock"
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
              height: 20,
            }}
          />
        )}
        <Box
          className="card-img"
          component="img"
          src={imageUrl}
          alt={product.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            p: 2,
            transition: 'transform 0.3s ease',
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
              color: '#00C2FF',
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
            color: '#F5F7FA',
            fontSize: '0.9rem',
            mb: 1,
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

        {/* Attributes preview */}
        {product.attributes && (product.attributes.range_km || product.attributes.speed) && (
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            {product.attributes.range_km && (
              <Box sx={{ fontSize: '0.65rem', color: '#9CA3AF', backgroundColor: '#111116', px: 1, py: 0.25, borderRadius: '4px', border: '1px solid #1E1E28' }}>
                {product.attributes.range_km}km
              </Box>
            )}
            {product.attributes.speed && (
              <Box sx={{ fontSize: '0.65rem', color: '#9CA3AF', backgroundColor: '#111116', px: 1, py: 0.25, borderRadius: '4px', border: '1px solid #1E1E28' }}>
                {product.attributes.speed}
              </Box>
            )}
            {product.attributes.motor_power && (
              <Box sx={{ fontSize: '0.65rem', color: '#9CA3AF', backgroundColor: '#111116', px: 1, py: 0.25, borderRadius: '4px', border: '1px solid #1E1E28' }}>
                {product.attributes.motor_power}
              </Box>
            )}
          </Box>
        )}

        {/* Price + stock */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: product.in_stock ? '#00E676' : '#E63946',
                boxShadow: product.in_stock ? '0 0 6px #00E676' : 'none',
              }}
            />
            <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: 500 }}>
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

