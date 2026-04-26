import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import { motion } from 'framer-motion';
import { AnimatedSection } from '@/shared/components/AnimatedSection';
import { staggerContainer, fadeInUp } from '@/shared/animations/variants';
import { useRef } from 'react';

const TESTIMONIALS = [
    {
        name: 'Ahmed K.',
        city: 'Casablanca',
        rating: 5,
        product: 'MiraiTech Pro X',
        text: '"Qualité exceptionnelle ! Ma MiraiTech Pro est rapide, silencieuse et le design est incroyable. Meilleur achat de l\'année."',
    },
    {
        name: 'Fatima Z.',
        city: 'Rabat',
        rating: 5,
        product: 'MiraiTech Urban',
        text: '"Livraison rapide et service client au top. La trottinette est exactement comme décrite. Je recommande à 100%."',
    },
    {
        name: 'Youssef M.',
        city: 'Marrakech',
        rating: 5,
        product: 'MiraiTech Sport',
        text: '"Après 6 mois d\'utilisation quotidienne, toujours aussi performante. L\'autonomie est impressionnante."',
    },
    {
        name: 'Nadia B.',
        city: 'Fes',
        rating: 5,
        product: 'MiraiTech Lite',
        text: '"Parfaite pour mes trajets quotidiens. Légère, pliable, et la batterie tient toute la journée. Ravie de mon achat."',
    },
    {
        name: 'Karim L.',
        city: 'Tanger',
        rating: 5,
        product: 'MiraiTech Pro Max',
        text: '"La puissance du moteur est bluffante. Je monte les côtes sans aucun effort. Le SAV est très réactif aussi."',
    },
    {
        name: 'Salma E.',
        city: 'Agadir',
        rating: 5,
        product: 'MiraiTech Urban S',
        text: '"Design magnifique, tout le monde me demande où je l\'ai achetée. Confortable et stable même sur les pavés."',
    },
];

const AVATAR_COLORS = ['#00C2FF', '#D4A43A', '#2EAD5F', '#D97A50', '#9B59B6', '#C7404D'];

function StarRating({ rating }: { rating: number }) {
    return (
        <Box sx={{ display: 'flex', gap: 0.3, mb: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                    key={i}
                    sx={{
                        fontSize: '1rem',
                        color: i < rating ? '#D4A43A' : 'rgba(255,255,255,0.12)',
                    }}
                />
            ))}
        </Box>
    );
}

export function TestimonialsSection() {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <AnimatedSection>
            <Box
                component="section"
                sx={{
                    bgcolor: '#0c0c14',
                    py: { xs: 6, md: 10 },
                }}
            >
                <Container maxWidth="lg">
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 6 } }}>
                        <Typography
                            sx={{
                                fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em',
                                color: '#00C2FF', textTransform: 'uppercase', mb: 1,
                                fontFamily: '"Orbitron", sans-serif'
                            }}
                        >
                            TÉMOIGNAGES CLIENTS
                        </Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.4rem' }, color: '#E8ECF2', textTransform: 'uppercase', fontFamily: '"Orbitron", sans-serif', mb: 2 }}>
                            500+ CLIENTS SATISFAITS
                        </Typography>
                        {/* Aggregate rating */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                            <Box sx={{ display: 'flex', gap: 0.3 }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <StarIcon key={i} sx={{ fontSize: '1.2rem', color: '#D4A43A' }} />
                                ))}
                            </Box>
                            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#D4A43A', fontFamily: '"Orbitron", sans-serif' }}>
                                4.8/5
                            </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.82rem', color: '#8A919D' }}>
                            Basé sur 500+ avis vérifiés à travers le Maroc
                        </Typography>
                    </Box>

                    {/* Desktop: grid 3 cols, Mobile: horizontal scroll carousel */}
                    <Box
                        ref={scrollRef}
                        component={motion.div}
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        sx={{
                            display: { xs: 'flex', md: 'grid' },
                            gridTemplateColumns: { md: 'repeat(3, 1fr)' },
                            gap: { xs: 2, md: 4 },
                            // Mobile horizontal scroll
                            overflowX: { xs: 'auto', md: 'visible' },
                            scrollSnapType: { xs: 'x mandatory', md: 'none' },
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': { display: 'none' },
                            pb: { xs: 2, md: 0 },
                        }}
                    >
                        {TESTIMONIALS.map(({ name, city, rating, product, text }, i) => (
                            <motion.div key={name} variants={fadeInUp} style={{ flexShrink: 0 }}>
                                <Box
                                    sx={{
                                        height: '100%',
                                        width: { xs: 280, md: 'auto' },
                                        p: { xs: 3, md: 4 },
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        background: 'rgba(17, 17, 22, 0.4)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        scrollSnapAlign: { xs: 'start', md: 'unset' },
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: 'rgba(0,194,255,0.15)',
                                            transform: { md: 'translateY(-4px)' },
                                        },
                                    }}
                                >
                                    <StarRating rating={rating} />

                                    <Typography sx={{ fontSize: '0.92rem', color: '#E8ECF2', lineHeight: 1.6, mb: 3, flexGrow: 1 }}>
                                        {text}
                                    </Typography>

                                    {/* Purchase reference */}
                                    <Typography sx={{ fontSize: '0.7rem', color: '#8A919D', mb: 2, fontStyle: 'italic' }}>
                                        A acheté : {product}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        {/* Avatar initials */}
                                        <Box sx={{
                                            width: 36, height: 36,
                                            borderRadius: '50%',
                                            bgcolor: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}18`,
                                            border: `1px solid ${AVATAR_COLORS[i % AVATAR_COLORS.length]}30`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <Typography sx={{
                                                fontSize: '0.8rem', fontWeight: 700,
                                                color: AVATAR_COLORS[i % AVATAR_COLORS.length],
                                                fontFamily: '"Orbitron", sans-serif',
                                            }}>
                                                {name[0]}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#E8ECF2', fontFamily: '"Orbitron", sans-serif' }}>
                                                    {name}
                                                </Typography>
                                                <VerifiedIcon sx={{ fontSize: '0.85rem', color: '#00C2FF' }} />
                                            </Box>
                                            <Typography sx={{ fontSize: '0.75rem', color: '#8A919D' }}>{city}</Typography>
                                        </Box>
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
