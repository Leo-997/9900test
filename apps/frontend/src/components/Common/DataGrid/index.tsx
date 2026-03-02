import {
  Accordion as MuiAccordion,
  AccordionDetails as MuiAccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  Box,
  styled,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  DataGrid, DataGridProps, useGridApiRef, type GridRenderCellParams, type GridSlotProps,
} from '@mui/x-data-grid';
import { SettingsIcon } from 'lucide-react';
import {
  ChangeEvent, useState,
  type JSX,
  type ReactNode,
} from 'react';
import CustomButton from '../Button';
import CustomTypography from '../Typography';
import { corePalette } from '@/themes/colours';
import Pagination from './Pagination';
import LoadingAnimation from '@/components/Animations/LoadingAnimation';

const Wrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  width: '100%',
  height: '100%',
  gap: '8px',
});

const Accordion = styled(MuiAccordion)(({ theme }) => ({
  width: '100%',
  borderBottom: 'none',
  '& h3': {
    ...theme.typography.h3,
    width: '100%',
  },
  '& .MuiCollapse-root': {
    width: '100%',
  },
}));

const AccordionSummary = styled(MuiAccordionSummary)({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '4px',
  minHeight: '0px',
  cursor: 'default !important',
});

const AccordionDetails = styled(MuiAccordionDetails)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  width: '100%',
  padding: '4px',
});

const ColumnToggles = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
  width: '100%',
  padding: '0px',
  gap: '16px',
});

export type TableConfig = {
  key: string;
  columnLabel: ReactNode;
  isVisible: boolean;
  initialWidth?: number;
  customRender?: (params: GridRenderCellParams) => JSX.Element;
}

interface IProps extends DataGridProps {
  tableConfig?: TableConfig[];
  onUpdateConfig?: (config: TableConfig[]) => void;
  onResetConfig?: () => void;
  countLabel?: string;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export default function CustomDataGrid({
  tableConfig,
  onUpdateConfig,
  onResetConfig,
  countLabel = 'items',
  ...props
}: IProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const gridAPIRef = useGridApiRef();

  const handleToggleColumn = (
    e: ChangeEvent<HTMLInputElement>,
    key: string,
  ): void => {
    if (!tableConfig) return;
    const idx = tableConfig.findIndex((c) => c.key === key);

    const newConfig = [...tableConfig];
    if (idx === -1) onUpdateConfig?.(tableConfig);

    newConfig[idx] = {
      ...newConfig[idx],
      isVisible: e.target.checked,
    };

    onUpdateConfig?.(newConfig);
  };

  const cell: React.JSXElementConstructor<GridSlotProps['cell']> = (params) => (
    <Box
      {...params}
      px="8px"
      py="16px"
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
    >
      {params.column.renderCell
        ? params.column.renderCell(
          gridAPIRef.current.getCellParams(
            params.rowId,
            params.column.field,
          ),
        )
        : (
          <CustomTypography truncate width="100%">
            {params.row[params.column.field] ?? '-'}
          </CustomTypography>
        )}
    </Box>
  );

  const loadingOverlay = (): JSX.Element => (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      width="100%"
      bgcolor={corePalette.white}
    >
      <LoadingAnimation />
    </Box>
  );

  return (
    <Wrapper>
      <Accordion
        expanded={open}
        sx={{ width: '100%', borderBottom: 'none', padding: 0 }}
        onChange={(e): void => e.stopPropagation()}
      >
        <AccordionSummary>
          <CustomTypography variant="bodySmall" fontWeight="medium">
            {(props.paginationModel?.page ?? 0) * (props.paginationModel?.pageSize ?? 1) + 1}
            {' - '}
            {(
              props.paginationModel?.page ?? 0
            ) * (
              props.paginationModel?.pageSize ?? 1
            ) + (
              props.rows?.length ?? 0
            )}
            {' of '}
            {props.rowCount ?? props.rows?.length ?? 0}
              &nbsp;
            {countLabel}
          </CustomTypography>
          {tableConfig && onUpdateConfig && (
            <CustomButton
              variant="subtle"
              label="Manage"
              size="small"
              onClick={(): void => setOpen((prev) => !prev)}
              startIcon={(
                <SettingsIcon
                  style={{
                    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'all 0.5s cubic-bezier(.19, 1, .22, 1)',
                  }}
                />
              )}
              sx={{
                marginLeft: 'auto',
              }}
            />
          )}
        </AccordionSummary>
        {tableConfig && onUpdateConfig && (
          <AccordionDetails>
            <ColumnToggles>
              {tableConfig.map((col, idx) => (
                <FormControlLabel
                  key={col.key}
                  label={col.columnLabel}
                  control={(
                    <Switch
                      checked={col.isVisible}
                      onChange={(e): void => handleToggleColumn(e, col.key)}
                      disabled={idx === 0}
                    />
                    )}
                />
              ))}
            </ColumnToggles>
            {onResetConfig && (
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="flex-end"
                marginTop="12px"
                gap="8px"
                width="100%"
              >
                <CustomButton
                  variant="subtle"
                  label="Reset to default"
                  size="small"
                  onClick={onResetConfig}
                />
              </Box>
            )}
          </AccordionDetails>
        )}
      </Accordion>
      <DataGrid
        {...props}
        apiRef={gridAPIRef || props.apiRef}
        columnHeaderHeight={props.columnHeaderHeight ?? 48}
        disableColumnSelector={props.disableColumnSelector}
        disableRowSelectionOnClick={props.disableRowSelectionOnClick ?? true}
        getRowHeight={props.getRowHeight ?? (() => 'auto')}
        pagination={props.pagination}
        paginationMode={props.paginationMode ?? 'server'}
        sx={{
          width: '100%',
          // Removes background color for hovering
          '& .MuiDataGrid-row:hover': {
            backgroundColor: corePalette.white,
          },
          // Removes outline for alterations cell when expanding
          '.MuiDataGrid-cell:focus-within': {
            outline: 'none !important',
          },

          // Removes outline for alterations cell when expanding
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '& .MuiDataGrid-columnHeaderTitle': (theme) => ({
            ...theme.typography.label,
          }),

          '& *': {
            borderColor: corePalette.grey50,
          },
          ...props.sx,
        }}
        slots={{
          cell,
          footer: () => null,
          loadingOverlay,
        }}
      />
      {props.pagination && (
        <Pagination
          rowsPerPage={props.paginationModel?.pageSize ?? 20}
          onRowsPerPageChange={(value: number): void => {
            props.onPageSizeChange?.(value);
          }}
          currentPage={props.paginationModel?.page ?? 0}
          onCurrentPageChange={(value: number): void => {
            props.onPageChange?.(value);
          }}
          totalResults={props.rowCount ?? 0}
        />
      )}
    </Wrapper>
  );
}
