import { Box, styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import {
  ReactNode, useEffect, useState, type JSX,
} from 'react';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { reportOptions } from '@/constants/Reports/reports';
import { classificationOptions, yesNoOptions } from '../../../constants/options';
import { useCuration } from '../../../contexts/CurationContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { Classification, ClassifierClassification, IReportableVariant } from '../../../types/Common.types';
import { ISelectOption, VariantType } from '../../../types/misc.types';
import { ReportType } from '../../../types/Reports/Reports.types';
import { boolToStr, strToBool } from '../../../utils/functions/bools';
import { isClassified } from '../../../utils/functions/reportable/isClassified';
import CustomTypography from '../../Common/Typography';
import { AutoWidthSelect } from '../../Input/Select/AutoWidthSelect';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';

interface IStyleProps {
  isSelected?: boolean,
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
      '& .MuiSelect-icon': {
        color: theme.colours.core.white,
      },
      '& .MuiSelect-select:focus': {
        backgroundColor: theme.colours.core.violet100,
        color: theme.colours.core.white,
      },
      '& .MuiSelect-select:hover': {
        backgroundColor: theme.colours.core.violet100,
        color: theme.colours.core.white,
      },
    } : {
      backgroundColor: theme.colours.core.grey30,
      color: theme.colours.core.offBlack100,
      '& .MuiSelect-icon': {
        color: theme.colours.core.offBlack100,
      },
      '& .MuiSelect-select:focus': {
        backgroundColor: theme.colours.core.grey30,
      },
      '& .MuiSelect-select:hover': {
        backgroundColor: theme.colours.core.grey30,
      },
    }
  ),
}));

const useStyles = makeStyles(() => ({
  header: {
    display: 'inline-block',
    paddingRight: '10px',
  },
}));

interface IProps<C extends Classification | ClassifierClassification = Classification> {
  variant: IReportableVariant<C>;
  handleUpdateVariant: (
    body: Partial<IReportableVariant<C>>,
    reports?: ReportType[]
    ) => Promise<ReportType[] | void> | void | ReportType[];
  variantId?: string ;
  variantType?: VariantType;
  biosampleId: string;
  overrideOptions?: ISelectOption<C | ''>[];
  hideIncludeInReport?: boolean;
}

export default function ReportableSelectRow<
  C extends Classification | ClassifierClassification = Classification
>({
  variant,
  variantId,
  variantType,
  biosampleId,
  handleUpdateVariant,
  overrideOptions,
  hideIncludeInReport,
}: IProps<C>): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;
  const { enqueueSnackbar } = useSnackbar();
  const {
    analysisSet,
    demographics,
  } = useAnalysisSet();

  const [selectedReports, setSelectedReports] = useState<ReportType[]>([]);

  const canEdit = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;

  useEffect(() => {
    async function getSelectedReports():Promise<void> {
      if (variantId && variantType) {
        const reportsData = await zeroDashSdk.reportableVariants.getReportableVariants(
          analysisSet.analysisSetId,
          {
            variantType: [variantType],
            variantId,
          },
        );
        const dataReports = reportsData.map((reportData) => reportData.reportType);
        setSelectedReports(dataReports);
      }
    }

    getSelectedReports();
  }, [zeroDashSdk.reportableVariants, analysisSet.analysisSetId, variantType, variantId]);

  const handleUpdateReports = async (newSelectedReports: ReportType[]): Promise<void> => {
    if (analysisSet.analysisSetId) {
      try {
        if (variantType && variantId) {
          await zeroDashSdk.reportableVariants.updateReportableVariant(
            analysisSet.analysisSetId,
            biosampleId,
            {
              variantType,
              variantId,
              reports: newSelectedReports,
            },
          );
          setSelectedReports(newSelectedReports);
        }
      } catch {
        enqueueSnackbar('Cannot update reports data, please try again.', { variant: 'error' });
      }
    }
  };

  return (
    <Box display="flex" width="100%" gap="8px" flexWrap="nowrap">
      <Box flex={4} minWidth="0px">
        <CustomTypography variant="label" truncate className={classes.header}>
          Classification
        </CustomTypography>
        <SelectInput
          key="curation-footer-reportable-select"
          options={overrideOptions || classificationOptions as ISelectOption<C | ''>[]}
          overrideReadonlyMode={isReadOnly || !canEdit}
          value={variant.classification}
          onChange={async (e): Promise<void> => {
            if (e.target.value !== 'Not Reportable'
              && e.target.value !== ''
              && 'cnType' in variant
              && !variant.cnType) {
              enqueueSnackbar('Please select a CN type.', { variant: 'error' });
              return;
            }
            const newReports = await handleUpdateVariant(
              {
                classification: (e.target.value || null) as (C | null),
              },
              selectedReports,
            );
            if (!hideIncludeInReport && newReports) handleUpdateReports(newReports);
          }}
          isSelected={isClassified(variant)}
        />
      </Box>
      <Box flex={3} minWidth="0px">
        <CustomTypography variant="label" truncate className={classes.header}>
          Reportable
        </CustomTypography>
        <SelectInput
          options={yesNoOptions}
          value={boolToStr(variant.reportable)}
          disabled={!isClassified(variant) || !canEdit}
          onChange={async (e): Promise<void> => {
            const newReports = await handleUpdateVariant(
              {
                reportable: strToBool(e.target.value as string),
              },
              selectedReports,
            );
            if (!hideIncludeInReport && newReports) handleUpdateReports(newReports);
          }}
          isSelected={Boolean(variant.reportable)}
          overrideReadonlyMode={isReadOnly || !canEdit}
        />
      </Box>
      {!hideIncludeInReport && (
        <Box flex={3} minWidth="0px">
          <CustomTypography variant="label" truncate className={classes.header}>
            Show in Reports
          </CustomTypography>
          <SelectInput
            multiple
            options={reportOptions}
            value={selectedReports}
            renderValue={(): ReactNode => {
              const reportsAbbreviations = selectedReports
                .map((rep) => reportOptions.find((option) => option.value === rep)?.abbreviation)
                .sort()
                .join(', ');
              return (
                <CustomTypography truncate>
                  {reportsAbbreviations}
                </CustomTypography>
              );
            }}
            onChange={(e): void => {
              const newReports = e.target.value as ReportType[];
              handleUpdateReports(newReports);
            }}
            disabled={
              !isClassified(variant)
              || variant.reportable !== true
              || !canEdit
              || demographics?.category1Consent === false
            }
            isSelected={selectedReports.length > 0}
            overrideReadonlyMode={isReadOnly || !canEdit}
          />
        </Box>
      )}
      <Box flex={3} minWidth="0px">
        <CustomTypography variant="label" truncate className={classes.header}>
          Targetable
        </CustomTypography>
        <SelectInput
          key="curation-footer-targetable-select"
          options={yesNoOptions}
          overrideReadonlyMode={isReadOnly || !canEdit}
          value={boolToStr(variant.targetable)}
          onChange={(e): void => {
            handleUpdateVariant(
              {
                targetable: strToBool(e.target.value as string),
              },
            );
          }}
          isSelected={Boolean(variant.targetable)}
        />
      </Box>
    </Box>
  );
}
