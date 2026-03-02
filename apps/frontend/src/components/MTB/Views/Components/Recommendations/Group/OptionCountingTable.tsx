import CustomTypography from '@/components/Common/Typography';
import { corePalette } from '@/themes/colours';
import { styled } from '@mui/material/styles';
import { Grid } from '@mui/material';
import CustomChip from '@/components/Common/Chip';
import { useRecommendationCountingChipHelpers } from '@/hooks/useRecommendationHelpers';
import { OptionType, typeLabel } from '../Common/recommendationUtils';

import type { JSX } from "react";

interface IProps {
  count: number[];
}

const TableWrapper = styled(Grid)({
  width: '100%',
  borderRadius: '8px',
  overflow: 'hidden',
  border: `1px solid ${corePalette.grey30}`,
  background: corePalette.white,
  padding: '0 12px',
});

const DataRow = styled(Grid)(({ isLast }: { isLast?: boolean }) => ({
  padding: '12px 16px',
  backgroundColor: corePalette.white,
  display: 'flex',
  alignItems: 'center',
  borderBottom: isLast ? 'none' : `1px solid ${corePalette.grey30}`,
  gap: '32px',
}));

const TypeGrid = styled(Grid)({
  flex: 9,
  minWidth: 0,
  paddingRight: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
});

const OptionCountGrid = styled(Grid)({
  flex: 3,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'left',
});

export default function OptionCountingTable({ count }: IProps): JSX.Element {
  const { getOptionTypeChip } = useRecommendationCountingChipHelpers();
  return (
    <TableWrapper size={12}>
      <DataRow
        container
        wrap="nowrap"
        justifyContent="flex-start"
        alignItems="center"
      >
        <TypeGrid>
          <CustomTypography variant="label" fontWeight="bold">
            Type
          </CustomTypography>
        </TypeGrid>
        <OptionCountGrid>
          <CustomTypography variant="label" fontWeight="bold">
            No. of options in this recommendation
          </CustomTypography>
        </OptionCountGrid>
      </DataRow>
      {[0, 1, 2, 3].map((typeIdx) => (
        <DataRow
          key={typeIdx}
          container
          wrap="nowrap"
          justifyContent="flex-start"
          alignItems="center"
          isLast={typeIdx === 3}
        >
          <TypeGrid>
            {getOptionTypeChip((typeIdx + 1) as OptionType)}
            <CustomTypography variant="bodySmall">
              {typeLabel[typeIdx]}
            </CustomTypography>
          </TypeGrid>
          <OptionCountGrid>
            <CustomChip
              label={count[typeIdx]}
              backgroundColour={
                count[typeIdx] === 0
                  ? corePalette.grey30
                  : corePalette.green10
              }
            />
          </OptionCountGrid>
        </DataRow>
      ))}
    </TableWrapper>
  );
}
