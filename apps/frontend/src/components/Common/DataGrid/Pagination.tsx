import {
  Box,
  IconButton,
  MenuItem,
  Select,
  styled,
} from '@mui/material';
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';

import type { JSX } from 'react';
import CustomTypography from '@/components/Common/Typography';

interface IProps {
  rowsPerPage: number,
  onRowsPerPageChange: (value: number) => void,
  currentPage: number,
  onCurrentPageChange: (value: number) => void,
  totalResults: number,
}

const Wrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'right',
  alignItems: 'center',
  marginRight: '30px',
  width: '100%',
});

const ArrowControlWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  marginLeft: '10px',
});

export const paginationOptions = [5, 10, 25, 50, 100] as const;

export default function Pagination({
  rowsPerPage,
  onRowsPerPageChange,
  currentPage,
  onCurrentPageChange,
  totalResults,
}: IProps): JSX.Element {
  const totalPages = Math.ceil(totalResults / rowsPerPage);

  return (
    <Wrapper>
      {totalResults > 5 && (
        <>
          <CustomTypography data-testid="RowsPerPageLabel" fontWeight="bold" sx={{ '&:hover': { cursor: 'default' } }}>Rows Per Page </CustomTypography>
          <Select
            defaultValue={rowsPerPage}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            sx={{
              marginLeft: '10px',
              width: '100px',
              '&:hover': {
                cursor: 'pointer',
              },
            }}
            onChange={(e): void => onRowsPerPageChange(Number(e.target.value))}
          >
            {paginationOptions.map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </>
      )}
      <ArrowControlWrapper>
        <ArrowControlWrapper>
          <IconButton
            onClick={(): void => {
              if (currentPage !== 0) onCurrentPageChange(0);
            }}
            disabled={currentPage === 0}
          >
            <ChevronFirstIcon />
          </IconButton>
          <IconButton
            onClick={(): void => onCurrentPageChange(Math.max(currentPage - 1, 0))}
            disabled={currentPage === 0}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={(): void => {
              onCurrentPageChange(Math.min(currentPage + 1, totalPages - 1));
            }}
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronRightIcon />
          </IconButton>
          <IconButton
            onClick={(): void => onCurrentPageChange(totalPages - 1)}
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronLastIcon />
          </IconButton>
        </ArrowControlWrapper>
      </ArrowControlWrapper>
    </Wrapper>
  );
}
