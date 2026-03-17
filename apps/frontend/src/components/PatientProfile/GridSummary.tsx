import { Grid, styled } from '@mui/material';
import { corePalette } from '@/themes/colours';
import { usePatient } from '@/contexts/PatientContext';
import { toFixed } from '../../utils/math/toFixed';
import ProfileSummaryItem from '../QCMetrics/ProfileSummaryItem';
import DataPanel from '../Common/DataPanel';

import type { JSX } from "react";

const CardContainer = styled(Grid)(() => ({
  height: '140px',
  minWidth: '200px',
  flex: '1 1 0',
  maxWidth: '20%',
}));

interface IGridSummaryProps {
  view: 'qc' | 'profile';
  qcStatus: string;
  aQC: string;
  mutationsPerMb: number;
  mbTargetable: boolean;
  contamination: number;
  purity: {
    avg?: number;
    min?: number;
    max?: number;
  };
  ploidy: {
    avg?: number;
    min?: number;
    max?: number;
  };
}

export default function GridSummary({
  view,
  qcStatus,
  aQC,
  mutationsPerMb,
  mbTargetable,
  contamination,
  purity,
  ploidy,
}: IGridSummaryProps): JSX.Element {
  const { patient } = usePatient();

  const getStatus = (
    val?: string,
  ): 'success' | 'error' | 'warn' | undefined => {
    if (val === 'PASS') {
      return 'success';
    }
    if (val === 'FAIL') {
      return 'error';
    }
    if (val === 'WARN') {
      return 'warn';
    }
    return undefined;
  };

  const getQCStatus = (val?: string): string => {
    if (val === 'PASS') {
      return 'PASS';
    }
    if (val?.includes('FAIL')) {
      return 'FAIL';
    }
    if (val?.includes('WARN')) {
      return 'WARN';
    }
    return '-';
  };

  return (
    <Grid
      container
      spacing={3}
      size={12}
      padding="24px"
      borderRadius="8px"
      bgcolor={corePalette.white}
    >
      <CardContainer>
        <ProfileSummaryItem
          title={
            purity.min && purity.max
              ? `purity (range ${toFixed(purity.min * 100, 0)} - ${toFixed(
                purity.max * 100,
                0,
              )}%)`
              : 'purity'
          }
          content={purity.avg ? `${toFixed(purity.avg * 100, 0)}%` : '-'}
          tooltip=""
        />
      </CardContainer>
      <CardContainer>
        <ProfileSummaryItem
          title={
            ploidy.min && ploidy.max
              ? `Ploidy (range ${toFixed(ploidy.min, 2)} - ${toFixed(
                ploidy.max,
                2,
              )})`
              : 'Ploidy'
          }
          content={ploidy.avg ? `${toFixed(ploidy.avg, 2)}` : '-'}
          tooltip=""
        />
      </CardContainer>
      <CardContainer>
        <ProfileSummaryItem
          title="germline aberration"
          tooltip=""
          content={patient.germlineAberration || '-'}
          status={!patient.germlineAberration || patient.germlineAberration === 'NONE' ? undefined : 'error'}
          bottom={(
            <DataPanel
              label="Consanguinity Score"
              value={patient.consanguinityScore ?? '-'}
              direction="row"
            />
          )}
        />
      </CardContainer>
      <CardContainer>
        <ProfileSummaryItem
          title="contamination"
          content={aQC || '-'}
          tooltip={`Contamination: ${
            contamination !== null && contamination !== undefined
              ? `${toFixed(contamination * 100, 2)}%`
              : 'N/A'}`}
          status={getStatus(aQC)}
        />
      </CardContainer>
      <CardContainer>
        {view === 'profile' ? (
          <ProfileSummaryItem
            title="mutations/mb"
            content={mutationsPerMb ? toFixed(mutationsPerMb, 2) : '-'}
            status={mbTargetable ? 'error' : undefined}
            tooltip="Tumour mutational burden (# passing variants per Mb) per mega base"
          />
        ) : (
          <ProfileSummaryItem
            title="Purple QC Status"
            content={getQCStatus(qcStatus)}
            tooltip={qcStatus?.length > 4 ? qcStatus.replace(/,/g, '\n') : ''}
            status={getStatus(qcStatus)}
          />
        )}
      </CardContainer>
    </Grid>
  );
}
