import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { Views } from '../../../../../types/MTB/MTB.types';
import CustomTypography from '../../../../Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  root: {
    width: '336px',
    height: '280px',
    position: 'relative',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    padding: '40px',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    transition: 'margin-right cubic-bezier(.19,1,.22,1) 1s',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

interface IProps {
  title: string;
  value: Views;
  onClick: () => void;
}

export default function StaticSlideItem({
  title,
  value,
  onClick,
}: IProps): JSX.Element {
  const classes = useStyles();
  const {
    mtbBaseUrl,
  } = useClinical();

  const canViewSlide = useIsUserAuthorised('clinical.sample.read');

  return (
    <Box className={classes.root}>
      <CustomTypography variant="h5" truncate style={{ marginTop: '4px' }}>
        {canViewSlide ? (
          <Link
            className={classes.link}
            onClick={onClick}
            to={`/${mtbBaseUrl}/${value}`}
          >
            {title}
          </Link>
        ) : (
          title
        )}
      </CustomTypography>
    </Box>
  );
}
