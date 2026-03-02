import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ISampleTableMapper } from '../../../../../../../types/MTB/MolecularAlteration.types';
import CustomTypography from '../../../../../../Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  headerBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '0px',
    gap: '16px',
    width: '100%',
    minWidth: '728px',
    height: '16px',
  },
  text: {
    height: '16px',
    fontWeight: 500,
    textTransform: 'uppercase',
    color: '#62728C',
  },
}));
interface IProps {
  sampleTableMapper: ISampleTableMapper[];
}
export default function SampleTableHeader({
  sampleTableMapper,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={classes.headerBox}>
      {sampleTableMapper.map(({ label, style }) => (
        <CustomTypography
          style={style}
          variant="label"
          className={classes.text}
        >
          {label}
        </CustomTypography>
      ))}
    </Box>
  );
}
