import { saveAs } from '@progress/kendo-file-saver';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from 'react';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { reportOptions } from '@/constants/Reports/reports';
import { highRiskCohorts } from '@/constants/sample';
import { LoadingPage } from '@/pages/Loading/Loading';
import { Group } from '@/types/Auth/Group.types';
import getPrimaryBiosample from '@/utils/functions/biosamples/getPrimaryBiosample';
import { FileType } from '@/types/FileTracker/FileTracker.types';
import { IPatientDemographics } from '@/types/Patient/Patient.types';
import { IApproval, ICreateApproval, Label } from '@/types/Reports/Approvals.types';
import {
  GermlineReportAttachmentOptions,
  IReport,
  IRequiredGroup,
  IUpdateReportMetadataKey,
  ReportGenerationType, ReportMetadata,
  ReportType,
} from '@/types/Reports/Reports.types';
import { useAnalysisSet } from '../AnalysisSetContext';
import { useUser } from '../UserContext';
import { useZeroDashSdk } from '../ZeroDashSdkContext';
import { usePatient } from '../PatientContext';
import { getAgeFromDob } from '@/utils/functions/getAgeFromDob';

interface IProps {
  initialReportType?: ReportType;
}

interface ICurrentReport {
  patientId: string;
  analysisSetId: string;
  demographics?: IPatientDemographics | null;
  isAssignedClinician: boolean;
  isAssignedCurator: boolean;
  isReadOnly: boolean;
  pendingReport: IReport | null;
  selectedReport: IReport | null | undefined;
  setSelectedReport: Dispatch<SetStateAction<IReport | null | undefined>>;
  reportMetadata?: ReportMetadata;
  reportType: ReportType;
  setReportType: (type: ReportType) => void;
  isGeneratingReport: ReportGenerationType | null;
  setIsGeneratingReport: Dispatch<SetStateAction<ReportGenerationType | null>>;
  generateRedactedReport?: IReport;
  setGenerateRedactedReport: Dispatch<SetStateAction<IReport | undefined>>;
  copyPrevReportComments: boolean;
  setCopyPrevReportComments: Dispatch<SetStateAction<boolean>>;
  approvals: IApproval[];
  isApproving: 'Finalise' | IApproval | null;
  setIsApproving: Dispatch<SetStateAction<'Finalise' | IApproval | null>>;
  approve: (approvalId: string, sendNotifications: boolean) => Promise<void>;
  setApprovals: Dispatch<SetStateAction<IApproval[]>>;
  prevGermlineReport: IReport | null;
  getRequiredApprovals: (previousApprovals: IApproval[], germline?: boolean) => ICreateApproval[],
  germlineFindings: boolean;
  setGermlineFindings: Dispatch<SetStateAction<boolean>>;
  submitForApproval: () => Promise<void>;
  updateMetadata: (metadata: ReportMetadata) => Promise<void>;
  uploadReport: (fileBlob: Blob, fileType: FileType) => Promise<void>;
  getReportFileName: (report: IReport, redacted?: boolean, fileType?: FileType) => Promise<string>;
  downloadReport: (report: IReport) => Promise<void>;
}

export const CurrentReportContext = createContext<ICurrentReport | undefined>(undefined);
CurrentReportContext.displayName = 'CurrentReportContext';

export const useReport = (): ICurrentReport => {
  const context = useContext(CurrentReportContext);

  if (!context) throw new Error('Report context is not available at this scope');

  return context;
};

export function CurrentReportProvider({
  initialReportType = 'MOLECULAR_REPORT',
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { patientId, analysisSetId } = useParams();
  const [search] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const {
    groups,
    currentUser,
    getGroupById,
  } = useUser();
  const { isReadOnly: isPatientReadOnly } = usePatient();
  const { analysisSet, demographics, isReadOnly: isAnalysisSetIsReadOnly } = useAnalysisSet();

  const isReadOnly = useMemo(() => (
    isAnalysisSetIsReadOnly || isPatientReadOnly
  ), [isPatientReadOnly, isAnalysisSetIsReadOnly]);

  const [pendingReport, setPendingReport] = useState<IReport | null>(null);
  const [selectedReport, setSelectedReport] = useState<IReport | null>();
  const [reportType, setReportType] = useState<ReportType>((search.get('reportType') as ReportType) ?? initialReportType);
  const [approvals, setApprovals] = useState<IApproval[]>([]);
  const [isApproving, setIsApproving] = useState<'Finalise' | IApproval | null>(null);
  const [prevGermlineReport, setPrevGermlineReport] = useState<IReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<ReportGenerationType | null>(null);
  const [germlineFindings, setGermlineFindings] = useState<boolean>(false);
  const [generateRedactedReport, setGenerateRedactedReport] = useState<IReport>();
  const [copyPrevReportComments, setCopyPrevReportComments] = useState<boolean>(false);

  const defaultMetadata = useMemo((): ReportMetadata => {
    if (reportType === 'MOLECULAR_REPORT') {
      return {
        'molecular.hidePanel': `${highRiskCohorts.some((c) => c === analysisSet.cohort)}`,
      };
    }
    if (reportType === 'GERMLINE_REPORT') {
      const attachments: GermlineReportAttachmentOptions[] = [];
      const fullConsent = Boolean(
        demographics?.germlineConsent
        || (
          demographics?.category1Consent
          && demographics?.category2Consent
        ),
      );

      if (fullConsent && germlineFindings) {
        attachments.push('Genetics contact list');
      }

      if (!germlineFindings && demographics) {
        if (fullConsent && getAgeFromDob(demographics, true).age < 18) {
          attachments.push('No findings factsheet');
        } else if (
          demographics?.category2Consent === false
          || demographics.germlineConsent === false
        ) {
          attachments.push('No attachment');
        }
      }

      return {
        'germline.attachments': JSON.stringify(attachments),
      };
    }
    return {};
  }, [
    demographics,
    germlineFindings,
    reportType,
    analysisSet.cohort,
  ]);

  const [reportMetadata, setReportMetadata] = useState<ReportMetadata>(defaultMetadata);

  const isAssignedClinician = useMemo(() => {
    if (reportType === 'MOLECULAR_REPORT') {
      return approvals.some((a) => (
        ['MolecularOncologists', 'CancerGeneticists'].includes(a.groupName ?? '')
        && a.assigneeId === currentUser?.id
      ));
    }

    if (reportType === 'GERMLINE_REPORT') {
      return approvals.some((a) => a.groupName === 'CancerGeneticists' && a.assigneeId === currentUser?.id);
    }

    if (reportType === 'PRECLINICAL_REPORT' || reportType === 'MTB_REPORT') {
      return approvals.some((a) => (
        ['MolecularOncologists', 'ClinicalFellows', 'MTBChairs'].includes(a.groupName ?? '')
        && a.assigneeId === currentUser?.id
      ));
    }

    return false;
  }, [approvals, currentUser?.id, reportType]);

  const isAssignedCurator = useMemo(() => (
    approvals.some((a) => a.groupName === 'Curators' && a.assigneeId === currentUser?.id)
    || analysisSet.primaryCuratorId === currentUser?.id
    || analysisSet.secondaryCuratorId === currentUser?.id
  ), [analysisSet.primaryCuratorId, analysisSet.secondaryCuratorId, approvals, currentUser?.id]);

  const getReportApprovals = useCallback(() => {
    if (pendingReport?.id) {
      zeroDashSdk.services.reports.getApprovals({
        reportId: pendingReport.id,
      })
        .then((resp) => {
          setApprovals(resp.map((a) => ({
            ...a,
            groupName: getGroupById(a.groupId),
          })));
        });
    } else {
      setApprovals([]);
    }
  }, [getGroupById, pendingReport?.id, zeroDashSdk.services.reports]);

  const approve = useCallback(async (
    approvalId: string,
    sendNotifications: boolean,
  ): Promise<void> => {
    await zeroDashSdk.services.reports.updateApproval(
      approvalId,
      {
        patientId,
        status: 'approved',
        sendNotifications,
      },
    );

    setApprovals((prev) => prev.map((a) => ({
      ...a,
      status: a.id === approvalId
        ? 'approved'
        : a.status,
    })));
  }, [patientId, zeroDashSdk.services.reports]);

  const getRequiredApprovals = useCallback((
    previousApprovals: IApproval[],
    germline?: boolean,
  ): ICreateApproval[] => {
    const apps: ICreateApproval[] = [];

    const requiredGroups: IRequiredGroup[] = [];
    if (reportType === 'MOLECULAR_REPORT') {
      requiredGroups.push({ group: 'Curators', label: 'Reported by' });
      requiredGroups.push({ group: 'MolecularOncologists' });
      if (germline) requiredGroups.push({ group: 'CancerGeneticists' });
    }

    if (reportType === 'MTB_REPORT' || reportType === 'PRECLINICAL_REPORT') {
      requiredGroups.push(
        { group: 'Curators', showOnReport: false, status: 'approved' },
        { group: 'MolecularOncologists' },
        { group: 'MTBChairs' },
        { group: 'ClinicalFellows', label: 'Reported by' },
      );
    }

    if (reportType === 'GERMLINE_REPORT') {
      if (germline) {
        requiredGroups.push(
          { group: 'CancerGeneticists', label: 'Reported by' },
          { group: 'CancerGeneticists', label: 'Authorised by' },
        );
      } else {
        requiredGroups.push({ group: 'Curators', label: 'Reported by' });
        requiredGroups.push({ group: 'CancerGeneticists' });
      }
    }

    const getAssignee = (
      prevApprovals: IApproval[],
      groupName: Group | undefined,
      label: Label | undefined,
    ): string | null | undefined => {
      if (typeof label === 'string') {
        return prevApprovals.find((a) => a.label === label)?.assigneeId;
      }
      if (prevApprovals && prevApprovals.length > 0) {
        return prevApprovals.find((a) => a.groupName === groupName)?.assigneeId;
      }
      return undefined;
    };

    for (const group of requiredGroups) {
      const groupId = groups.find((g) => g.name === group.group)?.id;
      apps.push({
        status: group.status || 'pending',
        groupId,
        label: group.label || null,
        assigneeId: getAssignee(previousApprovals, group.group, group.label),
        showOnReport: group.showOnReport,
      });
    }

    return apps;
  }, [reportType, groups]);

  const submitForApproval = useCallback(async (): Promise<void> => {
    if (!analysisSetId) return;
    if (pendingReport?.status === 'pending') {
      // Cancel pending approvals and report.
      // Really shouldn't get here, but better be safe.
      await Promise.all(approvals.map((a) => (
        zeroDashSdk.services.reports.updateApproval(a.id, { status: 'cancelled' })
      )));
      await zeroDashSdk.services.reports.updateReport(pendingReport.id, { status: 'cancelled' });
    }

    const prevReports = await zeroDashSdk.services.reports.getReports({
      analysisSetIds: [analysisSetId],
      types: [reportType],
      statuses: ['approved'],
      sortColumns: ['finalised'],
      sortDirections: ['desc'],
    });

    let prevApprovals: IApproval[] = [];
    if (prevReports[0]) {
      prevApprovals = await zeroDashSdk.services.reports.getApprovals({
        reportId: prevReports[0].id,
      })
        .then((resp) => resp.map((a) => ({
          ...a,
          groupName: getGroupById(a.groupId),
        })));
    }

    const newReportId = await zeroDashSdk.services.reports.createReport({
      analysisSetId,
      type: reportType,
      status: 'pending',
    });

    if (Object.values(reportMetadata).some((v) => v !== undefined)) {
      await zeroDashSdk.services.reports.updateReportMetadata(
        newReportId,
        Object.entries(reportMetadata)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => ({ key, value })) as IUpdateReportMetadataKey[],
      );
    }

    const requiredApprovals: ICreateApproval[] = getRequiredApprovals(
      prevApprovals,
      germlineFindings,
    );

    await zeroDashSdk.services.reports.createApprovals({
      reportId: newReportId,
      approvals: requiredApprovals,
    });

    setPendingReport({
      id: newReportId,
      analysisSetId,
      type: reportType,
      status: 'pending',
      pseudoStatus: null,
      approvedAt: null,
      metadata: { ...reportMetadata },
      createdBy: currentUser?.id || '',
      createdAt: dayjs().toISOString(),
    });
    if (prevReports[0]) {
      setCopyPrevReportComments(true);
    }
    setSelectedReport(null);
    getReportApprovals();
  }, [
    getGroupById,
    approvals,
    germlineFindings,
    getReportApprovals,
    getRequiredApprovals,
    reportType,
    analysisSetId,
    pendingReport?.id,
    pendingReport?.status,
    reportMetadata,
    zeroDashSdk.services.reports,
    currentUser?.id,
  ]);

  const updateMetadata = useCallback(async (metadata: ReportMetadata) => {
    setReportMetadata(metadata);
    if (pendingReport?.id) {
      try {
        await zeroDashSdk.services.reports.updateReportMetadata(
          pendingReport?.id,
          Object.entries(metadata)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => ({ key, value })) as IUpdateReportMetadataKey[],
        );
        setPendingReport({
          ...pendingReport,
          metadata,
        });
      } catch {
        enqueueSnackbar('Could not update report, please try again', { variant: 'error' });
      }
    }
  }, [enqueueSnackbar, pendingReport, zeroDashSdk.services.reports]);

  const uploadReport = useCallback(async (fileBlob: Blob, fileType: FileType) => {
    if (pendingReport?.id) {
      const fileName = `${analysisSetId}-${reportType}-${dayjs().toISOString()}.${fileType}`;
      const key = `report/${analysisSetId}/${reportType}/${fileName}`;
      const fileId = await zeroDashSdk.filetracker.uploadFile(
        fileBlob,
        {
          analysisSetId,
          fileName,
          key,
          fileType,
          isHidden: true,
        },
      );
      await zeroDashSdk.services.reports.updateReport(
        pendingReport.id,
        {
          fileId,
          status: 'approved',
        },
      );
      setPendingReport(null);
      setSelectedReport(null);
    }
  }, [
    reportType,
    analysisSetId,
    pendingReport?.id,
    zeroDashSdk.filetracker,
    zeroDashSdk.services.reports,
  ]);

  const getReportFileName = useCallback(async (
    report: IReport,
    redacted = false,
    fileType: FileType = 'pdf',
  ): Promise<string> => {
    if (!analysisSetId) return '';
    const type = report.fileId
      ? (await zeroDashSdk.filetracker.getFile(report.fileId)).fileType
      : fileType;
    const aset = await zeroDashSdk.curation.analysisSets.getAnalysisSetById(
      analysisSetId,
    );
    const primaryBiosample = getPrimaryBiosample(aset?.biosamples ?? []);

    const name = reportOptions.find((o) => o.value === report.type)?.downloadName;
    const patientName = `_${demographics?.firstName} ${demographics?.lastName?.toUpperCase()}`;
    const date = dayjs(report.approvedAt ?? undefined).format('YYYYMMDD');
    return `ZERO2_${name}_${patientId}_${primaryBiosample?.biomaterialId}${redacted ? '' : patientName}_${date}.${type}`;
  }, [
    patientId,
    analysisSetId,
    demographics,
    zeroDashSdk.filetracker,
    zeroDashSdk.curation.analysisSets,
  ]);

  const downloadReport = useCallback(async (report: IReport): Promise<void> => {
    const fileName = await getReportFileName(report);
    if (fileName && report.fileId) {
      const file = await zeroDashSdk.filetracker.getFile(report.fileId);
      const fileBlob = await zeroDashSdk.filetracker.downloadFile(file?.fileId);
      saveAs(fileBlob, fileName);
    }
  }, [zeroDashSdk.filetracker, getReportFileName]);

  useEffect(() => {
    if (pendingReport) {
      getReportApprovals();
      setReportMetadata(pendingReport.metadata || defaultMetadata);
    } else {
      setApprovals([]);
      setReportMetadata(defaultMetadata);
    }
  }, [pendingReport, getReportApprovals, defaultMetadata]);

  useEffect(() => {
    if (selectedReport === null) {
      setSelectedReport(pendingReport);
    }
  }, [pendingReport, selectedReport]);

  // check if there was a previous germline report for this patient
  useEffect(() => {
    zeroDashSdk.curation.analysisSets.getAnalysisSetPatients({ patientId })
      .then((sets) => (
        sets.length > 0
          ? zeroDashSdk.services.reports.getReports({
            analysisSetIds: sets.flatMap((s) => s.analysisSets.map((a) => a.analysisSetId)),
            statuses: ['approved'],
            types: ['GERMLINE_REPORT'],
          })
          : Promise.resolve([])
      ))
      .then((reports) => setPrevGermlineReport(reports[0]));
  }, [patientId, zeroDashSdk.curation.analysisSets, zeroDashSdk.services.reports]);

  useEffect(() => {
    // get a pending report whenever the report type changes
    if (analysisSetId && selectedReport !== undefined) {
      zeroDashSdk.services.reports.getReports({
        analysisSetIds: [analysisSetId],
        types: [reportType],
        statuses: ['pending'],
      })
        .then((resp) => setPendingReport(resp[0] || null));
    }
  }, [analysisSetId, reportType, selectedReport, zeroDashSdk.services.reports]);

  useEffect(() => {
    const reportId = search.get('reportId');
    const inputReportType = search.get('reportType');
    if (reportId) {
      zeroDashSdk.services.reports.getReportById(reportId)
        .then(setSelectedReport)
        .catch(() => setSelectedReport(null));
    } else if (inputReportType) {
      setReportType(inputReportType as ReportType);
      setSelectedReport(null);
    } else {
      setSelectedReport(null);
    }
  }, [search, zeroDashSdk.services.reports]);

  const value = useMemo(() => {
    const sortApprovals = (approval: IApproval): number => {
      let order: number;
      switch (approval.groupName) {
        case 'Curators':
          order = 1;
          break;
        case 'ClinicalFellows':
          order = 2;
          break;
        case 'CancerGeneticists':
          order = 3;
          break;
        case 'MolecularOncologists':
          order = 4;
          break;
        case 'MTBChairs':
          order = 5;
          break;
        default:
          order = 6;
          break;
      }
      // If two comparing items have the same role name, sorting is decided by label
      // An item with 'Reported by' label should be displayed first
      if (approval.label === 'Reported by') {
        order -= 0.5;
      }
      return order;
    };
    return {
      patientId: analysisSet.patientId,
      analysisSetId: analysisSet.analysisSetId,
      demographics,
      pendingReport,
      reportMetadata,
      isAssignedClinician,
      isAssignedCurator,
      isReadOnly,
      selectedReport,
      setSelectedReport,
      reportType,
      setReportType,
      isGeneratingReport,
      setIsGeneratingReport,
      approvals: approvals.sort((a, b) => sortApprovals(a) - sortApprovals(b)),
      approve,
      setApprovals,
      isApproving,
      setIsApproving,
      prevGermlineReport,
      getRequiredApprovals,
      germlineFindings,
      setGermlineFindings,
      submitForApproval,
      updateMetadata,
      uploadReport,
      downloadReport,
      getReportFileName,
      generateRedactedReport,
      setGenerateRedactedReport,
      copyPrevReportComments,
      setCopyPrevReportComments,
    };
  }, [
    analysisSet.analysisSetId,
    analysisSet.patientId,
    approvals,
    approve,
    copyPrevReportComments,
    demographics,
    downloadReport,
    generateRedactedReport,
    germlineFindings,
    getReportFileName,
    getRequiredApprovals,
    isApproving,
    isAssignedClinician,
    isAssignedCurator,
    isGeneratingReport,
    isReadOnly,
    pendingReport,
    prevGermlineReport,
    reportMetadata,
    reportType,
    selectedReport,
    submitForApproval,
    updateMetadata,
    uploadReport]);

  return selectedReport === undefined
    ? <LoadingPage />
    : (
      <CurrentReportContext.Provider value={value}>
        <Outlet />
      </CurrentReportContext.Provider>
    );
}
