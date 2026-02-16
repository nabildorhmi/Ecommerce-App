import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ProductImage } from '../types';

interface ProductGalleryProps {
  images: ProductImage[];
}

/**
 * Image gallery for the product detail page (Pattern 8 from RESEARCH.md).
 * Main image (full-res) + scrollable thumbnail row.
 * No external carousel library — MUI Box/Stack with useState is sufficient.
 */
export function ProductGallery({ images }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: 1,
          color: 'text.disabled',
        }}
      >
        <Typography variant="body2">No image</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Main image — use full conversion for detail page */}
      <Box
        component="img"
        src={images[selected].full}
        alt="Product"
        sx={{
          width: '100%',
          maxHeight: 500,
          objectFit: 'contain',
          bgcolor: 'grey.50',
          borderRadius: 1,
          mb: 1,
          display: 'block',
        }}
        onError={(e) => {
          // Fallback to card URL if full res fails
          const target = e.target as HTMLImageElement;
          if (target.src !== images[selected].card) {
            target.src = images[selected].card;
          }
        }}
      />

      {/* Thumbnail strip — only show if more than one image */}
      {images.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
          {images.map((img, i) => (
            <Box
              key={img.id}
              component="img"
              src={img.thumbnail}
              alt={`Thumbnail ${i + 1}`}
              onClick={() => setSelected(i)}
              sx={{
                width: 80,
                height: 60,
                objectFit: 'cover',
                cursor: 'pointer',
                border: '2px solid',
                borderColor: selected === i ? 'primary.main' : 'transparent',
                borderRadius: 1,
                flexShrink: 0,
                opacity: selected === i ? 1 : 0.65,
                transition: 'opacity 0.15s, border-color 0.15s',
                '&:hover': { opacity: 1 },
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
