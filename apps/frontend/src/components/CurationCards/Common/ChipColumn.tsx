import { CardContent } from '@mui/material';
import { CSSProperties, makeStyles } from '@mui/styles';
import CustomTypography from '../../Common/Typography';

import ColumnHeading from './ColumnHeading';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  subTextLabel: {
    color: '#5E6871',
    margin: '2px',
  },
  subText: {
    color: '#022034',
    margin: '2px',
  },
}));

interface IProps {
  column: string;
  subText: number | string;
  subTextLabel?: string;
  chip?: JSX.Element;
  subTextLabelClass?: string;
  subTextClass?: string;
  style?: CSSProperties;
}

export default function ChipColumn({
  column,
  subText,
  subTextLabel,
  chip,
  subTextLabelClass,
  subTextClass,
  style,
}: IProps): JSX.Element {
  const classes = useStyles();
  return (
    <CardContent style={style}>
      <ColumnHeading text={column} />
      {chip}
      <div style={{ display: 'flex' }}>
        {subTextLabel && (
          <CustomTypography
            className={`${classes.subTextLabel} ${subTextLabelClass}`}
            variant="bodyRegular"
          >
            {subTextLabel}
          </CustomTypography>
        )}
        <CustomTypography
          className={`${classes.subText} ${subTextClass}`}
          variant="bodyRegular"
        >
          {subText}
        </CustomTypography>
      </div>
    </CardContent>
  );
}
