import { useTranslation } from 'react-i18next';

export type SupportedLocale = 'fr' | 'en';

export function useLanguage() {
  const { i18n } = useTranslation();

  const changeLanguage = async (locale: SupportedLocale) => {
    await i18n.changeLanguage(locale);
  };

  return {
    currentLocale: i18n.language as SupportedLocale,
    changeLanguage,
  };
}
