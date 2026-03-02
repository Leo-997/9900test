import StatusChip from '@/components/Chips/StatusChip';
import CustomTypography from '@/components/Common/Typography';
import { nonGeneAlterationTypes } from '@/constants/alterations';
import { corePalette } from '@/themes/colours';
import { VariantType } from '@/types/misc.types';
import { IMolAltSummaryColumn, IMolecularAlterationDetail } from '@/types/MTB/MolecularAlteration.types';
import { IGeneAltSettings, INonGeneAltSettings } from '@/types/MTB/Settings.types';
import { getColourByMutationType } from '@/utils/functions/getColourByMutationType';
import mapMutationType from '@/utils/functions/mapMutationType';
import {
  styled,
  TableCell as MuiTableCell,
  Box,
  TableRow,
} from '@mui/material';
import { ReactNode, type JSX } from 'react';

const TableCell = styled(MuiTableCell)({
  height: '100%',
  padding: '0.6% 1.5% 0.6% 1.5%',
  backgroundColor: 'inherit',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
});

interface IProps<T = IGeneAltSettings | INonGeneAltSettings> {
  data: Omit<IMolecularAlterationDetail, 'additionalData'>;
  columnSettings: IMolAltSummaryColumn<T>[];
  isForNonGeneType?: boolean;
}

export function AlterationSummaryListItemExport<
  T = IGeneAltSettings | INonGeneAltSettings
>({
  data,
  columnSettings,
  isForNonGeneType,
}: IProps<T>): JSX.Element {
  const getRowItemContent = (item: IMolAltSummaryColumn<T>, index: number): ReactNode => {
    let content = data[item.key];

    if (data.mutationType.includes('CYTOGENETICS')) {
      if (item.key === 'gene') {
        content = data.alteration;
      } else if (item.key === 'clinicalAlteration') {
        content = data.description;
      }
    }

    if (item.displayTransform) {
      content = item.displayTransform(content, data);
    }

    if (index === 0) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
        >
          {((nonGeneAlterationTypes.includes(data.mutationType)
          || data.mutationType.includes('GERMLINE'))) && (
            <CustomTypography
              variant="label"
              color={getColourByMutationType(data.mutationType as VariantType)}
              fontSize="12px"
              fontWeight="normal"
              textTransform="none"
              letterSpacing="normal"
            >
              {mapMutationType(data.mutationType as VariantType)}
            </CustomTypography>
          )}
          <CustomTypography
            variant="bodyRegular"
            fontWeight="bold"
          >
            {content}
          </CustomTypography>
        </Box>
      );
    }

    if (item.key === 'clinicalTargetable') {
      return (
        <StatusChip
          status={content ? 'Yes' : 'No'}
          backgroundColor={content ? '#C9FFE2' : '#FEE0E9'}
          color={content ? '#048057' : '#B00047'}
          size="small"
        />
      );
    }

    return (
      <CustomTypography
        variant="bodySmall"
      >
        {item.key === 'mutationType' ? mapMutationType(content as VariantType) : content}
      </CustomTypography>
    );
  };

  return (
    <TableRow
      sx={{ borderBottom: `1px solid ${corePalette.grey30}` }}
    >
      {columnSettings
        .filter((item) => item.visible === true)
        .map((o, i) => (
          o.visible && (
          <TableCell
            key={o.key}
            sx={{
              textTransform: isForNonGeneType ? 'capitalize' : 'none',
              maxWidth: 'auto',
            }}
          >
            {getRowItemContent(o, i)}
          </TableCell>
          )))}
    </TableRow>
  );
}
