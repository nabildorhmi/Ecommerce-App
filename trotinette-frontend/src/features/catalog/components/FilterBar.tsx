import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { useCategories } from '../api/categories';
import { useCatalogFilters } from '../hooks/useCatalogFilters';

const LABEL_STYLE = {
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: 'text.secondary' as const,
  textTransform: 'uppercase' as const,
  mb: 1,
};

/**
 * MiraiTech FilterBar — vertical sidebar filter panel.
 */
export function FilterBar() {
  const { filters, setFilter, clearFilters } = useCatalogFilters();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];

  const [searchInput, setSearchInput] = useState(filters['filter[search]'] ?? '');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleMinPrice = (value: string) => {
    const centimes = value ? String(Math.round(parseFloat(value) * 100)) : '';
    setFilter('filter[min_price]', centimes);
  };

  const handleMaxPrice = (value: string) => {
    const centimes = value ? String(Math.round(parseFloat(value) * 100)) : '';
    setFilter('filter[max_price]', centimes);
  };

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

  const hasActiveFilters =
    !!filters['filter[search]'] ||
    !!filters['filter[category_id]'] ||
    !!filters['filter[min_price]'] ||
    !!filters['filter[max_price]'] ||
    !!filters['filter[in_stock]'];

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px',
        p: 2.5,
        position: { md: 'sticky' },
        top: { md: 80 },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneIcon sx={{ fontSize: '1rem', color: '#00C2FF' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', color: 'text.primary', textTransform: 'uppercase' }}>
            {"Filtres"}
          </Typography>
        </Box>
        {hasActiveFilters && (
          <Button
            size="small"
            onClick={handleClear}
            sx={{
              fontSize: '0.65rem',
              color: '#E63946',
              minWidth: 'auto',
              p: '2px 6px',
              '&:hover': { backgroundColor: 'rgba(230,57,70,0.08)' },
            }}
          >
            {"Effacer les filtres"}
          </Button>
        )}
      </Box>

      <Stack spacing={2.5}>
        {/* Search */}
        <Box>
          <Typography sx={LABEL_STYLE}>{"Recherche"}</Typography>
          <TextField
            size="small"
            placeholder={"Rechercher..."}
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& input': { fontSize: '0.82rem' } }}
          />
        </Box>

        <Divider />

        {/* Category */}
        <Box>
          <Typography sx={LABEL_STYLE}>{"Catégorie"}</Typography>
          <FormControl size="small" fullWidth>
            <Select
              value={filters['filter[category_id]'] ?? ''}
              onChange={(e) => setFilter('filter[category_id]', e.target.value)}
              displayEmpty
              sx={{ fontSize: '0.82rem' }}
            >
              <MenuItem value="" sx={{ fontSize: '0.82rem' }}>
                <em style={{ fontStyle: 'normal' }} className="filter-placeholder">{"Toutes les catégories"}</em>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={String(cat.id)} sx={{ fontSize: '0.82rem' }}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider />

        {/* Price Range */}
        <Box>
          <Typography sx={LABEL_STYLE}>{"Gamme de prix"}</Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              placeholder={"Min"}
              type="number"
              value={minPriceDisplay}
              onChange={(e) => handleMinPrice(e.target.value)}
              slotProps={{ input: { inputProps: { min: 0 } } }}
              sx={{ '& input': { fontSize: '0.82rem' } }}
            />
            <TextField
              size="small"
              placeholder={"Max"}
              type="number"
              value={maxPriceDisplay}
              onChange={(e) => handleMaxPrice(e.target.value)}
              slotProps={{ input: { inputProps: { min: 0 } } }}
              sx={{ '& input': { fontSize: '0.82rem' } }}
            />
          </Stack>
        </Box>

        <Divider />

        {/* In Stock */}
        <FormControlLabel
          control={
            <Switch
              checked={filters['filter[in_stock]'] === '1'}
              onChange={(e) => setFilter('filter[in_stock]', e.target.checked ? '1' : '')}
              size="small"
            />
          }
          label={
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', fontWeight: 500 }}>
              {"En stock uniquement"}
            </Typography>
          }
          sx={{ mx: 0 }}
        />
      </Stack>
    </Box>
  );
}

