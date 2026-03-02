import { yesNoOptions } from '@/constants/options';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { corePalette } from '@/themes/colours';
import { boolToStr, strToBool } from '@/utils/functions/bools';
import {
    Divider, Grid,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState, type JSX } from 'react';
import { ISignatureData, IUpdateSignature } from '../../types/MutationalSignatures.types';
import { toFixed } from '../../utils/math/toFixed';
import Signatures from '../../utils/mutationalsignatures/signatures';
import CustomChip from '../Common/Chip';
import DataPanel from '../Common/DataPanel';
import CustomTypography from '../Common/Typography';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';

const useStyles = makeStyles(() => ({
  title: {
    paddingBottom: '2px',
  },
  divider: {
    margin: '12px 0',
  },
  chipDefault: {
    height: '26px',
    margin: '0 8px 8px 0',
    color: 'rgba(31, 49, 61, 1)',
    backgroundColor: 'rgba(208, 217, 226, 1)',
    border: 'none',
    borderRadius: '24px',
  },
  subtitle: {
    marginTop: '8px',
  },
}));

interface IProps {
  data: ISignatureData;
  handleUpdateData(
    body: IUpdateSignature,
  ): Promise<void>;
}

export default function SignatureModal({ data, handleUpdateData }: IProps): JSX.Element {
  const classes = useStyles();
  const { tumourBiosample } = useAnalysisSet();
  const { isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: tumourBiosample?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const [researchCandidate, setResearchCandidate] = useState<string>(
    boolToStr(data.researchCandidate),
  );

  const canEdit = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  const index = parseInt(data.signature.replace('sig', ''), 10);

  return (
    <Grid container direction="column" gap="8px">
      <Grid container size={12}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DataPanel
            label="CONTRIBUTION"
            value={`${toFixed(data.contribution * 100, 2)}%`}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DataPanel
            label="Research candidate"
            value={(
              <AutoWidthSelect
                options={yesNoOptions}
                overrideReadonlyMode={isReadOnly || !canEdit}
                value={researchCandidate}
                onChange={(event): void => {
                  const newValue = event.target.value as string;
                  setResearchCandidate(newValue);
                  handleUpdateData({ researchCandidate: strToBool(newValue) });
                }}
                defaultValue={boolToStr(data.researchCandidate)}
              />
            )}
          />
        </Grid>

      </Grid>
      <Divider variant="middle" className={classes.divider} />
      <Grid size={12}>
        <DataPanel
          label="PROPOSED AETIOLOGIES"
          value={(
            <CustomTypography variant="titleRegular" fontWeight="bold">{Signatures[index].aetiology}</CustomTypography>
          )}
        />
        <DataPanel
          truncate={false}
          value={Signatures[index].aetiologyFull}
        />
      </Grid>
      <Divider variant="middle" className={classes.divider} />
      <Grid size={12}>
        <DataPanel
          label="CANCER TYPES"
          value={(
            <Grid container gap="8px">
              {Signatures[index].cancers.map((cancer) => (
                <CustomChip
                  pill
                  backgroundColour={corePalette.grey50}
                  label={cancer}
                  key={cancer}
                />
              ))}
            </Grid>
          )}
        />
      </Grid>
      <Divider variant="middle" className={classes.divider} />
      <Grid size={12}>
        <DataPanel
          label="ADDITIONAL MUTATIONAL FEATURES"
          value={Signatures[index].features ? Signatures[index].features : 'N/A'}
          truncate={false}
        />
      </Grid>
      <Divider variant="middle" className={classes.divider} />
      <Grid size={12}>
        <DataPanel
          label="COMMENTS"
          value={Signatures[index].comments ? Signatures[index].comments : 'N/A'}
          truncate={false}
        />
      </Grid>
    </Grid>
  );
}
