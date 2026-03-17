import type { VariantSeenInBiosample } from '@zero-dash/types/dist/src/variants/Variants.types';
import { useEffect, useState, type JSX } from 'react';
import type { GridColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Link } from '@mui/material';
import { ArrowUpRightIcon } from 'lucide-react';
import CustomDataGrid, { type TableConfig } from '@/components/Common/DataGrid';
import { paginationOptions } from '@/components/Common/DataGrid/Pagination';
import CustomTypography from '@/components/Common/Typography';

interface IProps {
  tabName: string;
  totalFrequency: number;
  getRows?: (
    page?: number,
    limit?: number,
  ) => Promise<VariantSeenInBiosample[]>;
}

export default function FrequencyData({
  tabName,
  totalFrequency,
  getRows,
}: IProps): JSX.Element {
  const [rows, setRows] = useState<VariantSeenInBiosample[]>([]);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(
    paginationOptions.find(
      (option) => option >= totalFrequency,
    ) || paginationOptions[paginationOptions.length - 1],
  );
  const defaultTableConfig: TableConfig[] = [
    { key: 'biosampleId', columnLabel: 'Biosample ID', isVisible: true },
    { key: 'zero2Category', columnLabel: 'ZERO2 Category', isVisible: false },
    { key: 'zero2Subcategory1', columnLabel: 'ZERO2 Subcategory 1', isVisible: true },
    { key: 'zero2Subcategory2', columnLabel: 'ZERO2 Subcategory 2', isVisible: false },
    { key: 'zero2FinalDiagnosis', columnLabel: 'ZERO2 Final Diagnosis', isVisible: true },
  ];
  const [tableConfig, setTableConfig] = useState<TableConfig[]>(defaultTableConfig);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (getRows) {
      setLoading(true);
      getRows(
        page + 1,
        pageSize,
      )
        .then(setRows)
        .finally(() => setLoading(false));
    }
  }, [getRows, page, pageSize]);

  const columns: GridColDef<VariantSeenInBiosample>[] = tableConfig
    .filter((config) => config.isVisible)
    .map((config) => ({
      field: config.key,
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      headerName: config.columnLabel?.toString() || config.key,
      flex: config.key === 'zero2FinalDiagnosis' ? 2 : 1,
      type: 'string',
      renderCell: config.key === 'biosampleId'
        ? ({ row }) => (
          <Link
            href={`/${row.patientId}/${row.analysisSetId}/curation/${tabName}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ width: '100%', display: 'flex', alignItems: 'center' }}
          >
            <CustomTypography truncate flex={1} fontWeight="bold">
              {row.biosampleId}
            </CustomTypography>
            <ArrowUpRightIcon style={{ marginLeft: '4px', flexShrink: 0 }} />
          </Link>
        )
        : undefined,
    }));

  return (
    <CustomDataGrid
      rows={rows}
      getRowId={({ biosampleId }) => biosampleId}
      columns={columns}
      sx={{
        '& .MuiDataGrid-virtualScroller': {
          // 8 rows + header height
          maxHeight: '390px',
        },
      }}
      pagination
      paginationModel={{ page, pageSize }}
      onPageChange={(value): void => {
        setPage(value);
      }}
      onPageSizeChange={(value): void => {
        setPageSize(value);
      }}
      rowCount={totalFrequency}
      tableConfig={tableConfig}
      onUpdateConfig={(config) => setTableConfig(config)}
      onResetConfig={() => setTableConfig(defaultTableConfig)}
      loading={loading}
      disableColumnMenu
      disableColumnSorting
      disableVirtualization
    />
  );
}
