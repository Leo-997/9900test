import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react';

import {
    Grid,
    IconButton,
    Paper as MuiPaper,
    styled,
} from '@mui/material';

import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { corePalette } from '@/themes/colours';
import { Maximize2Icon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import CustomTypography from '../Common/Typography';
import { ExpandedModal } from '../ExpandedModal/ExpandedModal';
import MethylationPredictionModal from './MethylationPredictionModal';

import { IGene } from '../../types/Common.types';
import { IMethylationPredictionData } from '../../types/Methylation.types';

import { toFixed } from '../../utils/math/toFixed';

import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { getMGMTStatusBackgroundColour, getMGMTStatusText, getMGMTStatusTextColour } from '../../utils/functions/getMGMTStatusIcon';
import CustomChip from '../Common/Chip';
import CircleIcon from '../CustomIcons/CircleIcon';
import MethExpandedModalTitle from './MethExpandedModalTitle';

interface IStyleProps {
  joined?: boolean;
}

const Paper = styled(MuiPaper)<IStyleProps>(({ joined }) => ({
  margin: joined ? 0 : '24px 0px',
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
  width: '15%',
  minWidth: '400px',
}));

const Item = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  verticalAlign: 'top',
  padding: '8px',
  width: '200px',
  minWidth: '200px',
}));

const PlotItem = styled(Item)(() => ({
  width: '300px',
  minWidth: '300px',
  marginRight: '100px',
}));

interface IMethylationPredictionPanelProps {
  data: IMethylationPredictionData;
  setData?: Dispatch<SetStateAction<IMethylationPredictionData | undefined>>;
}

export default function MethylationPredictionPanel({
  data,
  setData,
}: IMethylationPredictionPanelProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { methBiosample } = useAnalysisSet();
  const { enqueueSnackbar } = useSnackbar();

  const [expanded, setExpanded] = useState<boolean>(false);
  const [mgmt, setMgmt] = useState<IGene | undefined>(undefined);

  const handleCloseModal = async (): Promise<void> => {
    try {
      if (methBiosample?.biosampleId) {
        const res = await zeroDashSdk.methylation.getMethylationPrediction(
          methBiosample.biosampleId,
        );

        if (setData) {
          setData({
            ...res,
            status: res.status ?? '-',
            biosampleId: methBiosample.biosampleId,
            methId: methBiosample?.aliases.find((a) => a.aliasType === 'methylation')?.alias || '',
            plotUrl: data.plotUrl,
          });
        }
      }
    } catch (err) {
      enqueueSnackbar('Cannot load MGMT data, please try again.', { variant: 'error' });
    }

    setExpanded(!expanded);
  };

  useEffect(() => {
    if (!mgmt) {
      zeroDashSdk.gene.getGenes({
        gene: 'MGMT',
      })
        .then((resp) => {
          if (resp.length > 0) {
            setMgmt(resp[0]);
          }
        });
    }
  }, [zeroDashSdk?.gene, mgmt]);

  return (
    <Paper elevation={0}>
      <StickySection>
        <Grid container height="100%" gap="8px" alignItems="center">
          <Grid flex={1}>
            <IconButton onClick={(): void => setExpanded(!expanded)}>
              <Maximize2Icon />
            </IconButton>
          </Grid>
          <Grid flex={2}>
            <CircleIcon
              text={getMGMTStatusText(data?.status)}
              textColor={getMGMTStatusTextColour(data?.status)}
              iconColor={getMGMTStatusBackgroundColour(data?.status)}
              height={50}
              width={50}
              textSize={20}
            />
          </Grid>
          <Grid direction="column" container flex={9}>
            <CustomTypography variant="label">METHYLATION STATUS</CustomTypography>
            <CustomTypography variant="titleRegular" fontWeight="bold">
              { data.status ? data.status[0].toUpperCase() + data.status.substring(1) : '-' }
            </CustomTypography>
            <Grid container alignItems="baseline">
              <CustomTypography
                variant="label"
              >
                Gene:&nbsp;
              </CustomTypography>
              <CustomTypography variant="bodyRegular">MGMT</CustomTypography>
            </Grid>
            <Grid container alignItems="baseline">
              <CustomTypography
                variant="label"
                style={{ flexShrink: 0 }}
              >
                Sentrix ID:&nbsp;
              </CustomTypography>
              <CustomTypography variant="bodyRegular" truncate>
                {data.methId ? data.methId.split('_')[0] : '-'}
              </CustomTypography>
            </Grid>
            <Grid container alignItems="baseline">
              <CustomTypography
                truncate
                variant="label"
                style={{ flexShrink: 0 }}
              >
                Sentrix Position:&nbsp;
              </CustomTypography>
              <CustomTypography truncate variant="bodyRegular">
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
          <CustomTypography variant="label">ESTIMATED</CustomTypography>
          <CustomChip
            label={data.estimated ? toFixed(data.estimated, 2) : '-'}
            size="medium"
            backgroundColour={corePalette.grey50}
            colour={corePalette.offBlack100}
            fontWeight="bold"
            sx={{ width: '150px' }}
          />
          <Grid container>
            <CustomTypography
              variant="bodyRegular"
            >
              CI Lower&nbsp;
            </CustomTypography>
            <CustomTypography variant="bodyRegular">
              {data.ciLower ? toFixed(data.ciLower, 2) : '-'}
            </CustomTypography>
          </Grid>
          <Grid container>
            <CustomTypography
              variant="bodyRegular"
            >
              CI Upper&nbsp;
            </CustomTypography>
            <CustomTypography variant="bodyRegular">
              {data.ciUpper ? toFixed(data.ciUpper, 2) : '-'}
            </CustomTypography>
          </Grid>
        </Grid>
      </Item>
      <PlotItem>
        <Grid container direction="column" height="100%">
          <CustomTypography variant="label">
            MGMT PROMOTER STATUS PREDICTION
          </CustomTypography>
          <Grid
            sx={{
              height: '100px',
              backgroundImage: `url(${data.plotUrl})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
            }}
          />
        </Grid>
      </PlotItem>
      {expanded && methBiosample && (
        <ExpandedModal
          open={expanded}
          variantId={mgmt?.geneId || ''}
          biosampleId={methBiosample.biosampleId}
          handleClose={handleCloseModal}
          title={(
            <MethExpandedModalTitle methId={data.methId} />
          )}
          titleIcon={(
            <CircleIcon
              text={getMGMTStatusText(data?.status)}
              textColor={getMGMTStatusTextColour(data?.status)}
              iconColor={getMGMTStatusBackgroundColour(data?.status)}
              margin="0 0 0 20px"
              height={50}
              width={50}
              textSize={20}
            />
          )}
          variant={data}
          curationDataComponent={(
            <MethylationPredictionModal
              data={data}
            />
          )}
          hideIncludeInReport
          showContentFooter={false}
          variantType="METHYLATION"
        />
      )}
    </Paper>
  );
}
