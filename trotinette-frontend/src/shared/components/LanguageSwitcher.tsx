import { ButtonGroup, Button } from '@mui/material';
import { useLanguage } from '../hooks/useLanguage';
import type { SupportedLocale } from '../hooks/useLanguage';

const LANGUAGES: { code: SupportedLocale; label: string }[] = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
];

export function LanguageSwitcher() {
  const { currentLocale, changeLanguage } = useLanguage();

  return (
    <ButtonGroup size="small" variant="outlined" aria-label="language switcher">
      {LANGUAGES.map(({ code, label }) => (
        <Button
          key={code}
          onClick={() => changeLanguage(code)}
          variant={currentLocale === code ? 'contained' : 'outlined'}
        >
          {label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
