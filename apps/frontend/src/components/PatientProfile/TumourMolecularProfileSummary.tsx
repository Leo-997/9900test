import { Box, Grid, Switch } from '@mui/material';
import { useSnackbar } from 'notistack';
import type { JSX } from 'react';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IUpdateAnalysisSetBody } from '@/types/Analysis/AnalysisSets.types';
import { boolToStr } from '@/utils/functions/bools';
import { toFixed } from '@/utils/math/toFixed';
import DataPanel from '../Common/DataPanel';
import CustomTypography from '../Common/Typography';
import ProfileSummaryItem from '../QCMetrics/ProfileSummaryItem';

export default function TumourMolecularProfileSummary(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();

  const {
    purity, analysisSet, setAnalysisSet,
  } = useAnalysisSet();
  const { isReadOnly, isAssignedCurator } = useCuration();
  const canEdit = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator);

  const handleUpdate = async (
    body: Pick<IUpdateAnalysisSetBody, 'targetable' | 'ctcCandidate' | 'researchCandidate'>,
  ): Promise<void> => {
    try {
      await zeroDashSdk.curation.analysisSets.updateAnalysisSetById(
        analysisSet.analysisSetId,
        body,
      );
      setAnalysisSet((prev) => ({
        ...prev,
        ...body,
      }));
    } catch {
      enqueueSnackbar('Could not update analysis set, please try again', { variant: 'error' });
    }
  };

  return (
    <Grid
      container
      direction="row"
      spacing={3}
      size={{ xs: 12, lg: 8 }}
      padding="24px"
      borderRadius="8px"
      bgcolor="white"
      justifyContent="space-between"
      alignItems="center"
    >
      <Grid
        container
        direction="column"
        spacing={2}
        size={{ xs: 12, md: 8 }}
      >
        <CustomTypography variant="titleRegular" fontWeight="medium">
          Tumour Molecular Profile
        </CustomTypography>
        <Grid
          container
          direction="row"
          spacing={2}
          justifyContent="space-between"
        >
          <Grid>
            <DataPanel label="MSI STATUS" value={purity?.msStatus} />
          </Grid>
          <Grid>
            <DataPanel
              label="LOH Proportion"
              value={
                analysisSet.lohProportion !== null
                && analysisSet.lohProportion !== undefined
                  ? `${toFixed(analysisSet.lohProportion * 100, 2)}%`
                  : '-'
              }
            />
          </Grid>
          <Grid>
            <DataPanel
              label="Somatic Pass Variants"
              value={`${analysisSet.finalPass} (chr1-22,X,Y only)`}
            />
          </Grid>
          <Grid>
            <DataPanel
              label="CTC Candidate"
              value={(
                <Box gap="8px" display="flex" alignItems="center">
                  <CustomTypography
                    variant="bodyRegular"
                    minWidth="30px"
                  >
                    {boolToStr(analysisSet.ctcCandidate)}
                  </CustomTypography>
                  <Switch
                    onChange={
                      (e, checked): Promise<void> => handleUpdate({ ctcCandidate: checked })
                    }
                    defaultChecked={analysisSet.ctcCandidate}
                    disabled={isReadOnly || !canEdit}
                  />
                </Box>
              )}
            />
          </Grid>
          <Grid>
            <DataPanel
              label="Mutation Burden"
              value={(
                <Box gap="8px" display="flex" alignItems="center">
                  <CustomTypography
                    variant="bodyRegular"
                  >
                    Targetable
                  </CustomTypography>
                  <Switch
                    onChange={(e, checked): Promise<void> => handleUpdate({ targetable: checked })}
                    defaultChecked={analysisSet.targetable}
                    disabled={isReadOnly || !canEdit}
                    color="red"
                  />
                </Box>
              )}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid container height="110px" size={{ xs: 12, md: 4 }}>
        <ProfileSummaryItem
          title="mutations/mb"
          content={analysisSet.mutBurdenMb ? toFixed(analysisSet.mutBurdenMb, 2) : '-'}
          status={analysisSet.targetable ? 'error' : undefined}
          tooltip="Tumour mutational burden (# passing variants per Mb) per mega base"
          bottom={(
            <DataPanel
              label="SNVs/exome"
              value={analysisSet.somMissenseSnvs ?? '-'}
              tooltip="Tumour mutational load (# of missense variants in sample)"
              direction="row"
            />
          )}
        />
      </Grid>
    </Grid>
  );
}
