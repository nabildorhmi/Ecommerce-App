import Fab from '@mui/material/Fab';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useSiteSettings } from '@/shared/hooks/useSiteSettings';

function normalizePhoneForWa(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * WhatsAppFab — Global floating action button for WhatsApp contact.
 * Fixed at bottom-right corner on all pages.
 */
export function WhatsAppFab() {
  const { data: siteSettings } = useSiteSettings();
  const message = encodeURIComponent(siteSettings?.whatsapp_prefill_message ?? 'Bonjour, je suis interesse(e) par vos trottinettes');
  const number = normalizePhoneForWa(siteSettings?.whatsapp_number ?? '212600000000');
  const href = siteSettings?.whatsapp_url || `https://wa.me/${number}?text=${message}`;

  return (
    <Fab
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        position: 'fixed',
        bottom: { xs: 80, md: 24 },
        right: { xs: 16, md: 24 },
        bgcolor: '#25D366',
        color: '#fff',
        '&:hover': { bgcolor: '#1DA851' },
        zIndex: 1000,
      }}
    >
      <WhatsAppIcon />
    </Fab>
  );
}
