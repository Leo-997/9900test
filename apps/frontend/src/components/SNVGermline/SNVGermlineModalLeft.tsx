import {
  Box,
  ButtonBase,
  Grid,
  SelectChangeEvent,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import { CopyIcon } from 'lucide-react';
import { useEffect, useState, type JSX } from 'react';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useCuration } from '@/contexts/CurationContext';
import { yesNoOptions, zygosityOptions } from '../../constants/options';
import {
  PathClass,
  Phenotype,
} from '../../types/Common.types';
import { ReportType } from '../../types/Reports/Reports.types';
import { IGermlineSNV, Zygosity } from '../../types/SNV.types';
import { boolToStr, strToBool } from '../../utils/functions/bools';
import { getGermlineZygosity } from '../../utils/functions/getGermlineZygosity';
import { getImpactLevel } from '../../utils/impact';
import { toFixed } from '../../utils/math/toFixed';
import { IUpdateGermlineSNVBody } from '../../utils/sdk/clients/curation/snv/germline';
import { PrismChip } from '../Chips';
import { ScoreChip } from '../Chips/ScoreChip';
import DataPanel from '../Common/DataPanel';
import CustomTypography from '../Common/Typography';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';
import { PathClassSelector } from '../PathClassSelector/PathClassSelector';
import FrequencyChip from '../Chips/FrequencyChip';

type Props = {
  snv: IGermlineSNV;
  handleUpdateData: (
    data: IUpdateGermlineSNVBody,
    reports?: ReportType[],
  ) => Promise<ReportType[]>;
};

const useStyles = makeStyles(() => createStyles({
  root: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
  },
  section: {
    marginTop: '6px',
    marginBottom: '6px',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    padding: '4px',
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
  header: {
    marginBottom: 8,
    lineHeight: 1.5,
  },
  hairline: {
    border: 'none',
    borderTop: '1px solid #263238',
    width: '100%',
    opacity: 0.24,
    margin: 0,
  },
  divider: {
    width: '100%',
    border: '1px dashed #263238',
    opacity: 0.24,
    margin: '8px 0 8px 0',
  },
  selectPhenotype: {
    width: 125,
  },
  geneIcon: {
    width: 60,
    height: 60,
  },
  impactLabel: {
    marginTop: '15px',
    marginLeft: '20px',
  },
  impactIcon: {
    display: 'flex',
    flexDirection: 'row',
  },
  selectMenu: {
    paddingBottom: 0,
    paddingTop: 0,
    borderRadius: 8,
  },
  selectMenuItem: {
    height: 44,

    '&:hover': {
      background: '#F3F7FF',
    },
  },
  maxWidthDropdown: {
    width: '100%',
    maxWidth: '80%',
  },
  pathclassPanel: {

    '& .MuiInputBase-root': {
      maxWidth: '80%',
    },
  },
}));

export default function SNVGermlineModal({
  snv,
  handleUpdateData,
}: Props): JSX.Element {
  const classes = useStyles({ pathclass: snv.pathclass });
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: snv?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const [researchCandidate, setResearchCandidate] = useState<string>(
    boolToStr(snv.researchCandidate),
  );
  const [phenoType, setPhenotype] = useState<string>(
    snv.phenotype ? snv.phenotype : 'None',
  );
  const [pecanSelect, setPecan] = useState<string | null | undefined>(
    boolToStr(snv.pecan),
  );
  const [hgvsCommon, setHgvsCommon] = useState<string>();
  const [hgvsP, setHgvsP] = useState<string>();
  const [hgvsC, setHgvsC] = useState<string>();

  const canEditAssigned = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;
  const canEditAllCurators = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  const updatePhenotype = (option: Phenotype): void => {
    setPhenotype(option);
    handleUpdateData({ phenotype: option });
  };

  const handlePhenotypeChange = (
    event: SelectChangeEvent<unknown>,
  ): void => updatePhenotype(event.target.value as Phenotype);

  const handleZygosityChange = (
    event: SelectChangeEvent<unknown>,
  ): void => {
    handleUpdateData({
      zygosity: (event.target.value as Zygosity) || null,
    });
  };

  const handleResearchCandidateChange = (
    event: SelectChangeEvent<unknown>,
  ): void => {
    setResearchCandidate(event.target.value as string);
    handleUpdateData({
      researchCandidate: strToBool(event.target.value as string),
    });
  };

  const pecanSelectChange = (
    event: SelectChangeEvent<unknown>,
  ): void => {
    setPecan(event.target.value as string);
    handleUpdateData({
      pecan: strToBool(event.target.value as string),
    });
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

  const dnaVaf = snv.altad && snv.depth ? snv.altad / snv.depth : undefined;

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        style={{ marginBottom: 6 }}
        wrap="wrap"
      >
        <Grid size={{ xs: 11, lg: 6 }} className={clsx(classes.panel, classes.pathclassPanel)}>
          <DataPanel
            label="CLASS"
            value={(
              <PathClassSelector
                biosampleId={snv.biosampleId}
                currentPathClass={snv.pathclass}
                updatePathClass={(pathclass: PathClass): void => {
                  handleUpdateData({ pathclass });
                }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 11, lg: 6 }} className={classes.panel}>
          <DataPanel
            label="Impact"
            value={(
              <Grid container alignItems="center" wrap="nowrap">
                {snv.consequence && (
                  <Box display="flex" padding="8px">
                    <CustomTypography variant="bodyRegular">
                      {getImpactLevel(snv.consequence)?.toUpperCase()}
                      :
                    </CustomTypography>
                    <Box display="flex" flexDirection="column" paddingLeft="8px">
                      {snv.consequence
                        .toUpperCase()
                        .split('&')
                        .map((val) => (
                          <CustomTypography
                            key={val}
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
        <Grid size={{ xs: 11, sm: 4 }} className={classes.panel}>
          <DataPanel
            label="Phenotype Match"
            value={(
              <AutoWidthSelect
                options={
                  Object.keys(Phenotype).map(
                    (o) => ({ name: Phenotype[o], value: Phenotype[o as keyof typeof Phenotype] }),
                  )
                }
                overrideReadonlyMode={isReadOnly || !canEditAssigned}
                value={phenoType}
                className={classes.selectPhenotype}
                variant="outlined"
                onChange={handlePhenotypeChange}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 11, sm: 4 }} className={classes.panel} style={{ paddingLeft: '16px' }}>
          <DataPanel
            label="Zygosity"
            value={(
              <AutoWidthSelect
                options={zygosityOptions}
                className={classes.maxWidthDropdown}
                defaultValue={getGermlineZygosity(snv)}
                overrideReadonlyMode={isReadOnly || !canEditAssigned}
                onChange={handleZygosityChange}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 11, sm: 4 }} className={classes.panel} style={{ paddingLeft: '16px' }}>
          <DataPanel
            label="Research candidate"
            value={(
              <AutoWidthSelect
                options={yesNoOptions}
                className={classes.maxWidthDropdown}
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
      >
        <Grid size={{ xs: 12 }} className={classes.panel}>
          <DataPanel
            label="HGVS.p"
            value={(
              hgvsP ? (
                <CustomTypography truncate variant="bodyRegular">
                  {hgvsCommon}
                  :
                  {hgvsP}
                  <ButtonBase
                    style={{ marginLeft: 10 }}
                    onClick={(): boolean => copy(`${hgvsCommon}:${hgvsP}`)}
                  >
                    <CopyIcon size={20} />
                  </ButtonBase>
                </CustomTypography>
              ) : null
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }} className={classes.panel}>
          <DataPanel
            label="HGVS.c"
            value={(
              hgvsC ? (
                <Grid container wrap="nowrap">
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
                </Grid>
              ) : null
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }} className={classes.panel}>
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
                  <CopyIcon size={20} />
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
      >
        <Grid size={{ xs: 12, sm: 4 }} className={classes.panel}>
          <DataPanel
            label="Gene"
            value={snv.gene}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 4 }} className={classes.panel}>
          <DataPanel
            label="GENOMIC LOCATION"
            value={`${snv.chr}:${snv.pos}`}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} className={classes.panel}>
          <DataPanel
            label="GENOTYPE"
            value={snv.genotype}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
      >
        <Grid size={{ xs: 12, md: 4 }} className={classes.panel}>
          <DataPanel
            label="DNA VAF"
            value={!(dnaVaf === undefined || dnaVaf === null) ? (
              <>
                {toFixed(dnaVaf, 2)}
                &nbsp;
                (
                {`${snv.altad} / ${snv.depth}`}
                )
              </>
            ) : null}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} className={classes.panel}>
          <DataPanel
            label="Platform"
            value={snv.platforms}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
      >
        <Grid size={{ xs: 4 }} className={classes.panel}>
          <DataPanel
            label="Helium Score"
            value={(
              <ScoreChip
                min={0}
                mid={0.5}
                max={1}
                value={snv.heliumScore || 0}
                isLOH={false}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 8 }} className={classes.panel}>
          <DataPanel
            label="Reason For Score"
            value={snv.heliumReason || null}
          />
        </Grid>
      </Grid>
      <hr className={classes.hairline} />
      <Grid
        container
        alignItems="flex-start"
        className={classes.section}
      >
        <Grid size={{ xs: 12, md: 4 }} className={classes.panel}>
          <DataPanel
            label="Gene List"
            value={(
              <PrismChip label={snv.geneLists ? snv.geneLists : 'N/A'} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} className={classes.panel}>
          <DataPanel
            label="Pecan"
            value={(
              <AutoWidthSelect
                key="germline-snv-pecan-select-label"
                options={[
                  { name: 'Select status', value: 'Select status' },
                  { name: 'Yes', value: 'Yes' },
                  { name: 'No', value: 'No' },
                  { name: 'Leave as blank', value: '' },
                ]}
                overrideReadonlyMode={isReadOnly || !canEditAssigned}
                value={pecanSelect}
                onChange={pecanSelectChange}
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
      >
        <Grid size={{ xs: 12, sm: 4 }} className={classes.panel}>
          <DataPanel
            label="Frequency"
            value={(
              <FrequencyChip
                tabName="germline_snv"
                label="Germline"
                frequency={snv.sampleCount}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 4 }} className={classes.panel}>
          <DataPanel
            label="GnomAD Frequency"
            value={snv.gnomadAFGenomePopmax}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} className={classes.panel}>
          <DataPanel
            label="MGRB Frequency"
            value={snv.mgrbAC && snv.mgrbAN ? toFixed(snv.mgrbAC / snv.mgrbAN, 8) : null}
          />
        </Grid>
      </Grid>
    </>
  );
}
