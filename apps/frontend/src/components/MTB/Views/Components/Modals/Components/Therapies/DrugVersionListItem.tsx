import { Box } from '@mui/material';
import { IExternalDrug } from '@/types/Drugs/Drugs.types';
import { corePalette } from '@/themes/colours';
import CustomChip from '@/components/Common/Chip';
import CustomButton from '../../../../../../Common/Button';
import CustomTypography from '../../../../../../Common/Typography';

import type { JSX } from "react";

interface IProps {
  isActive: boolean;
  drug: IExternalDrug;
  handleClick: () => void;
}

export default function DrugVersionListItem({
  isActive,
  drug,
  handleClick,
}: IProps): JSX.Element {
  return (
    <CustomButton
      variant="text"
      onClick={handleClick}
      label={(
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          gap="16px"
        >
          <Box
            display="flex"
            flexDirection="row"
            gap="16px"
            flexGrow={1}
            minWidth={0}
          >
            <CustomTypography truncate fontWeight="medium">
              {`Version ${drug.version}`}
            </CustomTypography>
          </Box>
          {drug.version === drug.latestVersion && (
            <CustomChip
              label="LATEST"
              size="small"
              pill
              backgroundColour={corePalette.green10}
              colour={corePalette.green150}
              sx={{
                border: `1px solid ${corePalette.green150}`,
              }}
            />
          )}
        </Box>
      )}
      sx={{
        border: `${isActive ? `2px solid ${corePalette.green150}` : `1px solid ${corePalette.grey50}`}`,
      }}
    />
  );
}
