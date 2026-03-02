import {
    Divider,
    Grid,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useMemo, type JSX } from 'react';
import { IMethylationPredictionData } from '../../types/Methylation.types';
import { getMGMTStatusBackgroundColour } from '../../utils/functions/getMGMTStatusIcon';
import { toFixed } from '../../utils/math/toFixed';
import DataPanel from '../Common/DataPanel';
import CustomTypography from '../Common/Typography';
import CircleIcon from '../CustomIcons/CircleIcon';

const useStyles = makeStyles(() => ({
  wrapper: {
    paddingTop: '40px',
  },
  title: {
    paddingBottom: '8px',
  },
  divider: {
    margin: '12px 0',
  },
  fileDropZone: {
    marginTop: 20,
    height: '56px',
    minHeight: '56px',
    width: '100%',
  },
  button: {
    width: '100%',
    marginTop: 20,
  },
}));

interface IMethylationPredictionModalProps {
  data: IMethylationPredictionData;
}

export default function MethylationPredictionModal({
  data,
}: IMethylationPredictionModalProps): JSX.Element {
  const classes = useStyles();

  const mgmtData = useMemo(() => ({
    ...data,
    status: data.status && data.status !== '-' ? data.status : 'unknown',
    estimated: data.estimated ? parseFloat(toFixed(data.estimated, 2)) : 0,
    ciLower: data.ciLower ? parseFloat(toFixed(data.ciLower, 2)) : 0,
    ciUpper: data.ciUpper ? parseFloat(toFixed(data.ciUpper, 2)) : 0,
    cutoff: data.cutoff ? parseFloat(toFixed(data.cutoff, 2)) : 0,
  }), [data]);

  return (
    <Grid container direction="column">
      <Grid container direction="row" padding="8px 0px">
        <Grid size={{ xs: 6 }}>
          <DataPanel
            label="STATUS"
            value={(
              <Grid container wrap="nowrap" alignItems="center" gap="8px">
                <CircleIcon
                  text=""
                  textColor=""
                  iconColor={
                    getMGMTStatusBackgroundColour(mgmtData?.status)
                  }
                  height={25}
                  width={25}
                />
                <CustomTypography variant="bodyRegular">
                  {mgmtData.status.charAt(0).toUpperCase() + mgmtData.status.slice(1) }
                </CustomTypography>
              </Grid>
            )}
          />
        </Grid>
      </Grid>
      <Divider variant="middle" className={classes.divider} />
      <Grid container direction="row" padding="8px 0px">
        <Grid size={{ xs: 12, md: 4 }}>
          <DataPanel
            label="Gene"
            value="MGMT"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DataPanel
            label="Sentrix ID"
            value={data.methId?.split('_')[0]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DataPanel
            label="Sentrix Position"
            value={(
              data.methId && data.methId.split('_').length > 1
                ? data.methId?.split('_')[1]
                : '-'
            )}
          />
        </Grid>
      </Grid>
      <Divider variant="middle" className={classes.divider} />
      <Grid container direction="row" padding="8px 0px">
        <Grid size={{ xs: 12, md: 4 }} paddingRight="20px">
          <DataPanel
            label="ESTIMATED"
            value={mgmtData.estimated}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} paddingRight="20px">
          <DataPanel
            label="CI LOWER"
            value={mgmtData.ciLower}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} paddingRight="20px">
          <DataPanel
            label="CI Upper"
            value={mgmtData.ciUpper}
          />
        </Grid>
      </Grid>
      <Divider variant="middle" className={classes.divider} />
      <Grid container direction="column" padding="8px 0px">
        <DataPanel
          label="MGMT PROMOTER STATUS PREDICTION"
          value={(
            <div
              style={{
                height: '200px',
                maxWidth: '540px',
                backgroundImage: `url(${data.plotUrl})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}
