import {
    Grid,
    IconButton,
    Paper as MuiPaper,
    styled,
} from '@mui/material';

import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { corePalette } from '@/themes/colours';
import { makeStyles } from '@mui/styles';
import { Maximize2Icon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import CustomTypography from '../Common/Typography';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import SignatureModal from './SignatureModal';

import { ISignatureData, IUpdateSignature } from '../../types/MutationalSignatures.types';

import { toFixed } from '../../utils/math/toFixed';
import { getClassificationDisplayValue } from '../../utils/misc';
import Signatures from '../../utils/mutationalsignatures/signatures';

import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { boolToStr } from '../../utils/functions/bools';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import { inXSamplesText } from '../../utils/misc/strings';
import { ClassificationChip, TargetableChip } from '../Chips';
import CustomChip from '../Common/Chip';

interface IStyleProps {
  joined?: boolean;
}

const Paper = styled(MuiPaper)<IStyleProps>(({ joined }) => ({
  margin: joined ? 0 : '4px 0 4px 0',
  borderRadius: 0,
  border: 'none',
  background: 'auto',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  minWidth: '100%',
}));

const StickySection = styled(Grid)(({ theme }) => ({
  position: 'sticky',
  left: '0px',
  zIndex: 1,
  backgroundColor: theme.colours.core.white,
  flexShrink: 0,
  padding: '8px',
  width: '30%',
  minWidth: '550px',
}));

const Item = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  verticalAlign: 'top',
  padding: '8px',
  width: '200px',
  minWidth: '200px',
}));

const ItemLarge = styled(Item)(() => ({
  width: '400px',
  minWidth: '400px',
}));

const useStyles = makeStyles(() => ({
  title: {
    marginTop: '20px',
  },
  subtitle: {
    marginTop: '8px',
  },
  lightText: {
    color: 'rgba(94, 104, 113, 1)',
  },
  dynamicWrapper: {
    width: '100%',
    height: '100%',
  },
}));

interface ISignaturePanelProps {
  data: ISignatureData;
  setData?: Dispatch<SetStateAction<ISignatureData[]>>;
  joined?: boolean;
}

export default function SignaturePanel({
  data,
  setData,
  joined,
}: ISignaturePanelProps): JSX.Element {
  const { tumourBiosample } = useAnalysisSet();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles({ joined });
  const [expanded, setExpanded] = useState<boolean>(false);
  const index = parseInt(data.signature.replace('sig', ''), 10);

  const handleUpdateSignature = async (body: IUpdateSignature): Promise<void> => {
    if (tumourBiosample?.biosampleId) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, data.reportable),
        };
        await zeroDashSdk.mutsig.updateSignature(
          newBody,
          data.signature,
          tumourBiosample.biosampleId,
        );
        if (setData) {
          setData((prev) => prev.map((sig) => ({
            ...sig,
            ...(data.signature === sig.signature
              ? newBody
              : {}),
          })));
        }
      } catch {
        enqueueSnackbar('Cannot update signature data, please try again', { variant: 'error' });
      }
    }
  };

  const handleCloseModal = (): void => {
    setExpanded(!expanded);
  };

  return (
    <Paper elevation={0}>
      <StickySection>
        <Grid container height="100%" gap="8px" alignItems="center">
          <Grid flex={1}>
            <IconButton
              style={{
                padding: '0',
                width: '36px',
                height: '36px',
              }}
              disableRipple
              onClick={(): void => setExpanded(!expanded)}
            >
              <Maximize2Icon />
            </IconButton>
          </Grid>
          <Grid flex={2} container direction="column">
            <CustomTypography variant="label">SIGNATURE</CustomTypography>
            <CustomTypography variant="titleRegular" fontWeight="bold">
              {index}
            </CustomTypography>
          </Grid>
          <Grid flex={8} container direction="column" minHeight="48px">
            <CustomTypography variant="label">CANCER TYPES</CustomTypography>
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
          </Grid>
        </Grid>
      </StickySection>
      <ItemLarge>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">
            PROPOSED AETIOLOGIES
          </CustomTypography>
          <CustomTypography variant="titleRegular" fontWeight="bold">
            {Signatures[index].aetiology}
          </CustomTypography>
          <CustomTypography variant="bodyRegular" truncate>
            {Signatures[index].aetiologyFull}
          </CustomTypography>
          <Grid container>
            <CustomTypography
              variant="bodySmall"
              className={classes.lightText}
            >
              Additional Mutational Features:&nbsp;
            </CustomTypography>
            <CustomTypography variant="bodySmall">
              {Signatures[index].features ? 'YES' : 'NO'}
            </CustomTypography>
            <CustomTypography
              variant="bodySmall"
              className={classes.lightText}
            >
              &nbsp;| Comment:&nbsp;
            </CustomTypography>
            <CustomTypography variant="bodySmall">
              {Signatures[index].comments ? 'YES' : 'NO'}
            </CustomTypography>
          </Grid>
        </Grid>
      </ItemLarge>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">CONTRIBUTION</CustomTypography>
          <CustomTypography variant="titleRegular" fontWeight="bold">
            {toFixed(data.contribution * 100, 2)}
            %
          </CustomTypography>
        </Grid>
      </Item>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">Classification</CustomTypography>
          {data.classification && (
            <ClassificationChip
              classification={getClassificationDisplayValue(data.classification)}
              reportable={data.reportable}
            />
          )}
          <CustomTypography variant="bodySmall">
            {inXSamplesText(data.reportedCount)}
          </CustomTypography>
        </Grid>
      </Item>
      <Item>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">TARGETABLE</CustomTypography>
          {data.targetable !== null && (
            <TargetableChip
              targetable={boolToStr(data.targetable)}
            />
          )}
          <CustomTypography variant="bodySmall">
            {inXSamplesText(data.targetableCount)}
          </CustomTypography>
        </Grid>
      </Item>
      {expanded && tumourBiosample && (
        <ExpandedModal
          open={expanded}
          variantId={data.signature}
          biosampleId={tumourBiosample.biosampleId}
          handleClose={handleCloseModal}
          title="SIGNATURE"
          titleContent={`Signature ${index}`}
          curationDataComponent={(
            <SignatureModal
              data={data}
              handleUpdateData={handleUpdateSignature}
            />
          )}
          variant={data}
          handleUpdateVariant={handleUpdateSignature}
          hideIncludeInReport
          variantType="MUTATIONAL_SIG"
        />
      )}
    </Paper>
  );
}
