import {
  Box as MuiBox,
  styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useEffect, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { reportOptions } from '@/constants/Reports/reports';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IPatient } from '@/types/Patient/Patient.types';
import mapEvent from '@/utils/functions/mapEvent';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { approvalStatusMap } from '@/constants/Reports/status';
import { useUser } from '@/contexts/UserContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { IUser } from '@/types/Auth/User.types';
import { ClinicalReviewStatus } from '@/types/MTB/ClinicalStatus.types';
import { ApprovalStatus } from '@/types/Reports/Approvals.types';
import { IReport } from '@/types/Reports/Reports.types';
import { mapGroupName } from '@/utils/functions/mapGroupName';
import StatusChip from '../../Chips/StatusChip';
import CustomTypography from '../../Common/Typography';
import { AssigneeButton } from '../../MTB/NavBar/Sample/AssigneeButton';
import Gender from '../../VitalStatus/Gender';

const Row = styled(MuiBox)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  padding: '16px 0px',
  minHeight: '70px',
  minWidth: 'fit-content',
  alignItems: 'stretch',
}));

const Item = styled(MuiBox)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'left',
  backgroundColor: theme.colours.core.white,
  padding: '0px 10px',
  alignItems: 'center',
}));

const ItemLeft = styled(Item)({
  position: 'sticky',
  left: 0,
  paddingLeft: '16px',
});

const ItemRight = styled(Item)({
  position: 'sticky',
  right: 0,
  paddingRight: '16px',
});

const DateChip = styled(CustomTypography)(({ theme }) => ({
  color: theme.colours.core.offBlack100,
  border: `2px solid ${theme.colours.core.grey50}`,
  borderRadius: '6px',
  padding: '0 5px',
  fontSize: '13px',
}));

const useStyles = makeStyles(() => ({
  link: {
    textDecoration: 'none',
    color: 'inherit',
    width: '100%',
  },
}));

interface IProps {
  report: IReport;
  updateReport?: (newReport: IReport) => void;
}

export default function ReportListItem({
  report,
  updateReport,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSDK = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    groups,
    currentUser,
  } = useUser();

  const [analysisSet, setAnalysisSet] = useState<IAnalysisSet>();
  const [patient, setPatient] = useState<IPatient>();

  const isAsetReadOnly = useIsPatientReadOnly({ analysisSetId: report.analysisSetId });
  const canWrite = useIsUserAuthorised('report.assign');
  const canAssignApprover = canWrite && !isAsetReadOnly;

  useEffect(() => {
    zeroDashSDK.curation.analysisSets.getAnalysisSetById(
      report.analysisSetId,
    )
      .then((resp) => (
        zeroDashSDK.patient.getPatientById(resp.patientId)
          .then((patientResp) => {
            setAnalysisSet(resp);
            setPatient(patientResp);
          })
      ));
  }, [report.analysisSetId, zeroDashSDK.curation.analysisSets, zeroDashSDK.patient]);

  const getReportStatusTag = (): JSX.Element[] | undefined => {
    const { chips } = approvalStatusMap[report.status];

    if (chips) {
      return (
        chips.map((chip) => (
          <StatusChip
            {...chip.chipProps}
            maxWidth="calc(100% - 10px)"
          />
        ))
      );
    }

    return undefined;
  };

  const updateApprover = async (user: IUser | null, approvalId: string): Promise<void> => {
    try {
      await zeroDashSDK.services.reports.updateApproval(
        approvalId,
        {
          assigneeId: user?.id || null,
        },
      );
      if (updateReport) {
        updateReport({
          ...report,
          approvals: report.approvals?.map((a) => ({
            ...a,
            assigneeId: a.id === approvalId
              ? user?.id || null
              : a.assigneeId,
          })),
        });
      }
    } catch {
      enqueueSnackbar('Could not update approver, please try again', { variant: 'error' });
    }
  };

  const mapToReviewStatus = (status: ApprovalStatus): ClinicalReviewStatus => {
    switch (status) {
      case 'approved':
        return 'Completed';
      case 'pending':
        return 'Ready for Review';
      default:
        return 'Assigned';
    }
  };

  return (
    <Row display="flex" alignItems="center" padding="16px">
      <ItemLeft
        sx={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          width: '250px',
          borderRadius: '0 0 0 4px',
        }}
      >
        <MuiBox
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          width="100%"
        >
          <Link
            className={classes.link}
            to={`/${analysisSet?.patientId}/${report.analysisSetId}/reports?reportId=${report.id}&reportType=${report.type}`}
          >
            <CustomTypography truncate variant="bodyRegular">
              <b>{analysisSet?.patientId}</b>
            </CustomTypography>
          </Link>
        </MuiBox>
        <MuiBox
          display="flex"
          gap="8px"
        >
          <CustomTypography
            truncate
            variant="bodyRegular"
            sx={{ color: corePalette.grey100 }}
          >
            {`Event: ${analysisSet?.sequencedEvent ? mapEvent(analysisSet?.sequencedEvent, true) : ''}`}
          </CustomTypography>
          {patient?.sex && patient?.vitalStatus && (
            <Gender vitalStatus={patient.vitalStatus} gender={patient?.sex} />
          )}
        </MuiBox>
      </ItemLeft>
      <Item
        sx={{
          minWidth: '200px',
          flex: 2,
        }}
      >
        <CustomTypography variant="bodyRegular">
          {reportOptions.find((o) => o.value === report.type)?.name || '-'}
        </CustomTypography>
      </Item>
      <Item
        sx={{
          minWidth: '110px',
          flex: 1,
        }}
      >
        {getReportStatusTag()}
      </Item>
      <Item
        sx={{
          minWidth: '200px',
          flex: 2,
        }}
      >
        <CustomTypography variant="bodyRegular">
          {analysisSet?.zero2FinalDiagnosis}
        </CustomTypography>
      </Item>
      <Item
        sx={{
          minWidth: '200px',
          flex: 2,
        }}
      >
        <CustomTypography variant="bodyRegular">
          {analysisSet?.cohort}
        </CustomTypography>
      </Item>
      <Item
        sx={{
          width: '65px',
        }}
      >
        <CustomTypography variant="bodyRegular">
          {analysisSet?.sequencedEvent}
        </CustomTypography>
      </Item>
      <Item
        sx={{
          minWidth: '110px',
          flex: 1,
        }}
      >
        {report.createdAt ? (
          <DateChip
            variant="bodyRegular"
            fontWeight="bold"
          >
            {dayjs(report.createdAt).format('DD/MM/YYYY')}
          </DateChip>
        ) : (
          <CustomTypography variant="bodyRegular">-</CustomTypography>
        )}
      </Item>
      <Item
        sx={{
          minWidth: '110px',
          flex: 1,
        }}
      >
        {report.approvedAt
          ? (
            <DateChip
              variant="bodyRegular"
              fontWeight="bold"
            >
              {dayjs(report.approvedAt).format('DD/MM/YYYY')}
            </DateChip>
          ) : (
            <CustomTypography variant="bodyRegular">-</CustomTypography>
          )}
      </Item>
      <ItemRight
        sx={{
          minWidth: '150px',
          flex: 1,
        }}
      >
        {report.approvals?.map((a) => (
          <span style={{ marginLeft: '4px' }}>
            <AssigneeButton
              options={{
                id: a?.assigneeId || null,
                group: a.groupName || undefined,
                groupLabel: (
                  groups.find((g) => g.name === a.groupName)?.name
                    ? mapGroupName(a.groupName || null)
                    : ''
                ),
                reviewStatus: mapToReviewStatus(a.status),
                disabled: !(
                  currentUser?.id === a.assigneeId
                  || currentUser?.groups.some((r) => r.name === a.groupName)
                  || canAssignApprover
                ) || a.status !== 'pending',
                onSelect: (user) => updateApprover(user, a.id),
              }}
            />
          </span>
        ))}
      </ItemRight>
    </Row>
  );
}
