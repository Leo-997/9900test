import { SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

/**
 * A cell in the DataTable component. Each cell requires a `content` prop
 * which is the content of that cell.
 *
 * For customisation, you can provide the following props:
 *
 * - `gridArea`: An override for the cells name in the grid template. By default,
 * each cell will have the name in this format: `row-X-cell-Y` where X is the row
 * index, and Y is the cell index in that row.
 * - `header`: This cell will be treated as a heading, and will be given styles as
 * appropriate for a header.
 */
export interface IDataTableCell {
  content: ReactNode;
  /**
   * `gridArea`: An override for the cells name in the grid template. By default,
   * each cell will have the name in this format: `row-X-cell-Y` where X is the row
   * index, and Y is the cell index in that row.
   */
  gridArea?: string;
  /**
   * `header`: This cell will be treated as a heading, and will be given styles as
   * appropriate for a header.
   */
  header?: boolean;
  /**
   * `align`: Controls the alignment of the given cell. Takes the same values as justify-content.
   */
  align?: string;
  /**
   * `sx`: Overrides default styles
   */
  sx?: SxProps<Theme>
}

/**
 * A row in the DataTable component. It is a list of cells in this row.
 * Additionally, you can provide an override row template in the form of
 * of a row in the [grid-template](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template).
 *
 * By default every row will have a template of this form:
 *
 * ```row-1-cell-4 row-1-cell-5 row-1-cell-6```
 *
 * where 1 is row index, and 4, 5, and 6 are the cell indices in that row.
 */
export interface IDataTableRow {
  /**
   * An array of IDataTableCell objects.
   */
  cells: IDataTableCell[];
  /**
   * An override for the grid template for this row: [grid-template](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template).
   *
   * By default every row will have a template of this form:
   *
   * ```row-1-cell-4 row-1-cell-5 row-1-cell-6```
   *
   * where 1 is row index, and 4, 5, and 6 are the cell indices in that row.
   */
  rowTemplate?: string;
}
