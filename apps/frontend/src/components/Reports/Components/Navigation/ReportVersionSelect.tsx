import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { ChevronDown } from 'lucide-react';
import {
  ReactNode, useEffect, useState, type JSX, useMemo,
} from 'react';
import { GermlineConsentChip } from '@/components/Chips/GermlineConsentChip';
import CustomTypography from '@/components/Common/Typography';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { corePalette } from '@/themes/colours';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { IReport, ReportType } from '@/types/Reports/Reports.types';
import ItemButton from '../../../Buttons/ItemButton';
import CustomButton from '../../../Common/Button';
import { CombinedReportCheckbox } from './CombinedReportCheckbox';
import GeneratedReportButton from './GeneratedReportButton';
import { GermlineAttachmentSelection } from './GermlineAttachmentSelection';
import { PreclinicalSampleSelect } from './PreclinicalSampleSelect';
import { ReportApprovalButtons } from './ReportApprovalButtons';
import { CustomCheckbox } from '@/components/Input/CustomCheckbox';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { boolToStr, strToBool } from '@/utils/functions/bools';

interface IReportVersionSelectProps {
  reportName: ReactNode;
  reportType: ReportType;
}

export default function ReportVersionSelect({
  reportName,
  reportType,
}: IReportVersionSelectProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { analysisSet, demographics } = useAnalysisSet();
  const {
    pendingReport,
    reportType: selectedReportType,
    setReportType,
    selectedReport,
    setSelectedReport,
    isGeneratingReport,
    germlineFindings,
    isAssignedClinician,
    isAssignedCurator,
    reportMetadata,
    updateMetadata,
  } = useReport();
  const canEditMetadata = useIsUserAuthorised('report.meta.write', isAssignedCurator, isAssignedClinician);

  const [showingReports, setShowingReports] = useState(
    reportType === selectedReportType && !pendingReport,
  );
  const [generatedReports, setGeneratedReports] = useState<IReport[]>([]);
  const [clinicalVersionExists, setClinicalVersionExists] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const germlineNoFindingsReportsForceApproval = useMemo(
    () => strToBool(reportMetadata?.['germline.forceApproval']) ?? false,
    [reportMetadata],
  );

  const handleSelectReport = (): void => {
    if (!(
      (!selectedReport || selectedReport.status === 'pending')
      && reportType === selectedReportType
    )) {
      setReportType(reportType);
      setSelectedReport(null);
    }
  };

  useEffect(() => {
    if (showingReports) {
      const getGeneratedReports = async (): Promise<IReport[]> => {
        const reports = await zeroDashSdk.services.reports.getReports({
          analysisSetIds: [analysisSet.analysisSetId],
          types: [reportType],
          statuses: ['approved'],
        });
        return reports;
      };

      setLoading(true);
      getGeneratedReports()
        .then((reports) => {
          setGeneratedReports(reports);
        })
        .finally(() => setLoading(false));
    }
  }, [reportType, analysisSet.analysisSetId, showingReports, zeroDashSdk.services.reports]);

  useEffect(() => {
    if (generatedReports.some((r) => r.id === selectedReport?.id)) {
      setShowingReports(true);
    }
  }, [generatedReports, selectedReport?.id]);

  useEffect(() => {
    zeroDashSdk.mtb.clinical.getLatestClinicalVersion(analysisSet.analysisSetId)
      .then((resp) => setClinicalVersionExists(!!resp));
  }, [analysisSet.analysisSetId, zeroDashSdk.mtb.clinical]);

  return (
    <Box
      paddingBottom="20px"
      marginBottom="20px"
      paddingLeft="8px"
      borderBottom={`1px solid ${corePalette.grey50}`}
    >
      <ItemButton
        mainText={reportName}
        subText={(
          <Box display="flex" flexDirection="column" gap="16px" width="100%">
            <Box display="flex" alignItems="center" justifyContent="space-between" gap="8px" width="100%">
              <CustomTypography variant="bodySmall" style={{ color: '#8292A6' }}>
                Preview Mode
              </CustomTypography>
              {reportType === 'GERMLINE_REPORT' && demographics && (
                <GermlineConsentChip germlineConsent={demographics} />
              )}
            </Box>
          </Box>
        )}
        handleClick={handleSelectReport}
        isActive={
          (!selectedReport || selectedReport.status === 'pending') && reportType === selectedReportType
        }
        additionalContent={
          reportType === selectedReportType
            ? (
              <Box display="flex" flexDirection="column" gap="16px" width="100%" paddingTop="16px">
                {reportType === 'MOLECULAR_REPORT' && <CombinedReportCheckbox />}
                {reportType === 'GERMLINE_REPORT' && (
                  <>
                    {!germlineFindings && (
                      <CustomCheckbox
                        labelProps={{ label: 'Allow editing' }}
                        checked={germlineNoFindingsReportsForceApproval}
                        onChange={() => {
                          updateMetadata({ ...reportMetadata, 'germline.forceApproval': boolToStr(!germlineNoFindingsReportsForceApproval) });
                        }}
                        disabled={!canEditMetadata}
                      />
                    )}
                    <GermlineAttachmentSelection />
                  </>
                )}
                {reportType === 'PRECLINICAL_REPORT' && !pendingReport && <PreclinicalSampleSelect />}
                <ReportApprovalButtons reportType={reportType} />
              </Box>
            ) : (
              undefined
            )
        }
        disabled={
          (['MTB_REPORT', 'PRECLINICAL_REPORT'].includes(reportType) && !clinicalVersionExists)
          || Boolean(isGeneratingReport)
        }
      />
      <CustomButton
        variant="text"
        label="Generated Reports"
        style={{
          marginTop: '16px',
          border: 'none',
          padding: '7px 8px',
        }}
        startIcon={(
          <ChevronDown
            style={{
              transform: showingReports ? 'rotate(-180deg)' : undefined,
            }}
          />
        )}
        onClick={(): void => setShowingReports(!showingReports)}
        disabled={loading}
      />
      {showingReports && (
        <Box display="flex" flexDirection="column" paddingLeft="16px">
          {generatedReports
            .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))
            .map((report, index, self) => (
              <GeneratedReportButton
                key={report.id}
                report={report}
                version={self.length - index}
              />
            ))}
        </Box>
      )}
    </Box>
  );
}
