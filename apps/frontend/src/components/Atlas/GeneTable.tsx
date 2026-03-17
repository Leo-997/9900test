import { corePalette } from '@/themes/colours';
import {
  Box,
  Table, TableBody, TableCell,
  TableHead, TableRow,
  useTheme,
} from '@mui/material';
import { Dna } from 'lucide-react';
import CustomChip from '../Common/Chip';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import { IPanelItem } from './GeneModal';

import type { JSX } from "react";

interface IGeneTableProps {
  geneData: IPanelItem[];
}

export default function GeneTable({ geneData }: IGeneTableProps): JSX.Element {
  const theme = useTheme();

  return (
    <ScrollableSection
      style={{
        border: `1px solid ${corePalette.grey50}`,
        borderRadius: 1,
        minHeight: 100,
        maxHeight: 320,
      }}
    >
      <Table
        stickyHeader
        aria-label="sticky table"
        sx={{
          tableLayout: 'fixed',
          '& thead .MuiTableCell-root': {
            ...theme.typography.label,
            letterSpacing: 1,
            color: corePalette.grey100,
            borderRight: `1px solid ${corePalette.grey50}`,
            py: 1,
          },
          '& thead .MuiTableCell-root:last-of-type': {
            borderRight: 'none',
          },
          '& tbody tr:last-of-type .MuiTableCell-root': {
            borderBottom: 'none',
          },
          '& .MuiTableCell-root': {
            borderBottom: `1px solid ${corePalette.grey50}`,
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '50%' }}>Included in gene list</TableCell>
            <TableCell sx={{ width: '50%' }}>Added in version</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {geneData.map((panel) => (
            <TableRow key={panel.name}>
              <TableCell>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'medium',
                }}
                >
                  {panel.name}
                  {panel.chip && (
                  <CustomChip
                    label={panel.chip}
                    size="small"
                    backgroundColour={corePalette.grey30}
                  />
                  )}
                  {panel.isGermline && <Dna style={{ marginLeft: 2 }} />}
                </Box>
              </TableCell>
              <TableCell>{`v${panel.version}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollableSection>
  );
}
