import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useAttributes, useGenerateVariants } from '../api/variations';
import type { Attribute as AttrType, AttributeValue } from '../types';

interface VariantGeneratorProps {
  productId: number;
  productSku: string;
}

export function VariantGenerator({ productId, productSku }: VariantGeneratorProps) {
  const { data: attributes, isLoading: attrsLoading } = useAttributes();
  const generateMutation = useGenerateVariants();

  // Selected values per attribute: { attrId: AttributeValue[] }
  const [selected, setSelected] = useState<Record<number, AttributeValue[]>>({});

  const attrs: AttrType[] = useMemo(
    () => (attributes as AttrType[]) ?? [],
    [attributes],
  );
  const attrsWithValues = useMemo(
    () => attrs.filter((a) => a.values.length > 0),
    [attrs],
  );

  // Count total combinations (Cartesian product)
  const totalCombinations = useMemo(() => {
    const groups = Object.values(selected).filter((vals) => vals.length > 0);
    if (groups.length === 0) return 0;
    return groups.reduce((acc, vals) => acc * vals.length, 1);
  }, [selected]);

  const handleGenerate = async () => {
    const attributeValues: Record<number, number[]> = {};
    for (const [attrId, vals] of Object.entries(selected)) {
      const ids = vals.map((v) => v.id);
      if (ids.length > 0) {
        attributeValues[Number(attrId)] = ids;
      }
    }

    if (Object.keys(attributeValues).length === 0) return;

    await generateMutation.mutateAsync({
      productId,
      data: {
        attribute_values: attributeValues,
        default_price: null, // use product base price
        default_stock: 0,
        skip_existing: true,
      },
    });

    // Reset selections on success
    setSelected({});
  };

  if (attrsLoading) {
    return (
      <Box display="flex" justifyContent="center" py={2}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (attrsWithValues.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Créez d'abord des attributs (ex: Couleur, Taille) dans la page Attributs pour générer des variantes.
        <br />
        Create attributes first (e.g. Color, Size) in the Attributes page to generate variants.
      </Alert>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <AutoFixHighIcon color="primary" fontSize="small" />
        <Typography variant="subtitle1" fontWeight="bold">
          Ajouter des variantes / Add Variants
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Sélectionnez les valeurs — SKU et combinaisons générés automatiquement.
        <br />
        Pick values — SKUs and combinations are auto-generated.
      </Typography>

      {/* One autocomplete per attribute — pick values like tags */}
      <Box display="flex" flexDirection="column" gap={2}>
        {attrsWithValues.map((attr) => (
          <Autocomplete
            key={attr.id}
            multiple
            options={attr.values}
            getOptionLabel={(option) => option.value}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            value={selected[attr.id] ?? []}
            onChange={(_, newValue) => {
              setSelected((prev) => {
                const next = { ...prev };
                if (newValue.length === 0) {
                  delete next[attr.id];
                } else {
                  next[attr.id] = newValue;
                }
                return next;
              });
            }}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => {
                const { key, ...rest } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    label={option.value}
                    size="small"
                    color="primary"
                    variant="outlined"
                    {...rest}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={attr.name}
                placeholder={`Choisir ${attr.name.toLowerCase()}...`}
                size="small"
              />
            )}
            size="small"
            disableCloseOnSelect
          />
        ))}
      </Box>

      {/* Generate button + count */}
      <Box mt={2.5} display="flex" alignItems="center" gap={2} flexWrap="wrap">
        <Button
          variant="contained"
          startIcon={
            generateMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <AutoFixHighIcon />
            )
          }
          onClick={() => void handleGenerate()}
          disabled={totalCombinations === 0 || generateMutation.isPending}
        >
          Générer {totalCombinations > 0 ? `${totalCombinations} variante(s)` : ''}
        </Button>

        {totalCombinations > 0 && (
          <Typography variant="body2" color="text.secondary">
            SKU auto: <strong>{productSku || 'P' + productId}</strong>-…
            {' · '}Les doublons existants seront ignorés
          </Typography>
        )}
      </Box>

      {/* Success */}
      {generateMutation.isSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {(generateMutation.data as { message?: string })?.message ??
            'Variantes générées ! / Variants generated!'}
        </Alert>
      )}

      {/* Error */}
      {generateMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {(generateMutation.error as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Erreur / Error'}
        </Alert>
      )}
    </Paper>
  );
}
