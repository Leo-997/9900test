import {
  Grid,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { classifierClassificationOptions } from '../../constants/options';
import { ClassifierClassification, IReportableVariant } from '../../types/Common.types';
import { IMethylationData } from '../../types/Methylation.types';
import ReportableSelectRow from '../ExpandedModal/Common/ReportableSelectRow';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  mainContainer: {
    width: '100%',
    rowGap: '16px',
    flexDirection: 'column',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 8,
    color: '#022034',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
  selectBase: {
    backgroundColor: '#ECF0F3',
    color: '#022034',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiSelect-icon': {
      color: 'rgba(0, 0, 0, 0.54)',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiSelect-select:focus': {
      backgroundColor: '#F3F7FF',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiSelect-select:hover': {
      backgroundColor: '#F3F7FF',
    },
    height: 44,
    width: '90%',
    borderRadius: 4,
  },
  selectSelected: {
    backgroundColor: '#6F60E4',
    color: '#FFFFFF',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiSelect-icon': {
      color: '#FFFFFF',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiSelect-select:focus': {
      backgroundColor: '#6F60E4',
      color: '#FFFFFF',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiSelect-select:hover': {
      backgroundColor: '#6F60E4',
      color: '#FFFFFF',
    },
  },
  select: {
    paddingBottom: 0,
    paddingTop: 0,
    borderRadius: 8,
  },
  selectItem: {
    height: 44,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      background: '#F3F7FF',
    },
  },
}));

interface IProps {
  result: IMethylationData;
  handleUpdateResult: (body: Partial<IReportableVariant<ClassifierClassification>>) => void
}

export function MethCurationFooter({
  result,
  handleUpdateResult,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Grid container alignItems="center" className={classes.mainContainer}>
      <ReportableSelectRow
        biosampleId={result.biosampleId}
        variant={result}
        handleUpdateVariant={handleUpdateResult}
        overrideOptions={classifierClassificationOptions}
        hideIncludeInReport
      />
    </Grid>
  );
}
