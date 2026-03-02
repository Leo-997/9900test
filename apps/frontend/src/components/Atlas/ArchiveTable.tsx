import CustomTypography from '@/components/Common/Typography';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';
import { corePalette } from '@/themes/colours';
import { IGeneListGene } from '@/types/Reports/GeneLists.types';
import {
    Box, Grid, styled,
} from '@mui/material';
import { useEffect, useRef, type JSX } from 'react';
import ArchiveGeneCard from './ArchiveGeneCard';

interface IGeneGridProps {
  genes: IGeneListGene[];
  rowsPerPage: number;
  currentPage: number;
  listType: string;
}

const Table = styled(Grid)({
  borderTop: `1px solid ${corePalette.grey50}`,
});

const TableWrapper = styled(Box)({
  margin: '1vh 1vh 0 0',
  maxHeight: '55vh',
});

const PageNumberWrapper = styled(Box)({
  height: '35px',
  display: 'flex',
  justifyContent: 'flex-end',
});

const FillerCells = styled(Box)({
  height: '60px',
  borderBottom: `1px solid ${corePalette.grey50}`,
  borderRight: `1px solid ${corePalette.grey50}`,
  backgroundColor: corePalette.white,
});

function getNameLength(gene: IGeneListGene, listType: string, font = '14px Roboto'): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;
  context.font = font;
  let length = context.measureText(gene.gene).width;
  const iconWidth = 28;
  const iconPadding = 6;
  if (listType === 'somatic' && gene.isSomaticGermline) {
    length += iconWidth + iconPadding;
  }

  return length + 24;
}

export default function ArchiveGeneGrid({
  genes,
  rowsPerPage,
  currentPage,
  listType,
}: IGeneGridProps) : JSX.Element {
  const genesPerPage = rowsPerPage * 5;
  const start = currentPage * genesPerPage;
  const end = start + genesPerPage;
  const sortedGenes = [...genes].sort((a, b) => a.gene.localeCompare(b.gene));
  const paginatedGenes = sortedGenes.slice(start, end);
  const emptyCells = 5 - paginatedGenes.length;
  const archiveScrollableRef = useRef<HTMLDivElement>(null);

  const column: IGeneListGene[][] = Array.from({ length: 5 }, () => []);
  paginatedGenes.forEach((gene, idx) => {
    const col = idx % 5;
    column[col].push(gene);
  });

  const columnWidths = column.map((group) => {
    const widths = group.map((gene) => getNameLength(gene, listType));
    return Math.max(...widths, 0);
  });

  useEffect(() => {
    archiveScrollableRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [rowsPerPage]);
  return (
    <TableWrapper>
      <PageNumberWrapper>
        <CustomTypography fontSize="small" fontWeight="bold" sx={{ '&:hover': { cursor: 'default' } }}>
          {currentPage * (rowsPerPage * 5) + 1}
          -
          {Math.min(((currentPage + 1) * (rowsPerPage * 5)), genes.length)}
          {' '}
          of
          {' '}
          {genes.length}
          {' '}
          Genes
        </CustomTypography>
      </PageNumberWrapper>
      <ScrollableSection
        scrollableNodeProps={{ ref: archiveScrollableRef }}
        style={{
          maxHeight: '50vh',
          width: '100%',
        }}
      >
        <Table>
          <Grid container spacing={0.001} sx={{ paddingBottom: '5px' }}>
            {paginatedGenes.map((gene, index) => {
              const columnIndex = index % 5;
              const nameWidth = columnWidths[columnIndex];
              return (
                <Grid size={2.4} key={gene.geneId} sx={{ borderLeft: `1px solid ${corePalette.grey50}` }}>
                  <ArchiveGeneCard
                    gene={gene}
                    listType={listType}
                    nameWidth={nameWidth}
                  />
                </Grid>
              );
            })}
            {Array.from({ length: emptyCells }).map(() => (
              <Grid size={2.4}>
                <FillerCells data-testid="filler-cell" />
              </Grid>
            ))}
          </Grid>
        </Table>
      </ScrollableSection>
    </TableWrapper>
  );
}
