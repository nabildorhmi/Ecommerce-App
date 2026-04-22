import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/shared/animations/variants';

// Format WhatsApp number for display: 212600000000 -> +212 6 00 00 00 00
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '212600000000';
function formatPhoneDisplay(raw: string): string {
  if (raw.startsWith('212') && raw.length >= 12) {
    const local = raw.slice(3);
    return `+212 ${local[0]} ${local.slice(1, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
  }
  return `+${raw}`;
}

const SIGNALS = [
  {
    icon: <LocalShippingOutlinedIcon sx={{ fontSize: '1.3rem' }} />,
    color: '#00C2FF',
    label: 'Livraison Express',
    desc: '2 à 5 jours partout au Maroc',
  },
  {
    icon: <VerifiedUserIcon sx={{ fontSize: '1.3rem' }} />,
    color: '#2EAD5F',
    label: 'Garantie 2 Ans',
    desc: 'Sur tous les équipements',
  },
  {
    icon: <AssignmentReturnIcon sx={{ fontSize: '1.3rem' }} />,
    color: '#D4A43A',
    label: 'Retour 30 Jours',
    desc: 'Remboursement sans tracas',
  },
  {
    icon: <SupportAgentOutlinedIcon sx={{ fontSize: '1.3rem' }} />,
    color: '#C7404D',
    label: 'Support Expert',
    desc: formatPhoneDisplay(WHATSAPP_NUMBER),
  },
  {
    icon: <StorefrontIcon sx={{ fontSize: '1.3rem' }} />,
    color: '#9B59B6',
    label: 'Boutique Officielle',
    desc: 'Produits authentiques certifiés',
  },
];

/**
 * TrustSignals — enhanced premium reassurance badges below product detail.
 */
export function TrustSignals() {
  return (
    <Box
      sx={{
        mt: 4,
        py: 3,
        px: { xs: 2, md: 3 },
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.06)',
        bgcolor: 'rgba(19,22,35,0.4)',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em',
          color: 'text.secondary', textTransform: 'uppercase', mb: 2,
        }}
      >
        NOS ENGAGEMENTS
      </Typography>

      <Grid container spacing={2} component={motion.div} variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        {SIGNALS.map(({ icon, color, label, desc }) => (
          <Grid key={label} size={{ xs: 12, sm: 6, md: 4 }} component={motion.div} variants={fadeInUp}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{
                color,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
              }}>
                {icon}
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>{label}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', mt: 0.15 }}>{desc}</Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
