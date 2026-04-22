import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { Link } from 'react-router';
import { useCategories } from '@/features/catalog/api/categories';
import { useSiteSettings } from '@/shared/hooks/useSiteSettings';
import miraiLogo from '@/assets/miraiTech-Logo.png';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

function normalizePhoneForWa(phone: string): string {
  return phone.replace(/\D/g, '');
}

const trustBadges = [
  { icon: <LockOutlinedIcon sx={{ fontSize: '1.3rem', color: '#00C2FF' }} />, label: 'Paiement Sécurisé', sub: 'Données protégées' },
  { icon: <LocalShippingOutlinedIcon sx={{ fontSize: '1.3rem', color: '#00C2FF' }} />, label: 'Livraison Express', sub: '2-5 jours ouvrés' },
  { icon: <VerifiedUserOutlinedIcon sx={{ fontSize: '1.3rem', color: '#00C2FF' }} />, label: 'Garantie 2 Ans', sub: 'Sur tous nos produits' },
  { icon: <UndoIcon sx={{ fontSize: '1.3rem', color: '#00C2FF' }} />, label: 'Retour Facile', sub: '30 jours offerts' },
];

export function Footer() {
  const { data } = useCategories();
  const { data: siteSettings } = useSiteSettings();
  const categories = data?.data ?? [];
  const whatsappNumber = normalizePhoneForWa(siteSettings?.whatsapp_number ?? '212600000000');
  const whatsappMessage = encodeURIComponent(siteSettings?.whatsapp_prefill_message ?? 'Bonjour');
  const whatsappHref = siteSettings?.whatsapp_url || `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const socialLinks = [
    { label: 'Instagram', href: siteSettings?.instagram_url || '#', icon: <InstagramIcon sx={{ fontSize: '1rem' }} /> },
    { label: 'Facebook', href: siteSettings?.facebook_url || '#', icon: <FacebookIcon sx={{ fontSize: '1rem' }} /> },
    { label: 'WhatsApp', href: whatsappHref, icon: <WhatsAppIcon sx={{ fontSize: '1rem' }} /> },
  ].filter((item) => item.href && item.href !== '#');

  const companyLinks = (siteSettings?.short_links?.length ? siteSettings.short_links : [
    { label: 'A propos', url: '/a-propos' },
    { label: 'Contact', url: '/contact' },
    { label: 'CGV', url: '/cgv' },
    { label: 'Mentions legales', url: '/mentions-legales' },
  ]);
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#0c0c14',
        mt: 'auto',
        pt: 0,
        pb: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,194,255,0.012) 2px, rgba(0,194,255,0.012) 4px)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      {/* Gradient top border */}
      <Box sx={{ height: 1, background: 'linear-gradient(90deg, transparent 0%, #C7404D 30%, #00C2FF 70%, transparent 100%)', mb: 0, position: 'relative', zIndex: 1, boxShadow: '0 0 8px rgba(0,194,255,0.2)' }} />

      {/* Trust badges strip */}
      <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', py: 3, position: 'relative', zIndex: 1, mb: 5 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 } }}>
            {trustBadges.map(({ icon, label, sub }) => (
              <Box key={label} className="mirai-trust-badge" sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, cursor: 'default' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  {icon}
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#E8ECF2', letterSpacing: '0.02em' }}>{label}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.68rem', color: '#8A919D', ml: 0.5 }}>{sub}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} sx={{ mb: 5 }}>
          {/* Brand Column */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                component="img"
                src={miraiLogo}
                alt="MiraiTech"
                sx={{ height: 45, width: 'auto' }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#8A919D', lineHeight: 1.8, maxWidth: 300, mb: 2 }}>
              {siteSettings?.footer_description ?? '500+ clients satisfaits au Maroc. Trottinettes electriques premium avec garantie 2 ans et SAV local.'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <LocationOnIcon sx={{ fontSize: '0.9rem', color: '#8A919D' }} />
              <Typography variant="body2" sx={{ color: '#8A919D', fontSize: '0.82rem', lineHeight: 1.7, maxWidth: 300 }}>
                {siteSettings?.address ?? '123 Bd Mohammed V, Casablanca, Maroc'}
              </Typography>
            </Box>

            {/* Social links */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialLinks.map(({ label, href, icon }) => (
                <Box
                  key={label}
                  component="a"
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#8A919D',
                    textDecoration: 'none', transition: 'all 0.3s ease',
                    '&:hover': { borderColor: 'rgba(0,194,255,0.4)', color: '#00C2FF', background: 'rgba(0,194,255,0.06)', boxShadow: '0 0 12px rgba(0,194,255,0.15)' },
                  }}
                >
                  {icon}
                </Box>
              ))}
            </Box>

            {/* Japanese accent */}
            <Typography
              sx={{
                fontFamily: '"Noto Serif JP", serif',
                fontSize: '0.82rem',
                color: 'rgba(0,194,255,0.12)',
                letterSpacing: '0.25em',
                mt: 2.5,
              }}
            >
              ミライテック — 未来の技術
            </Typography>
          </Grid>

          {/* Products Column */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', color: '#00C2FF', textTransform: 'uppercase', mb: 2 }}>
              Produits
            </Typography>
            <Stack spacing={1.25}>
              <Box component={Link} to="/products" sx={{ fontSize: '0.82rem', color: '#8A919D', textDecoration: 'none', transition: 'all 0.25s ease', '&:hover': { color: '#00C2FF', transform: 'translateX(4px)', display: 'inline-block' } }}>
                Tous les produits
              </Box>
              {categories.map((cat) => (
                <Box key={cat.id} component={Link} to={`/products?filter[category_id]=${cat.id}`} sx={{ fontSize: '0.82rem', color: '#8A919D', textDecoration: 'none', transition: 'all 0.25s ease', '&:hover': { color: '#00C2FF', transform: 'translateX(4px)', display: 'inline-block' } }}>
                  {cat.name}
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Company Column */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', color: '#00C2FF', textTransform: 'uppercase', mb: 2 }}>
              Société
            </Typography>
            <Stack spacing={1.25}>
              {companyLinks.map(({ url, label }) => (
                <Box key={`${url}-${label}`} component={Link} to={url} sx={{ fontSize: '0.82rem', color: '#8A919D', textDecoration: 'none', transition: 'all 0.25s ease', '&:hover': { color: '#00C2FF', transform: 'translateX(4px)', display: 'inline-block' } }}>
                  {label}
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Contact/Support Column */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', color: '#00C2FF', textTransform: 'uppercase', mb: 2 }}>
              Contact
            </Typography>
            <Stack spacing={1.25}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ fontSize: '0.9rem', color: '#8A919D' }} />
                <Typography sx={{ fontSize: '0.82rem', color: '#8A919D', lineHeight: 1.6 }}>
                  {siteSettings?.phone ?? '+212 6XX XXX XXX'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: '0.9rem', color: '#8A919D' }} />
                <Typography sx={{ fontSize: '0.82rem', color: '#8A919D', lineHeight: 1.6 }}>
                  {siteSettings?.email ?? 'contact@miraitech.ma'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon sx={{ fontSize: '0.9rem', color: '#8A919D' }} />
                <Typography sx={{ fontSize: '0.82rem', color: '#8A919D', lineHeight: 1.6 }}>
                  {siteSettings?.business_hours ?? 'Lun-Sam: 9h - 18h'}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: '#1E1E28', mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography sx={{ fontSize: '0.72rem', color: '#6B7280' }}>
            © {new Date().getFullYear()} MiraiTech. Tous droits réservés.
          </Typography>
          {/* Payment badges */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {['Visa', 'Mastercard', 'COD'].map((pm) => (
              <Box key={pm} sx={{ px: 1.5, py: 0.5, border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', fontSize: '0.65rem', color: '#6B7280', fontWeight: 600, letterSpacing: '0.04em' }}>
                {pm}
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontFamily: '"Noto Serif JP", serif', fontSize: '0.75rem', color: 'rgba(0,194,255,0.12)', letterSpacing: '0.15em' }}>
            未来の移動 · FUTURE MOBILITY
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
