import { makeStyles } from '@mui/styles';
import { Tooltip } from '@mui/material';
import CustomTypography from '../Common/Typography';
import CircleIcon from './CircleIcon';
import DiamondIcon from './DiamondIcon';
import SquareIcon from './SquareIcon';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  tooltipText: {
    color: '#FFFFFF',
    fontWeight: 600,
  },
}));

interface IProps {
  height?: number;
  width?: number;
  iconColor?: string;
  expression?: string | null;
}

export default function GeneExpressionIcon({
  height = 60,
  width = 60,
  expression,
  iconColor = '#D0D9E2',
}: IProps): JSX.Element {
  const classes = useStyles();

  const getIcon = (): JSX.Element => {
    switch (expression?.toLowerCase()) {
      case 'high':
        return (
          <DiamondIcon
            iconColor={iconColor}
            height={height}
            width={width}
          />
        );
      case 'medium':
        return (
          <SquareIcon
            iconColor={iconColor}
            height={height}
            width={width}
          />
        );
      case 'low':
        return (
          <CircleIcon
            iconColor={iconColor}
            height={height}
            width={width}
          />
        );
      default:
        return (
          <CircleIcon
            iconColor={iconColor}
            height={height}
            width={width}
          />
        );
    }
  };

  const tooltipText = (
    <>
      <CustomTypography className={classes.tooltipText}>
        Gene Expression
      </CustomTypography>
      <CustomTypography className={classes.tooltipText} variant="bodySmall">
        {expression || 'Unknown'}
      </CustomTypography>
    </>
  );

  return (
    <Tooltip
      title={tooltipText}
      placement="right"
    >
      {getIcon()}
    </Tooltip>
  );
}
