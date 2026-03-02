import CustomTypography from '@/components/Common/Typography';
import { corePalette } from '@/themes/colours';
import { IGeneListGene } from '@/types/Reports/GeneLists.types';
import {
    Box, Grid, styled
} from '@mui/material';
import GeneCard from './GeneCard';

import type { JSX } from "react";

interface IGeneGridProps {
  genes: IGeneListGene[];
  listType: string;
  rowsPerPage: number,
  currentPage: number,
  filteredLetter: string,
  isFiltering: boolean,
  numGenes: number,
  searchQuery: string,
}

const Table = styled(Grid)({
  borderTop: `1px solid ${corePalette.grey50}`,
  marginBottom: '5px',
});

const TableWrapper = styled(Box)({
  margin: '1vh 0 0 0',
});

const NumGenesWrapper = styled(Box)({
  borderTop: `1px solid ${corePalette.grey50}`,
  borderLeft: `1px solid ${corePalette.grey50}`,
  borderRight: `1px solid ${corePalette.grey50}`,
  padding: '10px',
  borderRadius: '5px 5px 0 0',
});

const FillerCells = styled(Box)({
  height: '60px',
  borderBottom: `1px solid ${corePalette.grey50}`,
  borderRight: `1px solid ${corePalette.grey50}`,
});

function getNameLength(gene: IGeneListGene, listType: string, font = '14px Roboto'): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;
  context.font = font;
  let length = context.measureText(gene.gene).width;
  const iconWidth = 26;
  const iconPadding = 6;
  if (listType === 'somatic' && gene.isSomaticGermline) {
    length += iconWidth + iconPadding;
  }

  return length + 24;
}

export default function GeneGrid({
  genes,
  listType,
  rowsPerPage,
  currentPage,
  filteredLetter,
  isFiltering,
  numGenes,
  searchQuery,
}: IGeneGridProps): JSX.Element {
  const genesPerPage = rowsPerPage * 5;
  const start = currentPage * genesPerPage;
  const end = start + genesPerPage;
  const sortedGenes = [...genes].sort((a, b) => a.gene.localeCompare(b.gene));
  const paginatedGenes = sortedGenes.slice(start, end);
  const emptyCells = 5 - numGenes;

  const column: IGeneListGene[][] = Array.from({ length: 5 }, () => []);
  paginatedGenes.forEach((gene, idx) => {
    const col = idx % 5;
    column[col].push(gene);
  });

  const columnWidths = column.map((group) => {
    const widths = group.map((gene) => getNameLength(gene, listType));
    return Math.max(...widths, 0);
  });

  return (
    <TableWrapper>
      {(isFiltering && numGenes > 0) && (
        <NumGenesWrapper>
          <CustomTypography
            fontSize="medium"
            color={corePalette.grey100}
            sx={{
              marginLeft: '10px',
            }}
          >
            {filteredLetter}
            {' '}
            -
            {' '}
            {numGenes}
            {' '}
            {numGenes === 1 ? 'Gene' : 'Genes'}
          </CustomTypography>
        </NumGenesWrapper>
      )}
      {numGenes > 0 && (
        <Table>
          <Grid container spacing={0.001} sx={{ paddingBottom: '5px' }}>
            {paginatedGenes.map((gene, index) => {
              const columnIndex = index % 5;
              const nameWidth = columnWidths[columnIndex];
              return (
                <Grid size={2.4} key={gene.geneId} sx={{ borderLeft: `1px solid ${corePalette.grey50}` }}>
                  <GeneCard
                    gene={gene}
                    listType={listType}
                    nameWidth={nameWidth}
                    searchQuery={searchQuery}
                  />
                </Grid>
              );
            })}
            {Array.from({ length: emptyCells }).map(() => (
              <Grid size={2.4}>
                <FillerCells />
              </Grid>
            ))}
          </Grid>
        </Table>
      )}
    </TableWrapper>
  );
}
