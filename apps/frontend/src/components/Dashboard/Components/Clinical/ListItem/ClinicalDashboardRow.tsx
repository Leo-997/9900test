import {
  Box,
  IconButton,
  TableCell as MuiTableCell,
  styled,
  TableRow,
  Tooltip,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { ClockAlertIcon, Dna, EllipsisVerticalIcon } from 'lucide-react';
import {
  useCallback, useEffect, useMemo, useState, type JSX,
} from 'react';
import { Link } from 'react-router-dom';
import CustomTypography from '@/components/Common/Typography';
import { naStatus } from '@/constants/Common/status';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { Group } from '@/types/Auth/Group.types';
import { ClinicalMeetingType, IClinicalMeeting } from '@/types/Meetings/Meetings.types';
import { IPatient } from '@/types/Patient/Patient.types';
import getPrimaryBiosample from '@/utils/functions/biosamples/getPrimaryBiosample';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { clinicalStatuses } from '../../../../../constants/MTB/navigation';
import { useUser } from '../../../../../contexts/UserContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { IUser } from '../../../../../types/Auth/User.types';
import { IClinicalDashboardSample } from '../../../../../types/Dashboard.types';
import { IReviewWithUser } from '../../../../../types/MTB/MTB.types';
import { IChipProps } from '../../../../../types/Samples/Sample.types';
import mapEvent from '../../../../../utils/functions/mapEvent';
import { FlashingDotsAnimation } from '../../../../Animations/FlashingDotsAnimation';
import StatusChip from '../../../../Chips/StatusChip';
import { AssigneeButton } from '../../../../MTB/NavBar/Sample/AssigneeButton';
import Gender from '../../../../VitalStatus/Gender';
import ClinicalMeetingDateCell from './ClinicalMeetingCell';
import { ClinicalSampleMenu } from './ClinicalSampleMenu';

const TableCell = styled(MuiTableCell)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  border: 'none',
  padding: '16px 16px 16px 0px',
}));

const TableCellLeft = styled(TableCell)({
  position: 'sticky',
  left: 0,
});

const TableCellRight = styled(TableCell)({
  position: 'sticky',
  right: 0,
});

interface IProps {
  data: IClinicalDashboardSample;
  updateSamples?: (sample: IClinicalDashboardSample) => void;
  currentDate?: string;
}

export default function ClinicalDashboardRow({
  data,
  updateSamples,
  currentDate,
}: IProps): JSX.Element {
  const { users } = useUser();
  const zeroDashSdk = useZeroDashSdk();

  const {
    patientId,
    analysisSetId,
    clinicalVersionId,
    vitalStatus,
    zero2FinalDiagnosis,
    expedite,
    clinicalStatus,
    reviewerIds,
    meetings,
  } = data;

  const [sampleOptions, setSampleOptions] = useState<HTMLElement | null>(null);
  const [activeReviews, setActiveReviews] = useState<IReviewWithUser[]>(() => {
    const reviews: IReviewWithUser[] = [];
    for (const reviewer of (reviewerIds || [])) {
      const user = users.find((u) => u.id === reviewer.reviewerId);
      reviews.push({
        ...reviewer,
        user,
      });
    }
    return reviews;
  });
  const [germlineConsent, setGermlineConsent] = useState< 'loading' | boolean>(false);
  const [analysisSet, setAnalysisSet] = useState<IAnalysisSet>();
  const [patient, setPatient] = useState<IPatient>();

  const isAsetReadOnly = useIsPatientReadOnly({ analysisSetId });
  const canWrite = useIsUserAuthorised('clinical.sample.write');
  const canAssignUser = canWrite && !isAsetReadOnly;

  const primaryBiosample = useMemo(() => getPrimaryBiosample(
    analysisSet?.biosamples || [],
  ), [analysisSet]);

  const setClinicalStatusTooltip = (chip: IChipProps): string => {
    let tooltipPrefix = '';

    if (chip.status.includes('Addendum') && data.addendums.length > 0) {
      tooltipPrefix = data.addendums[0].addendumType === 'hts' // Check most recent addendum
        ? 'HTS '
        : 'General ';
    }

    return tooltipPrefix + (chip.tooltipText || '').replace('Addendum', 'addendum');
  };

  const setClinicalStatusTag = (): JSX.Element[] | undefined => {
    const { chips } = clinicalStatuses[clinicalStatus];

    if (data.pseudoStatus === 'N/A') {
      return [(
        <StatusChip
          {...naStatus.chipProps}
          key={naStatus.chipProps.status}
          tooltipText={setClinicalStatusTooltip(naStatus.chipProps)}
          maxWidth="calc(100% - 10px)"
        />
      )];
    }

    if (chips) {
      return (
        chips.map((chip) => (
          <StatusChip
            {...chip.chipProps}
            key={chip.chipProps.status}
            tooltipText={setClinicalStatusTooltip(chip.chipProps)}
            maxWidth="calc(100% - 10px)"
          />
        ))
      );
    }

    return undefined;
  };

  const updateAssignee = useCallback(async (
    property: keyof Pick<IClinicalDashboardSample, 'cancerGeneticistId' | 'curatorId' | 'clinicianId'>,
    newUser: IUser | null,
  ): Promise<void> => {
    const newUserId = newUser === null ? null : newUser?.id;
    await zeroDashSdk.mtb.clinical.updateClinicalVersionData(
      clinicalVersionId,
      { [property]: newUserId },
    );
    if (updateSamples) {
      updateSamples({
        ...data,
        [property]: newUserId,
      });
    }
  }, [clinicalVersionId, data, updateSamples, zeroDashSdk.mtb.clinical]);

  const updateReviewer = useCallback(async (
    reviewer: IUser | null,
    group: Group,
  ): Promise<void> => {
    // Remove previous reviewer
    await zeroDashSdk.mtb.clinical.removeReviewer(clinicalVersionId, group);
    // Assign new reviewer
    if (reviewer && group) {
      await zeroDashSdk.mtb.clinical.addReviewer(
        clinicalVersionId,
        {
          reviewerId: reviewer.id,
          group,
        },
      );
      // Swap old reviewer with new reviewer
      const newReview: IReviewWithUser = {
        user: reviewer,
        reviewerId: reviewer.id,
        status: 'Assigned',
        group,
      };
      setActiveReviews((prev) => {
        if (prev) {
          const reviewIndex = prev.findIndex((r) => r.group === group);
          if (reviewIndex !== -1) {
            const newReviews = [...prev];
            newReviews[reviewIndex] = newReview;
            return newReviews;
          }
          return [...prev, newReview];
        }
        return [newReview];
      });
    } else {
      setActiveReviews((prev) => prev?.filter((r) => r.group !== group));
    }
  }, [clinicalVersionId, zeroDashSdk.mtb.clinical]);

  const updateClinicalMeetingDate = useCallback(async (
    type: ClinicalMeetingType,
    newDate: Dayjs | null,
  ): Promise<void> => {
    const date = newDate ? dayjs(newDate).format('YYYY-MM-DD') : null;
    await zeroDashSdk.meetings.updateClinicalMeetingDate(
      clinicalVersionId,
      {
        date,
        type,
      },
    );
    if (updateSamples) {
      let newMeetings: IClinicalMeeting[];
      if (date) {
        newMeetings = data.meetings.find((r) => r.type === type)
          ? data.meetings.map((r) => (
            r.type === type
              ? {
                ...r,
                date,
              }
              : r))
          : [...data.meetings, { type, date, chairId: null }];
      } else {
        newMeetings = data.meetings.filter((r) => (
          r.type !== type));
      }
      updateSamples({
        ...data,
        meetings: newMeetings,
      });
    }
  }, [clinicalVersionId, data, updateSamples, zeroDashSdk.meetings]);

  const updateClinicalMeetingChair = useCallback(async (
    type: ClinicalMeetingType,
    newUser: IUser | null,
  ): Promise<void> => {
    // update assignee and reviewer in backend
    await zeroDashSdk.meetings.updateClinicalMeetingChair(
      clinicalVersionId,
      {
        chairId: newUser?.id ?? null,
        type,
      },
    );
    // update reviewer in frontend
    if (type === 'MTB' && newUser) {
      const newReview: IReviewWithUser = {
        user: newUser,
        reviewerId: newUser.id,
        status: 'Assigned',
        group: 'MTBChairs',
      };
      setActiveReviews((prev) => {
        if (prev) {
          const reviewIndex = prev.findIndex((r) => r.group === 'MTBChairs');
          if (reviewIndex !== -1) {
            const newReviews = [...prev];
            newReviews[reviewIndex] = newReview;
            return newReviews;
          }
          return [...prev, newReview];
        }
        return [newReview];
      });
    }
    // udpate assignee in frontend
    if (updateSamples) {
      updateSamples({
        ...data,
        meetings:
          data.meetings.map((r) => (
            r.type === type
              ? {
                ...r,
                chairId: newUser?.id ?? null,
              }
              : r)),
      });
    }
  }, [clinicalVersionId, data, updateSamples, zeroDashSdk.meetings]);

  const getAssigneeColumn = useCallback((
    property: keyof Pick<IClinicalDashboardSample, 'cancerGeneticistId' | 'curatorId' | 'clinicianId' >,
    group: Group,
    groupLabel: string,
  ) => {
    const assignee = users.find((u) => u.id === data[property]);

    const review = activeReviews?.find((r) => r.group === group);

    return (
      <Box display="flex" flexDirection="row-reverse" width="72px">
        <span>
          <AssigneeButton
            options={{
              id: review?.reviewerId || null,
              type: 'reviewer',
              group,
              groupLabel: `Reviewing ${groupLabel}`,
              reviewStatus: review?.status,
              disabled: !canAssignUser || clinicalStatus === 'Done',
              onSelect: (user) => updateReviewer(user, group),
            }}
          />
        </span>
        <span style={{ marginRight: '-8px' }}>
          <AssigneeButton
            options={{
              id: assignee?.id || null,
              type: 'assignee',
              group,
              groupLabel,
              disabled: !canAssignUser || clinicalStatus === 'Done',
              onSelect: (user) => updateAssignee(property, user),
            }}
          />
        </span>
      </Box>
    );
  }, [
    activeReviews,
    canAssignUser,
    clinicalStatus,
    users,
    data,
    updateAssignee,
    updateReviewer,
  ]);

  useEffect(() => {
    async function getGermlineConsent(): Promise<void> {
      setGermlineConsent('loading');
      const consent = await zeroDashSdk.patient.getPatientConsent(patientId);
      if (consent.germlineConsent || (consent.category1Consent && consent.category2Consent)) {
        setGermlineConsent(true);
      } else {
        setGermlineConsent(false);
      }
    }
    if (data.hasGermlineFindings) {
      getGermlineConsent();
    }
  }, [data.hasGermlineFindings, patientId, zeroDashSdk.patient]);

  useEffect(() => {
    zeroDashSdk.curation.analysisSets.getAnalysisSetById(
      analysisSetId,
    )
      .then((resp) => (
        zeroDashSdk.patient.getPatientById(resp.patientId)
          .then((patientResp) => {
            setAnalysisSet(resp);
            setPatient(patientResp);
          })
      ));
  }, [analysisSetId, zeroDashSdk.curation.analysisSets, zeroDashSdk.patient]);

  return (
    <TableRow>
      <TableCellLeft
        component="th"
        scope="row"
        sx={{
          width: '250px',
          minWidth: '250px',
          borderRadius: '0 0 0 4px',
        }}
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
        >
          <Box
            width="32px"
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
          >
            {Boolean(expedite) && (
              <Tooltip
                title="This case is expedited"
                placement="right"
              >
                <ClockAlertIcon color={corePalette.orange100} />
              </Tooltip>
            )}
          </Box>
          <Box
            display="flex"
            flexDirection="column"
          >
            <Box display="flex" alignItems="center">
              <Link
                to={`/${patientId}/${analysisSetId}/clinical/${clinicalVersionId}/mtb/OVERVIEW`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <CustomTypography
                  truncate
                  variant="bodyRegular"
                  fontWeight="bold"
                  width="180px"
                  display="inline-block"
                >
                  {primaryBiosample?.biosampleId ?? patientId}
                </CustomTypography>
              </Link>
              {germlineConsent && (
                <Tooltip
                  title={
                    germlineConsent === 'loading'
                      ? 'Checking for germline consent...'
                      : 'This case has germline findings'
                    }
                  placement="top"
                >
                  <span>
                    {germlineConsent === 'loading' ? (
                      <FlashingDotsAnimation
                        colour={corePalette.offBlack100}
                      />
                    ) : (
                      <Dna />
                    )}
                  </span>
                </Tooltip>
              )}
            </Box>
            <Box
              display="flex"
              gap="8px"
            >
              <CustomTypography
                truncate
                variant="bodyRegular"
                sx={{ color: '#5E6871' }}
              >
                {`Patient ID: ${patientId}`}
              </CustomTypography>
              {patient?.sex && vitalStatus && (
                <Gender vitalStatus={vitalStatus} gender={patient.sex} />
              )}
            </Box>
          </Box>
        </Box>
      </TableCellLeft>
      <TableCell
        sx={{
          minWidth: '160px',
          width: '160px',
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="start"
          gap="8px"
        >
          {setClinicalStatusTag()}
          {data.isGermlineOnly && (
            <CustomTypography variant="bodyRegular">
              <StatusChip
                status="Germline only"
                backgroundColor="#FCD7B1"
                color="#E36D00"
              />
            </CustomTypography>
          )}
        </Box>
      </TableCell>
      <ClinicalMeetingDateCell
        clinicalMeetings={meetings}
        updateClinicalMeetingChair={updateClinicalMeetingChair}
        updateClinicalMeetingDate={updateClinicalMeetingDate}
        currentDate={currentDate}
      />
      <TableCell
        sx={{
          minWidth: '200px',
          width: '33vw',
        }}
      >
        <CustomTypography
          variant="bodyRegular"
        >
          {zero2FinalDiagnosis}
        </CustomTypography>
      </TableCell>
      <TableCell
        sx={{
          minWidth: '120px',
          width: '20vw',
        }}
      >
        <CustomTypography variant="bodyRegular">
          {mapEvent(analysisSet?.sequencedEvent || '-', true)}
        </CustomTypography>
      </TableCell>
      <TableCell
        sx={{
          minWidth: '80px',
          width: '13vw',
        }}
      >
        <CustomTypography variant="bodyRegular">
          {primaryBiosample?.specimen ?? '-'}
        </CustomTypography>
      </TableCell>
      <TableCell
        sx={{
          minWidth: '96px',
          width: '16vw',
        }}
      >
        <CustomTypography variant="bodyRegular">
          {primaryBiosample?.ageAtSample ?? '-'}
        </CustomTypography>
      </TableCell>
      <TableCellRight
        sx={{
          minWidth: '318px',
          borderRadius: '0 0 4px 0',
          paddingLeft: '10px',
        }}
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          gap="12px"
        >
          {/* Curators */}
          {getAssigneeColumn('curatorId', 'Curators', 'Curator')}
          {/* Clinicians */}
          {getAssigneeColumn('clinicianId', 'Clinicians', 'Clinician')}
          {/* Cancer Geneticists */}
          {getAssigneeColumn('cancerGeneticistId', 'CancerGeneticists', 'Genetic Clinician')}
          <IconButton
            sx={{
              width: '30px',
              height: '30px',
              marginLeft: '10px',
            }}
            onClick={(e): void => setSampleOptions(e.currentTarget)}
          >
            <EllipsisVerticalIcon />
          </IconButton>
        </Box>
      </TableCellRight>
      {patient && (
        <ClinicalSampleMenu
          anchorEl={sampleOptions}
          setAnchorEl={setSampleOptions}
          sampleData={{ ...data, gender: patient?.sex }}
          updateSamples={updateSamples}
        />
      )}
    </TableRow>
  );
}
