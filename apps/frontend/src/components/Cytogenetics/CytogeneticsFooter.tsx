import {
  Grid,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { JSX } from 'react';
import { Chromosome, IReportableVariant } from '../../types/Common.types';
import { Arm, IParsedCytogeneticsData } from '../../types/Cytogenetics.types';
import { ReportType } from '../../types/Reports/Reports.types';
import CustomTypography from '../Common/Typography';
import ReportableSelectRow from '../ExpandedModal/Common/ReportableSelectRow';

const useStyles = makeStyles(() => ({
  mainContainer: {
    width: '100%',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: 18,
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  header: {
    marginBottom: 8,
  },
  hairline: {
    border: 'none',
    borderTop: '1px dashed #D0D9E2',
    width: '90%',
    margin: '12px 0',
  },
  selectBase: {
    backgroundColor: '#ECF0F3',
    color: '#022034',

    '& .MuiSelect-icon': {
      color: 'rgba(0, 0, 0, 0.54)',
    },

    '& .MuiSelect-select:focus': {
      backgroundColor: '#F3F7FF',
    },

    '& .MuiSelect-select:hover': {
      backgroundColor: '#F3F7FF',
    },
    height: 44,
    width: 230,
    borderRadius: 4,
  },
  selectSelected: {
    backgroundColor: '#6F60E4',
    color: '#FFFFFF',

    '& .MuiSelect-icon': {
      color: '#FFFFFF',
    },

    '& .MuiSelect-select:focus': {
      backgroundColor: '#6F60E4',
      color: '#FFFFFF',
    },

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

    '&:hover': {
      background: '#F3F7FF',
    },
  },
}));

interface IProps {
  biosampleId: string;
  data: IParsedCytogeneticsData;
  disabled: { p: boolean, q: boolean};
  type: 'somatic' | 'germline';
  handleUpdateData: (
    body: Partial<IReportableVariant>,
    chromosome: Chromosome,
    arm: Arm,
    reports?: ReportType[],
  ) => Promise<ReportType[]>;
}

export function CytogeneticsFooter({
  biosampleId,
  data,
  disabled,
  type,
  handleUpdateData,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Grid container alignItems="center" className={classes.mainContainer}>
      <Grid size={12}>
        <CustomTypography variant="bodyRegular" fontWeight="bold">ARM P</CustomTypography>
      </Grid>
      {disabled.p ? (
        <Grid size={12} style={{ height: 70 }}>
          <CustomTypography variant="bodyRegular">No records for Arm P</CustomTypography>
        </Grid>
      ) : (
        <ReportableSelectRow
          variant={data.p}
          variantId={`${data.chr}-p`}
          biosampleId={biosampleId}
          variantType={type === 'somatic' ? 'CYTOGENETICS' : 'GERMLINE_CYTO'}
          handleUpdateVariant={(body, reports?): Promise<ReportType[]> => handleUpdateData(body, data.chr, 'p', reports)}
        />
      )}
      <hr className={classes.hairline} />
      <Grid size={12}>
        <CustomTypography variant="bodyRegular" fontWeight="bold">ARM Q</CustomTypography>
      </Grid>
      {disabled.q ? (
        <Grid size={12} style={{ height: 70 }}>
          <CustomTypography variant="bodyRegular">No records for Arm Q</CustomTypography>
        </Grid>
      ) : (
        <ReportableSelectRow
          variant={data.q}
          variantId={`${data.chr}-q`}
          variantType={type === 'somatic' ? 'CYTOGENETICS' : 'GERMLINE_CYTO'}
          biosampleId={biosampleId}
          handleUpdateVariant={(body, reports?): Promise<ReportType[]> => handleUpdateData(body, data.chr, 'q', reports)}
        />
      )}
    </Grid>
  );
}
