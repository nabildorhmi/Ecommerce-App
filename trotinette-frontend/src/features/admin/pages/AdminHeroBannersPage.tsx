import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import {
  useAdminHeroBanners,
  useCreateHeroBanner,
  useUpdateHeroBanner,
  useDeleteHeroBanner,
  type HeroBanner,
} from '../api/heroBanners';

/* ════════════════════════════════════════════════════════
   Admin Hero Banners Page
   ════════════════════════════════════════════════════════ */
export function AdminHeroBannersPage() {
  const { data, isLoading } = useAdminHeroBanners();
  const banners = data?.data ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HeroBanner | null>(null);

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (banner: HeroBanner) => {
    setEditing(banner);
    setDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Hero Banners
        </Typography>
        <Button variant="contained" startIcon={<AddPhotoAlternateIcon />} onClick={handleAdd}>
          Ajouter un banner
        </Button>
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : banners.length === 0 ? (
        <Alert severity="info">Aucun banner. Ajoutez-en un pour le carousel hero.</Alert>
      ) : (
        <Grid container spacing={3}>
          {banners.map((banner) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={banner.id}>
              <BannerCard banner={banner} onEdit={() => handleEdit(banner)} />
            </Grid>
          ))}
        </Grid>
      )}

      <BannerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        banner={editing}
      />
    </Container>
  );
}

/* ── Banner card ──────────────────────────────────────── */
function BannerCard({ banner, onEdit }: { banner: HeroBanner; onEdit: () => void }) {
  const deleteMutation = useDeleteHeroBanner();

  const handleDelete = () => {
    if (confirm('Supprimer ce banner ?')) {
      deleteMutation.mutate(banner.id);
    }
  };

  return (
    <Card sx={{ position: 'relative', opacity: banner.is_active ? 1 : 0.5 }}>
      {banner.image ? (
        <CardMedia
          component="img"
          height={180}
          image={banner.image.hero}
          alt={banner.title ?? 'Hero banner'}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box sx={{ height: 180, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">Pas d'image</Typography>
        </Box>
      )}
      <CardContent sx={{ pb: 0.5 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {banner.title || '(sans titre)'}
        </Typography>
        {banner.subtitle && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {banner.subtitle}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          Ordre : {banner.sort_order} &middot; {banner.is_active ? 'Actif' : 'Inactif'}
        </Typography>
      </CardContent>
      <CardActions>
        <IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton>
        <IconButton size="small" color="error" onClick={handleDelete} disabled={deleteMutation.isPending}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
}

/* ── Create / Edit Dialog ─────────────────────────────── */
function BannerDialog({
  open,
  onClose,
  banner,
}: {
  open: boolean;
  onClose: () => void;
  banner: HeroBanner | null;
}) {
  const createMutation = useCreateHeroBanner();
  const updateMutation = useUpdateHeroBanner();
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [link, setLink] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [objectPosition, setObjectPosition] = useState('50% 50%');

  // Populate fields when dialog opens for editing
  const handleEnter = () => {
    if (banner) {
      setTitle(banner.title ?? '');
      setSubtitle(banner.subtitle ?? '');
      setLink(banner.link ?? '');
      setSortOrder(banner.sort_order);
      setIsActive(banner.is_active);
      setPreview(banner.image?.hero ?? null);
      setObjectPosition(banner.object_position ?? '50% 50%');
    } else {
      setTitle('');
      setSubtitle('');
      setLink('');
      setSortOrder(0);
      setIsActive(true);
      setPreview(null);
      setObjectPosition('50% 50%');
    }
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setObjectPosition('50% 50%');
    }
  };

  const handleResetPosition = () => setObjectPosition('50% 50%');

  /** Drag-to-pan: pointerdown starts tracking */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const [px, py] = objectPosition.split(' ').map(parseFloat);
    dragRef.current = { x: e.clientX, y: e.clientY, px, py };
    setIsDragging(true);
  };

  /** Drag-to-pan: each pointer move shifts the visible portion of the image */
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // Dragging right → image moves right → decreasing X reveals left side
    const dx = ((dragRef.current.x - e.clientX) / rect.width) * 100 * 1.8;
    const dy = ((dragRef.current.y - e.clientY) / rect.height) * 100 * 1.8;
    const nx = Math.min(100, Math.max(0, dragRef.current.px + dx));
    const ny = Math.min(100, Math.max(0, dragRef.current.py + dy));
    setObjectPosition(`${Math.round(nx)}% ${Math.round(ny)}%`);
    // Incremental: next delta is relative to current pos
    dragRef.current = { x: e.clientX, y: e.clientY, px: nx, py: ny };
  };

  const onPointerUp = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append('title', title);
    fd.append('subtitle', subtitle);
    fd.append('link', link);
    fd.append('sort_order', String(sortOrder));
    fd.append('is_active', isActive ? '1' : '0');
    fd.append('object_position', objectPosition);
    if (file) fd.append('image', file);

    if (banner) {
      await updateMutation.mutateAsync({ id: banner.id, formData: fd });
    } else {
      await createMutation.mutateAsync(fd);
    }
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isCreate = !banner;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
    >
      <DialogTitle>{isCreate ? 'Ajouter un banner' : 'Modifier le banner'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        {/* Image preview — drag to pan, same 21:9 aspect ratio as desktop hero */}
        {preview ? (
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Box
              sx={{
                width: '100%',
                aspectRatio: '21/9',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                cursor: isDragging ? 'grabbing' : 'grab',
                border: '2px solid',
                borderColor: 'primary.main',
                userSelect: 'none',
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              <Box
                component="img"
                src={preview}
                alt="Preview"
                draggable={false}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition, display: 'block', pointerEvents: 'none', userSelect: 'none' }}
              />
            </Box>
            {/* Hint + controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Glissez l’image pour ajuster le cadrage
              </Typography>
              <Box display="flex" gap={0.5}>
                <Tooltip title="Centrer">
                  <IconButton size="small" onClick={handleResetPosition}>
                    <CenterFocusStrongIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Changer l'image">
                  <IconButton size="small" onClick={() => fileRef.current?.click()}>
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              aspectRatio: '21/9',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
              bgcolor: 'action.hover',
            }}
            onClick={() => fileRef.current?.click()}
          >
            <Box textAlign="center">
              <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Cliquez pour sélectionner une image
              </Typography>
            </Box>
          </Box>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

        <TextField label="Titre" size="small" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField label="Sous-titre" size="small" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        <TextField label="Lien (URL)" size="small" value={link} onChange={(e) => setLink(e.target.value)} />
        <TextField label="Ordre d'affichage" size="small" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
        <FormControlLabel control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} label="Actif" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isPending || (isCreate && !file)}>
          {isPending ? 'Enregistrement…' : isCreate ? 'Créer' : 'Mettre à jour'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
