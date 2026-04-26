import { useState, useMemo, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams, Link, useNavigate } from 'react-router';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BoltIcon from '@mui/icons-material/Bolt';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import StarIcon from '@mui/icons-material/Star';
import { useProduct, useRelatedProducts, useFeaturedProducts } from '../api/products';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { ProductGallery } from '../components/ProductGallery';
import { SpecsTable } from '../components/SpecsTable';
import { StockBadge } from '../components/StockBadge';
import { CategoryBreadcrumb } from '../components/CategoryBreadcrumb';
import { useCartStore } from '../../cart/store';
import type { ProductVariantDisplay } from '../types';
import { PageDecor } from '@/shared/components/PageDecor';
import { ProductCard } from '../components/ProductCard';
import { motion } from 'framer-motion';
import { fadeInLeft, fadeInRight, fadeInUp, staggerContainer } from '@/shared/animations/variants';
import { AnimatedSection } from '@/shared/components/AnimatedSection';
import { useRef as useScrollRef } from 'react';

function ProductDetailSkeleton() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 3, bgcolor: 'action.hover' }} />
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Skeleton variant="rectangular" height={440} sx={{ mb: 1.5, borderRadius: 2, bgcolor: 'action.hover' }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} variant="rectangular" width={80} height={64} sx={{ borderRadius: 1, bgcolor: 'action.hover' }} />
              ))}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Skeleton variant="text" height={48} sx={{ mb: 1, bgcolor: 'action.hover' }} />
            <Skeleton variant="text" height={40} width={140} sx={{ mb: 2, bgcolor: 'action.hover' }} />
            <Skeleton variant="rounded" width={100} height={28} sx={{ mb: 3, bgcolor: 'action.hover' }} />
            <Skeleton variant="rectangular" height={56} sx={{ mb: 1.5, borderRadius: 1, bgcolor: 'action.hover' }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1, bgcolor: 'action.hover' }} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

/**
 * ProductDetailPage — /products/:slug
 * MiraiTech dark redesign: glow price, sticky add-to-cart panel,
 * gallery, specs table, trust signals, category breadcrumb.
 */
export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(slug ?? '');
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Variant selection state
  const [selectedVariantValues, setSelectedVariantValues] = useState<Record<string, string>>({});

  // Description expand / collapse
  const [descExpanded, setDescExpanded] = useState(false);
  const [prevSlug, setPrevSlug] = useState(slug);
  if (prevSlug !== slug) { setPrevSlug(slug); setDescExpanded(false); }
  const descRef = useRef<HTMLDivElement>(null);
  const [descClamped, setDescClamped] = useState(false);

  // Scroll to top whenever the product slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!descExpanded && descRef.current) {
      setDescClamped(descRef.current.scrollHeight > descRef.current.clientHeight + 2);
    }
  }, [product?.description, descExpanded]);

  // Extract unique variation types from variants
  const variationTypes = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];
    const typesMap = new Map<string, Set<string>>();
    product.variants.forEach((variant) => {
      (variant.attribute_values ?? []).forEach((val) => {
        const attrName = val.attribute ?? '';
        if (!typesMap.has(attrName)) {
          typesMap.set(attrName, new Set());
        }
        typesMap.get(attrName)!.add(val.value);
      });
    });
    return Array.from(typesMap.entries()).map(([type, values]) => ({
      type,
      values: Array.from(values),
    }));
  }, [product]);

  // Find matching variant based on selected values
  const selectedVariant = useMemo<ProductVariantDisplay | null>(() => {
    if (!product?.variants || variationTypes.length === 0) return null;
    if (Object.keys(selectedVariantValues).length !== variationTypes.length) return null;

    return (
      product.variants.find((variant) => {
        return (variant.attribute_values ?? []).every(
          (val) => selectedVariantValues[val.attribute ?? ''] === val.value
        );
      }) ?? null
    );
  }, [product, selectedVariantValues, variationTypes]);

  // Determine displayed price, promo, and stock from selected or default variant
  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayPromoPrice = selectedVariant?.promo_price ?? product?.default_variant?.promo_price ?? null;
  const displayIsOnSale = selectedVariant?.is_on_sale ?? product?.default_variant?.is_on_sale ?? false;
  const displayStock = selectedVariant?.stock ?? product?.stock_quantity ?? 0;
  const displayInStock = displayStock > 0;

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="xl">
          <Alert severity="warning" sx={{ mb: 3 }}>
            {"Produit introuvable"}
          </Alert>
          <Button component={Link} to="/products" variant="outlined" startIcon={<ArrowBackIcon />}>
            {"Retour au catalogue"}
          </Button>
        </Container>
      </Box>
    );
  }

  const hasVariants = product.variants && product.variants.length > 0;
  const variantNotSelected = hasVariants && !selectedVariant;
  // For cart dedup: match on productId + variantId
  const effectiveVariantId = selectedVariant?.id ?? product.default_variant?.id;
  const cartItem = items.find(
    (i) => i.productId === product.id && (i.variantId ?? null) === (effectiveVariantId ?? null)
  );
  const isAtMaxStock = cartItem ? cartItem.quantity >= displayStock : false;
  const isAddDisabled = !displayInStock || isAtMaxStock || variantNotSelected;

  const getVariantToAdd = (): ProductVariantDisplay | null => {
    if (selectedVariant) {
      return selectedVariant;
    }

    if (!hasVariants && product.default_variant) {
      return {
        id: product.default_variant.id,
        sku: product.default_variant.sku,
        price: product.default_variant.price,
        promo_price: product.default_variant.promo_price,
        is_on_sale: product.default_variant.is_on_sale,
        stock: product.default_variant.stock,
        attribute_values: [],
      } as ProductVariantDisplay;
    }

    return null;
  };

  const handleAddToCart = () => {
    const variantToAdd = getVariantToAdd();
    addItem(product, product.name, variantToAdd);
    setSnackbarOpen(true);
  };

  const handleBuyNow = () => {
    if (isAddDisabled) return;
    const variantToAdd = getVariantToAdd();
    addItem(product, product.name, variantToAdd);
    void navigate('/checkout');
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Futuristic side decorations */}
      <PageDecor variant="productDetail" />

      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 5 }, position: 'relative', zIndex: 1 }}>
        {/* Breadcrumb */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <CategoryBreadcrumb category={product.category} />
        </Box>

        <Grid container spacing={{ xs: 2, md: 6 }}>
          {/* Gallery */}
          <Grid size={{ xs: 12, md: 7 }} sx={{ order: { xs: 1, md: 1 } }}>
            <motion.div variants={fadeInLeft} initial="hidden" animate="visible">
              <ProductGallery images={product.images} />
            </motion.div>
          </Grid>

          {/* Description + Specs — shown after cart on mobile */}
          <Grid size={{ xs: 12, md: 7 }} sx={{ order: { xs: 3, md: 3 } }}>
            {/* Specs */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: '0.75rem', md: '0.8rem' },
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    color: '#00C2FF',
                    textTransform: 'uppercase',
                    fontFamily: '"Orbitron", sans-serif',
                    mb: { xs: 1.25, md: 2 },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <span style={{ width: 8, height: 8, backgroundColor: '#00C2FF', borderRadius: '50%', display: 'inline-block' }} />
                  CARACTÉRISTIQUES TECHNIQUES
                </Typography>
                <SpecsTable attributes={product.attributes} />
              </Box>
            )}

            {/* Description */}
            {product.description && (
              <Box sx={{ mt: { xs: 3, md: 4 } }}>
                <Typography
                  sx={{
                    fontSize: { xs: '0.75rem', md: '0.8rem' },
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    color: '#00C2FF',
                    textTransform: 'uppercase',
                    fontFamily: '"Orbitron", sans-serif',
                    mb: { xs: 1.25, md: 2 },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <span style={{ width: 8, height: 8, backgroundColor: '#00C2FF', borderRadius: '50%', display: 'inline-block' }} />
                  DESCRIPTION DU PRODUIT
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    ref={descRef}
                    sx={{
                      fontSize: { xs: '0.85rem', md: '0.92rem' },
                      color: 'text.secondary',
                      lineHeight: { xs: 1.6, md: 1.8 },
                      ...(!descExpanded && { maxHeight: { xs: 120, md: 135 }, overflow: 'hidden' }),
                      '& h1, & h2, & h3': { color: 'text.primary', mt: { xs: 1.5, md: 2 }, mb: { xs: 0.75, md: 1 } },
                      '& ul': { pl: { xs: 2.5, md: 3 }, listStyleType: 'disc' },
                      '& ol': { pl: { xs: 2.5, md: 3 }, listStyleType: 'decimal' },
                      '& li': { mb: 0.5, display: 'list-item' },
                      '& p': { mb: { xs: 1.2, md: 1.5 } },
                      '& p:last-child': { mb: 0 },
                      '& a': { color: '#00C2FF' },
                      '& strong': { color: 'text.primary', fontWeight: 700 },
                      '& em': { fontStyle: 'italic' },
                      '& blockquote': { borderLeft: '3px solid #00C2FF', pl: 2, ml: 0, color: 'text.disabled' },
                      '& code': { fontFamily: 'monospace', fontSize: '0.85em', bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5 },
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {product.description}
                    </ReactMarkdown>
                  </Box>
                  {descClamped && !descExpanded && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 60,
                        background: 'linear-gradient(to bottom, transparent, #0c0c14)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </Box>
                {descClamped && (
                  <Button
                    onClick={() => setDescExpanded((prev) => !prev)}
                    size="small"
                    sx={{
                      mt: 0.5,
                      color: '#00C2FF',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'none',
                      px: 0,
                      minWidth: 0,
                      '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    {descExpanded ? 'Afficher moins' : 'Afficher plus'}
                  </Button>
                )}
              </Box>
            )}
          </Grid>

          {/* Right: product info panel — order 2 so it appears before description on mobile */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ order: { xs: 2, md: 2 } }}>
            <motion.div variants={fadeInRight} initial="hidden" animate="visible">
            <Box
              className="mirai-glass"
              sx={{
                borderRadius: { xs: '12px', md: '20px' },
                p: { xs: 1.25, md: 3.5 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, #00C2FF, transparent)',
                },
              }}
            >
              <Stack spacing={{ xs: 0.9, md: 2.5 }}>
                {/* Category chip + NEW badge */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {product.category && (
                    <Chip
                      label={product.category.name}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(0,194,255,0.12)',
                        color: '#00C2FF',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    />
                  )}
                  {product.is_new && (
                    <Chip
                      label="NOUVEAU"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(46,173,95,0.15)',
                        color: '#2EAD5F',
                        border: '1px solid rgba(46,173,95,0.3)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    />
                  )}
                </Box>

                {/* Product name */}
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: '1.15rem', md: '2.4rem' },
                    fontWeight: 900,
                    lineHeight: 1.1,
                    color: 'text.primary',
                    letterSpacing: '0.02em',
                    fontFamily: '"Orbitron", sans-serif',
                    textTransform: 'uppercase',
                  }}
                >
                  {product.name}
                </Typography>

                {/* Price */}
                {displayIsOnSale && displayPromoPrice != null ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip
                        label="PROMO"
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(217,122,80,0.15)',
                          color: '#D97A50',
                          border: '1px solid rgba(217,122,80,0.3)',
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          height: 20,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: '0.95rem',
                          color: 'text.disabled',
                          textDecoration: 'line-through',
                          fontWeight: 500,
                        }}
                      >
                        {formatCurrency(displayPrice)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <BoltIcon sx={{ fontSize: '1.2rem', color: '#D97A50', mb: '-2px' }} />
                      <Typography
                        sx={{
                          fontSize: { xs: '1.3rem', md: '2rem' },
                          fontWeight: 800,
                          color: '#D97A50',
                          lineHeight: 1,
                          textShadow: '0 0 12px rgba(217,122,80,0.2)',
                        }}
                      >
                        {formatCurrency(displayPromoPrice)}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <BoltIcon sx={{ fontSize: '1.2rem', color: '#00C2FF', mb: '-2px' }} />
                    <Typography
                      sx={{
                        fontSize: { xs: '1.3rem', md: '2rem' },
                        fontWeight: 800,
                        color: '#00C2FF',
                        lineHeight: 1,
                        textShadow: '0 0 12px rgba(0,194,255,0.2)',
                      }}
                    >
                      {formatCurrency(displayPrice)}
                    </Typography>
                  </Box>
                )}

                {/* Variant selectors */}
                {variationTypes.length > 0 && (
                  <>
                    {variationTypes.map(({ type, values }) => (
                      <Box key={type}>
                        <Typography
                          sx={{
                            fontSize: { xs: '0.6rem', md: '0.7rem' },
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                            mb: { xs: 0.5, md: 1 },
                          }}
                        >
                          {type}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, flexWrap: 'wrap' }}>
                          {values.map((value) => {
                            const isSelected = selectedVariantValues[type] === value;
                            return (
                              <Chip
                                key={value}
                                label={value}
                                onClick={() =>
                                  setSelectedVariantValues((prev) => ({
                                    ...prev,
                                    [type]: value,
                                  }))
                                }
                                sx={{
                                  borderColor: isSelected ? '#00C2FF' : 'divider',
                                  backgroundColor: isSelected
                                    ? 'rgba(0,194,255,0.12)'
                                    : 'transparent',
                                  color: isSelected ? '#00C2FF' : 'text.secondary',
                                  fontWeight: isSelected ? 700 : 500,
                                  fontSize: { xs: '0.68rem', md: '0.8rem' },
                                  height: { xs: 26, md: 32 },
                                  cursor: 'pointer',
                                  '& .MuiChip-label': { px: { xs: 1, md: 1.5 } },
                                  '&:hover': {
                                    backgroundColor: isSelected
                                      ? 'rgba(0,194,255,0.18)'
                                      : 'rgba(255,255,255,0.04)',
                                  },
                                }}
                                variant="outlined"
                              />
                            );
                          })}
                        </Box>
                      </Box>
                    ))}
                  </>
                )}

                {/* Stock status + urgency */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <StockBadge inStock={displayInStock} />
                  {displayInStock && displayStock <= 5 && displayStock > 0 && (
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 0.5,
                      bgcolor: 'rgba(212,164,58,0.08)', border: '1px solid rgba(212,164,58,0.2)',
                      borderRadius: '6px', px: 1, py: 0.4,
                    }}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#D4A43A', animation: 'pulse-dot 2s ease infinite' }} />
                      <Typography sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' }, color: '#D4A43A', fontWeight: 700 }}>
                        Plus que {displayStock} — Vite !
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Rating display */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', gap: 0.15 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} sx={{ fontSize: { xs: '0.75rem', md: '0.9rem' }, color: '#D4A43A' }} />
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: { xs: '0.68rem', md: '0.78rem' }, color: '#D4A43A', fontWeight: 700 }}>4.8/5</Typography>
                  <Typography sx={{ fontSize: { xs: '0.62rem', md: '0.72rem' }, color: 'text.secondary' }}>(500+ avis)</Typography>
                </Box>

                <Divider sx={{ display: { xs: 'none', md: 'block' } }} />

                {/* CTA Actions */}
                <Stack spacing={{ xs: 0.75, md: 1 }} sx={{ pt: 0.25, display: { xs: 'none', md: 'flex' } }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isAddDisabled}
                    onClick={handleAddToCart}
                    startIcon={<ShoppingCartIcon />}
                    sx={{
                      py: { xs: 1, md: 1.75 },
                      fontSize: { xs: '0.75rem', md: '0.88rem' },
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      borderRadius: { xs: '8px', md: '12px' },
                      bgcolor: isAddDisabled ? undefined : '#00C2FF',
                      boxShadow: isAddDisabled
                        ? 'none'
                        : '0 4px 14px rgba(0,194,255,0.25)',
                      transition: 'all 0.3s',
                      '&:hover': { transform: isAddDisabled ? 'none' : 'translateY(-2px)' },
                    }}
                  >
                    {variantNotSelected
                      ? "Sélectionner une variante"
                      : isAtMaxStock && displayInStock
                        ? "Stock maximum atteint"
                        : "Ajouter au panier"}
                  </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      disabled={isAddDisabled}
                      onClick={handleBuyNow}
                      sx={{
                        py: { xs: 0.9, md: 1.4 },
                        fontSize: { xs: '0.73rem', md: '0.84rem' },
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        borderRadius: { xs: '8px', md: '12px' },
                        borderColor: 'rgba(0,194,255,0.45)',
                        color: '#00C2FF',
                      }}
                    >
                      Acheter maintenant
                    </Button>

                  {/* Reassurance micro-copy */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 0.75, md: 2.5 }, flexWrap: 'wrap', pt: { xs: 0, md: 0.25 } }}>
                    {[
                      { icon: <LocalShippingOutlinedIcon sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }} />, label: 'Livraison 2-5j' },
                      { icon: <UndoIcon sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }} />, label: 'Retour 30j' },
                      { icon: <LockOutlinedIcon sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }} />, label: 'Paiement sécurisé' },
                    ].map(({ icon, label }) => (
                      <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled' }}>
                        {icon}
                        <Typography sx={{ fontSize: { xs: '0.58rem', md: '0.62rem' }, fontWeight: 500 }}>{label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Stack>
              </Stack>
            </Box>
            </motion.div>
          </Grid>
        </Grid>

        {/* Related Products */}
        <RelatedProductsSection categoryId={product.category?.id} excludeProductId={product.id} />

        {/* Upsell Section */}
        <UpsellSection excludeProductId={product.id} />
      </Container>

      {/* Mobile sticky Add to Cart bar */}
      <Box sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
        bgcolor: 'rgba(12,12,20,0.96)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(0,194,255,0.15)',
        p: 1.2, gap: 1.5, alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: displayIsOnSale ? '#D97A50' : '#00C2FF', fontSize: '1rem' }}>
            {formatCurrency(displayIsOnSale && displayPromoPrice ? displayPromoPrice : displayPrice)}
          </Typography>
        </Box>
        <Button
          variant="contained"
          disabled={isAddDisabled}
          onClick={handleAddToCart}
          startIcon={<ShoppingCartIcon sx={{ fontSize: '1rem' }} />}
          sx={{
            flex: 1, maxWidth: 190, py: 1, fontSize: '0.75rem',
            bgcolor: isAddDisabled ? undefined : '#00C2FF',
            fontWeight: 700,
          }}
        >
          Ajouter
        </Button>
        <Button
          variant="outlined"
          disabled={isAddDisabled}
          onClick={handleBuyNow}
          sx={{
            py: 1,
            minWidth: 100,
            borderColor: 'rgba(0,194,255,0.45)',
            color: '#00C2FF',
            fontSize: '0.7rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          Acheter
        </Button>
      </Box>

      {/* Added to cart snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        message={"Ajouté au panier"}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

/* ════════════════════════════════════════════════════════════════════
   RELATED PRODUCTS SECTION
   ════════════════════════════════════════════════════════════════════ */
function RelatedProductsSection({ categoryId, excludeProductId }: { categoryId?: number; excludeProductId: number }) {
  const { data, isLoading } = useRelatedProducts(categoryId, excludeProductId);
  const products = data?.data ?? [];

  if (!categoryId || (!isLoading && products.length === 0)) return null;

  return (
    <AnimatedSection>
      <Box sx={{ mt: 8, pt: 6, borderTop: '1px solid rgba(0,194,255,0.1)' }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 800,
            mb: 4,
            color: 'text.primary',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          PRODUITS SIMILAIRES
        </Typography>
        {isLoading ? (
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                <Skeleton variant="rectangular" sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', aspectRatio: '1 / 1.3' }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Grid container spacing={2}>
              {products.slice(0, 4).map((p) => (
                <Grid key={p.id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <motion.div variants={fadeInUp}>
                    <ProductCard product={p} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </Box>
    </AnimatedSection>
  );
}

/* ════════════════════════════════════════════════════════════════════
   UPSELL "VOUS AIMEREZ AUSSI" SECTION
   ════════════════════════════════════════════════════════════════════ */
function UpsellSection({ excludeProductId }: { excludeProductId: number }) {
  const { data, isLoading } = useFeaturedProducts();
  const products = (data?.data ?? []).filter(p => p.id !== excludeProductId);
  const scrollRef = useScrollRef<HTMLDivElement>(null);

  if (!isLoading && products.length === 0) return null;

  return (
    <AnimatedSection>
      <Box sx={{ mt: 8, pt: 6, borderTop: '1px solid rgba(0,194,255,0.06)' }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 800,
            mb: 4,
            color: 'text.primary',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          VOUS AIMEREZ AUSSI
        </Typography>
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex', gap: 2, overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
            pb: 2,
            maskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)',
          }}
        >
          {products.map((p) => (
            <Box key={p.id} sx={{ flexShrink: 0, width: { xs: 260, sm: 280, md: 300 }, scrollSnapAlign: 'start' }}>
              <ProductCard product={p} />
            </Box>
          ))}
        </Box>
      </Box>
    </AnimatedSection>
  );
}
