import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAdminDashboard } from '../api/dashboard';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import type { DashboardFilters } from '../types';

const ORDER_STATUSES = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'dispatched', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#ff9800',
  confirmed: '#2196f3',
  dispatched: '#9c27b0',
  delivered: '#4caf50',
  cancelled: '#f44336',
};

const MONTHS = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
];

export function AdminDashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>({});
  const { data, isLoading, error } = useAdminDashboard(filters);

  const handleFilterChange = (key: keyof DashboardFilters, value: string | number | undefined) => {
    setFilters((prev) => {
      if (value === undefined || value === '') {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  };

  // Generate year options from yearly stats
  const currentYear = new Date().getFullYear();
  const yearOptions = data?.yearly_stats.length
    ? data.yearly_stats.map((s) => s.year)
    : [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Erreur lors du chargement du tableau de bord</Alert>
      </Container>
    );
  }

  if (!data) return null;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
          <TextField
            label="Date début"
            type="date"
            size="small"
            sx={{ minWidth: 150 }}
            InputLabelProps={{ shrink: true }}
            value={filters.date_from || ''}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
          />
          <TextField
            label="Date fin"
            type="date"
            size="small"
            sx={{ minWidth: 150 }}
            InputLabelProps={{ shrink: true }}
            value={filters.date_from || ''}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Mois</InputLabel>
            <Select
              value={filters.month || ''}
              label="Mois"
              onChange={(e) => handleFilterChange('month', e.target.value ? Number(e.target.value) : undefined)}
            >
              <MenuItem value="">Tous</MenuItem>
              {MONTHS.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Année</InputLabel>
            <Select
              value={filters.year || ''}
              label="Année"
              onChange={(e) => handleFilterChange('year', e.target.value ? Number(e.target.value) : undefined)}
            >
              <MenuItem value="">Toutes</MenuItem>
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filters.status || ''}
              label="Statut"
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            >
              <MenuItem value="">Tous</MenuItem>
              {ORDER_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Commandes totales
            </Typography>
            <Typography variant="h4">{data.kpis.total_orders}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Chiffre d'affaires
            </Typography>
            <Typography variant="h4">{formatCurrency(data.kpis.total_revenue)}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Panier moyen
            </Typography>
            <Typography variant="h4">{formatCurrency(data.kpis.average_order_value)}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Nouveaux clients
            </Typography>
            <Typography variant="h4">{data.kpis.new_customers}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Status distribution */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Commandes par statut
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.kpis.orders_by_status}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                label
              >
                {data.kpis.orders_by_status.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#999'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Monthly revenue */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Chiffre d'affaires mensuel
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthly_stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="revenue" fill="#2196f3" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Monthly orders */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Commandes mensuelles
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthly_stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="order_count" stroke="#4caf50" name="Commandes" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Best selling products */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Produits les plus vendus
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.kpis.best_selling_products} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="product_name" width={150} />
              <Tooltip />
              <Bar dataKey="total_quantity" fill="#ff9800" name="Quantité" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Best selling categories */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Meilleures catégories
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.kpis.best_selling_categories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
              <YAxis type="category" dataKey="category_name" width={150} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="total_revenue" fill="#9c27b0" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Container>
  );
}
