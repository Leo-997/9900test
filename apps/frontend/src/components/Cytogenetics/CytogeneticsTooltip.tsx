import { Grid, styled } from '@mui/material';
import { IArmData, ISampleCytoband } from '../../types/Cytogenetics.types';
import { boolToStr } from '../../utils/functions/bools';
import { getClassificationDisplayValue } from '../../utils/misc';
import CustomTypography from '../Common/Typography';

import type { JSX } from "react";

const Container = styled(Grid)(() => ({
  '& *': {
    color: 'inherit !important',
  },
}));

interface ICytogeneticsTooltipProps {
  p: IArmData;
  q: IArmData;
  cytobands: ISampleCytoband[];
  type: 'classification' | 'targetable';
}

export function CytogeneticsTooltip({
  p,
  q,
  cytobands,
  type,
}: ICytogeneticsTooltipProps): JSX.Element {
  return (
    <Container container direction="column" sx={{ width: '240px', fontStyle: 'italic' }}>
      { p !== null && (
        <Grid container direction="row" justifyContent="space-around" width="100%">
          <Grid size={12}>
            <CustomTypography variant="bodyRegular">
              Arm P:
              <b>
                &nbsp;
                { type === 'classification'
                  ? getClassificationDisplayValue(p.classification)
                  : boolToStr(p.targetable)}
              </b>
            </CustomTypography>
          </Grid>
        </Grid>
      )}
      { q !== null && (
        <Grid container direction="row" width="100%">
          <Grid size={12}>
            <CustomTypography variant="bodyRegular">
              Arm Q:
              <b>
                &nbsp;
                { type === 'classification'
                  ? getClassificationDisplayValue(q.classification)
                  : boolToStr(q.targetable)}
              </b>
            </CustomTypography>
          </Grid>
        </Grid>
      )}
      { cytobands.length > 0 && (
        <>
          <Grid container direction="row" width="100%">
            <Grid size={12}>
              <CustomTypography variant="bodyRegular">Cytobands</CustomTypography>
            </Grid>
          </Grid>
          <Grid container direction="row" width="100%">
            <ul style={{ margin: 0, width: '100%' }}>
              { cytobands.map((cyto) => (
                <li style={{ width: '100%' }}>
                  <div style={{ display: 'flex' }}>
                    <CustomTypography
                      variant="bodyRegular"
                      truncate
                      style={{ maxWidth: '50%' }}
                    >
                      {cyto.cytoband}
                    </CustomTypography>
                    <CustomTypography
                      variant="bodyRegular"
                      truncate
                      style={{ maxWidth: '50%' }}
                    >
                      <b>
                        :
                        &nbsp;
                        { type === 'classification'
                          ? getClassificationDisplayValue(cyto.classification)
                          : boolToStr(cyto.targetable)}
                      </b>
                    </CustomTypography>
                  </div>
                </li>
              ))}
            </ul>
          </Grid>
        </>
      )}
    </Container>
  );
}
