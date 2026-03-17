import {
  Box, LinearProgress, styled, TableCell,
} from '@mui/material';
import { JSX, ReactNode, useState } from 'react';
import StatusChip from '@/components/Chips/StatusChip';
import CustomTypography from '@/components/Common/Typography';
import { AvatarWithBadge } from '@/components/CustomIcons/AvatarWithBadge';
import { caseStatusesMap } from '@/constants/TaskDashboard/status';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { Avatar } from '@/types/Avatar.types';
import { IDateChip } from '@/types/Chip.types';
import { IClinicalDashboardSample } from '@/types/Dashboard.types';
import { IReport } from '@/types/Reports/Reports.types';
import { CaseStatus, DashboardRowType, StageName } from '@/types/TaskDashboard/TaskDashboard.types';
import { getProgressColor } from '@/utils/components/progressbar/getProgressColor';
import { getProgressDates } from '@/utils/components/progressbar/getProgressDates';
import { getProgressPercentage } from '@/utils/components/progressbar/getProgressPercentage';
import { StageProgressModal } from '../StageProgressModal/StageProgressModal';

interface IStyleProps {
  type?: DashboardRowType;
  disabled?: boolean;
}

interface IProgressStyles {
  barColor: string;
}

export const ClickableTableCell = styled(TableCell)<IStyleProps>(
  ({ type, theme, disabled }) => ({
    backgroundColor: type !== 'related' ? theme.colours.core.white : theme.colours.core.grey30,
    border: 'none',
    padding: '16px 32px 16px 0px',
    verticalAlign: 'bottom',
    '&: hover': {
      cursor: !disabled ? 'pointer' : 'default',
    },
  }),
);

const StyledLinearProgress = styled(LinearProgress)<IProgressStyles >(({ theme, barColor }) => ({
  backgroundColor: theme.colours.core.grey50,
  borderRadius: '100px',
  '& .MuiLinearProgress-bar': {
    backgroundColor: barColor,
    borderRadius: '100px',
  },
}));

const DateChip = styled(CustomTypography)(({ theme }) => ({
  color: theme.colours.core.offBlack100,
  border: `2px solid ${theme.colours.core.grey50}`,
  borderRadius: '6px',
  padding: '0 5px',
  fontSize: '13px',
  width: '85px',
}));

interface IProps<T extends IAnalysisSet | IReport | IClinicalDashboardSample> {
  stageName: StageName,
  status: CaseStatus;
  columnWidths: {
    minWidth: string;
    width: string;
  };
  data: T | null;
  startAt: string | null;
  finalisedAt: string | null;
  averageDays: {
    belowAvgDays: number;
    aboveAvgDays: number;
  }
  disabled?: boolean;
  patientId?: string;
  avatars?: Avatar[];
  dateChip?: IDateChip;
  icon?: ReactNode;
  type?: DashboardRowType;
  isHighRiskCohort?: boolean;
  modalUsersSectionContent?: JSX.Element;
}

export default function TaskStageCell<T extends IAnalysisSet | IReport | IClinicalDashboardSample>({
  stageName,
  type = 'main',
  status,
  disabled,
  columnWidths,
  data,
  patientId,
  avatars,
  dateChip,
  icon,
  startAt,
  finalisedAt,
  averageDays,
  isHighRiskCohort,
  modalUsersSectionContent,
}: IProps<T>): JSX.Element {
  const [progressModalAnchor, setProgressModalAnchor] = useState<HTMLElement | null>(null);

  const {
    startDate,
    completionDate,
    belowAvgEndDate,
    aboveAvgEndDate,
  } = getProgressDates(
    startAt,
    finalisedAt,
    averageDays.belowAvgDays,
    averageDays.aboveAvgDays,
  );

  const getAvgCompletionTime = (
    measure: 'businessDays' | 'weeks',
    minAvgDays: number,
    maxAvgDays: number,
  ): number => {
    if (measure === 'weeks') {
      const avgBusinessDays = (minAvgDays + maxAvgDays) / 2;
      return Math.ceil(avgBusinessDays / 5);
    }
    return averageDays.aboveAvgDays;
  };

  const isAvgMeasuredInDays = ['Curation', 'Molecular Report'].includes(stageName)
  || (stageName === 'Case Status' && Boolean(isHighRiskCohort));

  const getAvatars = (): JSX.Element[] | undefined => {
    if (avatars && avatars?.length > 2) {
      const firstAvatarItem = avatars[0];
      return [
        <AvatarWithBadge
          key={firstAvatarItem.key}
          size="small"
          borderStyle="solid"
          user={firstAvatarItem.user}
          status={firstAvatarItem.status}
        />,
        <AvatarWithBadge
          key={`${firstAvatarItem.key} + ${avatars.length - 1} more`}
          size="small"
          borderStyle="solid"
          avatarContent={(
            <CustomTypography
              variant="bodySmall"
              fontWeight="medium"
            >
              +
              {avatars.length - 1}
            </CustomTypography>
          )}
        />,
      ];
    }
    return avatars?.map((a) => (
      <AvatarWithBadge
        key={a.key}
        size="small"
        borderStyle="solid"
        user={a.user}
        status={a.status}
      />
    ));
  };

  return (
    <>
      <ClickableTableCell
        type={type}
        disabled={disabled}
        sx={{ minWidth: columnWidths.minWidth, width: columnWidths.width }}
        onClick={!disabled ? (e): void => setProgressModalAnchor(e.currentTarget) : undefined}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          gap="8px"
          position="relative"
          bottom="0px"
        >
          {(dateChip || icon)
              && (
                <Box
                  display="flex"
                  gap="5px"
                >
                  {dateChip && (
                  <DateChip
                    variant="bodyRegular"
                    fontWeight="bold"
                    tooltipText={dateChip.tooltip}
                  >
                    {dateChip.date}
                  </DateChip>
                  )}
                  {icon}
                </Box>
              )}
          <Box
            display="flex"
            gap="5px"
            maxHeight="22px"
          >
            <StatusChip
              {...caseStatusesMap[status]?.chipProps}
              maxWidth="fit-content"
            />
            {getAvatars()}
          </Box>
          <Box height="4px">
            {!disabled && startDate && (
              <StyledLinearProgress
                variant="determinate"
                value={getProgressPercentage(
                  startDate,
                  completionDate,
                  belowAvgEndDate,
                  aboveAvgEndDate,
                )}
                barColor={getProgressColor(
                  startDate,
                  completionDate,
                  belowAvgEndDate,
                  aboveAvgEndDate,
                )}
              />
            )}
          </Box>
        </Box>
      </ClickableTableCell>
      {!disabled && Boolean(progressModalAnchor) && (
        <StageProgressModal
          onClose={(): void => setProgressModalAnchor(null)}
          anchorEl={progressModalAnchor}
          stageName={stageName}
          startDate={startDate}
          completionDateOrToday={completionDate}
          belowAvgEndDate={belowAvgEndDate}
          aboveAvgEndDate={aboveAvgEndDate}
          avgCompletionTime={
            getAvgCompletionTime(
              isAvgMeasuredInDays ? 'businessDays' : 'weeks',
              averageDays.belowAvgDays,
              averageDays.aboveAvgDays,
            )
          }
          isAvgMeasuredInDays={isAvgMeasuredInDays}
          isStageCompleted={Boolean(finalisedAt)}
          data={data}
          patientId={patientId}
          usersSectionContent={modalUsersSectionContent}
        />
      )}
    </>
  );
}
