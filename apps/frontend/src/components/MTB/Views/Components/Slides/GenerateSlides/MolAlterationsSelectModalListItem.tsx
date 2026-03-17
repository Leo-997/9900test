import { corePalette } from '@/themes/colours';
import {
  Checkbox,
  TableCell as MuiTableCell,
  TableRow as MuiTableRow,
  lighten,
  styled,
} from '@mui/material';
import { ReactNode, type JSX } from 'react';
import { getClinicalSVGenes } from '@/utils/functions/getSVGenes';
import { DisruptedTypes, SvType } from '@/types/SV.types';
import { nonGeneAlterationTypes } from '../../../../../../constants/alterations';
import { VariantType } from '../../../../../../types/misc.types';
import { IMolAltSelectModalColumn, IMolecularAlterationDetail } from '../../../../../../types/MTB/MolecularAlteration.types';
import { getColourByMutationType } from '../../../../../../utils/functions/getColourByMutationType';
import { getCytobandFormat } from '../../../../../../utils/functions/getCytobandFormat';
import mapMutationType from '../../../../../../utils/functions/mapMutationType';
import StatusChip from '../../../../../Chips/StatusChip';
import CustomTypography from '../../../../../Common/Typography';

const TableRow = styled(MuiTableRow)(({ theme }) => ({
  width: '784px',
  height: '56px',
  border: 'none',
  backgroundColor: theme.colours.core.white,
}));

const TableCell = styled(MuiTableCell)({
  padding: 0,
  backgroundColor: 'inherit',
  border: 'none',
});

interface IProps {
  data: IMolecularAlterationDetail;
  handleOnChangeAlteration: (
    molAlteration: IMolecularAlterationDetail,
  ) => void;
  columnSettings: IMolAltSelectModalColumn[];
  isChecked: boolean,
  isDisabled?: boolean,
}

export function MolAlterationsSelectModalListItem({
  data,
  handleOnChangeAlteration,
  columnSettings,
  isChecked,
  isDisabled = false,
}: IProps): JSX.Element {
  const customColor = getColourByMutationType(data.mutationType as VariantType);

  const getRowItemContent = (item: IMolAltSelectModalColumn, index: number): ReactNode => {
    let content = data[item.key];

    if (data.mutationType.includes('CYTOGENETICS') || data.mutationType.includes('GERMLINE_CYTO')) {
      if (item.key === 'gene') {
        content = data.alteration;
      } else if (item.key === 'clinicalAlteration') {
        content = data.description;
      }
    }

    if (item.key === 'gene' && ['CYTOGENETICS_CYTOBAND', 'GERMLINE_CYTO_CYTOBAND'].includes(data.mutationType)) {
      content = getCytobandFormat(content as string);
    }

    if (item.key === 'mutationType' && data.mutationType === 'TMB') {
      content = 'Tumour mutational burden';
    }

    if (data.mutationType.includes('SV') && data.additionalData && item.key === 'gene') {
      content = getClinicalSVGenes({
        startGene: data.additionalData.startGene.toString(),
        endGene: data.additionalData.endGene.toString(),
        markDisrupted: data.additionalData.markDisrupted as DisruptedTypes,
        svType: data.additionalData.svType as SvType,
      });
    }

    if (index === 0) {
      return (
        <>
          {((nonGeneAlterationTypes.includes(data.mutationType)
          || data.mutationType.includes('GERMLINE'))) && (
            <CustomTypography
              fontSize="12px"
              fontWeight="normal"
              color={customColor}
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
        </>
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
        {content}
      </CustomTypography>
    );
  };

  return (
    <TableRow
      sx={{
        borderLeft: `1px solid ${customColor}`,
        backgroundColor: data.mutationType.includes('GERMLINE')
          ? lighten(corePalette.orange10, 0.7)
          : corePalette.white,
      }}
    >
      <TableCell
        align="center"
      >
        <Checkbox
          onChange={(): void => handleOnChangeAlteration(data)}
          checked={isChecked}
          disabled={isDisabled}
        />
      </TableCell>
      {columnSettings.map((o, i) => ((
        <TableCell
          key={o.key}
          sx={{
            paddingRight: '10px',
            maxWidth: o.width,
          }}
        >
          {getRowItemContent(o, i)}
        </TableCell>
      )))}
    </TableRow>
  );
}
