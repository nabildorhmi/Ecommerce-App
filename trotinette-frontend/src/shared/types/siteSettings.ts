export interface SiteShortLink {
  label: string;
  url: string;
}

export interface ShippingPricingRule {
  min_subtotal: number;
  fee: number;
}

export type ShippingPricingMode = 'simple' | 'tiered';

export interface SiteSettings {
  whatsapp_number: string;
  whatsapp_prefill_message: string;
  whatsapp_url: string;
  instagram_url: string;
  facebook_url: string;
  email: string;
  phone: string;
  address: string;
  business_hours: string;
  footer_description: string;
  home_promo_headline: string;
  short_links: SiteShortLink[];
  delivery_fee_default: number;
  free_shipping_threshold: number;
  shipping_pricing_mode: ShippingPricingMode;
  shipping_pricing_rules: ShippingPricingRule[];
}

export const defaultSiteSettings: SiteSettings = {
  whatsapp_number: '212600000000',
  whatsapp_prefill_message: 'Bonjour, je suis interesse(e) par vos trottinettes',
  whatsapp_url: '',
  instagram_url: '',
  facebook_url: '',
  email: 'contact@miraitech.ma',
  phone: '+212 6XX XXX XXX',
  address: '123 Bd Mohammed V, Casablanca, Maroc',
  business_hours: 'Lun-Sam: 9h - 18h',
  footer_description: '500+ clients satisfaits au Maroc. Trottinettes electriques premium avec garantie 2 ans et SAV local.',
  home_promo_headline: '',
  delivery_fee_default: 0,
  free_shipping_threshold: 0,
  shipping_pricing_mode: 'simple',
  shipping_pricing_rules: [],
  short_links: [
    { label: 'A propos', url: '/a-propos' },
    { label: 'Contact', url: '/contact' },
    { label: 'CGV', url: '/cgv' },
    { label: 'Mentions legales', url: '/mentions-legales' },
  ],
};

function sanitizeCentimes(value: unknown, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.round(value));
}

function sanitizeShippingRules(rules: unknown): ShippingPricingRule[] {
  if (!Array.isArray(rules)) return [];

  return rules
    .filter((rule): rule is { min_subtotal: unknown; fee: unknown } =>
      Boolean(rule && typeof rule === 'object')
    )
    .map((rule) => ({
      min_subtotal: sanitizeCentimes(rule.min_subtotal),
      fee: sanitizeCentimes(rule.fee),
    }))
    .sort((a, b) => a.min_subtotal - b.min_subtotal);
}

export function getDeliveryFeeForSubtotal(settings: SiteSettings, subtotalCentimes: number): number {
  const subtotal = Math.max(0, Math.round(subtotalCentimes));
  const threshold = sanitizeCentimes(settings.free_shipping_threshold);

  if (threshold > 0 && subtotal >= threshold) {
    return 0;
  }

  let fee = sanitizeCentimes(settings.delivery_fee_default);
  const rules = sanitizeShippingRules(settings.shipping_pricing_rules);
  const mode: ShippingPricingMode = settings.shipping_pricing_mode === 'tiered' ? 'tiered' : 'simple';

  if (mode === 'simple') {
    return fee;
  }

  for (const rule of rules) {
    if (subtotal >= rule.min_subtotal) {
      fee = rule.fee;
    }
  }

  return fee;
}

export function getFreeShippingRemaining(settings: SiteSettings, subtotalCentimes: number): number {
  const threshold = sanitizeCentimes(settings.free_shipping_threshold);
  if (threshold <= 0) return 0;

  const subtotal = Math.max(0, Math.round(subtotalCentimes));
  return Math.max(0, threshold - subtotal);
}

export function parseSiteSettingsContent(content?: string): SiteSettings {
  if (!content) return defaultSiteSettings;

  try {
    const parsed = JSON.parse(content) as Partial<SiteSettings>;
    const shippingRules = sanitizeShippingRules(parsed.shipping_pricing_rules);
    const shippingMode: ShippingPricingMode = parsed.shipping_pricing_mode === 'tiered' || parsed.shipping_pricing_mode === 'simple'
      ? parsed.shipping_pricing_mode
      : (shippingRules.length > 0 ? 'tiered' : defaultSiteSettings.shipping_pricing_mode);

    return {
      ...defaultSiteSettings,
      ...parsed,
      delivery_fee_default: sanitizeCentimes(parsed.delivery_fee_default, defaultSiteSettings.delivery_fee_default),
      free_shipping_threshold: sanitizeCentimes(parsed.free_shipping_threshold, defaultSiteSettings.free_shipping_threshold),
      shipping_pricing_mode: shippingMode,
      shipping_pricing_rules: shippingRules,
      short_links: Array.isArray(parsed.short_links)
        ? parsed.short_links.filter((item): item is SiteShortLink =>
            Boolean(item && typeof item.label === 'string' && typeof item.url === 'string')
          )
        : defaultSiteSettings.short_links,
    };
  } catch {
    return defaultSiteSettings;
  }
}
