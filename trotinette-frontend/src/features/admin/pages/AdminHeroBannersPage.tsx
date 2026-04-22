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
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
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
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import {
  useAdminHeroBanners,
  useCreateHeroBanner,
  useUpdateHeroBanner,
  useDeleteHeroBanner,
  type HeroBanner,
} from '../api/heroBanners';
import { HERO_BANNER_ASPECT } from '../../home/components/HeroCarousel';

const HERO_UPLOAD_SOFT_LIMIT_BYTES = 1_900_000;
const HERO_DESKTOP_TARGET_WIDTH = 1920;
const HERO_MOBILE_TARGET_WIDTH = 1080;

function fileBaseName(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot > 0 ? filename.slice(0, dot) : filename;
}

async function loadImageElement(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Cannot load selected image'));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function optimizeHeroUpload(file: File, targetWidth: number): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.size <= HERO_UPLOAD_SOFT_LIMIT_BYTES) return file;

  const image = await loadImageElement(file);
  const scale = Math.min(1, targetWidth / image.naturalWidth);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(image, 0, 0, width, height);

  const qualities = [0.9, 0.82, 0.74, 0.66];
  for (const q of qualities) {
    const blob = await canvasToBlob(canvas, 'image/webp', q);
    if (!blob) continue;
    if (blob.size <= HERO_UPLOAD_SOFT_LIMIT_BYTES || blob.size < file.size) {
      return new File([blob], `${fileBaseName(file.name)}.webp`, {
        type: 'image/webp',
        lastModified: Date.now(),
      });
    }
  }

  return file;
}

/* ════════════════════════════════════════════════════════
   Admin Hero Banners Page
   ════════════════════════════════════════════════════════ */
export function AdminHeroBannersPage() {
  const { data, isLoading } = useAdminHeroBanners();
  const banners = data?.data ?? [];
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'' | '1' | '0'>('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HeroBanner | null>(null);

  const filteredBanners = banners.filter((banner) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (banner.title ?? '').toLowerCase().includes(q) ||
      (banner.subtitle ?? '').toLowerCase().includes(q) ||
      (banner.link ?? '').toLowerCase().includes(q);

    const matchesActive =
      activeFilter === '' ||
      (activeFilter === '1' ? banner.is_active : !banner.is_active);

    return matchesSearch && matchesActive;
  });

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (banner: HeroBanner) => {
    setEditing(banner);
    setDialogOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Banners hero
        </Typography>
        <Button variant="contained" startIcon={<AddPhotoAlternateIcon />} onClick={handleAdd}>
          Ajouter un visuel
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          Gestion des visuels d accueil
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Administrez les images du carousel principal et leur ordre d affichage pour la page d accueil.
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Rechercher (titre, sous-titre, lien)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 280 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              label="Statut"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as '' | '1' | '0')}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="1">Actifs</MenuItem>
              <MenuItem value="0">Inactifs</MenuItem>
            </Select>
          </FormControl>

          {(search || activeFilter) && (
            <Button size="small" variant="outlined" onClick={() => { setSearch(''); setActiveFilter(''); }}>
              Effacer
            </Button>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filteredBanners.length} visuel(s)
          </Typography>
        </Box>
      </Paper>

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredBanners.length === 0 ? (
        <Alert severity="info">Aucun visuel. Ajoutez-en un pour le carousel hero.</Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredBanners.map((banner) => (
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
      {(banner.image?.desktop || banner.image?.mobile) ? (
        <Box sx={{ position: 'relative', width: '100%', aspectRatio: HERO_BANNER_ASPECT.desktop, overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={banner.image?.desktop?.hero ?? banner.image?.mobile?.hero ?? ''}
            alt={banner.title ?? 'Hero banner'}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: banner.object_position ?? '50% 50%' }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(12,12,20,0.65) 0%, rgba(12,12,20,0.15) 45%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        </Box>
      ) : (
        <Box sx={{ width: '100%', aspectRatio: HERO_BANNER_ASPECT.desktop, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
          {banner.has_desktop && banner.has_mobile ? (
            <>
              <Chip label="Desktop" size="small" sx={{ bgcolor: 'rgba(0,194,255,0.15)', color: '#00C2FF', fontSize: '0.65rem', height: 20 }} />
              <Chip label="Mobile" size="small" sx={{ bgcolor: 'rgba(255,45,120,0.15)', color: '#FF2D78', fontSize: '0.65rem', height: 20 }} />
            </>
          ) : banner.has_desktop ? (
            <Chip label="Desktop uniquement" size="small" sx={{ bgcolor: 'rgba(0,194,255,0.15)', color: '#00C2FF', fontSize: '0.65rem', height: 20 }} />
          ) : banner.has_mobile ? (
            <Chip label="Mobile uniquement" size="small" sx={{ bgcolor: 'rgba(255,45,120,0.15)', color: '#FF2D78', fontSize: '0.65rem', height: 20 }} />
          ) : null}
        </Box>
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
  const desktopDragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const mobileDragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [isDraggingDesktop, setIsDraggingDesktop] = useState(false);
  const [isDraggingMobile, setIsDraggingMobile] = useState(false);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [link, setLink] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [desktopObjectPosition, setDesktopObjectPosition] = useState('50% 50%');
  const [mobileObjectPosition, setMobileObjectPosition] = useState('50% 50%');
  const [removeDesktop, setRemoveDesktop] = useState(false);
  const [removeMobile, setRemoveMobile] = useState(false);
  const [desktopWarning, setDesktopWarning] = useState<string | null>(null);
  const [mobileWarning, setMobileWarning] = useState<string | null>(null);
  const mutationError = createMutation.error ?? updateMutation.error;
  const mutationErrorMessage =
    (mutationError as { response?: { data?: { detail?: string; errors?: Record<string, string[]> } } })?.response?.data?.detail
    ?? (mutationError as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors?.image_desktop?.[0]
    ?? (mutationError as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors?.image_mobile?.[0]
    ?? (mutationError as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors?.image?.[0]
    ?? 'Une erreur est survenue pendant l envoi de l image.';

  // Populate fields when dialog opens for editing
  const handleEnter = () => {
    if (banner) {
      setTitle(banner.title ?? '');
      setSubtitle(banner.subtitle ?? '');
      setLink(banner.link ?? '');
      setSortOrder(banner.sort_order);
      setIsActive(banner.is_active);
      // No fallback between desktop and mobile
      setDesktopPreview(banner.image?.desktop?.hero ?? null);
      setMobilePreview(banner.image?.mobile?.hero ?? null);
      setDesktopObjectPosition(banner.object_position ?? '50% 50%');
      setMobileObjectPosition('50% 50%');
    } else {
      setTitle('');
      setSubtitle('');
      setLink('');
      setSortOrder(0);
      setIsActive(true);
      setDesktopPreview(null);
      setMobilePreview(null);
      setDesktopObjectPosition('50% 50%');
      setMobileObjectPosition('50% 50%');
    }
    setDesktopFile(null);
    setMobileFile(null);
    setRemoveDesktop(false);
    setRemoveMobile(false);
    setDesktopWarning(null);
    setMobileWarning(null);
  };

  const handleFileChange = async (kind: 'desktop' | 'mobile', e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const optimized = await optimizeHeroUpload(
        selected,
        kind === 'mobile' ? HERO_MOBILE_TARGET_WIDTH : HERO_DESKTOP_TARGET_WIDTH,
      );

      // Check aspect ratio and show warning if wrong orientation
      const img = await loadImageElement(optimized);
      const isPortrait = img.naturalHeight > img.naturalWidth;
      const isLandscape = img.naturalWidth > img.naturalHeight;

      const url = URL.createObjectURL(optimized);
      if (kind === 'desktop') {
        setDesktopFile(optimized);
        setDesktopPreview(url);
        // Desktop should be landscape
        if (isPortrait) {
          setDesktopWarning("L'image selectionnee est en format portrait. Le format paysage (ex: 1920x600) est recommande pour desktop.");
        } else {
          setDesktopWarning(null);
        }
      } else {
        setMobileFile(optimized);
        setMobilePreview(url);
        // Mobile should be portrait
        if (isLandscape) {
          setMobileWarning("L'image selectionnee est en format paysage. Le format portrait (ex: 375x600) est recommande pour mobile.");
        } else {
          setMobileWarning(null);
        }
      }
    }
  };

  const handleResetDesktopPosition = () => setDesktopObjectPosition('50% 50%');
  const handleResetMobilePosition = () => setMobileObjectPosition('50% 50%');

  /** Desktop drag-to-pan handlers */
  const onDesktopPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const [px, py] = desktopObjectPosition.split(' ').map(parseFloat);
    desktopDragRef.current = { x: e.clientX, y: e.clientY, px, py };
    setIsDraggingDesktop(true);
  };

  const onDesktopPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!desktopDragRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = ((desktopDragRef.current.x - e.clientX) / rect.width) * 100 * 1.8;
    const dy = ((desktopDragRef.current.y - e.clientY) / rect.height) * 100 * 1.8;
    const nx = Math.min(100, Math.max(0, desktopDragRef.current.px + dx));
    const ny = Math.min(100, Math.max(0, desktopDragRef.current.py + dy));
    setDesktopObjectPosition(`${Math.round(nx)}% ${Math.round(ny)}%`);
    desktopDragRef.current = { x: e.clientX, y: e.clientY, px: nx, py: ny };
  };

  const onDesktopPointerUp = () => {
    desktopDragRef.current = null;
    setIsDraggingDesktop(false);
  };

  /** Mobile drag-to-pan handlers */
  const onMobilePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const [px, py] = mobileObjectPosition.split(' ').map(parseFloat);
    mobileDragRef.current = { x: e.clientX, y: e.clientY, px, py };
    setIsDraggingMobile(true);
  };

  const onMobilePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mobileDragRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = ((mobileDragRef.current.x - e.clientX) / rect.width) * 100 * 1.8;
    const dy = ((mobileDragRef.current.y - e.clientY) / rect.height) * 100 * 1.8;
    const nx = Math.min(100, Math.max(0, mobileDragRef.current.px + dx));
    const ny = Math.min(100, Math.max(0, mobileDragRef.current.py + dy));
    setMobileObjectPosition(`${Math.round(nx)}% ${Math.round(ny)}%`);
    mobileDragRef.current = { x: e.clientX, y: e.clientY, px: nx, py: ny };
  };

  const onMobilePointerUp = () => {
    mobileDragRef.current = null;
    setIsDraggingMobile(false);
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append('title', title);
    fd.append('subtitle', subtitle);
    fd.append('link', link);
    fd.append('sort_order', String(sortOrder));
    fd.append('is_active', isActive ? '1' : '0');
    fd.append('object_position', desktopObjectPosition);
    if (desktopFile) fd.append('image_desktop', desktopFile);
    if (mobileFile) fd.append('image_mobile', mobileFile);

    // If editing and user removed an image without replacing
    if (banner) {
      if (removeDesktop && !desktopFile) {
        fd.append('remove_desktop', '1');
      }
      if (removeMobile && !mobileFile) {
        fd.append('remove_mobile', '1');
      }
    }

    if (banner) {
      await updateMutation.mutateAsync({ id: banner.id, formData: fd });
    } else {
      await createMutation.mutateAsync(fd);
    }
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isCreate = !banner;

  const handleRemoveDesktop = () => {
    setDesktopPreview(null);
    setDesktopFile(null);
    setRemoveDesktop(true);
    setDesktopWarning(null);
  };

  const handleRemoveMobile = () => {
    setMobilePreview(null);
    setMobileFile(null);
    setRemoveMobile(true);
    setMobileWarning(null);
  };

  const renderPreviewFrame = (
    label: string,
    sizeHint: string,
    aspectRatio: string,
    src: string | null,
    inputId: string,
    frameWidth: { xs?: number | string; sm?: number | string } | undefined,
    objectPosition: string,
    isDragging: boolean,
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void,
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void,
    onPointerUp: () => void,
    onRemove: (() => void) | null,
    warning: string | null,
  ) => (
    <Box sx={{ width: frameWidth ?? '100%', maxWidth: '100%' }}>
      <Typography variant="subtitle2" sx={{ display: 'block', mb: 0.3 }}>
        {label}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.8 }}>
        {sizeHint}
      </Typography>
      {src ? (
        <>
          <Box
            sx={{
              width: '100%',
              aspectRatio,
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
              cursor: isDragging ? 'grabbing' : 'grab',
              border: '2px solid',
              borderColor: 'primary.main',
              userSelect: 'none',
              bgcolor: 'black',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <Box
              component="img"
              src={src}
              alt={`Preview ${label}`}
              draggable={false}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition, display: 'block', pointerEvents: 'none', userSelect: 'none' }}
            />
            {banner && onRemove && (
              <IconButton
                size="small"
                onClick={onRemove}
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(244,67,54,0.8)' },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          {warning && (
            <Alert severity="warning" sx={{ mt: 1, py: 0.5 }}>
              {warning}
            </Alert>
          )}
        </>
      ) : (
        <Box
          component="label"
          htmlFor={inputId}
          sx={{
            width: '100%',
            aspectRatio,
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
        >
          <Box textAlign="center">
            <CloudUploadIcon sx={{ fontSize: 34, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Selectionner image {label.toLowerCase()}
            </Typography>
          </Box>
        </Box>
      )}
      <Button size="small" sx={{ mt: 0.4 }} component="label" htmlFor={inputId}>
        Choisir image
      </Button>
    </Box>
  );

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
        {mutationError && <Alert severity="error">{mutationErrorMessage}</Alert>}

        <Box sx={{ position: 'relative', width: '100%' }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Apercu rendu homepage
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {renderPreviewFrame(
              'Desktop Banner',
              'Recommande: 1920x600, format paysage',
              HERO_BANNER_ASPECT.desktop,
              desktopPreview,
              'hero-banner-desktop-input',
              undefined,
              desktopObjectPosition,
              isDraggingDesktop,
              onDesktopPointerDown,
              onDesktopPointerMove,
              onDesktopPointerUp,
              banner ? handleRemoveDesktop : null,
              desktopWarning,
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
              <Typography variant="caption" color="text.secondary">
                Cadrage desktop
              </Typography>
              <Tooltip title="Centrer desktop">
                <IconButton size="small" onClick={handleResetDesktopPosition} disabled={!desktopPreview}>
                  <CenterFocusStrongIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            {renderPreviewFrame(
              'Mobile Banner',
              'Recommande: 375x600, format portrait',
              HERO_BANNER_ASPECT.mobile,
              mobilePreview,
              'hero-banner-mobile-input',
              { xs: '68%', sm: '42%' },
              mobileObjectPosition,
              isDraggingMobile,
              onMobilePointerDown,
              onMobilePointerMove,
              onMobilePointerUp,
              banner ? handleRemoveMobile : null,
              mobileWarning,
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
              <Typography variant="caption" color="text.secondary">
                Cadrage mobile
              </Typography>
              <Tooltip title="Centrer mobile">
                <IconButton size="small" onClick={handleResetMobilePosition} disabled={!mobilePreview}>
                  <CenterFocusStrongIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Vous pouvez uploader seulement desktop ou seulement mobile. Glissez dans un apercu pour ajuster le cadrage independamment pour chaque appareil.
          </Typography>
        </Box>
        <input id="hero-banner-desktop-input" type="file" accept="image/*" hidden onChange={(e) => handleFileChange('desktop', e)} />
        <input id="hero-banner-mobile-input" type="file" accept="image/*" hidden onChange={(e) => handleFileChange('mobile', e)} />

        <TextField label="Titre" size="small" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField label="Sous-titre" size="small" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        <TextField label="Lien (URL)" size="small" value={link} onChange={(e) => setLink(e.target.value)} />
        <TextField label="Ordre d'affichage" size="small" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
        <FormControlLabel control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} label="Actif" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isPending || (isCreate && !desktopFile && !mobileFile)}>
          {isPending ? 'Enregistrement…' : isCreate ? 'Créer' : 'Mettre à jour'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
