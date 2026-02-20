import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

interface SpecsTableProps {
  attributes: Record<string, string | number> | null | undefined;
}

// Format a spec key into a human-readable label
// e.g. "motor_power" -> "Motor Power"
function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Add unit suffix based on known spec key names
function formatValue(key: string, value: string | number): string {
  const str = String(value);
  if (!str || str === '') return '—';

  const keyLower = key.toLowerCase();
  if (keyLower === 'speed') return `${str} km/h`;
  if (keyLower === 'battery') return `${str} Ah`;
  if (keyLower === 'range_km') return `${str} km`;
  if (keyLower === 'weight') return `${str} kg`;
  if (keyLower === 'motor_power') return `${str} W`;

  return str;
}

/**
 * SpecsTable renders a two-column table of product technical attributes.
 * Keys are auto-formatted (underscore -> spaces, capitalized).
 * Known spec keys get appropriate unit suffixes.
 */
export function SpecsTable({ attributes }: SpecsTableProps) {
  if (!attributes) return null;

  // Safety: if attributes is a JSON string (double-encoding bug), parse it
  let parsed = attributes;
  if (typeof attributes === 'string') {
    try {
      parsed = JSON.parse(attributes);
    } catch {
      return null;
    }
  }

  // Filter out empty values
  const entries = Object.entries(parsed).filter(
    ([, value]) => value !== null && value !== undefined && String(value) !== ''
  );

  if (entries.length === 0) return null;

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mt: 3 }}>
      <Typography
        variant="h6"
        sx={{ px: 2, pt: 2, pb: 1 }}
      >
        Caractéristiques
      </Typography>
      <Table size="small">
        <TableBody>
          {entries.map(([key, value]) => (
            <TableRow key={key} sx={{ '&:last-child td': { border: 0 } }}>
              <TableCell
                component="th"
                scope="row"
                sx={{ fontWeight: 600, width: '40%', color: 'text.secondary' }}
              >
                {formatKey(key)}
              </TableCell>
              <TableCell>{formatValue(key, value)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
