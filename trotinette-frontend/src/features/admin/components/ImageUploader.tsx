import { useRef, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import type { ProductImage } from '../types';

const MAX_IMAGES = 10;

interface NewFile {
  file: File;
  previewUrl: string;
}

interface ImageUploaderProps {
  existingImages: ProductImage[];
  onNewFiles: (files: File[]) => void;
  onDeleteImage: (mediaId: number) => void;
}

export function ImageUploader({
  existingImages,
  onNewFiles,
  onDeleteImage,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [newFiles, setNewFiles] = useState<NewFile[]>([]);

  const totalCount = existingImages.length + newFiles.length;
  const remaining = MAX_IMAGES - totalCount;

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(event.target.files ?? []);
      const allowed = selected.slice(0, remaining);

      const withPreviews: NewFile[] = allowed.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      setNewFiles((prev) => {
        const updated = [...prev, ...withPreviews];
        onNewFiles(updated.map((nf) => nf.file));
        return updated;
      });

      // Reset input so same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = '';
    },
    [remaining, onNewFiles]
  );

  const handleRemoveNew = useCallback(
    (index: number) => {
      setNewFiles((prev) => {
        const copy = [...prev];
        URL.revokeObjectURL(copy[index].previewUrl);
        copy.splice(index, 1);
        onNewFiles(copy.map((nf) => nf.file));
        return copy;
      });
    },
    [onNewFiles]
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={() => inputRef.current?.click()}
          disabled={remaining <= 0}
        >
          Télécharger des images / Upload images
        </Button>
        <Chip
          label={`${totalCount} / ${MAX_IMAGES}`}
          color={totalCount >= MAX_IMAGES ? 'error' : 'default'}
          size="small"
        />
      </Box>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Existing images from the server */}
      {existingImages.length > 0 && (
        <Box mb={2}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Images existantes
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
            {existingImages.map((img) => (
              <Box
                key={img.id}
                position="relative"
                width={80}
                height={80}
                borderRadius={1}
                overflow="hidden"
                border="1px solid"
                borderColor="divider"
              >
                <img
                  src={img.thumbnail_url || img.url}
                  alt={img.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => onDeleteImage(img.id)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '2px',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* New files (local preview only) */}
      {newFiles.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Nouvelles images / New images
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
            {newFiles.map((nf, index) => (
              <Box
                key={nf.previewUrl}
                position="relative"
                width={80}
                height={80}
                borderRadius={1}
                overflow="hidden"
                border="1px solid"
                borderColor="primary.main"
              >
                <img
                  src={nf.previewUrl}
                  alt={nf.file.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveNew(index)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '2px',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
