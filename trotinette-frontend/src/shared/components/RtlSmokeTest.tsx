import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Paper,
  Divider,
} from '@mui/material';
import { LanguageSwitcher } from './LanguageSwitcher';
import { formatCurrency } from '../utils/formatCurrency';

export function RtlSmokeTest() {
  const { t, i18n } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
          {' | '}
          document.dir: <strong>{document.dir}</strong>
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          {t('smoke_test.price_label')}:
        </Typography>
        {/* Uses CSS logical properties: padding-inline-start auto-flips in RTL */}
        <Typography
          variant="h6"
          sx={{ paddingInlineStart: 2, color: 'primary.main' }}
        >
          {formatCurrency(150000)}
        </Typography>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          {t('smoke_test.open_dialog')}
        </Button>
        <Button variant="outlined" onClick={() => setDrawerOpen(true)}>
          {t('smoke_test.open_drawer')}
        </Button>
      </Box>

      {/* Dialog — portal component; must mirror in RTL via MUI theme direction */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{t('smoke_test.dialog_title')}</DialogTitle>
        <DialogContent>
          <Typography>{t('smoke_test.dialog_content')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {t('smoke_test.close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer — portal component; anchor must respond to RTL */}
      <Drawer
        anchor={i18n.language === 'ar' ? 'right' : 'left'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 280, p: 3 }}>
          <Typography>{t('smoke_test.drawer_content')}</Typography>
          <Button sx={{ mt: 2 }} onClick={() => setDrawerOpen(false)}>
            {t('smoke_test.close')}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
