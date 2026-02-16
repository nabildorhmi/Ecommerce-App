import { useCallback, useEffect, useRef, useState } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../api/categories';
import { useCatalogFilters } from '../hooks/useCatalogFilters';

/**
 * FilterBar manages all product filters:
 * - Full-text search (debounced 300ms)
 * - Category select (populated from API)
 * - Price range (min/max in MAD, converted to centimes for API)
 * - In-stock toggle
 * - Clear all filters button
 * All state is persisted in URL search params via useCatalogFilters.
 */
export function FilterBar() {
  const { t } = useTranslation();
  const { filters, setFilter, clearFilters } = useCatalogFilters();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];

  // Local state for search to enable debounce without URL thrashing
  const [searchInput, setSearchInput] = useState(filters['filter[search]'] ?? '');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local search input in sync if external filter is cleared
  useEffect(() => {
    setSearchInput(filters['filter[search]'] ?? '');
  }, [filters['filter[search]']]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setFilter('filter[search]', value);
      }, 300);
    },
    [setFilter]
  );

  // Price range: user enters MAD, API expects centimes (multiply by 100)
  const handleMinPrice = (value: string) => {
    const centimes = value ? String(Math.round(parseFloat(value) * 100)) : '';
    setFilter('filter[min_price]', centimes);
  };

  const handleMaxPrice = (value: string) => {
    const centimes = value ? String(Math.round(parseFloat(value) * 100)) : '';
    setFilter('filter[max_price]', centimes);
  };

  // Display MAD value from centimes stored in URL
  const minPriceDisplay = filters['filter[min_price]']
    ? String(parseInt(filters['filter[min_price]']!, 10) / 100)
    : '';
  const maxPriceDisplay = filters['filter[max_price]']
    ? String(parseInt(filters['filter[max_price]']!, 10) / 100)
    : '';

  const handleClear = () => {
    setSearchInput('');
    clearFilters();
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ md: 'center' }}
        flexWrap="wrap"
      >
        {/* Search */}
        <TextField
          size="small"
          label={t('catalog.search')}
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 200 }}
        />

        {/* Category */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{t('catalog.category')}</InputLabel>
          <Select
            value={filters['filter[category_id]'] ?? ''}
            label={t('catalog.category')}
            onChange={(e) => setFilter('filter[category_id]', e.target.value)}
          >
            <MenuItem value="">
              <em>{t('catalog.allCategories')}</em>
            </MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Price range */}
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            label={t('catalog.minPrice')}
            type="number"
            value={minPriceDisplay}
            onChange={(e) => handleMinPrice(e.target.value)}
            slotProps={{ input: { inputProps: { min: 0 } } }}
            sx={{ width: 110 }}
          />
          <TextField
            size="small"
            label={t('catalog.maxPrice')}
            type="number"
            value={maxPriceDisplay}
            onChange={(e) => handleMaxPrice(e.target.value)}
            slotProps={{ input: { inputProps: { min: 0 } } }}
            sx={{ width: 110 }}
          />
        </Stack>

        {/* In-stock toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={filters['filter[in_stock]'] === '1'}
              onChange={(e) => setFilter('filter[in_stock]', e.target.checked ? '1' : '')}
              size="small"
            />
          }
          label={t('catalog.inStockOnly')}
        />

        {/* Clear filters */}
        <Button variant="outlined" size="small" onClick={handleClear} color="secondary">
          {t('catalog.clearFilters')}
        </Button>
      </Stack>
    </Paper>
  );
}
