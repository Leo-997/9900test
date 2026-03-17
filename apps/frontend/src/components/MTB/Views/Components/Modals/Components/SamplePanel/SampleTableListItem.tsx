import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  IMolAlterationSampleDetails,
  ISampleTableMapper,
} from '../../../../../../../types/MTB/MolecularAlteration.types';
import CustomTypography from '../../../../../../Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  listBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '0px',
    gap: '16px',
    width: '100%',
    minWidth: '728px',
    height: '20px',
    boxSizing: 'border-box',
    borderRadius: '8px',
  },
  listItemText: {
    height: '20px',
    fontWeight: 400,
    color: '#273957',
  },
}));
interface IProps {
  listData: Omit<IMolAlterationSampleDetails, 'additionalData'>;
  sampleTableMapper: ISampleTableMapper[];
}
export default function SampleTableListItem({
  listData,
  sampleTableMapper,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={classes.listBox}>
      {sampleTableMapper.map(({ style, key, displayRender }) => (
        <CustomTypography
          truncate
          key={key}
          style={style}
          variant="bodySmall"
          className={classes.listItemText}
        >
          {
            displayRender
              ? displayRender(listData[key]) || '-'
              : listData[key] || '-'
          }
        </CustomTypography>
      ))}
    </Box>
  );
}
