import { useState, type JSX } from 'react';

import {
    Grid,
    IconButton,
    Paper as MuiPaper,
    styled,
    Tooltip,
} from '@mui/material';

import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { corePalette } from '@/themes/colours';
import { Maximize2Icon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { ClassifierClassification, IReportableVariant } from '../../types/Common.types';
import { IMethylationData } from '../../types/Methylation.types';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import { toFixedNoRounding } from '../../utils/math/toFixedNoRounding';
import { getClassifierClassificationDisplayValue } from '../../utils/misc';
import { inXSamplesText } from '../../utils/misc/strings';
import ClassificationChip from '../Chips/ClassificationChip';
import StatusChip from '../Chips/StatusChip';
import TargetableChip from '../Chips/TargetableChip';
import CustomChip from '../Common/Chip';
import CustomTypography from '../Common/Typography';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import { MethCurationFooter } from './MethCurationFooter';
import MethExpandedModalTitle from './MethExpandedModalTitle';
import MethylationModal from './MethylationModal';

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
  padding: '8px',
  zIndex: 1,
  backgroundColor: theme.colours.core.white,
  flexShrink: 0,
  width: '30%',
  minWidth: '500px',
}));

const Item = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  verticalAlign: 'top',
  padding: '8px',
  width: '200px',
  minWidth: '200px',
}));

interface IMethylationPanelProps {
  data: IMethylationData;
  setData?: (result: IMethylationData) => void;
}

export default function MethylationPanel({
  data,
  setData,
}: IMethylationPanelProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { methBiosample } = useAnalysisSet();
  const { enqueueSnackbar } = useSnackbar();

  const [expanded, setExpanded] = useState<boolean>(false);

  const handleUpdateResult = async (
    body: Partial<IReportableVariant<ClassifierClassification>>,
  ): Promise<void> => {
    if (methBiosample?.biosampleId) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(body, data.reportable),
        };
        await zeroDashSdk.methylation.updateMethylationByGroupId(
          newBody,
          methBiosample.biosampleId,
          data.groupId,
        );
        if (setData) {
          setData({
            ...data,
            ...newBody,
          });
        }
      } catch {
        enqueueSnackbar('Cannot update methylation data, please try again.', { variant: 'error' });
      }
    }
  };

  const handleCloseModal = async (): Promise<void> => {
    if (methBiosample?.biosampleId) {
      const res = await zeroDashSdk.methylation.getMethylationData(
        methBiosample.biosampleId,
      );
      if (setData) {
        for (const r of res) {
          setData({
            ...r,
            biosampleId: methBiosample.biosampleId,
            methId: methBiosample?.aliases.find((a) => a.aliasType === 'methylation')?.alias || '',
            groupName:
              r
              && r.groupName
              && r.groupName.replace(/([Mm]ethylation class )/, ''),
          });
        }
      }
    }
    setExpanded(!expanded);
  };

  const assignColour = (): string => {
    if (data.score < 0.5) {
      return corePalette.red150;
    }
    if (data.score >= 0.5 && data.score < 0.8) {
      return corePalette.orange50;
    }
    if (data.score >= 0.8) {
      return corePalette.green50;
    }
    return corePalette.grey50;
  };

  const interpretation = data.interpretation ? data.interpretation : '';

  return (
    <>
      <Paper elevation={0}>
        <StickySection>
          <Grid container height="100%" gap="8px" alignItems="center">
            <Grid flex={2} container justifyContent="center">
              <IconButton
                disableRipple
                onClick={(): void => setExpanded(!expanded)}
              >
                <Maximize2Icon />
              </IconButton>
            </Grid>
            <Grid direction="column" container flex={10}>
              <Grid container spacing={1}>
                <CustomTypography variant="label">METHYLATION CLASS</CustomTypography>
                {data.providerId && (
                  <CustomTypography variant="label">
                    <StatusChip
                      status={data.providerId}
                      backgroundColor={data.providerId === 'AGRF' ? '#FADEF6' : '#BBDEFF'}
                      color={data.providerId === 'AGRF' ? '#AD239D' : '#08317E'}
                    />
                  </CustomTypography>
                )}
              </Grid>
              <CustomTypography truncate variant="titleRegular" fontWeight="bold">
                {data
                  && data.groupName[0]
                  && data.groupName[0].toUpperCase() + data.groupName.substring(1)}
              </CustomTypography>
              <Grid container alignItems="center" gap="8px">
                <CustomTypography
                  variant="label"
                  style={{ flexShrink: 0 }}
                >
                  Sentrix ID:
                </CustomTypography>
                <CustomTypography
                  variant="bodyRegular"
                  style={{ flexShrink: 0 }}
                >
                  {data.methId ? data.methId.split('_')[0] : '-'}
                </CustomTypography>
              </Grid>
              <Grid container alignItems="center" gap="8px">
                <CustomTypography
                  truncate
                  variant="label"
                  style={{ flexShrink: 0 }}
                >
                  Sentrix Position:
                </CustomTypography>
                <CustomTypography
                  truncate
                  variant="bodyRegular"
                  style={{ flexShrink: 0 }}
                >
                  { data.methId && data.methId.split('_').length > 1
                    ? data.methId.split('_')[1]
                    : '-'}
                </CustomTypography>
              </Grid>
            </Grid>
          </Grid>
        </StickySection>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label">CLASSIFIER VERSION</CustomTypography>
            <CustomTypography>
              {`${data.classifierName} version ${data.version}`}
            </CustomTypography>
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label">CALIBRATED SCORE</CustomTypography>
            <CustomChip
              size="medium"
              backgroundColour={assignColour()}
              sx={{ width: '150px' }}
              label={(
                <CustomTypography fontWeight="bold">
                  {data.score ? toFixedNoRounding(data.score, 2) : '-'}
                </CustomTypography>
              )}
            />
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label">INTERPRETATION</CustomTypography>
            <Tooltip title={interpretation} placement="bottom">
              <CustomChip
                backgroundColour={corePalette.grey30}
                size="medium"
                label={
                  interpretation.length > 22
                    ? `${interpretation.substring(0, 22)}...`
                    : interpretation
                }
                sx={{ width: '150px' }}
              />
            </Tooltip>
          </Grid>
        </Item>
        <Item>
          <Grid container direction="column" height="100%">
            <CustomTypography variant="label">CLASSIFICATION</CustomTypography>
            {data.classification && (
              <ClassificationChip
                classification={getClassifierClassificationDisplayValue(data.classification) || ''}
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
            {data.targetable !== null && data.targetable !== undefined && (
              <TargetableChip
                targetable={data.targetable ? 'Yes' : 'No'}
              />
            )}
            <CustomTypography variant="bodySmall">
              {inXSamplesText(data.targetableCount)}
            </CustomTypography>
          </Grid>
        </Item>
      </Paper>
      {expanded && methBiosample && (
        <ExpandedModal
          variantType="METHYLATION"
          variantId={data.groupId}
          biosampleId={methBiosample.biosampleId}
          open={expanded}
          handleClose={handleCloseModal}
          title={(
            <MethExpandedModalTitle methId={data.methId} />
          )}
          curationDataComponent={(
            <MethylationModal
              data={data}
            />
          )}
          overrideFooter={(
            <MethCurationFooter
              result={data}
              handleUpdateResult={handleUpdateResult}
            />
          )}
          overrideType="meth"
        />
      )}
    </>
  );
}
