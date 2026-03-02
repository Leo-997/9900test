import { Grid } from '@mui/material';
import { type JSX, type ReactNode } from 'react';
import CustomTypography from '@/components/Common/Typography';

interface IProps {
  icon?: ReactNode;
  title?: string | ReactNode;
  titleContent?: string | ReactNode;
}

export default function ExpandedModalTitle({
  icon,
  title,
  titleContent,
}: IProps): JSX.Element {
  return (
    <Grid container width="100%" alignItems="center" direction="row" wrap="nowrap">
      <Grid size={1} style={{ marginRight: 40 }}>
        {icon || null}
      </Grid>
      <Grid size={icon ? 10 : 12} direction="column" container paddingRight="8px">
        {title && <CustomTypography variant="label">{title}</CustomTypography>}
        {titleContent && (
          <CustomTypography truncate variant="titleRegular" fontWeight="medium">
            {titleContent}
          </CustomTypography>
        )}
      </Grid>
    </Grid>
  );
}
