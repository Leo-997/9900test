import { correlationSelectOptions, rationaleSelectOptions } from '@/constants/HTS/hts';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { HTSCorrelation, HTSReportingRationale, IHTSReportable } from '@/types/HTS.types';
import { VariantType } from '@/types/misc.types';
import {
    Grid,
    styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { yesNoOptions } from '../../constants/options';
import { useCuration } from '../../contexts/CurationContext';
import { boolToStr, strToBool } from '../../utils/functions/bools';
import CustomTypography from '../Common/Typography';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';

import type { JSX } from "react";

interface IStyleProps {
  isSelected?: boolean;
}

const SelectInput = styled(AutoWidthSelect)<IStyleProps>(({ theme, isSelected }) => ({
  width: '100%',
  borderRadius: 4,
  '&.Mui-focused fieldset': {
    borderColor: `${theme.colours.core.violet100} !important`,
  },
  ...(
    isSelected ? {
      backgroundColor: theme.colours.core.violet100,
      color: theme.colours.core.white,
      '& *': {
        color: theme.colours.core.white,
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '& .MuiSelect-icon': {
        color: theme.colours.core.white,
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '& .MuiSelect-select:focus': {
        backgroundColor: theme.colours.core.violet100,
        color: theme.colours.core.white,
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '& .MuiSelect-select:hover': {
        backgroundColor: theme.colours.core.violet100,
        color: theme.colours.core.white,
      },
    } : {
      backgroundColor: theme.colours.core.grey30,
      color: theme.colours.core.offBlack100,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '& .MuiSelect-icon': {
        color: theme.colours.core.offBlack100,
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '& .MuiSelect-select:focus': {
        backgroundColor: theme.colours.core.grey30,
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '& .MuiSelect-select:hover': {
        backgroundColor: theme.colours.core.grey30,
      },
    }
  ),
}));

const useStyles = makeStyles(() => ({
  mainContainer: {
    width: '100%',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: 18,
    paddingRight: 16,
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  header: {
    marginBottom: 8,
  },
  select: {
    paddingBottom: 0,
    paddingTop: 0,
    borderRadius: 8,
  },
}));

interface IProps {
  variantId: string;
  variantType: Extract<VariantType, 'HTS' | 'HTS_COMBINATION'>;
  biosampleId: string;
  data: IHTSReportable;
  updateReportable?(body: Partial<IHTSReportable>): Promise<void>;
}

export function HtsFooter({
  variantId,
  variantType = 'HTS',
  biosampleId,
  data,
  updateReportable,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { analysisSet } = useAnalysisSet();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;
  const zeroDashSdk = useZeroDashSdk();

  const canEdit = useIsUserAuthorised('curation.sample.hts.write', isAssignedCurator);

  const handleUpdate = async (
    body: Partial<IHTSReportable>,
  ): Promise<void> => {
    if (updateReportable) {
      await updateReportable(body);
      if (body.reportable !== undefined) {
        await zeroDashSdk.reportableVariants.updateReportableVariant(
          analysisSet.analysisSetId,
          biosampleId,
          {
            reports: body.reportable ? ['PRECLINICAL_REPORT'] : [],
            variantType,
            variantId,
          },
        );
      }
    }
  };

  return (
    <Grid container alignItems="center" className={classes.mainContainer}>
      <Grid size={{ xs: 2 }} className={classes.column}>
        <CustomTypography variant="label" className={classes.header}>
          Reportable
        </CustomTypography>
        <SelectInput
          options={yesNoOptions}
          MenuProps={{
            // eslint-disable-next-line @typescript-eslint/naming-convention
            MenuListProps: { className: classes.select },
          }}
          value={boolToStr(data.reportable)}
          onChange={(e): Promise<void> => (
            handleUpdate({ reportable: strToBool(e.target.value as string) })
          )}
          isSelected={Boolean(data.reportable)}
          overrideReadonlyMode={isReadOnly || !canEdit}
        />
      </Grid>
      <Grid size={{ xs: 4 }} className={classes.column}>
        <CustomTypography variant="label" truncate className={classes.header}>
          Reporting Rationale
        </CustomTypography>
        <SelectInput
          options={rationaleSelectOptions}
          MenuProps={{
            // eslint-disable-next-line @typescript-eslint/naming-convention
            MenuListProps: { className: classes.select },
          }}
          value={data.reportingRationale}
          onChange={(e): Promise<void> => (
            handleUpdate({ reportingRationale: e.target.value as HTSReportingRationale })
          )}
          isSelected={Boolean(data.reportingRationale)}
          overrideReadonlyMode={isReadOnly || !canEdit}
        />
      </Grid>
      <Grid size={{ xs: 6 }} className={classes.column}>
        <CustomTypography variant="label" truncate className={classes.header}>
          Correlation to patient molecular aberration
        </CustomTypography>
        <SelectInput
          options={correlationSelectOptions}
          MenuProps={{
            // eslint-disable-next-line @typescript-eslint/naming-convention
            MenuListProps: { className: classes.select },
          }}
          value={data.correlation}
          onChange={(e): Promise<void> => (
            handleUpdate({ correlation: e.target.value as HTSCorrelation })
          )}
          isSelected={Boolean(data.correlation)}
          overrideReadonlyMode={isReadOnly || !canEdit}
        />
      </Grid>
    </Grid>
  );
}
