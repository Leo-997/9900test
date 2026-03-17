import CustomTypography from '@/components/Common/Typography';
import { corePalette } from '@/themes/colours';
import { IGeneListGene } from '@/types/Reports/GeneLists.types';
import {
  Box, InputAdornment, styled, TextField,
} from '@mui/material';
import { SearchIcon } from 'lucide-react';
import { AlphaTabs } from './AlphaTabs';

import type { JSX } from "react";

interface ITableSearchAndFilterProps {
  name: string,
  panelOrList: string | undefined,
  alphaTabValue: number | boolean,
  setAlphaTabValue: (value: number | boolean) => void
  searchQuery: string,
  setSearchQuery: (value: string) => void,
  numGenes: number,
  currentPage: number,
  rowsPerPage: number,
  genes: IGeneListGene[],
}

const ToolWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginLeft: '32px',
  marginRight: '32px',
});

export default function TableSearchAndFilter({
  name,
  panelOrList,
  alphaTabValue,
  setAlphaTabValue,
  searchQuery,
  setSearchQuery,
  numGenes,
  currentPage,
  rowsPerPage,
  genes,
}: ITableSearchAndFilterProps): JSX.Element {
  const geneCountByLetter = genes.reduce((acc, gene) => {
    const firstLetter = gene.gene[0].toUpperCase();
    acc[firstLetter] = (acc[firstLetter] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const alphaTabs = Array.from({ length: 26 }, (unused, i) => {
    const letter = String.fromCharCode(65 + i);
    return { label: letter, value: 0 + i };
  });

  const handleAlphaTabClick = (newValue: number | boolean): void => {
    if (alphaTabValue === newValue) {
      setAlphaTabValue(false);
    } else {
      setAlphaTabValue(newValue);
    }
  };

  return (
    <ToolWrapper>
      <TextField
        id="gene-list-table-search"
        placeholder={`Search ${name} ${panelOrList === 'gene-list' ? 'List' : 'Gene Panel'}`}
        variant="outlined"
        sx={{ width: '25vw', marginRight: '6px' }}
        value={searchQuery}
        onChange={(e): void => {
          const input = e.target.value;

          if (input.length <= 200) {
            setSearchQuery(input);
          } else {
            const trimmed = input.slice(0, 200);
            setSearchQuery(trimmed);
          }
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color={corePalette.offBlack100} />
              </InputAdornment>
            ),
          },
        }}
      />
      <AlphaTabs
        variant="alpha-hopper"
        size="small"
        value={alphaTabValue}
        tabs={alphaTabs.map((tab) => {
          const letter = tab.label;
          const count = geneCountByLetter[letter] || 0;
          return {
            ...tab,
            count,
            label: <span>{tab.label}</span>,
            onClick: () => handleAlphaTabClick(tab.value),
          };
        })}
        tabGap="0.2vw"
      />
      <Box sx={{ marginLeft: 'auto' }}>
        <CustomTypography fontSize="small" fontWeight="bold" sx={{ '&:hover': { cursor: 'default' } }}>
          {numGenes === 0 || searchQuery !== '' ? (`${numGenes} gene${numGenes === 1 ? '' : 's'}`) : (
            `${currentPage * (rowsPerPage * 5) + 1}-${Math.min(((currentPage + 1) * (rowsPerPage * 5)), numGenes)} of ${numGenes} genes`
          )}
        </CustomTypography>
      </Box>
    </ToolWrapper>
  );
}
