import { useState } from 'react';
import { useLocation } from 'react-router';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ShareIcon from '@mui/icons-material/Share';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LinkIcon from '@mui/icons-material/Link';
import { useAuthStore } from '@/features/auth/store';
import { parseSiteSettingsContent, type ShippingPricingMode, type ShippingPricingRule, type SiteSettings, type SiteShortLink } from '@/shared/types/siteSettings';
import { useAdminSiteSettingsPage, useUpdateAdminSiteSettingsPage } from '../api/siteSettings';

function slugifyLabel(label: string): string {
  const normalized = label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const compact = normalized
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return compact || 'nouvelle-page';
}

function extractDynamicSlug(url: string): string | null {
  const match = url.match(/^\/pages\/([a-z0-9-]+)$/i);
  return match ? match[1].toLowerCase() : null;
}

function buildUniqueShortLinkUrl(label: string, links: SiteShortLink[], currentIndex?: number): string {
  const baseSlug = slugifyLabel(label);
  const usedSlugs = new Set(
    links
      .map((link, index) => {
        if (typeof currentIndex === 'number' && index === currentIndex) {
          return null;
        }

        return extractDynamicSlug(link.url);
      })
      .filter((slug): slug is string => Boolean(slug))
  );

  let candidate = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return `/pages/${candidate}`;
}

function centimesToMad(centimes: number): string {
  return (Math.max(0, centimes) / 100).toFixed(2);
}

function madToCentimes(value: string): number {
  const normalized = value.replace(',', '.').trim();
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

function sectionFromHash(hash: string): number {
  const normalized = hash.replace('#', '').trim().toLowerCase();

  if (normalized === 'social') return 1;
  if (normalized === 'shipping') return 2;
  if (normalized === 'short-links') return 3;
  return 0; // default: contact
}

function hashFromTabIndex(tabIndex: number): string {
  const hashMap = ['#contact', '#social', '#shipping', '#short-links'];
  return hashMap[tabIndex] ?? '#contact';
}

// Glass card style reused across all tab panels
const glassSx = {
  background: 'rgba(12, 12, 20, 0.7)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0,194,255,0.09)',
  borderRadius: '18px',
  p: { xs: 2, md: 3 },
};

function SiteSettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  const location = useLocation();
  const updateMutation = useUpdateAdminSiteSettingsPage();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSettings);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState(sectionFromHash(location.hash));

  const handleSiteSettingChange = (key: keyof SiteSettings, value: string) => {
    setSiteSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleShippingFieldChange = (key: 'delivery_fee_default' | 'free_shipping_threshold', value: string) => {
    setSiteSettings((prev) => ({
      ...prev,
      [key]: madToCentimes(value),
    }));
  };

  const handleShippingModeChange = (value: ShippingPricingMode) => {
    setSiteSettings((prev) => ({
      ...prev,
      shipping_pricing_mode: value,
    }));
  };

  const handleShippingRuleChange = (index: number, field: 'min_subtotal' | 'fee', value: string) => {
    setSiteSettings((prev) => {
      const nextRules = [...prev.shipping_pricing_rules];
      nextRules[index] = {
        ...nextRules[index],
        [field]: madToCentimes(value),
      };

      return {
        ...prev,
        shipping_pricing_rules: nextRules,
      };
    });
  };

  const addShippingRule = () => {
    setSiteSettings((prev) => ({
      ...prev,
      shipping_pricing_rules: [...prev.shipping_pricing_rules, { min_subtotal: 0, fee: 0 }],
    }));
  };

  const removeShippingRule = (index: number) => {
    setSiteSettings((prev) => ({
      ...prev,
      shipping_pricing_rules: prev.shipping_pricing_rules.filter((_, i) => i !== index),
    }));
  };

  const handleShortLinkLabelChange = (index: number, value: string) => {
    setSiteSettings((prev) => {
      const nextLinks = [...prev.short_links];
      const url = buildUniqueShortLinkUrl(value, nextLinks, index);

      nextLinks[index] = {
        ...nextLinks[index],
        label: value,
        url,
      };

      return {
        ...prev,
        short_links: nextLinks,
      };
    });
  };

  const addShortLink = () => {
    setSiteSettings((prev) => {
      const newUrl = buildUniqueShortLinkUrl('nouvelle-page', prev.short_links);
      return {
        ...prev,
        short_links: [...prev.short_links, { label: '', url: newUrl }],
      };
    });
  };

  const removeShortLink = (index: number) => {
    setSiteSettings((prev) => ({
      ...prev,
      short_links: prev.short_links.filter((_, i) => i !== index),
    }));
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    window.location.hash = hashFromTabIndex(newValue);
  };

  const saveSiteSettings = async () => {
    const payload = JSON.stringify(siteSettings, null, 2);
    try {
      await updateMutation.mutateAsync({
        title: 'Parametres du site',
        content: payload,
      });
      setFeedback({ type: 'success', message: 'Parametres du site enregistres.' });
    } catch {
      setFeedback({ type: 'error', message: 'Echec de l enregistrement des parametres du site.' });
    }
  };

  return (
    <>
      <Box>
        {/* Tabs Navigation */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            mb: 3,
            borderBottom: '1px solid rgba(0,194,255,0.1)',
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(90deg,#00C2FF,#0099CC)',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              color: 'var(--mirai-gray)',
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              gap: 0.75,
            },
            '& .Mui-selected': { color: 'var(--mirai-white) !important' },
          }}
        >
          <Tab
            icon={<ContactMailIcon sx={{ fontSize: '1rem' }} />}
            iconPosition="start"
            label="Contact"
            disableRipple={false}
          />
          <Tab
            icon={<ShareIcon sx={{ fontSize: '1rem' }} />}
            iconPosition="start"
            label="Reseaux sociaux"
            disableRipple={false}
          />
          <Tab
            icon={<LocalShippingIcon sx={{ fontSize: '1rem' }} />}
            iconPosition="start"
            label="Livraison"
            disableRipple={false}
          />
          <Tab
            icon={<LinkIcon sx={{ fontSize: '1rem' }} />}
            iconPosition="start"
            label="Short links"
            disableRipple={false}
          />
        </Tabs>

        {/* Tab Panel 0: Contact */}
        {activeTab === 0 && (
          <Box sx={glassSx}>
            <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
              Contact et disponibilite
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Infos affichees dans le footer et les zones de contact.
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={1.5}>
              <TextField label="Email contact" size="small" value={siteSettings.email} onChange={(e) => handleSiteSettingChange('email', e.target.value)} fullWidth />
              <TextField label="Telephone" size="small" value={siteSettings.phone} onChange={(e) => handleSiteSettingChange('phone', e.target.value)} fullWidth />
              <TextField label="Horaires" size="small" value={siteSettings.business_hours} onChange={(e) => handleSiteSettingChange('business_hours', e.target.value)} fullWidth />
              <TextField label="Titre promo homepage (optionnel)" size="small" value={siteSettings.home_promo_headline} onChange={(e) => handleSiteSettingChange('home_promo_headline', e.target.value)} fullWidth />
              <TextField label="Adresse" size="small" value={siteSettings.address} onChange={(e) => handleSiteSettingChange('address', e.target.value)} fullWidth multiline minRows={2} sx={{ gridColumn: { xs: '1 / -1', md: '1 / -1' } }} />
              <TextField label="Description footer" size="small" value={siteSettings.footer_description} onChange={(e) => handleSiteSettingChange('footer_description', e.target.value)} fullWidth multiline minRows={2} sx={{ gridColumn: { xs: '1 / -1', md: '1 / -1' } }} />
            </Box>
          </Box>
        )}

        {/* Tab Panel 1: Social */}
        {activeTab === 1 && (
          <Box sx={glassSx}>
            <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
              WhatsApp et reseaux sociaux
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Liens utilises pour les boutons de contact rapides.
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={1.5}>
              <TextField label="Numero WhatsApp" size="small" value={siteSettings.whatsapp_number} onChange={(e) => handleSiteSettingChange('whatsapp_number', e.target.value)} fullWidth />
              <TextField label="Lien WhatsApp direct (optionnel)" size="small" value={siteSettings.whatsapp_url} onChange={(e) => handleSiteSettingChange('whatsapp_url', e.target.value)} fullWidth />
              <TextField label="Message WhatsApp par defaut" size="small" value={siteSettings.whatsapp_prefill_message} onChange={(e) => handleSiteSettingChange('whatsapp_prefill_message', e.target.value)} fullWidth sx={{ gridColumn: { xs: '1 / -1', md: '1 / -1' } }} />
              <TextField label="Instagram URL" size="small" value={siteSettings.instagram_url} onChange={(e) => handleSiteSettingChange('instagram_url', e.target.value)} fullWidth />
              <TextField label="Facebook URL" size="small" value={siteSettings.facebook_url} onChange={(e) => handleSiteSettingChange('facebook_url', e.target.value)} fullWidth />
            </Box>
          </Box>
        )}

        {/* Tab Panel 2: Shipping */}
        {activeTab === 2 && (
          <Box sx={glassSx}>
            <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
              Frais de livraison et regles de prix
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Configurez les frais de base, le seuil de livraison gratuite et les regles selon le montant du panier (MAD).
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={1.5}>
              <FormControl size="small" fullWidth>
                <InputLabel id="shipping-pricing-mode-label">Mode de tarification</InputLabel>
                <Select
                  labelId="shipping-pricing-mode-label"
                  label="Mode de tarification"
                  value={siteSettings.shipping_pricing_mode}
                  onChange={(e) => handleShippingModeChange(e.target.value as ShippingPricingMode)}
                >
                  <MenuItem value="simple">Simple (frais fixes)</MenuItem>
                  <MenuItem value="tiered">Avance (regles par montant)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Frais de livraison par defaut (MAD)"
                value={centimesToMad(siteSettings.delivery_fee_default)}
                onChange={(e) => handleShippingFieldChange('delivery_fee_default', e.target.value)}
                type="number"
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />
              <Box sx={{ display: { xs: 'none', md: 'block' } }} />
              <TextField
                size="small"
                label="Livraison gratuite a partir de (MAD)"
                value={centimesToMad(siteSettings.free_shipping_threshold)}
                onChange={(e) => handleShippingFieldChange('free_shipping_threshold', e.target.value)}
                type="number"
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />
            </Box>

            <Box mt={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.25}>
                <Typography variant="subtitle2" fontWeight={700}>Regles de tarification conditionnelle</Typography>
                <Button size="small" variant="outlined" onClick={addShippingRule}>Ajouter une regle</Button>
              </Box>

              {siteSettings.shipping_pricing_mode !== 'tiered' ? (
                <Alert severity="info" sx={{ py: 0.5 }}>
                  Mode simple actif: seul le frais de livraison par defaut est applique (jusqu au seuil de livraison gratuite).
                </Alert>
              ) : siteSettings.shipping_pricing_rules.length === 0 ? (
                <Alert severity="info" sx={{ py: 0.5 }}>Aucune regle conditionnelle. Le frais par defaut sera applique.</Alert>
              ) : (
                <Box display="flex" flexDirection="column" gap={1.25}>
                  {siteSettings.shipping_pricing_rules.map((rule: ShippingPricingRule, index: number) => (
                    <Box key={`${index}-${rule.min_subtotal}-${rule.fee}`} display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr auto' }} gap={1}>
                      <TextField
                        size="small"
                        label="Panier a partir de (MAD)"
                        value={centimesToMad(rule.min_subtotal)}
                        onChange={(e) => handleShippingRuleChange(index, 'min_subtotal', e.target.value)}
                        type="number"
                        slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                      />
                      <TextField
                        size="small"
                        label="Frais appliques (MAD)"
                        value={centimesToMad(rule.fee)}
                        onChange={(e) => handleShippingRuleChange(index, 'fee', e.target.value)}
                        type="number"
                        slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                      />
                      <Button color="error" onClick={() => removeShippingRule(index)}>Supprimer</Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Tab Panel 3: Short Links */}
        {activeTab === 3 && (
          <Box sx={glassSx}>
            <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
              Short links dynamiques
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="caption" color="text.secondary">
                Chaque short link cree automatiquement une page markdown dynamique via /pages/slug.
              </Typography>
              <Button size="small" variant="outlined" onClick={addShortLink}>Ajouter</Button>
            </Box>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {siteSettings.short_links.length === 0 && (
                <Alert severity="info" sx={{ py: 0.5 }}>Aucun short link configure pour le moment.</Alert>
              )}
              {siteSettings.short_links.map((link, index) => (
                <Box key={`${index}-${link.label}`} display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr auto' }} gap={1}>
                  <TextField size="small" label="Label" value={link.label} onChange={(e) => handleShortLinkLabelChange(index, e.target.value)} />
                  <TextField size="small" label="URL (auto)" value={link.url} slotProps={{ input: { readOnly: true } }} />
                  <Button color="error" onClick={() => removeShortLink(index)}>Supprimer</Button>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Sticky Save Bar */}
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            background: 'rgba(12, 12, 20, 0.95)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(0,194,255,0.12)',
            py: 1.5,
            px: 2,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="contained"
            onClick={() => void saveSiteSettings()}
            disabled={updateMutation.isPending}
            startIcon={updateMutation.isPending ? <CircularProgress size={16} /> : undefined}
          >
            Enregistrer
          </Button>
        </Box>
      </Box>

    <Snackbar
      open={Boolean(feedback)}
      autoHideDuration={3000}
      onClose={() => setFeedback(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity={feedback?.type ?? 'success'} onClose={() => setFeedback(null)}>
        {feedback?.message}
      </Alert>
    </Snackbar>
    </>
  );
}

export function AdminSiteSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: siteSettingsPage, isLoading, error } = useAdminSiteSettingsPage();

  if (user?.role !== 'global_admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">Acces reserve au super admin.</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">Impossible de charger les parametres du site.</Alert>
      </Container>
    );
  }

  const initialSettings = parseSiteSettingsContent(siteSettingsPage?.content);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" mb={0.5}>
          Parametres du site
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Organisez les informations globales du footer, des reseaux sociaux et des pages dynamiques.
        </Typography>
      </Box>

      <SiteSettingsForm
        key={siteSettingsPage?.updated_at ?? 'site-settings-default'}
        initialSettings={initialSettings}
      />
    </Container>
  );
}
