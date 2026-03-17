import { Box as MuiBox, styled } from '@mui/material';
import CustomTypography from '../../Common/Typography';

import type { JSX } from "react";

const Row = styled(MuiBox)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  height: '60px',
  minWidth: 'fit-content',
  paddingLeft: '0px',
  backgroundColor: theme.colours.core.grey10,
  zIndex: 1,
}));

const Item = styled(MuiBox)(({ theme }) => ({
  backgroundColor: theme.colours.core.grey10,
  padding: '0px 10px',
}));

const ItemLeft = styled(Item)({
  position: 'sticky',
  left: 0,
  paddingLeft: '16px',
});

const ItemRight = styled(Item)({
  position: 'sticky',
  right: 0,
  paddingRight: '16px',
});

export default function ReportsDashboardHeader(): JSX.Element {
  return (
    <Row display="flex" alignItems="center">
      <ItemLeft minWidth="250px">
        <CustomTypography truncate variant="label">
          Sample ID
        </CustomTypography>
      </ItemLeft>
      <Item flex="2" minWidth="200px">
        <CustomTypography variant="label">
          Report Type
        </CustomTypography>
      </Item>
      <Item flex="1" minWidth="110px">
        <CustomTypography variant="label">
          Status
        </CustomTypography>
      </Item>
      <Item flex="2" minWidth="200px">
        <CustomTypography variant="label">
          Zero 2 Final Diagnosis
        </CustomTypography>
      </Item>
      <Item flex="2" minWidth="200px">
        <CustomTypography variant="label">
          Cohort
        </CustomTypography>
      </Item>
      <Item width="65px">
        <CustomTypography variant="label">
          Event
        </CustomTypography>
      </Item>
      <Item flex="1" minWidth="110px">
        <CustomTypography variant="label">
          Drafted
        </CustomTypography>
      </Item>
      <Item flex="1" minWidth="110px">
        <CustomTypography variant="label">
          Finalised
        </CustomTypography>
      </Item>
      <ItemRight flex="1" minWidth="150px">
        <CustomTypography variant="label">
          Approvers
        </CustomTypography>
      </ItemRight>
    </Row>
  );
}
