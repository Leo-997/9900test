import { Box, IconButton, styled } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { useSnackbar } from 'notistack';
import {
  useEffect, useMemo, useState, type JSX,
} from 'react';
import { corePalette } from '@/themes/colours';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { useUser } from '@/contexts/UserContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { IApproval } from '@/types/Reports/Approvals.types';
import { GermlineReportAttachmentOptions, IReport, ReportType } from '@/types/Reports/Reports.types';
import CustomButton from '../../../Common/Button';
import CustomTypography from '../../../Common/Typography';
import { ApproverRow } from './ApproverRow';
import { getAgeFromDob } from '@/utils/functions/getAgeFromDob';
import { strToBool } from '@/utils/functions/bools';

const ApprovalsContainer = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.colours.core.yellow150}`,
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const Message = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '8px',
  gap: '8px',
  backgroundColor: theme.colours.core.yellow10,
}));

const MessageDot = styled(Box)(({ theme }) => ({
  width: '8px',
  height: '8px',
  backgroundColor: theme.colours.core.yellow150,
  borderRadius: '50%',
  flex: 'none',
  order: 0,
  flexGrow: 0,
}));

interface IReportApprovalButtonsProps {
  reportType: ReportType;
}

export function ReportApprovalButtons({
  reportType,
}: IReportApprovalButtonsProps): JSX.Element {
  const { currentUser } = useUser();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    pendingReport,
    analysisSetId,
    demographics,
    selectedReport,
    approvals,
    approve,
    submitForApproval,
    isGeneratingReport,
    setIsGeneratingReport,
    germlineFindings,
    setGenerateRedactedReport,
    setIsApproving,
    isApproving,
    reportMetadata,
    isReadOnly,
  } = useReport();

  const [showApprovers, setShowApprovers] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [approvedReports, setApprovedReports] = useState<IReport[]>([]);

  const canRedact = useIsUserAuthorised('report.redacted.write') && !isReadOnly;
  const canSubmit = useIsUserAuthorised('report.assign') && !isReadOnly;
  const canFinalise = useIsUserAuthorised('report.finalise') && !isReadOnly;

  const germlineAttachments = useMemo((): GermlineReportAttachmentOptions[] => (
    reportMetadata?.['germline.attachments']
      ? JSON.parse(reportMetadata['germline.attachments'])
      : []
  ), [reportMetadata]);

  const germlineNoFindingsReportsForceApproval = useMemo(
    () => strToBool(reportMetadata?.['germline.forceApproval']) ?? false,
    [reportMetadata],
  );

  const getValidApproval = (): IApproval | null => {
    for (const approval of approvals) {
      if (
        approval.status === 'pending'
        && approval.assigneeId
        && currentUser
        && approval.assigneeId === currentUser.id
        && approval.showOnReport
      ) {
        return approval;
      }
    }
    return null;
  };

  const canApprove = (): boolean => {
    const approvable = getValidApproval();
    const needsGermlineAttachment = reportType === 'GERMLINE_REPORT'
    && (
      germlineFindings
      || (!germlineFindings && demographics && getAgeFromDob(demographics).age >= 18)
    ) && germlineAttachments.length === 0;
    return Boolean(approvable && selectedReport?.status === 'pending' && !needsGermlineAttachment);
  };

  const canFinaliseReport = (): boolean => {
    const allAssignedOrCancelled = approvals.every(
      (a) => a.assigneeId || a.status === 'cancelled' || !a.showOnReport,
    );
    const allApproved = approvals.every(
      (a) => a.status === 'approved' || a.status === 'cancelled' || !a.showOnReport,
    );

    const germlineConsent = Boolean(demographics?.germlineConsent)
      || (Boolean(demographics?.category1Consent) && Boolean(demographics?.category2Consent));

    const hasCorrectAttachments = (
    // For germline reports we need at least 1 attachment
      reportType === 'GERMLINE_REPORT' && germlineAttachments.length > 0
    )

      // we don't need attachments for other report types
      || reportType !== 'GERMLINE_REPORT';

    // Germline no findings reports with full consent
    // can be generated without all approvals being approved
    const isFinalisableGermline = reportType === 'GERMLINE_REPORT'
      && !germlineFindings
      && allAssignedOrCancelled
      && germlineConsent
      && !germlineNoFindingsReportsForceApproval;

    return canFinalise && hasCorrectAttachments && (isFinalisableGermline || allApproved);
  };

  const canGetRedacted = (): boolean => (
    Boolean(
      approvedReports?.length
      && approvedReports[0].approvals?.length
      && selectedReport === null
      && reportType === 'MOLECULAR_REPORT'
      && canRedact,
    )
  );

  const approveReport = (): void => {
    const approval = getValidApproval();
    if (approval) {
      setIsApproving(approval);
    }
  };

  const finaliseReport = async (): Promise<void> => {
    setLoading(true);
    await Promise.all(
      approvals
        .filter((approval) => approval.status === 'pending')
        .map((approval) => (
          approve(approval.id, false)
        )),
    );
    setIsApproving('Finalise');
    setLoading(false);
  };

  const handleGenerateRedacted = (report: IReport): void => {
    if (
      report.approvals?.length
      && report.approvals.every((a) => a.status === 'approved' || a.status === 'cancelled')
    ) {
      setGenerateRedactedReport(report);
      setIsGeneratingReport('redacted');
    }
  };

  const handleSubmitApproval = async (): Promise<void> => {
    setLoading(true);
    try {
      await submitForApproval();
    } catch {
      enqueueSnackbar('Could not submit for approval, please try again', { variant: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    zeroDashSdk.services.reports.getReports({
      analysisSetIds: [analysisSetId],
      types: [reportType],
      includeApprovals: true,
      statuses: ['approved'],
    })
      .then((resp) => setApprovedReports(resp));
  }, [reportType, analysisSetId, zeroDashSdk.services.reports]);

  if (demographics === undefined) {
    return <div />;
  }

  return (
    <Box display="flex" flexDirection="column" width="100%" gap="16px">
      {pendingReport
        && approvals.filter((a) => a.showOnReport).length > 0
        && approvals.every((a) => a.reportId === pendingReport.id)
        && pendingReport.type === reportType
        && (
          <>
            {approvals.filter((a) => !a.showOnReport).map((approval) => (
              <ApproverRow approval={approval} key={approval.id} />
            ))}
            <Box width="100%" height="1px" sx={{ backgroundColor: corePalette.grey50 }} />
          </>
        )}
      { !pendingReport
        && canSubmit
        && (
          <>
            <ApprovalsContainer>
              <Message>
                <MessageDot />
                <CustomTypography variant="bodySmall" fontWeight="medium">
                  Awaiting sign off
                </CustomTypography>
              </Message>
            </ApprovalsContainer>
            <Box>
              <CustomButton
                variant="outline"
                label="Prepare report"
                onClick={handleSubmitApproval}
                size="small"
                style={{ borderRadius: '90px', minWidth: '130px' }}
                loading={loading}
              />
            </Box>
          </>
        )}
      { pendingReport
        && approvals.every((a) => a.reportId === pendingReport.id)
        && pendingReport.type === reportType
        && (
          <>
            <ApprovalsContainer>
              <Message>
                <MessageDot />
                <CustomTypography variant="bodySmall" fontWeight="medium">
                  Awaiting sign off
                </CustomTypography>
                <IconButton
                  style={{ padding: '8px 2px' }}
                  onClick={(): void => setShowApprovers(!showApprovers)}
                >
                  <ChevronDown
                    width="22px"
                    height="20px"
                    style={{
                      rotate: showApprovers ? '180deg' : 'none',
                    }}
                  />
                </IconButton>
              </Message>
              {showApprovers && approvals.filter((a) => a.showOnReport).map((approval) => (
                <ApproverRow approval={approval} key={`${approval.id}_${approval.assigneeId}`} />
              ))}
            </ApprovalsContainer>
            <Box display="flex" columnGap="16px" alignItems="center">
              {canFinaliseReport() && (
                <CustomButton
                  variant="bold"
                  size="small"
                  label="Finalise report"
                  onClick={finaliseReport}
                  style={{ minWidth: '142px' }}
                  loading={Boolean(isGeneratingReport || loading || isApproving === 'Finalise')}
                />
              )}
              {canApprove() && !canFinaliseReport() && (
                <CustomButton
                  variant="bold"
                  size="small"
                  label="Approve"
                  onClick={approveReport}
                  style={{ minWidth: '142px' }}
                  loading={Boolean(isGeneratingReport || loading || isApproving)}
                />
              )}
            </Box>
          </>
        )}
      { canGetRedacted() && (
        <CustomButton
          variant="bold"
          size="small"
          label="Generate redacted report"
          onClick={(): void => handleGenerateRedacted(approvedReports[0])}
          style={{ width: '200px' }}
          loading={Boolean(isGeneratingReport || loading)}
        />
      )}
    </Box>
  );
}
