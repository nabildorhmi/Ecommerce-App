import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PhoneIcon from '@mui/icons-material/Phone';

// Format WhatsApp number for display: 212600000000 -> +212 6 00 00 00 00
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '212600000000';
function formatPhoneDisplay(raw: string): string {
  // Expected format: country code + 9-digit Moroccan number
  // 212600000000 -> +212 6 00 00 00 00
  if (raw.startsWith('212') && raw.length >= 12) {
    const local = raw.slice(3); // "600000000"
    return `+212 ${local[0]} ${local.slice(1, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
  }
  return `+${raw}`;
}

interface TrustBadgeProps {
  icon: React.ReactNode;
  text: string;
}

function TrustBadge({ icon, text }: TrustBadgeProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        flex: 1,
        minWidth: 160,
      }}
    >
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Typography variant="body2" fontWeight={500}>
        {text}
      </Typography>
    </Box>
  );
}

/**
 * TrustSignals displays three reassurance badges below the product detail.
 * Content is static — no props required.
 */
export function TrustSignals() {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ mt: 3 }}
      flexWrap="wrap"
    >
      <TrustBadge
        icon={<AssignmentReturnIcon />}
        text="Retour sous 7 jours"
      />
      <TrustBadge
        icon={<VerifiedUserIcon />}
        text="Boutique officielle"
      />
      <TrustBadge
        icon={<PhoneIcon />}
        text={formatPhoneDisplay(WHATSAPP_NUMBER)}
      />
    </Stack>
  );
}
