import {
  Box,
  Grid,
  styled,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { saveAs } from '@progress/kendo-file-saver';
import CustomTypography from '@/components/Common/Typography';
import { useUser } from '@/contexts/UserContext';
import { CustomTabs } from '@/components/Common/Tabs';
import CustomButton from '@/components/Common/Button';
import CustomAutocomplete from '@/components/Common/Autocomplete';
import { corePalette } from '@/themes/colours';
import { defaultComparisonMetrics } from '@/components/Comparison/metrics';
import { PatientSamplePicker } from '@/components/Comparison/PatientSamplePicker';
import { ComparisonMetricsTable } from '@/components/Comparison/ComparisonMetricsTable';
import type { ComparisonMode, MetricDefinition, ComparisonSubject } from '@/components/Comparison/types';
import { generateReportPDF } from '@/utils/functions/reportGenerationHelpers';
import { ReportableVariantsSummary } from '@/components/Comparison/ReportableVariantsSummary';
import { SubjectPlots, type PlotBlockType } from '@/components/Comparison/SubjectPlots';

const WELCOME_MESSAGE_BAR_HEIGHT = 64;

const Page = styled('div')(({ theme }) => ({
  marginTop: 80,
  padding: '20px 24px 0',
  backgroundColor: theme.colours.core.grey10,
  height: 'calc(100vh - 80px)',
  width: '100%',
  maxHeight: 'calc(100vh - 80px)',
  maxWidth: '100vw',
  overflow: 'hidden',
  display: 'flex',
  borderTopLeftRadius: '22px',
}));

const PageBg = styled('div')(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  backgroundColor: theme.colours.core.offBlack200,
  zIndex: -1,
}));

const Content = styled('div')(() => ({
  flexGrow: 1,
  paddingLeft: 24,
  paddingRight: 24,
  marginBottom: 24,
  maxHeight: '100%',
  width: '100%',
}));

const WelcomeMsgBar = styled(Grid)(() => ({
  height: `${WELCOME_MESSAGE_BAR_HEIGHT}px`,
}));

const Body = styled(Grid)(() => ({
  marginTop: 24,
  maxHeight: `calc(100% - ${WELCOME_MESSAGE_BAR_HEIGHT}px - 40px)`,
  width: '100%',
  maxWidth: '100%',
}));

const BuilderPane = styled('div')(() => ({
  width: '380px',
  minWidth: '380px',
  maxWidth: '380px',
  height: '100%',
  overflowY: 'auto',
  paddingRight: 16,
}));

const PreviewPane = styled('div')(() => ({
  flexGrow: 1,
  height: '100%',
  overflow: 'auto',
  paddingLeft: 16,
}));

const ReportPreviewPaper = styled('div')(() => ({
  backgroundColor: corePalette.white,
  borderRadius: 8,
  border: `1px solid ${corePalette.grey50}`,
  padding: 24,
  minHeight: 800,
}));

async function waitForImages(container: HTMLElement): Promise<void> {
  const imgs = Array.from(container.querySelectorAll('img'));
  const pending = imgs
    .filter((img) => !img.complete)
    .map((img) => new Promise<void>((resolve) => {
      const done = (): void => resolve();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }));
  await Promise.all(pending);
}

function safeFilePart(input: string): string {
  return input
    .replaceAll(/[<>:"/\\|?*\u0000-\u001F]/g, '')
    .replaceAll(/\s+/g, '_')
    .slice(0, 120);
}

export default function ComparisonDashboardPage(): JSX.Element {
  const { currentUser } = useUser();
  const reportRef = useRef<HTMLDivElement | null>(null);

  const plotOptions: { id: PlotBlockType; label: string }[] = useMemo(() => ([
    { id: 'QC', label: 'QC (copy number plot)' },
    { id: 'Circos', label: 'Circos' },
    { id: 'Methylation', label: 'Methylation (CN/profile/MGMT)' },
  ]), []);

  const [mode, setMode] = useState<ComparisonMode>('SinglePatientReport');
  const [subjects, setSubjects] = useState<ComparisonSubject[]>([]);
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>([
    'sequencedEvent',
    'diagnosisEvent',
    'analysisEvent',
    'zero2FinalDiagnosis',
  ]);
  const [includeVariantSummary, setIncludeVariantSummary] = useState<boolean>(true);
  const [plotBlocks, setPlotBlocks] = useState<PlotBlockType[]>(['Methylation']);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const selectedMetrics: MetricDefinition[] = useMemo(() => (
    defaultComparisonMetrics.filter((m) => selectedMetricIds.includes(m.id))
  ), [selectedMetricIds]);

  const subjectTitle = useMemo(() => {
    if (subjects.length === 0) return 'No subjects selected';
    const patientIds = [...new Set(subjects.map((s) => s.patientId))];
    return patientIds.join(', ');
  }, [subjects]);

  useEffect(() => {
    if (mode !== 'SamePatientTimepointComparison') return;
    const firstPatient = subjects[0]?.patientId;
    if (!firstPatient) return;
    const filtered = subjects.filter((s) => s.patientId === firstPatient);
    if (filtered.length !== subjects.length) {
      setSubjects(filtered);
    }
  }, [mode, subjects]);

  return (
    <Page>
      <PageBg />
      <Content>
        <Grid
          container
          direction="column"
          sx={{ height: '100%', width: '100%' }}
          wrap="nowrap"
        >
          <WelcomeMsgBar>
            <CustomTypography variant="h2" fontWeight="bold">
              Hi
              {currentUser?.givenName ? ` ${currentUser.givenName}` : ''}
              , compare datasets here
            </CustomTypography>
          </WelcomeMsgBar>
          <Body>
            <Grid container sx={{ height: '100%' }} wrap="nowrap">
              <BuilderPane>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Box>
                    <CustomTypography variant="titleSmall" fontWeight="bold" sx={{ marginBottom: '8px' }}>
                      Report type
                    </CustomTypography>
                    <CustomTabs
                      value={mode}
                      variant="navigation"
                      size="large"
                      indicatorLocation="bottom"
                      tabs={[
                        { label: 'Single', value: 'SinglePatientReport' },
                        { label: 'Same patient', value: 'SamePatientTimepointComparison' },
                        { label: 'Multi patient', value: 'MultiPatientComparison' },
                      ]}
                      onChange={(_, v): void => setMode(v as ComparisonMode)}
                    />
                  </Box>

                  <PatientSamplePicker
                    mode={mode}
                    subjects={subjects}
                    onChange={setSubjects}
                  />

                  <CustomAutocomplete<MetricDefinition, true, false, false>
                    multiple
                    label="Metrics to include"
                    options={defaultComparisonMetrics}
                    value={defaultComparisonMetrics.filter((m) => selectedMetricIds.includes(m.id))}
                    onChange={(_, v): void => setSelectedMetricIds(v.map((m) => m.id))}
                    getOptionLabel={(m): string => m.label}
                    isOptionEqualToValue={(a, b): boolean => a.id === b.id}
                    fullWidth
                  />

                  <CustomTabs
                    value={includeVariantSummary ? 'on' : 'off'}
                    variant="pill"
                    size="small"
                    tabs={[
                      { label: 'Include variant summary', value: 'on' },
                      { label: 'Hide', value: 'off' },
                    ]}
                    onChange={(_, v): void => setIncludeVariantSummary(v === 'on')}
                  />

                  <CustomAutocomplete<{ id: PlotBlockType; label: string }, true, false, false>
                    multiple
                    label="Plots to include"
                    options={plotOptions}
                    value={plotOptions.filter((o) => plotBlocks.includes(o.id))}
                    onChange={(_, v): void => setPlotBlocks(v.map((x) => x.id))}
                    getOptionLabel={(o): string => o.label}
                    isOptionEqualToValue={(a, b): boolean => a.id === b.id}
                    fullWidth
                  />

                  <CustomButton
                    variant="bold"
                    size="small"
                    label={isExporting ? 'Generating PDF...' : 'Download PDF'}
                    disabled={subjects.length === 0 || isExporting}
                    loading={isExporting}
                    onClick={async (): Promise<void> => {
                      if (!reportRef.current) return;
                      setIsExporting(true);
                      try {
                        await waitForImages(reportRef.current);
                        const blob = await generateReportPDF({
                          element: reportRef.current,
                          forcePageBreak: '.page-break',
                          keepTogether: '.keep-together',
                        });
                        if (blob) {
                          const date = new Date();
                          const y = date.getFullYear();
                          const m = String(date.getMonth() + 1).padStart(2, '0');
                          const d = String(date.getDate()).padStart(2, '0');
                          saveAs(blob, `Comparison_${safeFilePart(subjectTitle)}_${y}${m}${d}.pdf`);
                        }
                      } finally {
                        setIsExporting(false);
                      }
                    }}
                  />
                </Box>
              </BuilderPane>

              <PreviewPane>
                <Box sx={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <CustomTypography variant="titleRegular" fontWeight="bold">
                    Report preview
                  </CustomTypography>
                  <CustomTypography variant="bodySmall" sx={{ color: corePalette.grey200 }}>
                    {subjects.length} subject(s)
                  </CustomTypography>
                </Box>

                <ReportPreviewPaper ref={reportRef}>
                  <Box sx={{ marginBottom: '16px' }}>
                    <CustomTypography variant="titleRegular" fontWeight="bold">
                      Comparison report
                    </CustomTypography>
                    <CustomTypography variant="bodySmall" sx={{ color: corePalette.grey200 }}>
                      {subjectTitle}
                    </CustomTypography>
                  </Box>

                  <Box className="keep-together">
                    <ComparisonMetricsTable
                      subjects={subjects}
                      metrics={selectedMetrics}
                    />
                  </Box>

                  {includeVariantSummary && subjects.length > 0 && (
                    <>
                      <Box sx={{ height: 16 }} />
                      <Grid container direction="column" gap="16px">
                        {subjects.map((s, idx) => (
                          <Box key={`summary-${s.id}`}>
                            {idx > 0 && <div className="page-break" />}
                            <Box className="keep-together">
                              <ReportableVariantsSummary subject={s} />
                            </Box>
                          </Box>
                        ))}
                      </Grid>
                    </>
                  )}

                  {plotBlocks.length > 0 && subjects.length > 0 && (
                    <>
                      <Box sx={{ height: 16 }} />
                      <Grid container direction="column" gap="16px">
                        {subjects.map((s, idx) => (
                          <Box key={`plots-${s.id}`}>
                            {idx > 0 && <div className="page-break" />}
                            <SubjectPlots subject={s} enabled={plotBlocks} />
                          </Box>
                        ))}
                      </Grid>
                    </>
                  )}
                </ReportPreviewPaper>
              </PreviewPane>
            </Grid>
          </Body>
        </Grid>
      </Content>
    </Page>
  );
}

