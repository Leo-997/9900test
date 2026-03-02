import {
  Table, TableBody, TableCell, TableRow,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { corePalette } from '@/themes/colours';
import { IFetchRecommendation } from '../../../../../../types/MTB/Recommendation.types';
import CustomTypography from '../../../../../Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  row: {
    width: '100%',
    minHeight: '40px',
    paddingLeft: '16px',
    backgroundColor: '#FFFFFF',
  },
  item: {
    padding: '12px 16px',
    flex: 1,
    border: 'none',
  },
}));

interface IDiagnosisListItem {
  recommendation: IFetchRecommendation;
}

export default function DiagnosisListItem({
  recommendation,
}: IDiagnosisListItem): JSX.Element {
  const classes = useStyles();

  return (
    <Table>
      <TableBody>
        <TableRow className={classes.row} style={{ backgroundColor: corePalette.grey30 }}>
          <TableCell className={classes.item}>
            <CustomTypography variant="bodyRegular" fontWeight="bold">
              Recommended
            </CustomTypography>
          </TableCell>
          <TableCell className={classes.item}>
            <CustomTypography variant="bodyRegular">
              {recommendation.zero2FinalDiagnosis}
            </CustomTypography>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
