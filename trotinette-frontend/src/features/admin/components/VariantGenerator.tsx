import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TuneIcon from '@mui/icons-material/Tune';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router';
import { useAttributes, useGenerateVariants } from '../api/variations';
import type { Attribute as AttrType, AttributeValue } from '../types';

interface VariantGeneratorProps {
  productId: number;
  productSku: string;
}

interface GeneratorRow {
  id: number;
  attributeId: number | null;
}

export function VariantGenerator({ productId, productSku }: VariantGeneratorProps) {
  const { data: attributes, isLoading: attrsLoading } = useAttributes();
  const generateMutation = useGenerateVariants();

  const [selected, setSelected] = useState<Record<number, AttributeValue[]>>({});
  const [rows, setRows] = useState<GeneratorRow[]>([]);
  const [rowSeed, setRowSeed] = useState(1);

  const attrs: AttrType[] = useMemo(() => (attributes as AttrType[]) ?? [], [attributes]);
  const attrsWithValues = useMemo(() => attrs.filter((a) => a.values.length > 0), [attrs]);

  const selectedGroups = useMemo(() => {
    return rows
      .map((row) => (row.attributeId ? selected[row.attributeId] ?? [] : []))
      .filter((vals) => vals.length > 0);
  }, [rows, selected]);

  // Count total combinations (Cartesian product)
  const totalCombinations = useMemo(() => {
    if (selectedGroups.length === 0) return 0;
    return selectedGroups.reduce((acc, vals) => acc * vals.length, 1);
  }, [selectedGroups]);

  // Preview: flat list of combination labels
  const combinationPreview = useMemo(() => {
    if (selectedGroups.length === 0) return [];

    const cartesian = (arr: AttributeValue[][]): AttributeValue[][] => {
      if (arr.length === 0) return [[]];
      const [first, ...rest] = arr;
      const restProduct = cartesian(rest);
      return first.flatMap((item) => restProduct.map((combo) => [item, ...combo]));
    };

    return cartesian(selectedGroups).map((combo) => combo.map((v) => v.value).join(' · '));
  }, [selectedGroups]);

  const addAttributeRow = () => {
    setRows((prev) => [...prev, { id: rowSeed, attributeId: null }]);
    setRowSeed((prev) => prev + 1);
  };

  const removeAttributeRow = (rowId: number) => {
    setRows((prev) => {
      const rowToRemove = prev.find((row) => row.id === rowId);
      if (rowToRemove?.attributeId) {
        setSelected((old) => {
          const next = { ...old };
          delete next[rowToRemove.attributeId!];
          return next;
        });
      }
      return prev.filter((row) => row.id !== rowId);
    });
  };

  const updateRowAttribute = (rowId: number, newAttributeId: number | null) => {
    setRows((prev) => {
      const current = prev.find((row) => row.id === rowId);
      const previousAttributeId = current?.attributeId ?? null;

      if (previousAttributeId && previousAttributeId !== newAttributeId) {
        setSelected((old) => {
          const next = { ...old };
          delete next[previousAttributeId];
          return next;
        });
      }

      return prev.map((row) =>
        row.id === rowId ? { ...row, attributeId: newAttributeId } : row
      );
    });
  };

  const handleGenerate = async () => {
    const attributeValues: Record<number, number[]> = {};
    for (const row of rows) {
      if (!row.attributeId) continue;
      const vals = selected[row.attributeId] ?? [];
      const ids = vals.map((v) => v.id);
      if (ids.length > 0) {
        attributeValues[row.attributeId] = ids;
      }
    }
    if (Object.keys(attributeValues).length === 0) return;

    await generateMutation.mutateAsync({
      productId,
      data: {
        attribute_values: attributeValues,
        default_price: null,
        default_stock: 0,
        skip_existing: true,
      },
    });
    setSelected({});
    setRows([]);
  };

  if (attrsLoading) {
    return (
      <Box display="flex" justifyContent="center" py={3}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (attrsWithValues.length === 0) {
    return (
      <Box
        sx={{
          p: 2.5,
          mb: 3,
          background: 'rgba(0,194,255,0.04)',
          border: '1px dashed rgba(0,194,255,0.2)',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          textAlign: 'center',
        }}
      >
        <TuneIcon sx={{ color: 'rgba(0,194,255,0.4)', fontSize: '2rem' }} />
        <Box>
          <Typography sx={{ fontWeight: 700, color: 'var(--mirai-white)', fontSize: '0.9rem', mb: 0.5 }}>
            Aucun attribut de variation disponible
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'var(--mirai-gray)' }}>
            Créez d'abord des attributs (ex: Couleur, Taille) pour générer des variantes automatiquement.
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/admin/variation-types"
          variant="outlined"
          size="small"
          endIcon={<OpenInNewIcon sx={{ fontSize: '0.85rem' }} />}
          sx={{
            borderRadius: '8px',
            borderColor: 'rgba(0,194,255,0.4)',
            color: '#00C2FF',
            fontSize: '0.78rem',
            '&:hover': { borderColor: '#00C2FF', background: 'rgba(0,194,255,0.08)' },
          }}
        >
          Gérer les attributs
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mb: 3,
        p: 2.5,
        background: 'rgba(0,194,255,0.04)',
        border: '1px solid rgba(0,194,255,0.12)',
        borderRadius: '14px',
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoFixHighIcon sx={{ color: '#00C2FF', fontSize: '1.1rem' }} />
          <Typography sx={{ fontWeight: 700, color: 'var(--mirai-white)', fontSize: '0.88rem' }}>
            Générer des variantes en masse
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/admin/variation-types"
          size="small"
          endIcon={<OpenInNewIcon sx={{ fontSize: '0.75rem' }} />}
          sx={{ fontSize: '0.72rem', color: 'rgba(0,194,255,0.6)', '&:hover': { color: '#00C2FF' }, textTransform: 'none', p: 0 }}
        >
          Gérer les attributs
        </Button>
      </Box>
      <Typography sx={{ fontSize: '0.75rem', color: 'var(--mirai-gray)', mb: 2 }}>
        Sélectionnez les valeurs ci-dessous — toutes les combinaisons seront créées automatiquement.
      </Typography>

      {rows.length === 0 ? (
        <Box
          sx={{
            border: '1px dashed rgba(255,255,255,0.12)',
            borderRadius: '12px',
            p: 2,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: '0.78rem', color: 'var(--mirai-gray)', mb: 1.2 }}>
            Ajoutez d'abord les attributs que vous voulez combiner.
          </Typography>
          <Button size="small" startIcon={<AddIcon />} variant="outlined" onClick={addAttributeRow}>
            Ajouter un attribut
          </Button>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={1.5}>
          {rows.map((row, index) => {
            const usedIds = rows
              .filter((r) => r.id !== row.id && r.attributeId !== null)
              .map((r) => r.attributeId as number);
            const attributeOptions = attrsWithValues.filter(
              (attr) => attr.id === row.attributeId || !usedIds.includes(attr.id)
            );
            const selectedAttr = attrsWithValues.find((attr) => attr.id === row.attributeId) ?? null;

            return (
              <Box
                key={row.id}
                sx={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  p: 1.5,
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography sx={{ fontSize: '0.72rem', color: 'rgba(0,194,255,0.75)', fontWeight: 700 }}>
                    Attribut #{index + 1}
                  </Typography>
                  <Box sx={{ ml: 'auto' }}>
                    <IconButton size="small" color="error" onClick={() => removeAttributeRow(row.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Autocomplete
                  size="small"
                  options={attributeOptions}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={selectedAttr}
                  noOptionsText="Aucun attribut"
                  onChange={(_, newValue) => updateRowAttribute(row.id, newValue?.id ?? null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Attribut"
                      placeholder="Rechercher un attribut..."
                    />
                  )}
                />

                {selectedAttr && (
                  <Box mt={1}>
                    <Autocomplete
                      multiple
                      size="small"
                      options={selectedAttr.values}
                      getOptionLabel={(option) => option.value}
                      isOptionEqualToValue={(opt, val) => opt.id === val.id}
                      value={selected[selectedAttr.id] ?? []}
                      onChange={(_, newValue) => {
                        setSelected((prev) => {
                          const next = { ...prev };
                          if (newValue.length === 0) {
                            delete next[selectedAttr.id];
                          } else {
                            next[selectedAttr.id] = newValue;
                          }
                          return next;
                        });
                      }}
                      renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, tagIndex) => {
                          const { key, ...rest } = getTagProps({ index: tagIndex });
                          return (
                            <Chip
                              key={key}
                              label={option.value}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                              {...rest}
                            />
                          );
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={`Valeurs (${selectedAttr.name})`}
                          placeholder="Selectionner les valeurs..."
                        />
                      )}
                      disableCloseOnSelect
                    />
                  </Box>
                )}
              </Box>
            );
          })}

          <Box>
            <Button size="small" startIcon={<AddIcon />} variant="outlined" onClick={addAttributeRow}>
              Ajouter un attribut
            </Button>
          </Box>
        </Box>
      )}

      {/* Combination preview */}
      {combinationPreview.length > 0 && (
        <Box mt={2}>
          <Divider sx={{ borderColor: 'rgba(0,194,255,0.1)', mb: 1.5 }} />
          <Typography sx={{ fontSize: '0.72rem', color: 'rgba(0,194,255,0.6)', mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {combinationPreview.length} combinaison{combinationPreview.length > 1 ? 's' : ''} à créer
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
            {combinationPreview.slice(0, 16).map((label, i) => (
              <Chip
                key={i}
                label={label}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  background: 'rgba(0,194,255,0.1)',
                  color: 'var(--mirai-white)',
                  border: '1px solid rgba(0,194,255,0.2)',
                }}
              />
            ))}
            {combinationPreview.length > 16 && (
              <Chip
                label={`+${combinationPreview.length - 16} autres`}
                size="small"
                sx={{ fontSize: '0.7rem', color: 'text.secondary' }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Generate button */}
      <Box display="flex" alignItems="center" gap={2} mt={totalCombinations > 0 ? 0 : 2} flexWrap="wrap">
        <Button
          variant="contained"
          startIcon={
            generateMutation.isPending
              ? <CircularProgress size={16} color="inherit" />
              : <AutoFixHighIcon />
          }
          onClick={() => void handleGenerate()}
          disabled={totalCombinations === 0 || generateMutation.isPending}
          sx={{
            borderRadius: '8px',
            fontWeight: 700,
            background: totalCombinations > 0
              ? 'linear-gradient(135deg, #00C2FF, #0099CC)'
              : undefined,
            '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(0,194,255,0.3)' },
            transition: 'all 0.2s ease',
          }}
        >
          {generateMutation.isPending
            ? 'Génération…'
            : totalCombinations > 0
              ? `Générer ${totalCombinations} variante${totalCombinations > 1 ? 's' : ''}`
              : 'Sélectionnez des valeurs'}
        </Button>

        {totalCombinations > 0 && (
          <Typography sx={{ fontSize: '0.72rem', color: 'var(--mirai-gray)' }}>
            SKU auto : <strong style={{ fontFamily: 'monospace' }}>{productSku || `P${productId}`}-…</strong>
            {' · '}Les doublons existants sont ignorés
          </Typography>
        )}
      </Box>

      {generateMutation.isSuccess && (
        <Alert severity="success" sx={{ mt: 2, borderRadius: '8px' }}>
          {(generateMutation.data as { message?: string })?.message ?? 'Variantes générées avec succès !'}
        </Alert>
      )}
      {generateMutation.isError && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: '8px' }}>
          {(generateMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur lors de la génération'}
        </Alert>
      )}
    </Box>
  );
}
