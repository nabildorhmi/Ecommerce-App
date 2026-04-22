import { Link } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import CountUp from 'react-countup';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ElectricScooterIcon from '@mui/icons-material/ElectricScooter';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { HeroCarousel } from './HeroCarousel';

const CYAN = '#00C2FF';
const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const stats = [
    { value: 500, suffix: '+', label: 'Clients satisfaits' },
    { value: 2, suffix: ' ans', label: 'Garantie incluse' },
    { value: 4.8, suffix: '/5', decimals: 1, label: 'Note moyenne' },
];

export function HeroSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end start'],
    });
    const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

    return (
        <Box
            ref={sectionRef}
            component="section"
            sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 'calc(100vw * (16 / 9))', md: 'min(100vh, calc(100vw * (9 / 16)))' },
                minHeight: { xs: 'calc(100vw * (16 / 9))', md: 'min(100vh, calc(100vw * (9 / 16)))' },
                bgcolor: '#0c0c14',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {/* ── Parallax base layers ── */}
            <motion.div
                style={{
                    y: bgY,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                }}
            >
                <HeroCarousel fullBleed />
                <Box sx={{
                    position: 'absolute', inset: 0,
                    background: {
                        xs: 'linear-gradient(to right, #0c0c14 0%, rgba(12,12,20,0.9) 40%, rgba(12,12,20,0.65) 100%)',
                        md: 'linear-gradient(to right, #0c0c14 0%, rgba(12,12,20,0.82) 40%, rgba(12,12,20,0.35) 100%)',
                    },
                }} />
                <Box sx={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, #0c0c14 0%, rgba(12,12,20,0.4) 40%, transparent 70%)',
                }} />
                <Box sx={{
                    position: 'absolute', inset: 0,
                    bgcolor: 'rgba(12,12,20,0.15)',
                }} />
            </motion.div>

            {/* ── Subtle scan-line texture ── */}
            <Box sx={{
                position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)',
            }} />

            {/* ── Ambient cyan glow from left ── */}
            <Box sx={{
                position: 'absolute', left: -200, top: '30%', width: 600, height: 600,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,194,255,0.06) 0%, transparent 65%)',
                zIndex: 1, pointerEvents: 'none',
            }} />

            {/* ── Content ── */}
            <Box
                sx={{
                    position: 'relative', zIndex: 2,
                    width: '100%', maxWidth: '1400px',
                    mx: 'auto', px: { xs: 2.5, sm: 4, md: 8, lg: 10 },
                    py: { xs: 8, md: 0 },
                }}
            >
                <Box sx={{ maxWidth: { xs: '100%', md: 520 } }}>
                    {/* Japanese watermark */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.05 }}
                    >
                        <Typography sx={{
                            fontFamily: '"Noto Serif JP", serif',
                            fontSize: '0.6rem',
                            color: 'rgba(255,255,255,0.12)',
                            letterSpacing: '0.4em',
                            mb: 1,
                        }}>
                            未来の移動手段
                        </Typography>
                    </motion.div>

                    {/* NOUVELLE COLLECTION badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EASE }}
                    >
                        <Box sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 1,
                            px: 1.75, py: 0.6,
                            bgcolor: 'rgba(0,194,255,0.08)',
                            border: '1px solid rgba(0,194,255,0.25)',
                            borderRadius: '20px',
                            mb: 3,
                        }}>
                            <ElectricScooterIcon sx={{ fontSize: '0.85rem', color: CYAN }} />
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', color: CYAN, textTransform: 'uppercase' }}>
                                LIVRAISON GRATUITE — OFFRE LIMITÉE
                            </Typography>
                        </Box>
                    </motion.div>

                    {/* Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
                    >
                        <Typography
                            component="h1"
                            sx={{
                                fontFamily: '"Orbitron", sans-serif',
                                fontWeight: 900,
                                fontSize: { xs: '2.4rem', sm: '3.4rem', md: '4rem', lg: '4.6rem' },
                                lineHeight: 1.05,
                                letterSpacing: '-0.02em',
                                textTransform: 'uppercase',
                                color: '#E8ECF2',
                                mb: 2.5,
                            }}
                        >
                            ROULEZ PLUS{' '}
                            <Box
                                component="span"
                                sx={{
                                    color: CYAN,
                                    textShadow: `0 0 16px rgba(0,194,255,0.2), 0 0 32px rgba(0,194,255,0.08)`,
                                }}
                            >
                                VITE
                            </Box>
                            ,<br />PLUS LOIN,
                            <br />PLUS{' '}
                            <Box
                                component="span"
                                sx={{
                                    color: CYAN,
                                    textShadow: `0 0 16px rgba(0,194,255,0.2), 0 0 32px rgba(0,194,255,0.08)`,
                                }}
                            >
                                LIBRE
                            </Box>
                        </Typography>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: '0.88rem', md: '0.95rem' },
                                color: 'rgba(255,255,255,0.55)',
                                lineHeight: 1.75,
                                mb: 4,
                                maxWidth: 420,
                            }}
                        >
                            Jusqu'à 80 km d'autonomie, 45 km/h de vitesse max. Rejoignez 500+ propriétaires qui ont adopté la mobilité{' '}
                            <Box component="span" sx={{ color: CYAN, fontWeight: 600 }}>intelligente.</Box>
                        </Typography>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.35 }}
                    >
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
                            <Button
                                component={Link}
                                to="/products"
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForwardIcon />}
                                sx={{
                                    px: 3.5, py: 1.5, fontSize: '0.88rem',
                                    bgcolor: CYAN,
                                    color: '#0c0c14', fontWeight: 800,
                                    boxShadow: `0 4px 14px rgba(0,194,255,0.25)`,
                                    '&:hover': {
                                        bgcolor: '#33CFFF',
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 6px 20px rgba(0,194,255,0.35)`,
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                VOIR NOS MODÈLES
                            </Button>
                            <Button
                                component={Link}
                                to="/products?filter[is_on_sale]=1"
                                variant="outlined"
                                size="large"
                                sx={{
                                    px: 3.5, py: 1.5, fontSize: '0.88rem',
                                    borderColor: 'rgba(217,122,80,0.5)',
                                    color: '#D97A50',
                                    '&:hover': {
                                        borderColor: '#D97A50',
                                        bgcolor: 'rgba(217,122,80,0.08)',
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                PROMOS EN COURS
                            </Button>
                        </Box>
                    </motion.div>

                    {/* Trust micro-line */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.45 }}
                    >
                        <Box sx={{ display: 'flex', gap: { xs: 2, md: 3 }, mb: 4, flexWrap: 'wrap' }}>
                            {[
                                'Garantie 2 ans',
                                'Livraison 2-5 jours',
                                'Retour 30 jours',
                            ].map((item) => (
                                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#2EAD5F', boxShadow: '0 0 6px #2EAD5F' }} />
                                    <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '0.02em' }}>
                                        {item}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </motion.div>

                    {/* Stats row with CountUp */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                    >
                        <Box sx={{ display: 'flex', gap: { xs: 3, md: 4 }, flexWrap: 'wrap' }}>
                            {stats.map(({ value, suffix, decimals, label }, i) => (
                                <motion.div
                                    key={label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.55 + i * 0.1 }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 900, fontSize: { xs: '1.4rem', md: '1.75rem' },
                                            color: CYAN, lineHeight: 1,
                                            textShadow: `0 0 12px rgba(0,194,255,0.18)`,
                                            letterSpacing: '-0.02em',
                                            fontFamily: '"Orbitron", sans-serif',
                                        }}
                                    >
                                        <CountUp end={value} decimals={decimals ?? 0} duration={2} delay={0.6} suffix={suffix} />
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500, mt: 0.25 }}>
                                        {label}
                                    </Typography>
                                </motion.div>
                            ))}
                        </Box>
                    </motion.div>
                </Box>
            </Box>
            {/* ── Scroll-down indicator ── */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: { xs: 60, md: 80 },
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                }}
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                >
                    <Typography sx={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500 }}>
                        Scroll
                    </Typography>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: [0, 0.6, 0], y: [-5, 8, -5] }}
                    transition={{ delay: 1.4, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <KeyboardArrowDownIcon sx={{ fontSize: '1.3rem', color: 'rgba(0,194,255,0.5)' }} />
                </motion.div>
            </Box>
        </Box>
    );
}
