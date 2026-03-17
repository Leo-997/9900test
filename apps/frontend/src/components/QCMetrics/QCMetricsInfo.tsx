import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import {
    Box,
    Grid,
    Link,
} from '@mui/material';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState, type JSX } from 'react';
import { corePalette } from '@/themes/colours';
import clsx from 'clsx';
import CustomTypography from '../Common/Typography';
import CoverageInfoSegment from './CoverageInfoSegment';
import DataPanel from '../Common/DataPanel';

export default function QCMetricsInfo(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const {
    primaryBiosample,
    tumourBiosample,
    germlineBiosample,
    metrics,
    rnaBiosample,
    rnaseqMetrics,
  } = useAnalysisSet();

  const [reportLink, setReportLink] = useState<string>('#');

  useEffect(() => {
    if (primaryBiosample?.biosampleId) {
      zeroDashSdk.curation.metrics.getReportLink(primaryBiosample.biosampleId)
        .then((link) => setReportLink(link));
    }
  }, [primaryBiosample?.biosampleId, zeroDashSdk.curation.metrics]);

  const normalMetrics = metrics?.find(
    (metric) => metric.biosampleId === germlineBiosample?.biosampleId,
  );
  const tumourMetrics = metrics?.find(
    (metric) => metric.biosampleId === tumourBiosample?.biosampleId,
  );

  return (
    <Grid
      container
      size={12}
      bgcolor={corePalette.white}
      borderRadius="8px"
      direction="column"
      padding="24px 0"
    >
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        padding="0 24px"
      >
        <CustomTypography variant="titleRegular" fontWeight="medium">
          Sample QC
        </CustomTypography>
        {reportLink !== '' && (
          <Link
            href={reportLink}
            target="_blank"
            rel="noopener"
          >
            <Box display="flex" gap="4px">
              <CustomTypography variant="bodyRegular" color={corePalette.green150}>
                MultiQC Report
              </CustomTypography>
              <ArrowUpRight />
            </Box>
          </Link>
        )}
      </Grid>
      <Grid direction="row" container rowGap={4} minHeight="112px" size={12}>
        <CoverageInfoSegment
          title="Germline DNA ID"
          titleContent={normalMetrics?.biosampleId || ''}
          pMean={normalMetrics?.meanCoverage}
          p20={normalMetrics?.x20}
          p30={normalMetrics?.x30}
          p50={normalMetrics?.x50}
          sx={(theme): { [x: string]: { borderRight: string; }; } => ({
            [theme.breakpoints.up('md')]: {
              borderRight: `1px solid ${corePalette.grey30}`,
            },
          })}
        />
        <CoverageInfoSegment
          title="Tumour DNA ID"
          titleContent={tumourMetrics?.biosampleId || ''}
          pMean={tumourMetrics?.meanCoverage}
          p20={tumourMetrics?.x20}
          p30={tumourMetrics?.x30}
          p50={tumourMetrics?.x50}
          sx={(theme): { [x: string]: { borderRight: string; }; } => ({
            [theme.breakpoints.up('lg')]: {
              borderRight: `1px solid ${corePalette.grey30}`,
            },
          })}
        />
        <Grid
          container
          direction="column"
          gap={2}
          size={{ xs: 12, md: 6, lg: 4 }}
          height="fit-content"
          minHeight="112px"
          padding="0 24px"
        >
          <DataPanel
            label="Tumour RNA ID"
            tooltip={rnaBiosample?.status}
            value={(
              <CustomTypography
                variant="bodyRegular"
                fontWeight="bold"
                truncate
                color={clsx({
                  [corePalette.orange150]: rnaBiosample?.status?.includes('WARN'),
                  [corePalette.red200]: rnaBiosample?.status?.includes('FAIL'),
                })}
              >
                {rnaBiosample?.biosampleId || '-'}
              </CustomTypography>
            )}
          />
          <Grid container direction="row" justifyContent="space-between">
            <Grid>
              <DataPanel
                label="Unique Mapped Reads"
                value={
                  rnaseqMetrics?.uniqMappedReads && rnaseqMetrics?.uniqMappedReadsPct
                    ? `${rnaseqMetrics?.uniqMappedReads} / ${rnaseqMetrics?.uniqMappedReadsPct}%`
                    : '-'
                }
              />
            </Grid>
            <Grid>
              <DataPanel
                label="RIN"
                value={rnaseqMetrics?.rin}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
