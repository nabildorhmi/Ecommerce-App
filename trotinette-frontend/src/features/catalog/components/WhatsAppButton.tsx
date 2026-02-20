import Button from '@mui/material/Button';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

// Phone number comes from env — client-visible (public phone number, acceptable)
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '212600000000';

interface WhatsAppButtonProps {
  productName: string;
}

/**
 * WhatsApp contact button using wa.me deep link (Pattern 7 from RESEARCH.md).
 * Pre-fills a French message with the product name.
 * Opens in a new tab.
 */
export function WhatsAppButton({ productName }: WhatsAppButtonProps) {
  const message = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par : ${productName}`
  );
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <Button
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variant="contained"
      color="success"
      size="large"
      startIcon={<WhatsAppIcon />}
      sx={{ py: 1.5 }}
    >
      Demander sur WhatsApp
    </Button>
  );
}
