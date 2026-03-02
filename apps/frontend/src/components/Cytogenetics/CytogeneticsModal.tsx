import { usePatient } from '@/contexts/PatientContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { Chromosome } from '@/types/Common.types';
import { ReportType } from '@/types/Reports/Reports.types';
import { boolToStr, strToBool } from '@/utils/functions/bools';
import isCytoArmLoh from '@/utils/functions/isCytoArmLoh';
import { toFixed } from '@/utils/math/toFixed';
import { Box, Grid, styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { ChevronDownIcon, PlusIcon } from 'lucide-react';
import { useCallback, useEffect, useState, type JSX } from 'react';
import { cytoCNTypeOptions, yesNoOptions } from '../../constants/options';
import { useCuration } from '../../contexts/CurationContext';
import {
    Arm,
    IArmCNSummary, ICytogeneticsData, IParsedCytogeneticsData, ISampleCytoband,
} from '../../types/Cytogenetics.types';
import { ScoreChip } from '../Chips/ScoreChip';
import CustomButton from '../Common/Button';
import DataPanel from '../Common/DataPanel';
import CustomTypography from '../Common/Typography';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';
import CytobandGraph from './CytobandGraph';
import { CytobandList } from './CytobandList';
import CytobandModal from './CytobandModal';

const StyledAutoWidthSelect = styled(AutoWidthSelect)({
  maxWidth: '80%',
});

const useStyles = makeStyles(() => ({
  wrapper: {
    paddingTop: '40px',
  },
  accordionTitle: {
    padding: '6px 12px',
    backgroundColor: '#ECF0F3',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      cursor: 'pointer',
    },
  },
  accordionShowButton: {
    fontSize: '12px',
    display: 'inline',
    marginRight: '6px',
  },
  chipDefault: {
    height: '28px',
    backgroundColor: 'rgba(208, 217, 226, 1)',
    borderRadius: '8px',
  },
  hairline: {
    border: 'none',
    borderTop: '1px solid #D0D9E2',
    width: '100%',
    margin: '12px 0',
  },
  select: {
    width: '150px',
    paddingLeft: '12px',
    backgroundColor: 'rgba(243, 245, 247, 1)',
    boxBorder: 'none',
  },
  cytobandContainer: {
    margin: '0px 0 0 0px',
    padding: '10px',
    position: 'relative',
    width: '90%',
  },
  cytobandItems: {
    width: '90%',
    borderBottom: '1px dashed #D0D9E2',
    padding: '8px 16px',
  },
  cytobandEmpty: {
    color: '#596983',
    marginTop: '16px',
  },
}));

interface ICytogeneticsModalProps {
  data: IParsedCytogeneticsData;
  type: 'somatic' | 'germline';
  armCnSummary: IArmCNSummary;
  biosampleId: string | undefined;
  getCytobands: (biosampleId: string, q: { chr: Chromosome }) => Promise<ISampleCytoband[]>;
  handleUpdateCyto: (
    body: Partial<ICytogeneticsData>,
    chr: Chromosome,
    arm: Arm,
    reports?: ReportType[],
    ) => Promise<ReportType[]>;
}

export default function CytogeneticsModal({
  data,
  type,
  armCnSummary,
  biosampleId,
  getCytobands,
  handleUpdateCyto,
}: ICytogeneticsModalProps): JSX.Element {
  const classes = useStyles();
  const { patient } = usePatient();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const [researchCandidateArmP, setResearchCandidateArmP] = useState<string>(
    boolToStr(data.p.researchCandidate),
  );
  const [researchCandidateArmQ, setResearchCandidateArmQ] = useState<string>(
    boolToStr(data.q.researchCandidate),
  );
  const [cytobands, setCytobands] = useState<ISampleCytoband[]>();
  const [isArmPShowing, setIsArmPShowing] = useState<boolean>(true);
  const [isArmQShowing, setIsArmQShowing] = useState<boolean>(true);
  const [cytobandModalOpen, setCytobandModalOpen] = useState<boolean>(false);
  const [cytobandModalArm, setCytobandModalArm] = useState<Arm | null>(null);
  const [selectedCytoband, setSelectedCytoband] = useState<ISampleCytoband | null>(null);
  const [selectedCytobandReports, setSelectedCytobandReports] = useState<ReportType[] | null>(null);

  const canEditAssigned = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;
  const canEditAllCurators = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  const isGermline = type === 'germline';

  const handleOpenCytobandModal = (
    arm: Arm,
    cytoband?:ISampleCytoband,
    reports?: ReportType[],
  ):void => {
    if (cytoband && reports) {
      setSelectedCytoband(cytoband);
      setSelectedCytobandReports(reports);
    } else {
      setSelectedCytoband(null);
      setSelectedCytobandReports(null);
    }
    setCytobandModalArm(arm);
    setCytobandModalOpen(true);
  };

  const handleResearchCandidateChange = (
    newValue: string,
    arm: Arm,
  ): void => {
    if (arm === 'p') {
      setResearchCandidateArmP(newValue);
    } else {
      setResearchCandidateArmQ(newValue);
    }
    handleUpdateCyto(
      { researchCandidate: strToBool(newValue) },
      data.chr,
      arm,
    );
  };

  const getArmContent = useCallback((
    armCytobands: ISampleCytoband[],
    arm: Arm,
  ): JSX.Element => {
    let armContent: JSX.Element;
    if (armCytobands.length) {
      armContent = (
        <CytobandList
          biosampleId={biosampleId}
          type={type}
          chromosome={data.chr}
          cytobands={armCytobands}
          setCytobands={setCytobands}
          handleOpenModal={handleOpenCytobandModal}
        />
      );
    } else {
      armContent = (
        <CustomTypography
          variant="bodySmall"
          fontWeight="regular"
          align="center"
          className={classes.cytobandEmpty}
        >
          No cytobands found.
        </CustomTypography>
      );
    }

    return (
      <>
        {armContent}
        <Box display="flex" justifyContent="center" marginTop="10px">
          <CustomButton
            variant="text"
            label={`Add Arm ${arm.toUpperCase()} cytoband`}
            startIcon={<PlusIcon />}
            onClick={(): void => handleOpenCytobandModal(arm)}
            disabled={isReadOnly || !canEditAssigned}
          />
        </Box>
      </>
    );
  }, [biosampleId, canEditAssigned, classes.cytobandEmpty, data.chr, isReadOnly, type]);

  useEffect(() => {
    if (biosampleId) {
      getCytobands(biosampleId, { chr: data.chr })
        .then((resp) => {
          setCytobands(resp);
        });
    }
  }, [biosampleId, data.chr, getCytobands]);

  const handleShowArmPCytobands = (): void => {
    setIsArmPShowing((prev) => !prev);
  };

  const handleShowArmQCytobands = (): void => {
    setIsArmQShowing((prev) => !prev);
  };

  const handleCytobandModalClose = (): void => {
    setSelectedCytoband(null);
    setSelectedCytobandReports(null);
    setCytobandModalArm(null);
    setCytobandModalOpen(false);
  };

  const handleUpdateCytobands = async (): Promise<void> => {
    if (biosampleId) {
      const updatedCytobandList = await getCytobands(
        biosampleId,
        { chr: data.chr },
      );
      setCytobands(updatedCytobandList);
    }
  };

  return (
    <Grid container direction="column">
      <Grid style={{ width: '100%', paddingBottom: '8px' }}>
        <Grid container>
          <Grid size={{ xs: 12, lg: 4 }}>
            <DataPanel
              label="ARM P COPY NUMBER"
              value={(
                <ScoreChip
                  min={armCnSummary.p.min}
                  max={armCnSummary.p.max}
                  mid={2}
                  value={data.p.avgCN}
                  label={toFixed(data.p.avgCN, 2)}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 3 }}>
            <DataPanel
              label="ARM P CN TYPE"
              value={(
                <div>
                  <StyledAutoWidthSelect
                    options={cytoCNTypeOptions}
                    defaultValue={data.p.cnType}
                    onChange={(e): Promise<ReportType[]> => handleUpdateCyto(
                      { cnType: e.target.value as string },
                      data.chr,
                      'p',
                    )}
                    overrideReadonlyMode={isReadOnly || !canEditAssigned}
                  />
                </div>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 2 }}>
            <DataPanel
              label="ARM P LOH"
              value={isCytoArmLoh(data.chr, data.p, patient?.sex === 'Male') ? 'Yes' : 'No'}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 3 }}>
            <DataPanel
              label="Research candidate"
              value={(
                <StyledAutoWidthSelect
                  options={yesNoOptions}
                  overrideReadonlyMode={isReadOnly || !canEditAllCurators}
                  value={researchCandidateArmP}
                  onChange={(event): void => handleResearchCandidateChange(event.target.value as string, 'p')}
                  defaultValue={boolToStr(data.p.researchCandidate)}
                />
            )}
            />
          </Grid>
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid style={{ width: '100%', paddingBottom: '8px' }}>
        <Grid container>
          <Grid size={{ xs: 12, lg: 4 }}>
            <DataPanel
              label="ARM Q COPY NUMBER"
              value={(
                <ScoreChip
                  min={armCnSummary.q.min}
                  max={armCnSummary.q.max}
                  mid={2}
                  value={data.q.avgCN}
                  label={toFixed(data.q.avgCN, 2)}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 3 }}>
            <DataPanel
              label="ARM Q CN TYPE"
              value={(
                <div>
                  <StyledAutoWidthSelect
                    options={cytoCNTypeOptions}
                    defaultValue={data.q.cnType}
                    onChange={(e): Promise<ReportType[]> => handleUpdateCyto(
                      { cnType: e.target.value as string },
                      data.chr,
                      'q',
                    )}
                    overrideReadonlyMode={isReadOnly || !canEditAssigned}
                  />
                </div>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 2 }}>
            <DataPanel
              label="ARM Q LOH"
              value={data.q.aveMinMinorAlleleCN !== null && data.q.aveMinMinorAlleleCN < 0.5 ? 'Yes' : 'No'}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 3 }}>
            <DataPanel
              label="Research candidate"
              value={(
                <StyledAutoWidthSelect
                  options={yesNoOptions}
                  overrideReadonlyMode={isReadOnly || !canEditAllCurators}
                  value={researchCandidateArmQ}
                  onChange={(event): void => handleResearchCandidateChange(event.target.value as string, 'q')}
                  defaultValue={boolToStr(data.q.researchCandidate)}
                />
            )}
            />
          </Grid>
        </Grid>
      </Grid>

      <hr className={classes.hairline} />

      {!isGermline && (
        <Grid style={{ maxHeight: '130px', overflowY: 'hidden', width: '100%' }}>
          <Grid container direction="column">
            <Grid>
              <CustomTypography variant="label">CYTOBAND CNS</CustomTypography>
            </Grid>
            <Grid className={classes.cytobandContainer}>
              <CytobandGraph
                chr={data.chr.replace('chr', '')}
                width={25}
                view="modal"
                annotations={data.annotations}
              />
            </Grid>
          </Grid>
        </Grid>
      )}

      <Grid style={{ width: '100%' }}>
        <Grid container direction="column">
          <Grid container direction="row" justifyContent="space-between" className={clsx(classes.accordionTitle)} onClick={handleShowArmPCytobands}>
            <Grid>
              <CustomTypography variant="label" fontWeight="bold">
                ARM P Cytobands
                {' ('}
                {(cytobands?.filter((c) => c.arm === 'p') || []).length}
                {') '}
              </CustomTypography>
            </Grid>
            <Grid style={{ display: 'flex', alignItems: 'center' }}>
              <CustomTypography variant="bodySmall" fontWeight="bold" className={classes.accordionShowButton}>{isArmPShowing ? 'Hide' : 'Show'}</CustomTypography>
              <ChevronDownIcon
                width="22px"
                height="20px"
                style={{
                  transform: isArmPShowing ? 'rotate(180deg)' : undefined,
                  transition: 'all 0.5s cubic-bezier(.19, 1, .22, 1)',
                }}
              />
            </Grid>
          </Grid>
          {isArmPShowing && (
            getArmContent(
              cytobands?.filter((c) => c.arm === 'p') || [],
              'p',
            )
          )}
        </Grid>
      </Grid>
      <Grid style={{ width: '100%', marginTop: '16px', marginBottom: '12px' }}>
        <Grid container direction="column">
          <Grid container direction="row" justifyContent="space-between" className={clsx(classes.accordionTitle)} onClick={handleShowArmQCytobands}>
            <Grid>
              <CustomTypography variant="label" fontWeight="bold">
                ARM Q Cytobands
                {' ('}
                {(cytobands?.filter((c) => c.arm === 'q') || []).length}
                {') '}
              </CustomTypography>
            </Grid>
            <Grid style={{ display: 'flex', alignItems: 'center' }}>
              <CustomTypography variant="bodySmall" fontWeight="bold" className={classes.accordionShowButton}>{isArmQShowing ? 'Hide' : 'Show'}</CustomTypography>
              <ChevronDownIcon
                width="22px"
                height="20px"
                style={{
                  transform: isArmQShowing ? 'rotate(180deg)' : undefined,
                  transition: 'all 0.5s cubic-bezier(.19, 1, .22, 1)',
                }}
              />
            </Grid>
          </Grid>
          {isArmQShowing && (
            getArmContent(
              cytobands?.filter((c) => c.arm === 'q') || [],
              'q',
            )
          )}
        </Grid>
      </Grid>
      {cytobandModalOpen && cytobandModalArm && (
        <CytobandModal
          biosampleId={biosampleId}
          isGermline={isGermline}
          open={cytobandModalOpen}
          closeModal={handleCytobandModalClose}
          arm={cytobandModalArm}
          armCytobands={cytobands?.filter((c) => c.arm === cytobandModalArm) || []}
          chromosome={data.chr}
          selectedCytoband={selectedCytoband}
          handleUpdateCytobands={handleUpdateCytobands}
          selectedReports={selectedCytobandReports || null}
        />
      )}
    </Grid>
  );
}
