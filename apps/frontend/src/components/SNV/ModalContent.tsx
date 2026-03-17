import copy from 'copy-to-clipboard';
import {
  useEffect, useMemo, useState, type JSX,
} from 'react';

import {
  Box,
  ButtonBase,
  Grid,
  SelectChangeEvent,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';

import clsx from 'clsx';
import { CopyIcon } from 'lucide-react';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { PrismChip } from '../Chips';
import CustomTypography from '../Common/Typography';
import { HeliumChips } from '../Helium/HeliumChips';

import { getImpactLevel } from '../../utils/impact';
import { toFixed } from '../../utils/math/toFixed';
import { IUpdateCuratedSampleSomaticSNVsByIdBody } from '../../utils/sdk/clients/curation/snv/somatic';

import { platformOptions, yesNoOptions, zygosityOptions } from '../../constants/options';
import { useCuration } from '../../contexts/CurationContext';
import { ISummary, PathClass, Platforms } from '../../types/Common.types';
import { ReportType } from '../../types/Reports/Reports.types';
import { ISomaticSnv, Zygosity } from '../../types/SNV.types';
import { boolToStr, strToBool } from '../../utils/functions/bools';
import { ScoreChip } from '../Chips/ScoreChip';
import DataPanel from '../Common/DataPanel';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';
import { PathClassSelector } from '../PathClassSelector/PathClassSelector';
import FrequencyChip from '../Chips/FrequencyChip';
import { ConsequencePathclassIcon } from '../CustomIcons/ConsequencePathclassIcon';
import ExpandedModalTitle from '../ExpandedModal/Components/ExpandedModalTitle';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';

const useStyles = makeStyles(() => createStyles({
  section: {
    padding: 6,
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  selectMenu: {
    paddingBottom: 0,
    paddingTop: 0,
    borderRadius: 8,
    minWidth: 80,
  },
  selectMenuItem: {
    height: 44,

    '&:hover': {
      background: '#F3F7FF',
    },
  },
  selectButtonPlain: {
    color: '#022034',
    height: 40,
    maxWidth: '100%',
    borderRadius: 4,

    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
  header: {
    marginBottom: 8,
  },
  hairline: {
    border: 'none',
    borderTop: '1px solid #D0D9E2',
    width: '100%',
    margin: 0,
  },
  chipCol: {},
  link: {
    color: '#1E86FC',
    textDecoration: 'underline',
  },
  copyIcon: {
    fontSize: '20px',
  },
  maxWidthAutoWidh: {
    width: '100%',
    maxWidth: '80%',
  },
  pathclassPanel: {

    '& .MuiInputBase-root': {
      maxWidth: '80%',
    },
  },
}));

interface IProps {
  snv: ISomaticSnv;
  heliumSummary: ISummary;
  handleUpdateData(
    body: IUpdateCuratedSampleSomaticSNVsByIdBody,
    reports?: ReportType[]
  ): Promise<ReportType[]>;
}

export function SNVModalContent({
  snv,
  heliumSummary,
  handleUpdateData,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const classes = useStyles({ pathclass: snv.pathclass });
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: snv?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const [researchCandidate, setResearchCandidate] = useState<string>(
    boolToStr(snv.researchCandidate),
  );
  const [hgvsCommon, setHgvsCommon] = useState<string>();
  const [hgvsP, setHgvsP] = useState<string>();
  const [hgvsC, setHgvsC] = useState<string>();
  const [platform, setPlatform] = useState<string>(
    snv.platforms ? snv.platforms : 'No',
  );
  const [pecanSelect, setPecan] = useState<string | null | undefined>(
    boolToStr(snv.pecan),
  );

  const canEditAssigned = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;
  const canEditAllCurators = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  const handleResearchCandidateChange = (
    event: SelectChangeEvent<unknown>,
  ): void => {
    setResearchCandidate(event.target.value as string);
    handleUpdateData({
      researchCandidate: strToBool(event.target.value as string),
    });
  };

  const handlePecanChange = (
    event: SelectChangeEvent<unknown>,
  ): void => {
    setPecan(event.target.value as string);
    handleUpdateData({
      pecan: strToBool(event.target.value as string),
    });
  };

  const handleZygosityChange = (
    event: SelectChangeEvent<unknown>,
  ): void => {
    handleUpdateData({
      zygosity: (event.target.value as Zygosity) || null,
    });
  };

  const handleUpdatePlatform = (
    event: SelectChangeEvent<unknown>,
  ): void => {
    setPlatform(event.target.value as string);
    handleUpdateData({ platform: event.target.value as Platforms });
  };

  useEffect(() => {
    if (snv.hgvs) {
      const matches = snv.hgvs.match(
        /(.+):(c\.[\w\-!$%^&*()_+|~=`{}[\]:";'<>?,./]+)\s?(\((p\..[\w\-!$%^&*()_+|~=`{}[\]:";'<>?,./]+)\))?/,
      );
      if (matches && matches[1]) setHgvsCommon(matches[1]);
      if (matches && matches[2]) setHgvsC(matches[2]);
      if (matches && matches[4]) setHgvsP(matches[4]);
    }
  }, [snv.hgvs]);

  const impact = snv.consequence ? getImpactLevel(snv.consequence) : undefined;
  const dnaVaf = snv.altad && snv.depth ? snv.altad / snv.depth : undefined;

  const getSeenInRows = useMemo(() => (
    inGermline = false,
    page?: number,
    limit?: number,
  ) => zeroDashSdk.snv.somatic.getSeenInByVariantId(
    snv.biosampleId,
    snv.variantId,
    inGermline,
    page,
    limit,
  ), [snv.biosampleId, snv.variantId, zeroDashSdk.snv.somatic]);

  const icon = (
    <ConsequencePathclassIcon
      consequence={snv.consequence}
      pathclass={snv.pathclass}
      height={54}
      width={54}
    />
  );

  const modalTitle = (
    <ExpandedModalTitle
      title="HGVS"
      titleContent={snv.hgvs}
      icon={icon}
    />
  );

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        style={{ marginBottom: 6 }}
        spacing={2}
      >
        <Grid size={{ xs: 4 }} className={clsx(classes.pathclassPanel)}>
          <DataPanel
            label="Class"
            value={(
              <PathClassSelector
                biosampleId={snv.biosampleId}
                currentPathClass={snv.pathclass || null}
                updatePathClass={(pathclass: PathClass): void => {
                  handleUpdateData({ pathclass });
                }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <DataPanel
            label="Zygosity"
            value={(
              <AutoWidthSelect
                options={zygosityOptions}
                className={classes.maxWidthAutoWidh}
                defaultValue={snv.zygosity ?? undefined}
                overrideReadonlyMode={isReadOnly || !canEditAssigned}
                onChange={handleZygosityChange}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <DataPanel
            label="Research candidate"
            value={(
              <AutoWidthSelect
                options={yesNoOptions}
                className={classes.maxWidthAutoWidh}
                overrideReadonlyMode={isReadOnly || !canEditAllCurators}
                value={researchCandidate}
                onChange={handleResearchCandidateChange}
                defaultValue={boolToStr(snv.researchCandidate)}
              />
            )}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 11, lg: 8 }}>
          <DataPanel
            label="Impact"
            value={(
              <Grid container alignItems="center" spacing={2} wrap="nowrap">
                {snv.consequence && (
                  <Box display="flex" gap="8px">
                    <CustomTypography variant="bodyRegular">
                      { impact
                        ? impact.charAt(0).toUpperCase() + impact.slice(1)
                        : 'Unknown'}
                      :
                    </CustomTypography>
                    <Box display="flex" flexDirection="column">
                      {snv.consequence
                        .toUpperCase()
                        .split('&')
                        .map((val, index) => (
                          <CustomTypography
                            // eslint-disable-next-line react/no-array-index-key
                            key={`${val}-${index}`}
                            variant="bodyRegular"
                            truncate
                            tooltipText={val}
                          >
                            {val}
                          </CustomTypography>
                        ))}
                    </Box>
                  </Box>
                )}
              </Grid>
            )}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, lg: 12 }}>
          <DataPanel
            label="HGVS.p"
            value={(
              hgvsP && (
                <Box display="flex">
                  <CustomTypography truncate variant="bodyRegular">
                    {hgvsCommon}
                    :
                    {hgvsP}
                  </CustomTypography>
                  <ButtonBase
                    style={{ marginLeft: 10 }}
                    onClick={(): boolean => copy(`${hgvsCommon}:${hgvsP}`)}
                  >
                    <CopyIcon size={20} />
                  </ButtonBase>
                </Box>
              )
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 12 }}>
          <DataPanel
            label="HGVS.c"
            value={(
              hgvsC && (
                <Box display="flex">
                  <CustomTypography truncate variant="bodyRegular">
                    {hgvsCommon}
                    :
                    {hgvsC}
                  </CustomTypography>
                  <ButtonBase
                    style={{ marginLeft: 10 }}
                    onClick={(): boolean => copy(`${hgvsCommon}:${hgvsC}`)}
                  >
                    <CopyIcon size={20} />
                  </ButtonBase>
                </Box>
              )
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 12 }}>
          <DataPanel
            label="HGVS.g (hs38)"
            value={(
              <Grid container wrap="nowrap">
                <CustomTypography
                  style={{ display: 'inline-block', maxWidth: '90%' }}
                  truncate
                  variant="bodyRegular"
                >
                  {snv.chr}
                  :g.
                  {snv.pos}
                  {snv.snvRef}
                  &gt;
                  {snv.alt}
                </CustomTypography>
                <ButtonBase
                  style={{ marginLeft: 10 }}
                  onClick={(): boolean => copy(`${snv.chr}.hs38:g.${snv.pos}${snv.snvRef}>${snv.alt}`)}
                >
                  <CopyIcon className={classes.copyIcon} />
                </ButtonBase>
              </Grid>
            )}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 4 }}>
          <DataPanel
            label="GENE"
            value={snv.gene}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 4 }}>
          <DataPanel
            label="VARIANT Location"
            value={`${snv.chr}:${snv.pos}`}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DataPanel
            label="Genotype"
            value={snv.genotype}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DataPanel
            label="DNA VAF"
            value={(
              !(dnaVaf === undefined || dnaVaf === null) ? (
                <>
                  {toFixed(dnaVaf, 2)}
                  {' '}
                  (
                  {`${snv.altad} / ${snv.depth}`}
                  )
                </>
              ) : null
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }}>
          <DataPanel
            label="Adjusted Purity VAF"
            value={(
              !(snv.adjustedVaf === undefined || snv.adjustedVaf === null) ? (
                <>{toFixed(snv.adjustedVaf, 2)}</>
              ) : null
            )}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DataPanel
            label="RNA TPM"
            value={snv.rnaTpm}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }}>
          <DataPanel
            label="RNA VAF"
            value={`${
              !(snv.rnaVafNo === undefined || snv.rnaVafNo === null)
                ? toFixed(snv.rnaVafNo, 2)
                : ''
            } ${
              !(snv.rnaAltad === undefined || snv.rnaAltad === null)
                ? ` (${snv.rnaAltad}/${snv.rnaDepth})`
                : ''
            } ${
              !(snv.rnaImpact === undefined || snv.rnaImpact === null)
                ? ` ${snv.rnaImpact}`
                : ''
            }`}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 4 }}>
          <DataPanel
            label="Variant Copies"
            value={!(
              snv.adjustedCopyNumber === undefined
              || snv.adjustedCopyNumber === null
            ) ? (
              <>{toFixed(snv.adjustedCopyNumber, 2)}</>
              ) : null}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 4 }}>
          <DataPanel
            label="Copy Number"
            value={snv.copyNumber && (
              <ScoreChip
                min={0}
                mid={2}
                max={6}
                value={snv.copyNumber}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DataPanel
            label="LOH"
            value={snv.loh}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 4 }}>
          <DataPanel
            label="Bi-Allelic"
            value={boolToStr(snv.biallelic)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 4 }}>
          <DataPanel
            label="Subclonal Likelihood"
            value={(
              snv.subclonalLikelihood !== null && snv.subclonalLikelihood !== undefined ? (
                <>
                  {toFixed(snv.subclonalLikelihood * 100, 2)}
                  %
                </>
              ) : null
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DataPanel
            label="Found In Germline"
            value={(boolToStr(snv.inGermline))}
          />
        </Grid>
      </Grid>
      <HeliumChips
        heliumScore={snv.heliumScore}
        summary={heliumSummary}
        breakdown={snv.heliumBreakdown}
        divider={<hr className={classes.hairline} />}
      />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 8, md: 4 }}>
          <DataPanel
            label="Gene List"
            value={(<PrismChip label={snv.geneLists ? snv.geneLists : 'N/A'} />)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <DataPanel
            label="Platform"
            value={(
              <AutoWidthSelect
                key="somatic-snv-platform-select-label"
                options={
                  platformOptions.map((p) => ({ name: p, value: p }))
                }
                overrideReadonlyMode={isReadOnly || !canEditAssigned}
                value={platform}
                onChange={handleUpdatePlatform}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DataPanel
            label="Pecan"
            value={(
              <AutoWidthSelect
                key="somatic-snv-pecan-select-label"
                options={[
                  { name: 'Select status', value: 'Select status' },
                  { name: 'Yes', value: 'Yes' },
                  { name: 'No', value: 'No' },
                  { name: 'Leave as blank', value: '' },
                ]}
                overrideReadonlyMode={isReadOnly || !canEditAssigned}
                value={pecanSelect}
                onChange={handlePecanChange}
                defaultValue="Select status"
              />
            )}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 4 }}>
          <DataPanel
            label="Frequency"
            value={(
              <Grid container direction="column" height="100%" width="100%" gap="8px">
                <FrequencyChip
                  tabName="snv"
                  label="Somatic"
                  counts={snv.counts || []}
                  getRows={(page, limit) => getSeenInRows(false, page, limit)}
                  modalTitle={modalTitle}
                />
                {snv.inGermline && (
                  <FrequencyChip
                    tabName="snv"
                    label="In Germline"
                    counts={snv.germlineCounts || []}
                    getRows={(page, limit) => getSeenInRows(true, page, limit)}
                    modalTitle={modalTitle}
                  />
                )}
              </Grid>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 4 }}>
          <DataPanel
            label="GnomAD Frequency"
            value={snv.gnomadAFGenomePopmax}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DataPanel
            label="MGRB Frequency"
            value={snv.mgrbAC && snv.mgrbAN ? toFixed(snv.mgrbAC / snv.mgrbAN, 8) : null}
          />
        </Grid>
      </Grid>
    </>
  );
}
