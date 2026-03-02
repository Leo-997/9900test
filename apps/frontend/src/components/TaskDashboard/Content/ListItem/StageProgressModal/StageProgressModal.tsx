import {
  Box, Card, Divider, Link, Popover,
  styled,
} from '@mui/material';
import { Dayjs } from 'dayjs';
import { ArrowUpRightIcon } from 'lucide-react';
import type { JSX } from 'react';
import CustomTypography from '@/components/Common/Typography';
import { corePalette } from '@/themes/colours';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IClinicalDashboardSample } from '@/types/Dashboard.types';
import { IReport } from '@/types/Reports/Reports.types';
import { StageName } from '@/types/TaskDashboard/TaskDashboard.types';
import { getProgressColor } from '@/utils/components/progressbar/getProgressColor';

const UsersSection = styled(Box)({
  padding: '15px 16px 0',
});

const HeaderSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  padding: '8px 16px',
});

const Title = styled(CustomTypography)(({ theme }) => ({
  color: theme.colours.core.grey100,
  fontWeight: '500',
}));

const StyledLink = styled(Link)({
  '&:hover': {
    cursor: 'pointer',
  },
});

interface IProps<T extends IAnalysisSet | IReport | IClinicalDashboardSample> {
  stageName: StageName;
  startDate: Dayjs | null;
  completionDateOrToday: Dayjs;
  belowAvgEndDate: Dayjs | null;
  aboveAvgEndDate: Dayjs | null;
  avgCompletionTime: number;
  isAvgMeasuredInDays: boolean;
  usersSectionContent?: JSX.Element;
  isStageCompleted: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  data: T | null;
  patientId?: string;
}

export function StageProgressModal<T extends IAnalysisSet | IReport | IClinicalDashboardSample>({
  stageName,
  startDate,
  completionDateOrToday,
  belowAvgEndDate,
  aboveAvgEndDate,
  avgCompletionTime,
  isAvgMeasuredInDays,
  usersSectionContent,
  isStageCompleted,
  onClose,
  anchorEl,
  data,
  patientId,
}: IProps<T>):JSX.Element {
  const progressColour = getProgressColor(
    startDate,
    completionDateOrToday,
    belowAvgEndDate,
    aboveAvgEndDate,
  );

  const getTargetTimeText = (): string => {
    let startingText = 'On par with';
    if (progressColour === corePalette.green150) {
      startingText = 'Faster than';
    }
    if (progressColour === corePalette.warmRed200) {
      startingText = 'Slower than';
    }
    return `(${startingText} target time)`;
  };

  const calculateTimeDifference = (
    lessRecentDate: Dayjs,
    moreRecentDate: Dayjs,
    withBusinessDays = true,
  ): string => {
    if (startDate) {
      const daysElapsed = withBusinessDays
        ? moreRecentDate.businessDiff(lessRecentDate)
        : moreRecentDate.diff(lessRecentDate, 'day');
      if (daysElapsed < 7) return `${daysElapsed} ${withBusinessDays ? 'business' : ''} day${daysElapsed === 1 ? '' : 's'}`;

      const divisor = withBusinessDays ? 5 : 7;
      const roundedWeeksElapsed = Math.ceil((daysElapsed / divisor));
      return `${roundedWeeksElapsed} week${roundedWeeksElapsed === 1 ? '' : 's'}`;
    }

    return '';
  };

  const getHref = (): string => {
    if (data) {
      if (stageName === 'Curation' && 'patientId' in data) {
        return `/${data.patientId}/${data.analysisSetId}/curation`;
      }
      if (
        stageName === 'MTB Slides'
        && 'patientId' in data
        && 'clinicalVersionId' in data
      ) {
        return `/${data.patientId}/${data.analysisSetId}/clinical/${data.clinicalVersionId}/mtb/OVERVIEW`;
      }
      if (
        ['Molecular Report', 'Germline Report', 'MTB Report'].includes(stageName)
        && patientId
        && 'id' in data
      ) {
        return `/${patientId}/${data.analysisSetId}/reports?reportId=${data.id}&reportType=${stageName.replace(' ', '_').toUpperCase()}`;
      }
    }
    return '';
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <Card sx={{ padding: '10px 0px' }}>
        {/* HEADER */}
        <HeaderSection>
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            marginBottom="8px"
          >
            {stageName !== 'Case Status'
              && (
                <StyledLink
                  href={getHref()}
                  target="_blank"
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="8px"
                  >
                    <CustomTypography
                      variant="bodySmall"
                      fontWeight="bold"
                      color={corePalette.green150}
                    >
                      Go to
                      {' '}
                      {stageName}
                    </CustomTypography>
                    <ArrowUpRightIcon />
                  </Box>
                </StyledLink>
              )}
          </Box>
          <CustomTypography variant="bodyRegular">
            {`${stageName} stage: Target ${avgCompletionTime} ${isAvgMeasuredInDays ? 'business days' : 'weeks'}`}
          </CustomTypography>
          {
            !startDate
              ? (
                <CustomTypography variant="bodyRegular" marginTop="10px">
                  Insufficient data - the start date for this stage is missing.
                </CustomTypography>
              )
              : (
                <>
                  <CustomTypography variant="bodyRegular" marginTop="10px">
                    This stage
                    {' '}
                    {isStageCompleted ? 'was completed in' : 'has been ongoing for'}
                    {' '}
                    {startDate && calculateTimeDifference(startDate, completionDateOrToday)}
                  </CustomTypography>
                  <CustomTypography
                    variant="bodyRegular"
                    color={progressColour}
                  >
                    {getTargetTimeText()}
                    .
                  </CustomTypography>
                </>
              )
          }
        </HeaderSection>
        {stageName !== 'Case Status' && (
          <>
            {/* DIVIDER */}
            <Divider />
            {/* USERS */}
            <UsersSection>
              {usersSectionContent
              && (
                <>
                  <Title variant="bodySmall">Assignees</Title>
                  {usersSectionContent}
                </>
              )}
            </UsersSection>
          </>
        )}
      </Card>
    </Popover>
  );
}
