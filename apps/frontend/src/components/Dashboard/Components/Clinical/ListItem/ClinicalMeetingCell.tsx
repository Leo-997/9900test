import { corePalette } from '@/themes/colours';
import { Box, styled, TableCell } from '@mui/material';
import CustomTypography from '@/components/Common/Typography';
import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { AvatarWithBadge } from '@/components/CustomIcons/AvatarWithBadge';
import { useUser } from '@/contexts/UserContext';
import { IUser } from '@/types/Auth/User.types';
import { ClinicalMeetingType, IClinicalMeeting } from '@/types/Meetings/Meetings.types';
import { ClinicalMeetingModal } from './ClinicalMeetingModal';

interface IDateChipStyleProps {
  hasCurrentDate: boolean;
  dateMatched: boolean;
}

const DateChip = styled(CustomTypography)<IDateChipStyleProps>(
  ({ hasCurrentDate, dateMatched }) => ({
    color: corePalette.offBlack100,
    border: `2px solid ${corePalette.grey50}`,
    borderRadius: '6px',
    padding: '0 5px',
    fontSize: '13px',
    width: '125px',
    display: 'flex',
    justifyContent: 'center',
    ...(hasCurrentDate && {
      backgroundColor: dateMatched ? corePalette.green10 : undefined,
      borderColor: dateMatched ? corePalette.green150 : undefined,
      color: dateMatched ? corePalette.green200 : undefined,
      opacity: !dateMatched ? '60%' : undefined,
    }),
  }),
);

interface IProps {
  clinicalMeetings: IClinicalMeeting[]
  updateClinicalMeetingChair: (
    type: ClinicalMeetingType,
    newUser: IUser | null,
  ) => Promise<void>;
  updateClinicalMeetingDate: (
    type: ClinicalMeetingType,
    newDate: Dayjs | null,
  ) => Promise<void>;
  currentDate?: string;
}

export default function ClinicalMeetingDateCell({
  clinicalMeetings,
  updateClinicalMeetingChair,
  updateClinicalMeetingDate,
  currentDate,
}: IProps): React.JSX.Element {
  const { users } = useUser();
  const [modalAnchor, setModalAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <TableCell
        sx={{
          backgroundColor: corePalette.white,
          minWidth: '180px',
          width: '18vw',
          padding: '16px 16px 16px 0',
          '&: hover': {
            cursor: 'pointer',
          },
        }}
        onClick={(e): void => setModalAnchor(e.currentTarget)}
      >
        {clinicalMeetings.length > 0
          ? (
            <Box
              display="flex"
              flexDirection="column"
              gap="10px"
            >
              {clinicalMeetings
                .sort((a, b) => {
                  const order = { MTB: 0, HTS: 1, PDX: 2 };
                  return (order[a.type]) - (order[b.type]);
                })
                .map(({ type, chairId, date }) => {
                  const dateMatched = dayjs(currentDate).isSame(dayjs(date), 'day');
                  const chair = users.find((u) => u.id === chairId);
                  return (
                    <Box
                      display="flex"
                      flexDirection="row"
                      gap="8px"
                    >
                      <DateChip
                        variant="bodyRegular"
                        fontWeight="bold"
                        hasCurrentDate={Boolean(currentDate)}
                        dateMatched={dateMatched}
                      >
                        {`${type}: ${dayjs(date).format('DD/MM/YYYY')}`}
                      </DateChip>
                      <AvatarWithBadge
                        size="small"
                        borderStyle={chairId ? 'solid' : 'dashed'}
                        user={chair}
                        sx={{
                          opacity: currentDate && !dateMatched ? '60%' : undefined,
                        }}
                      />
                    </Box>
                  );
                })}
            </Box>
          )
          : (
            <CustomTypography variant="bodyRegular">
              -
            </CustomTypography>
          )}
      </TableCell>
      <ClinicalMeetingModal
        anchorEl={modalAnchor}
        onClose={(): void => setModalAnchor(null)}
        clinicalMeetings={clinicalMeetings}
        updateClinicalMeetingChair={updateClinicalMeetingChair}
        updateClinicalMeetingDate={updateClinicalMeetingDate}
      />
    </>
  );
}
