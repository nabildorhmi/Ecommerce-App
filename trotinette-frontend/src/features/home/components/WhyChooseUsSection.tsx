import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import SpeedIcon from '@mui/icons-material/Speed';
import DesignServicesOutlinedIcon from '@mui/icons-material/DesignServicesOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import CountUp from 'react-countup';
import { staggerContainer, fadeInUp, fadeInLeft } from '@/shared/animations/variants';

const FEATURES = [
    {
        icon: <SpeedIcon sx={{ fontSize: '2rem' }} />,
        color: '#00C2FF',
        title: 'Puissance Brute',
        subLabel: 'パフォーマンス',
        desc: 'Moteurs jusqu\'à 1500W. Sentez l\'accélération vous propulser à travers la ville.',
    },
    {
        icon: <DesignServicesOutlinedIcon sx={{ fontSize: '2rem' }} />,
        color: '#D4A43A',
        title: 'Design Qui Se Remarque',
        subLabel: 'デザイン',
        desc: 'Finitions premium, lignes futuristes. Faites tourner les têtes à chaque trajet.',
    },
    {
        icon: <BatteryChargingFullIcon sx={{ fontSize: '2rem' }} />,
        color: '#2EAD5F',
        title: 'Liberté Totale',
        subLabel: 'バッテリー',
        desc: 'Jusqu\'à 80 km d\'autonomie. Allez où vous voulez, quand vous voulez, sans limite.',
    },
    {
        icon: <BuildOutlinedIcon sx={{ fontSize: '2rem' }} />,
        color: '#D97A50',
        title: 'Zéro Souci',
        subLabel: 'サービス',
        desc: 'Garantie 2 ans, SAV réactif, pièces disponibles. On s\'occupe de tout.',
    },
];

const STATS = [
    { value: 500, suffix: '+', label: 'Clients satisfaits' },
    { value: 20, suffix: '+', label: 'Modèles disponibles' },
    { value: 2, suffix: ' ans', label: 'Garantie offerte' },
    { value: 48, suffix: 'h', label: 'Livraison rapide' },
];

export function WhyChooseUsSection() {
    const statsRef = useRef<HTMLDivElement>(null);
    const statsInView = useInView(statsRef, { once: true, amount: 0.3 });

    return (
        <Box
            component="section"
            sx={{
                bgcolor: 'background.default',
                py: { xs: 5, md: 8 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse 70% 50% at 80% 50%, rgba(0,194,255,0.04) 0%, transparent 70%)',
                    pointerEvents: 'none',
                },
            }}
        >
            <Container maxWidth="xl">
                <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
                    {/* Left: text content */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <motion.div
                            variants={fadeInLeft}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            <Typography
                                sx={{
                                    fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.28em',
                                    color: 'primary.main', textTransform: 'uppercase', mb: 1.5,
                                }}
                            >
                                技術革新 — NOS ATOUTS
                            </Typography>
                            <Typography
                                sx={{
                                    fontWeight: 800, fontSize: { xs: '1.6rem', md: '2.2rem' },
                                    color: 'text.primary', letterSpacing: '-0.02em', lineHeight: 1.15, mb: 2,
                                }}
                            >
                                POURQUOI 500+ CLIENTS NOUS CHOISISSENT
                            </Typography>
                            <Typography sx={{ fontSize: '0.92rem', color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>
                                Performance, design et fiabilité. Chaque MiraiTech est sélectionnée pour vous offrir une expérience de conduite incomparable.
                            </Typography>
                        </motion.div>
                        {/* Stats with CountUp */}
                        <Box ref={statsRef} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            {STATS.map(({ value, suffix, label }, i) => (
                                <motion.div
                                    key={label}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={statsInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                >
                                    <Box sx={{ p: 1.75, borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(19,19,27,0.5)' }}>
                                        <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#00C2FF', letterSpacing: '-0.02em', lineHeight: 1, fontFamily: '"Orbitron", sans-serif' }}>
                                            {statsInView ? <CountUp end={value} duration={2} suffix={suffix} /> : `0${suffix}`}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>{label}</Typography>
                                    </Box>
                                </motion.div>
                            ))}
                        </Box>
                    </Grid>

                    {/* Right: feature cards */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                        >
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                {FEATURES.map(({ icon, color, title, subLabel, desc }) => (
                                    <motion.div key={title} variants={fadeInUp}>
                                        <Box
                                            sx={{
                                                p: { xs: 2.5, md: 3 },
                                                borderRadius: '18px',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                background: 'rgba(17, 17, 22, 0.6)',
                                                backdropFilter: 'blur(16px)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                '&:hover': {
                                                    borderColor: `${color}30`,
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: `0 12px 36px ${color}12`,
                                                },
                                            }}
                                        >
                                            <Box sx={{ color, mb: 1.25, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {icon}
                                                <Typography sx={{ fontFamily: '"Noto Serif JP", serif', fontSize: '0.55rem', color: `${color}40`, letterSpacing: '0.1em' }}>
                                                    {subLabel}
                                                </Typography>
                                            </Box>
                                            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary', mb: 0.75 }}>{title}</Typography>
                                            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.65 }}>{desc}</Typography>
                                        </Box>
                                    </motion.div>
                                ))}
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
