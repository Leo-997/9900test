import { makeStyles } from '@mui/styles';
import LoadingAnimation from '../../components/Animations/LoadingAnimation';
import CustomTypography from '../../components/Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(({
  page: {
    height: '100vh',
    width: '100vw',
  },
}));

interface ILoadingPageProps {
  message?: string;
}

export function LoadingPage({
  message,
}: ILoadingPageProps): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.page}>
      <LoadingAnimation
        msg={(
          <CustomTypography variant="bodyRegular">
            {message}
          </CustomTypography>
        )}
      />
    </div>
  );
}
