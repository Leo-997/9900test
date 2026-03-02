/* eslint-disable @typescript-eslint/naming-convention */
import {
  Box,
  IconButton,
  TableCell as MuiTableCell,
  styled,
  TableBody,
  TableRow,
  Tooltip,
} from '@mui/material';
import dayjs from 'dayjs';
import { PencilIcon } from 'lucide-react';
import {
  Dispatch, SetStateAction, useState, type JSX,
} from 'react';
import Markdown from 'react-markdown';
import StatusChip from '@/components/Chips/StatusChip';
import CustomTypography from '@/components/Common/Typography';
import Gender from '@/components/VitalStatus/Gender';
import { samplelessPatientHeaderWidths } from '@/constants/Curation/samplelessPatient';
import { corePalette } from '@/themes/colours';
import { IAnalysisPatient } from '@/types/Analysis/AnalysisSets.types';
import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import UpdateCommentsModal from './UpdateCommentsModal';

const DateChip = styled(CustomTypography)(({ theme }) => ({
  color: theme.colours.core.offBlack100,
  border: `2px solid ${theme.colours.core.grey50}`,
  borderRadius: '6px',
  padding: '0 5px',
  fontSize: '13px',
}));

const TableCell = styled(MuiTableCell)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  border: 'none',
  padding: '16px 16px 16px 0px',
}));

const TruncatingTypography = styled(CustomTypography)({
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  '& .editor-added-class': {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
});

interface IProps {
  patient: IAnalysisPatient;
  updatePatient?: (value: IAnalysisPatient) => void;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export function SamplelessPatientListItem({
  patient,
  updatePatient,
  loading,
  setLoading,
}: IProps): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const {
    patientId,
    vitalStatus,
    gender,
    stage: caseStatus,
    study,
    registrationDate,
    comments,
  } = patient;
  const isWithdrawn = caseStatus === 'Withdrawn';

  const canEditNotes = useIsUserAuthorised('curation.patient.write');

  const getStatusChipLabel = (): string => {
    if (!caseStatus) return 'REGISTERED';
    if (caseStatus === 'Unwithdrawn') return 'Eligible';

    return caseStatus;
  };

  return (
    <TableBody>
      <TableRow sx={{ width: '100%', display: 'flex' }}>
        <TableCell
          sx={{
            ...samplelessPatientHeaderWidths[0],
            padding: '16px',
          }}
        >
          <Box
            display="flex"
            gap="8px"
          >
            <CustomTypography variant="titleRegular" fontWeight="bold">
              {`Patient ID(s): ${patientId || 'No ID found'}`}
            </CustomTypography>
            {vitalStatus && <Gender vitalStatus={vitalStatus} gender={gender} />}
          </Box>
        </TableCell>
        <TableCell
          sx={samplelessPatientHeaderWidths[1]}
        >
          <StatusChip
            status={getStatusChipLabel()}
            color={isWithdrawn ? corePalette.grey100 : corePalette.green300}
            backgroundColor={isWithdrawn ? corePalette.grey50 : corePalette.green10}
          />
        </TableCell>
        <TableCell
          sx={samplelessPatientHeaderWidths[2]}
        >
          <CustomTypography variant="bodyRegular">
            {study}
          </CustomTypography>
        </TableCell>
        <TableCell
          sx={samplelessPatientHeaderWidths[3]}
        >
          {registrationDate && (
            <DateChip variant="bodyRegular" fontWeight="bold">
              {dayjs(registrationDate).format('DD/MM/YYYY')}
            </DateChip>
          )}
        </TableCell>
        <TableCell sx={{ flex: 1 }}>
          <Box display="flex" justifyContent="space-between">
            <TruncatingTypography
              tooltipText={(
                <Markdown>
                  {comments}
                </Markdown>
              )}
            >
              <RichTextEditor
                key={`${patientId}::${comments}`}
                classNames={{ editor: 'editor-added-class' }}
                mode="readOnly"
                initialText={comments}
                condensed
                hideEmptyEditor
              />
            </TruncatingTypography>
            <Tooltip title="Edit comments" placement="top">
              <IconButton
                sx={{ padding: '6px' }}
                onClick={(): void => setIsModalOpen(true)}
                disabled={!canEditNotes}
              >
                <PencilIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
      {isModalOpen && (
        <UpdateCommentsModal
          patient={patient}
          updatePatient={updatePatient}
          isModalOpen={isModalOpen}
          handleClose={(): void => setIsModalOpen(false)}
          latestComments={comments || ''}
          isLoading={loading}
          setIsLoading={setLoading}
        />
      )}
    </TableBody>
  );
}
