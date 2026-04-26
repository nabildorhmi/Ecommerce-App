import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import BoltIcon from '@mui/icons-material/Bolt';
import SpeedIcon from '@mui/icons-material/Speed';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TireRepairIcon from '@mui/icons-material/TireRepair';
import StraightenIcon from '@mui/icons-material/Straighten';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SettingsIcon from '@mui/icons-material/Settings';

interface SpecsTableProps {
  attributes: Record<string, string | number> | null | undefined;
}

function formatKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Map common spec keywords to icons
function getSpecIcon(key: string): React.ReactNode | null {
  const lk = key.toLowerCase();
  const iconSize = { fontSize: { xs: '0.8rem', md: '0.9rem' } };
  if (lk.includes('power') || lk.includes('motor') || lk.includes('watt')) return <BoltIcon sx={{ ...iconSize, color: '#D4A43A' }} />;
  if (lk.includes('speed') || lk.includes('vitesse')) return <SpeedIcon sx={{ ...iconSize, color: '#00C2FF' }} />;
  if (lk.includes('battery') || lk.includes('batterie') || lk.includes('range') || lk.includes('autonomie')) return <BatteryChargingFullIcon sx={{ ...iconSize, color: '#2EAD5F' }} />;
  if (lk.includes('weight') || lk.includes('poids')) return <FitnessCenterIcon sx={{ ...iconSize, color: '#8A919D' }} />;
  if (lk.includes('tire') || lk.includes('pneu') || lk.includes('roue')) return <TireRepairIcon sx={{ ...iconSize, color: '#D97A50' }} />;
  if (lk.includes('dimension') || lk.includes('taille') || lk.includes('size')) return <StraightenIcon sx={{ ...iconSize, color: '#9B59B6' }} />;
  if (lk.includes('color') || lk.includes('couleur')) return <ColorLensIcon sx={{ ...iconSize, color: '#C7404D' }} />;
  return <SettingsIcon sx={{ ...iconSize, color: 'rgba(255,255,255,0.2)' }} />;
}

/**
 * SpecsTable — premium styled specs display with icons and alternating row highlights.
 */
export function SpecsTable({ attributes }: SpecsTableProps) {
  if (!attributes) return null;

  let parsed = attributes;
  if (typeof attributes === 'string') {
    try { parsed = JSON.parse(attributes); } catch { return null; }
  }

  const entries = Object.entries(parsed).filter(
    ([, value]) => value !== null && value !== undefined && String(value) !== ''
  );

  if (entries.length === 0) return null;

  return (
    <TableContainer
      sx={{
        borderRadius: { xs: '12px', md: '16px' },
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
        background: 'rgba(19,19,27,0.5)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Table size="small">
        <TableBody>
          {entries.map(([key, value], i) => {
            const icon = getSpecIcon(key);
            return (
              <TableRow
                key={key}
                sx={{
                  '&:last-child td': { border: 0 },
                  bgcolor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  transition: 'background 0.2s',
                  '&:hover': { bgcolor: 'rgba(0,194,255,0.04)' },
                }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    fontWeight: 600, width: '42%', color: 'text.secondary',
                    fontSize: { xs: '0.72rem', md: '0.8rem' }, py: { xs: 0.9, md: 1.25 }, borderColor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.6, md: 1 } }}>
                    {icon}
                    <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
                      {formatKey(key)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600, color: 'text.primary',
                    fontSize: { xs: '0.74rem', md: '0.82rem' }, py: { xs: 0.9, md: 1.25 }, borderColor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  {String(value)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
