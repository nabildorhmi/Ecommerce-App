import Fab from '@mui/material/Fab';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

// Phone number comes from env — client-visible (public phone number, acceptable)
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '212600000000';

/**
 * WhatsAppFab — Global floating action button for WhatsApp contact.
 * Fixed at bottom-right corner on all pages.
 */
export function WhatsAppFab() {
  const message = encodeURIComponent("Bonjour, je suis interesse(e) par vos trottinettes");
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <Fab
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
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
