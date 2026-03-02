import { ReactNode, type JSX } from 'react';
import { Box, Chip } from '@mui/material';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import CustomTypography from '../Common/Typography';

const useStyles = makeStyles(() => ({
  chip: {
    maxWidth: '210px',
  },
  secondaryText: {
    display: 'flex',
    alignItems: 'center',
  },
}));

interface IProps {
  primaryText?: string;
  secondaryText?: string;
  endIcon?: ReactNode;
  className?: string;
}

export default function DualLabelChip({
  primaryText,
  secondaryText,
  endIcon,
  className,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Chip
      variant="outlined"
      className={clsx({
        [classes.chip]: true,
        [className || '']: true,
      })}
      label={(
        <Box display="flex" gap="5px">
          {primaryText && (
            <CustomTypography variant="bodySmall" fontWeight="bold" truncate>
              {primaryText}
            </CustomTypography>
          )}
          {secondaryText && (
            <CustomTypography
              variant="bodySmall"
              color="textSecondary"
              className={classes.secondaryText}
            >
              {secondaryText}
            </CustomTypography>
          )}
          {endIcon}
        </Box>
      )}
      size="small"
    />
  );
}
