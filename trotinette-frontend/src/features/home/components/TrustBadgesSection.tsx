import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';

import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { AnimatedSection } from '@/shared/components/AnimatedSection';
import { fadeInUp } from '@/shared/animations/variants';

const TRUST_ITEMS = [
    {
        icon: <LocalShippingOutlinedIcon sx={{ fontSize: '1.1rem' }} />,
        color: '#00C2FF',
        label: 'Livraison Rapide',
        desc: 'Livraison partout au Maroc en 2-5 jours ouvrés.',
    },
    {
        icon: <VerifiedUserOutlinedIcon sx={{ fontSize: '1.1rem' }} />,
        color: '#2EAD5F',
        label: 'Garantie 2 Ans',
        desc: "Protection complète pièces & main-d'œuvre.",
    },
    {
        icon: <SupportAgentOutlinedIcon sx={{ fontSize: '1.1rem' }} />,
        color: '#D4A43A',
        label: 'SAV Réactif',
        desc: 'Réponse en 24h, assistance technique locale.',
    },
    {
        icon: <StarOutlineIcon sx={{ fontSize: '1.1rem' }} />,
        color: '#D97A50',
        label: 'Avis 4.8/5',
        desc: '+500 clients satisfaits à travers le Maroc.',
    },
];

export function TrustBadgesSection() {
    return (
        <AnimatedSection>
            <Box
                component="section"
                sx={{
                    bgcolor: '#0c0c14',
                    py: { xs: 2, md: 3 },
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                            gap: { xs: 1, sm: 2 },
                        }}
                    >
                        {TRUST_ITEMS.map(({ icon, color, label, desc }, i) => (
                            <motion.div
                                key={label}
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ delay: i * 0.12 }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: { xs: 'center', sm: 'flex-start' },
                                        gap: { xs: 1, sm: 1.5 },
                                        p: { xs: 1.5, sm: 2.5 },
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        bgcolor: 'rgba(19,22,35,0.5)',
                                        backdropFilter: 'blur(8px)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: `${color}30`,
                                            transform: 'translateY(-3px)',
                                            boxShadow: `0 8px 24px ${color}10`,
                                        },
                                    }}
                                >
                                    <Box sx={{
                                        width: { xs: 30, sm: 36 }, height: { xs: 30, sm: 36 },
                                        borderRadius: '8px',
                                        bgcolor: `${color}14`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color,
                                        flexShrink: 0,
                                    }}>
                                        {icon}
                                    </Box>
                                    <Box>
                                        <Typography sx={{
                                            fontWeight: 700,
                                            fontSize: { xs: '0.72rem', sm: '0.82rem' },
                                            color: '#E8ECF2',
                                            letterSpacing: '0.02em',
                                            lineHeight: 1.3,
                                            mb: { xs: 0, sm: 0.25 },
                                        }}>
                                            {label}
                                        </Typography>
                                        <Typography sx={{
                                            fontSize: '0.72rem',
                                            color: '#8A919D',
                                            lineHeight: 1.4,
                                            display: { xs: 'none', sm: 'block' },
                                        }}>
                                            {desc}
                                        </Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        ))}
                    </Box>
                </Container>
            </Box>
        </AnimatedSection>
    );
}
