import { useTranslation } from 'react-i18next';

export type SupportedLocale = 'fr' | 'ar' | 'en';

/**
 * Atomic language switch hook.
 * Always use this hook — never call i18n.changeLanguage() directly in components.
 * The single i18n.changeLanguage() call triggers RTLProvider's useEffect via
 * useTranslation re-render, which then updates document.dir and html lang.
 */
export function useLanguage() {
  const { i18n } = useTranslation();

  const changeLanguage = async (locale: SupportedLocale) => {
    await i18n.changeLanguage(locale);
  };

  return {
    currentLocale: i18n.language as SupportedLocale,
    isRTL: i18n.language === 'ar',
    changeLanguage,
  };
}
