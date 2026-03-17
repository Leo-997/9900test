import {
    Grid,
    styled,
} from '@mui/material';
import { getGenderProps } from '@/utils/functions/patients/getGenderProps';
import CustomTypography from '../Common/Typography';
import Gender from './Gender';

import type { JSX } from "react";

interface IVitalStatusProps {
  vitalStatus: string;
  gender: string;
}

const Root = styled(Grid)<IVitalStatusProps>({
  width: '160px',
  maxWidth: '100%',
  height: '48px',
  borderRadius: '4px',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '& .MuiGrid-item': {
    minWidth: '0 !important',
    paddingRight: '0 !important',
  },
});

export default function VitalStatus({
  vitalStatus,
  gender,
}: IVitalStatusProps): JSX.Element {
  const { label, colour, backgroundColour } = getGenderProps(vitalStatus);

  return (
    <Root
      container
      direction="row"
      alignItems="center"
      wrap="nowrap"
      vitalStatus={vitalStatus}
      gender={gender}
      bgcolor={backgroundColour}
    >
      <Gender
        vitalStatus={vitalStatus}
        gender={gender}
        size="45px"
      />
      <Grid>
        <CustomTypography
          variant="titleRegular"
          color={colour}
          marginLeft="15px"
        >
          {label}
        </CustomTypography>
      </Grid>
    </Root>
  );
}
