import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMyOrders } from '../api/orders';
import { OrderStatusChip } from '../components/OrderStatusChip';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

/**
 * Customer order history page.
 * Shows paginated list of orders with status badges and expandable details.
 */
export function MyOrdersPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useMyOrders(page);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {t('common.loading')}
      </Alert>
    );
  }

  const orders = data?.data ?? [];
  const totalPages = data?.meta?.last_page ?? 1;

  return (
    <Box p={3} maxWidth="md" mx="auto">
      <Typography variant="h5" fontWeight="bold" mb={3}>
        {t('orders.myOrders')}
      </Typography>

      {orders.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography color="text.secondary" mb={2}>
            {t('orders.noOrders')}
          </Typography>
          <Button
            component={Link}
            to="/products"
            variant="contained"
          >
            {t('orders.browseProducts')}
          </Button>
        </Box>
      ) : (
        <>
          {orders.map((order) => (
            <Accordion key={order.id} variant="outlined" sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={2}
                  flexWrap="wrap"
                  width="100%"
                  pr={1}
                >
                  <Typography fontWeight="bold" sx={{ minWidth: 140 }}>
                    {t('orders.orderNumber')}: {order.order_number}
                  </Typography>
                  <OrderStatusChip status={order.status} />
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    {order.delivery_zone.city}
                  </Typography>
                  <Typography fontWeight="medium">
                    {formatCurrency(order.total)}
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 0 }}>
                <Divider sx={{ mb: 2 }} />

                {/* Order items */}
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('orders.items')}</TableCell>
                        <TableCell align="right">{t('checkout.qty')}</TableCell>
                        <TableCell align="right">{t('checkout.subtotal')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Typography variant="body2">
                              {item.product?.name ?? item.product_sku}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(item.unit_price)} / {t('checkout.qty').toLowerCase()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.subtotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Order summary */}
                <Box mt={2} textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    {t('checkout.subtotal')}: {formatCurrency(order.subtotal)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('checkout.deliveryFee')} ({order.delivery_zone.city}): {formatCurrency(order.delivery_fee)}
                  </Typography>
                  <Typography fontWeight="bold" mt={0.5}>
                    {t('checkout.total')}: {formatCurrency(order.total)}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
