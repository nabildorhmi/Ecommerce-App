import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { LanguageSwitcher } from './LanguageSwitcher';
import { formatCurrency } from '../utils/formatCurrency';

export function RtlSmokeTest() {
  const { t, i18n } = useTranslation();

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {t('smoke_test.title')}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <LanguageSwitcher />
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Current locale: <strong>{i18n.language}</strong>
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          {t('smoke_test.price_label')}:
        </Typography>
        <Typography
          variant="h6"
          sx={{ pl: 2, color: 'primary.main' }}
        >
          {formatCurrency(150000)}
        </Typography>
      </Paper>
    </Box>
  );
}
