import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Link } from 'react-router';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { StockBadge } from './StockBadge';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

// Placeholder image shown when a product has no images
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400?text=No+image';

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images.length > 0 ? product.images[0].card : PLACEHOLDER_IMAGE;

  return (
    <Card
      component={Link}
      to={`/products/${product.slug}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': { boxShadow: 4 },
        transition: 'box-shadow 0.2s',
      }}
    >
      <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <CardMedia
          component="img"
          image={imageUrl}
          alt={product.name}
          sx={{ height: 200, objectFit: 'contain', bgcolor: 'grey.50' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 0.5,
            }}
          >
            {product.name}
          </Typography>

          {product.category && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {product.category.name}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="h6" color="primary" fontWeight={700}>
              {formatCurrency(product.price)}
            </Typography>
            <StockBadge inStock={product.in_stock} />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
