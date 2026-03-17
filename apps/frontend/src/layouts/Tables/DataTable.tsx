/* eslint-disable @typescript-eslint/naming-convention */
import {
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomTypography from '../../components/Common/Typography';
import { IDataTableRow } from '../../types/DataTable/DataTable.types';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  container: {
    display: 'grid',
    gridGap: '1px',
    backgroundColor: '#D0D9E2',
    border: '1px solid #D0D9E2',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  cell: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#FFFFFF',
  },
}));

interface IProps {
  rows: IDataTableRow[];
}

/**
 * A table component for displaying data.
 * This component is customisable through the rows prop.
 *
 * This component uses a [CSS grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout).
 * By default this component uses the following grid template
 * for a 3x3 table:
 *
 * `row-0-cell-0 row-0-cell-1 row-0-cell-2`
 *
 * `row-1-cell-0 row-1-cell-1 row-1-cell-2`
 *
 * `row-2-cell-0 row-2-cell-1 row-2-cell-2`
 *
 * This can be overriden, however, by passing a `rowTemplate` prop
 * to each row that requires the override. Along with the `rowTemplate`,
 * you can provide a `gridArea` override for each cell to rename the
 * cell's area.
 */
export default function DataTable({
  rows,
}: IProps): JSX.Element {
  const classes = useStyles();

  const gridTemplate = rows.map((row, rowIndex) => (
    row.rowTemplate
      ? `'${row.rowTemplate}'`
      : `'${row.cells.map((cell, cellIndex) => `row-${rowIndex}-cell-${cellIndex}`).join(' ')}'`
  ))
    .join('\n');

  return (
    <Box
      className={classes.container}
      style={{
        gridTemplate,
      }}
    >
      {rows.map((row, rowIndex) => (
        row.cells.map((cell, cellIndex) => (
          <Box
            className={classes.cell}
            sx={{
              gridArea: cell.gridArea ? cell.gridArea : `row-${rowIndex}-cell-${cellIndex}`,
              justifyContent: cell.align ? cell.align : 'center',
              ...cell.sx,
            }}
          >
            {typeof cell.content === 'string' || typeof cell.content === 'number' ? (
              <CustomTypography
                style={{ textAlign: 'start', whiteSpace: 'pre-wrap' }}
                variant="bodyRegular"
                fontWeight={cell.header ? 'bold' : undefined}
              >
                {cell.content}
              </CustomTypography>
            ) : cell.content}
          </Box>
        ))
      ))}
    </Box>
  );
}
