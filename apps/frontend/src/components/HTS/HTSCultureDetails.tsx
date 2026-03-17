import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import type { JSX } from 'react';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { IBiosample } from '@/types/Analysis/Biosamples.types';
import { IHTSCulture } from '../../types/HTS.types';
import DataPanel from '../Common/DataPanel';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';

const useStyles = makeStyles(() => ({
  item: {
    minWidth: '220px',
  },
}));

interface IProps {
  data?: IHTSCulture;
  selectedBiosample: IBiosample;
  onSelectBiosample: (biosample: IBiosample) => void;
  cultures: IHTSCulture[];
  onSelectCulture: (culture: IHTSCulture) => void;
}

export default function HTSCultureDetails({
  data,
  selectedBiosample,
  onSelectBiosample,
  cultures,
  onSelectCulture,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { htsBiosamples } = useAnalysisSet();

  return (
    <Grid
      container
      style={{
        padding: '16px 16px 16px 0px',
        columnGap: '24px',
        rowGap: '16px',
      }}
    >
      {htsBiosamples && (
        <Grid className={classes.item}>
          <DataPanel
            label="Biosample"
            value={(
              <AutoWidthSelect
                options={htsBiosamples?.map((b) => ({
                  value: b.biosampleId,
                  name: b.biosampleId,
                }))}
                defaultValue={selectedBiosample.biosampleId}
                onChange={(e): void => onSelectBiosample(
                  htsBiosamples.find((b) => b.biosampleId === e.target.value) ?? selectedBiosample,
                )}
              />
            )}
          />
        </Grid>
      )}
      {cultures && data && (
        <Grid className={classes.item}>
          <DataPanel
            label="Screen"
            value={cultures.filter((c) => c.screenName).length > 0 ? (
              <AutoWidthSelect
                options={cultures.map((c) => ({
                  value: c.screenName,
                  name: c.screenName,
                }))}
                value={data.screenName}
                onChange={(e): void => onSelectCulture(
                  cultures.find((b) => b.screenName === e.target.value) as IHTSCulture,
                )}
              />
            ) : '-'}
          />
        </Grid>
      )}
      <Grid className={classes.item}>
        <DataPanel
          label="Biomaterial Name"
          value={(
            <b>
              {data?.biomaterial ?? '-'}
            </b>
          )}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Cell Seeded"
          value={
            data?.htsSeedDate
              ? dayjs(data?.htsSeedDate).format('DD/MM/YYYY')
              : '-'
          }
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Drug Added"
          value={
            data?.htsScreenDate
              ? dayjs(data?.htsScreenDate).format('DD/MM/YYYY')
              : '-'
          }
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Endpoint"
          value={
            data?.htsEndpointDate
              ? dayjs(data?.htsEndpointDate).format('DD/MM/YYYY')
              : '-'
          }
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="No. Compounds"
          value={data?.htsNumDrugs ?? '-'}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Screening Format"
          value={(
            <b>
              {data?.htsScreenFormat ?? '-'}
            </b>
          )}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Passage"
          value={(
            <b>
              {data?.htsPassage ?? '-'}
            </b>
          )}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Number Cells/Well"
          value={data?.htsNumCells ?? '-'}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Viability"
          value={data?.htsViabilityPct ?? '-'}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Screening Platform"
          value={data?.htsScreenPlatform ?? '-'}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Rocki"
          value={data?.htsRocki ?? '-'}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Culture Validation Method"
          value={data?.htsCultureValidMethod ?? '-'}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Validation Method"
          value={data?.htsValidMethod ?? '-'}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Incubation Condition"
          value={data?.htsCondIncubation ?? '-'}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Validation Results"
          value={data?.htsValidResult ?? '-'}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Cohort count"
          value={(data?.wholeCohortCount !== null && data?.wholeCohortCount !== undefined
            ? `${data?.wholeCohortCount} samples`
            : '-'
          )}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Subcohort"
          value={data?.subcohort ?? '-'}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Subcohort count"
          value={(data?.subcohortCount !== null && data?.subcohortCount !== undefined
            ? `${data?.subcohortCount} samples`
            : '-'
          )}
        />
      </Grid>
      <Grid className={classes.item}>
        <DataPanel
          label="Culture Conditions"
          value={data?.htsCondCulture ?? '-'}
        />
      </Grid>
    </Grid>
  );
}
