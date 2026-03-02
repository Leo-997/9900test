import {
    Box,
    Divider,
    Grid,
    IconButton,
    Paper as MuiPaper,
    styled,
} from '@mui/material';
import { ImageOffIcon, Maximize2Icon } from 'lucide-react';
import { useState, type JSX } from 'react';
import { IProfiles } from '../../types/Methylation.types';
import LoadingAnimation from '../Animations/LoadingAnimation';
import CustomTypography from '../Common/Typography';
import PlotCardModal from '../QCPlots/PlotcardModal';

const Paper = styled(MuiPaper)(() => ({
  borderRadius: 0,
  border: 'none',
  background: 'auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  minWidth: '100%',
  margin: '24px 0px',
}));

const MissingImage = styled(ImageOffIcon)(({ theme }) => ({
  color: theme.colours.core.grey50,
}));

interface IProps {
  data?: IProfiles;
}

export default function GraphPanel({
  data,
}: IProps): JSX.Element {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <Paper elevation={0}>
      <Grid container direction="column" width="100%" gap="16px">
        <Grid container direction="column" width="100%">
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            width="100%"
            padding="8px 16px"
            alignItems="center"
          >
            <CustomTypography variant="bodyRegular" fontWeight="bold">
              Copy Number Profile (EPIC array)
            </CustomTypography>
            {data && (
              <IconButton onClick={(): void => setExpanded(!expanded)}>
                <Maximize2Icon />
              </IconButton>
            )}
          </Grid>
          <Grid container direction="row" justifyContent="center" height="350px">
            {!data && (
              <LoadingAnimation />
            )}
            {data && !data.methProfile && (
              <Box display="flex" flexDirection="column" justifyContent="center">
                <MissingImage size="100px" />
              </Box>
            )}
            {data?.methProfile && (
              <img src={data?.methProfile} alt="methylation profile" style={{ maxHeight: '100%' }} />
            )}
          </Grid>
        </Grid>
        <Divider variant="middle" />
        <Grid container direction="column" width="100%">
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            width="100%"
            padding="8px 16px"
            alignItems="center"
          >
            <CustomTypography variant="bodyRegular" fontWeight="bold">
              Copy Number Profile (WGS)
            </CustomTypography>
            {data && (
              <IconButton onClick={(): void => setExpanded(!expanded)}>
                <Maximize2Icon />
              </IconButton>
            )}
          </Grid>
          <Grid container direction="row" justifyContent="center" height="350px">
            {!data && (
              <LoadingAnimation />
            )}
            {data && !data.cnProfile && (
              <Box display="flex" flexDirection="column" justifyContent="center">
                <MissingImage size="100px" />
              </Box>
            )}
            {data?.cnProfile && (
              <img src={data?.cnProfile} alt="methylation profile" style={{ maxHeight: '100%' }} />
            )}
          </Grid>
        </Grid>
      </Grid>
      {expanded && (
        <PlotCardModal
          legendTitle="Copy Number Profiles"
          legendData={[
            {
              title: 'Copy Number Profiles',
              summary: '',
              content:
                'Top profile: Epic Array.\nBottom profile: Whole genome sequencing.',
            },
          ]}
          title="Copy Number profiles (EPIC array and WGS)"
          url={data ? [data.methProfile, data.cnProfile] : []}
          open={expanded}
          openModal={(): void => setExpanded(true)}
          closeModal={(): void => setExpanded(false)}
        />
      )}
    </Paper>
  );
}
