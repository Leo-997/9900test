import { IDrugMetadata } from '@/types/Drugs/Drugs.types';
import { Divider, Grid, styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState, type JSX } from 'react';
import { htsHitsPlotTabs } from '../../constants/options';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import {
    HTSDrugHitsPlotTypes, HTSResultSummary, IDetailedHTSResult, IHTSDrugHitsPlots,
} from '../../types/HTS.types';
import { toFixed } from '../../utils/math/toFixed';
import { ScoreChip } from '../Chips/ScoreChip';
import DataPanel from '../Common/DataPanel';
import ImageThumbnail from '../Common/ImageThumbnail';
import { CustomTabs } from '../Common/Tabs';
import { CustomCheckbox } from '../Input/CustomCheckbox';

const Row = styled(Grid)(() => ({
}));

const Item = styled(Grid)(() => ({
  padding: '8px',
}));

const useStyles = makeStyles(() => ({
  wrapper: {
    paddingTop: '40px',
  },
  title: {
    paddingBottom: '8px',
  },
  divider: {
    margin: '24px 0',
  },
  chipDefault: {
    height: '28px',
    backgroundColor: 'rgba(208, 217, 226, 1)',
    borderRadius: '8px',
  },
  select: {
    width: '150px',
    paddingLeft: '12px',
    boxBorder: 'none',
  },
}));

interface IHTSModalContentProps {
  data: IDetailedHTSResult;
  zScoreSummary: HTSResultSummary;
  cohortCount?: number;
  updateHTS?: (data: IDetailedHTSResult) => void
}

export default function HTSModalContent({
  data,
  zScoreSummary,
  cohortCount,
  updateHTS,
}: IHTSModalContentProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const [currentImage, setCurrentImage] = useState<HTSDrugHitsPlotTypes>('AUC');
  const [plots, setPlots] = useState<IHTSDrugHitsPlots>();

  const { aucZScore: aucZScoreSummary, ic50ZScore: ic50ZScoreSummary } = zScoreSummary;

  const handleReportTargetChange = async (
    target: IDrugMetadata,
    checked: boolean,
  ): Promise<void> => {
    let newTargets = data.reportTargets ?? '';
    if (!newTargets && !checked) {
      newTargets = data
        .targets
        ?.filter((t) => t.id !== target.id)
        .map((t) => t.name)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .join('; ') || '';
    } else if (checked) {
      newTargets = [...(newTargets ?? '').split('; '), target.name]
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .join('; ');
    } else if (!checked) {
      newTargets = [...(newTargets ?? '').split('; ').filter((t) => t !== target.name)]
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .join('; ');
    }
    try {
      await zeroDashSdk.hts.updateHtsResultById(
        { reportTargets: newTargets },
        data.biosampleId,
        data.screenId,
      );
      if (updateHTS) {
        updateHTS({
          ...data,
          reportTargets: newTargets,
        });
      }
    } catch {
      enqueueSnackbar('Could not update report targets, please try again', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (data.biosampleId && data.screenId) {
      zeroDashSdk.plots.getHTSHitsPlots(
        data.biosampleId,
        data.screenId,
      )
        .then((resp) => setPlots(resp));
    }
  }, [data.screenId, data.biosampleId, zeroDashSdk.plots]);

  return (
    <Grid container direction="row" spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Row container>
          <Item size={{ xs: 12, md: 6 }}>
            <DataPanel label="DRUG NAME" value={data.drugName} />
          </Item>
          <Item size={{ xs: 12, md: 6 }}>
            <DataPanel label="COMPOUND ID" value={data.compoundId} />
          </Item>
        </Row>
        <Divider variant="middle" className={classes.divider} />
        <Row container>
          <Item size={{ xs: 12, md: 6 }}>
            <DataPanel
              label="TARGET"
              value={(
                <Grid container direction="row">
                  {data.targets
                    ?.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
                    .map((t) => (
                      <Grid size={5}>
                        <CustomCheckbox
                          key={t.id}
                          labelProps={{ label: t.name }}
                          checked={
                            data.reportTargets === null
                            || data.reportTargets.split('; ').includes(t.name)
                          }
                          onChange={(e, checked): Promise<void> => (
                            handleReportTargetChange(t, checked)
                          )}
                        />
                      </Grid>
                    ))}
                </Grid>
              )}
            />
          </Item>
          <Item size={{ xs: 12, md: 6 }}>
            <DataPanel label="PATHWAY" value={data.classes?.map((c) => c.name).join(', ') || null} />
          </Item>
        </Row>
        <Divider variant="middle" className={classes.divider} />
        <Row container>
          <Item size={{ xs: 12, lg: 6 }}>
            <DataPanel
              label="Cohort for ZSCORE"
              value={
                  cohortCount !== undefined
                    ? `${cohortCount} samples`
                    : '-'
                }
            />
          </Item>
          <Item size={{ xs: 12, lg: 6 }}>
            <DataPanel
              label="Change from Starting point (%)"
              value={data.changeRatio || '-'}
            />
          </Item>
        </Row>
        <Divider variant="middle" className={classes.divider} />
        <Row container>
          <Item size={{ xs: 12, md: 4 }}>
            <DataPanel
              label="AUC Z-SCORE"
              value={(
                <ScoreChip
                  inverted
                  min={aucZScoreSummary.min}
                  max={aucZScoreSummary.max}
                  mid={aucZScoreSummary.mid}
                  value={
                    data.aucZScore
                      ? Number(toFixed(data.aucZScore, 2))
                      : undefined
                  }
                />
              )}
            />
          </Item>
          <Item size={{ xs: 12, sm: 6, md: 3 }}>
            <DataPanel label="AUC" value={data.aucPatient ?? '-'} />
          </Item>
          <Item size={{ xs: 12, sm: 6, md: 3 }}>
            <DataPanel label="AUC median" value={data.aucMedian ?? '-'} />
          </Item>
        </Row>
        <Divider variant="middle" className={classes.divider} />
        <Row container>
          <Item size={{ xs: 12, md: 4 }}>
            <DataPanel
              label="Log2(IC50) Z-SCORE"
              value={(
                <ScoreChip
                  inverted
                  min={ic50ZScoreSummary.min}
                  max={ic50ZScoreSummary.max}
                  mid={ic50ZScoreSummary.mid}
                  value={
                      data.ic50Log2ZScore
                        ? Number(toFixed(data.ic50Log2ZScore, 2))
                        : undefined
                    }
                />
              )}
            />
          </Item>
          <Item size={{ xs: 12, sm: 6, md: 3 }}>
            <DataPanel label="IC50" value={data.ic50Patient ?? '-'} />
          </Item>
          <Item size={{ xs: 12, sm: 6, md: 3 }}>
            <DataPanel label="LOG2(IC50)" value={data.ic50Log2 ?? '-'} />
          </Item>
          <Item size={{ xs: 12, sm: 6, md: 2 }}>
            <DataPanel label="IC50 MEDIAN" value={data.ic50Log2Median ?? '-'} />
          </Item>
        </Row>
        <Divider variant="middle" className={classes.divider} />
        <Row container>
          <Item size={{ xs: 12, md: 4 }}>
            <DataPanel
              label="Log2(LC50) Z-SCORE"
              value={(
                <ScoreChip
                  inverted
                  min={ic50ZScoreSummary.min}
                  max={ic50ZScoreSummary.max}
                  mid={ic50ZScoreSummary.mid}
                  value={
                      data.lc50Log2ZScore
                        ? Number(toFixed(data.lc50Log2ZScore, 2))
                        : undefined
                    }
                />
                )}
            />
          </Item>
          <Item size={{ xs: 12, sm: 6, md: 3 }}>
            <DataPanel label="LC50" value={data.lc50 ?? '-'} />
          </Item>
          <Item size={{ xs: 12, sm: 6, md: 3 }}>
            <DataPanel label="LOG2(LC50)" value={data.lc50Log2 ?? '-'} />
          </Item>
          <Item size={{ xs: 12, sm: 6, md: 2 }}>
            <DataPanel label="LC50 MEDIAN" value={data.lc50Log2Median ?? '-'} />
          </Item>
        </Row>
        <Divider variant="middle" className={classes.divider} />
        <Row container>
          <Item
            size={{
              xs: 12, sm: 6, md: 4, lg: 2,
            }}
          >
            <DataPanel label="CMAX(NM)" value={data.cmax ?? '-'} />
          </Item>
          <Item
            size={{
              xs: 12, sm: 6, md: 4, lg: 3,
            }}
          >
            <DataPanel label="Effect CMAX" value={data.effectCmax ?? '-'} />
          </Item>
          <Item
            size={{
              xs: 12, sm: 6, md: 4, lg: 2,
            }}
          >
            <DataPanel label="CSS(NM)" value={data.css ?? '-'} />
          </Item>
          <Item
            size={{
              xs: 12, sm: 6, md: 4, lg: 3,
            }}
          >
            <DataPanel label="Effect CSS" value={data.effectCss ?? '-'} />
          </Item>
          <Item
            size={{
              xs: 12, sm: 6, md: 4, lg: 2,
            }}
          >
            <DataPanel label="Crew" value={data.crew ?? '-'} />
          </Item>
        </Row>
      </Grid>
      <Grid size={{ xs: 12 }} style={{ minHeight: '120px' }}>
        <CustomTabs
          variant="sub-navigation"
          tabs={htsHitsPlotTabs(Boolean(plots?.LN50)).map((t) => ({ ...t, label: t.name }))}
          fullWidth
          scrollButtons
          onChange={(e, tab: keyof IHTSDrugHitsPlots): void => setCurrentImage(tab)}
          value={currentImage}
        />
        <ImageThumbnail
          imageUrl={plots ? plots[currentImage] : ''}
          headerTitle={currentImage}
        />
      </Grid>
    </Grid>
  );
}
