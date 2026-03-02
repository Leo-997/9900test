import LabelledInputWrapper from '@/components/Common/LabelledInputWrapper';
import { AutoWidthSelect } from '@/components/Input/Select/AutoWidthSelect';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { Box } from '@mui/material';

import type { JSX } from "react";

export function PreclinicalSampleSelect(): JSX.Element {
  const { htsBiosamples, htsCultures } = useAnalysisSet();
  const {
    reportMetadata,
    updateMetadata,
    isReadOnly,
  } = useReport();

  const canUpdateMeta = useIsUserAuthorised('report.meta.write') && !isReadOnly;

  return (
    <Box display="flex" flexDirection="column" gap="8px" paddingTop="8px">
      {htsBiosamples && (
        <>
          <LabelledInputWrapper label="Biosample ID">
            <AutoWidthSelect
              options={htsBiosamples?.map((b) => ({
                value: b.biosampleId,
                name: b.biosampleId,
              }))}
              value={reportMetadata?.['preclinical.htsBiosampleId']}
              onChange={(e): Promise<void> => updateMetadata({
                ...reportMetadata,
                'preclinical.htsBiosampleId': e.target.value as string,
                'preclinical.htsScreen': undefined,
              })}
              overrideReadonlyMode={!canUpdateMeta}
            />
          </LabelledInputWrapper>
          <LabelledInputWrapper label="Screen Name">
            <AutoWidthSelect
              key={`${reportMetadata?.['preclinical.htsBiosampleId']}-preclinical-select-screen`}
              options={htsCultures
                ?.filter((c) => c.biosampleId === reportMetadata?.['preclinical.htsBiosampleId'])
                .map((c) => ({
                  value: c.screenName,
                  name: c.screenName,
                })) || []}
              value={reportMetadata?.['preclinical.htsScreen'] ?? null}
              onChange={(e): Promise<void> => updateMetadata({
                ...reportMetadata,
                'preclinical.htsScreen': e.target.value as string,
              })}
              overrideReadonlyMode={!canUpdateMeta}
            />
          </LabelledInputWrapper>
        </>
      )}
    </Box>
  );
}
