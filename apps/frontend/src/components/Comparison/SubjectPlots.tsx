import { Box, Grid } from '@mui/material';
import { useEffect, useMemo, useState, type JSX } from 'react';
import CustomTypography from '@/components/Common/Typography';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { corePalette } from '@/themes/colours';
import type { ComparisonSubject } from './types';

export type PlotBlockType = 'QC' | 'Circos' | 'Methylation';

interface Props {
  subject: ComparisonSubject;
  enabled: PlotBlockType[];
}

type ImgBlock = { key: string; title: string; url: string };

export function SubjectPlots({
  subject,
  enabled,
}: Props): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const [qcUrl, setQcUrl] = useState<string>('');
  const [circosUrl, setCircosUrl] = useState<string>('');
  const [methUrls, setMethUrls] = useState<{ cnProfile: string; methProfile: string; mgmt: string }>({
    cnProfile: '',
    methProfile: '',
    mgmt: '',
  });

  const tumourBiosampleId = subject.analysisSet?.biosamples?.find((b) => b.biosampleType === 'tumour')?.biosampleId;

  useEffect(() => {
    let cancelled = false;
    async function run(): Promise<void> {
      if (!tumourBiosampleId) {
        setQcUrl('');
        setCircosUrl('');
        setMethUrls({ cnProfile: '', methProfile: '', mgmt: '' });
        return;
      }

      if (enabled.includes('QC')) {
        zeroDashSdk.plots.getQCPlots(tumourBiosampleId).then((resp) => {
          if (cancelled) return;
          setQcUrl(resp.purpleCopyNumberPlot?.plotURL || '');
        }).catch(() => {
          if (cancelled) return;
          setQcUrl('');
        });
      } else {
        setQcUrl('');
      }

      if (enabled.includes('Circos')) {
        zeroDashSdk.plots.getCircosPlots(tumourBiosampleId).then((resp) => {
          if (cancelled) return;
          setCircosUrl(resp.circos || '');
        }).catch(() => {
          if (cancelled) return;
          setCircosUrl('');
        });
      } else {
        setCircosUrl('');
      }

      if (enabled.includes('Methylation')) {
        zeroDashSdk.plots.getMethPlots(tumourBiosampleId).then((resp) => {
          if (cancelled) return;
          setMethUrls(resp);
        }).catch(() => {
          if (cancelled) return;
          setMethUrls({ cnProfile: '', methProfile: '', mgmt: '' });
        });
      } else {
        setMethUrls({ cnProfile: '', methProfile: '', mgmt: '' });
      }
    }
    run();
    return () => { cancelled = true; };
  }, [enabled, tumourBiosampleId, zeroDashSdk.plots]);

  const blocks: ImgBlock[] = useMemo(() => {
    const out: ImgBlock[] = [];
    if (qcUrl) out.push({ key: 'qc', title: 'QC', url: qcUrl });
    if (circosUrl) out.push({ key: 'circos', title: 'Circos', url: circosUrl });
    if (methUrls.cnProfile) out.push({ key: 'meth-cn', title: 'Methylation CN profile', url: methUrls.cnProfile });
    if (methUrls.methProfile) out.push({ key: 'meth-profile', title: 'Methylation profile', url: methUrls.methProfile });
    if (methUrls.mgmt) out.push({ key: 'mgmt', title: 'MGMT', url: methUrls.mgmt });
    return out;
  }, [circosUrl, methUrls.cnProfile, methUrls.methProfile, methUrls.mgmt, qcUrl]);

  if (enabled.length === 0) return <></>;

  return (
    <Box>
      <CustomTypography variant="titleSmall" fontWeight="bold" sx={{ marginBottom: '8px' }}>
        Plots
      </CustomTypography>
      <CustomTypography variant="bodyTiny" sx={{ color: corePalette.grey200, marginBottom: '8px' }}>
        {subject.patientId} — {subject.timepointTag}
      </CustomTypography>

      {blocks.length === 0 ? (
        <CustomTypography variant="bodySmall">
          No plots available for this subject.
        </CustomTypography>
      ) : (
        <Grid container direction="column" gap="12px">
          {blocks.map((b) => (
            <Box key={b.key} className="keep-together">
              <CustomTypography variant="label" sx={{ marginBottom: '6px' }}>
                {b.title}
              </CustomTypography>
              <Box
                component="img"
                src={b.url}
                alt={b.title}
                sx={{
                  width: '100%',
                  border: `1px solid ${corePalette.grey50}`,
                  borderRadius: '8px',
                }}
              />
            </Box>
          ))}
        </Grid>
      )}
    </Box>
  );
}

