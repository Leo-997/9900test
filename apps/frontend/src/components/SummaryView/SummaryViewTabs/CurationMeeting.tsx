import { Box, Tooltip } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useState, type JSX } from 'react';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { ICurationSummary } from '@/types/Analysis/AnalysisSets.types';
import { parseText } from '@/utils/editor/parser';
import plateToMarkdown from '@/utils/editor/plateToMarkdown';
import { useCuration } from '../../../contexts/CurationContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { IFilter, Sections } from '../../../types/Summary/Summary.types';
import CustomButton from '../../Common/Button';
import Section from '../SharedComponents/Section';
import SummaryBox from '../SharedComponents/SummaryBox';

interface ISectionProps {
  summary?: ICurationSummary;
  label: string | JSX.Element;
  filter?: IFilter;
  submitChanges: (
    newSummary: string,
    section: Sections
  ) => void;
}

export default function CurationMeeting({
  summary,
  label,
  filter,
  submitChanges,
}: ISectionProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { isReadOnly } = useCuration();
  const { enqueueSnackbar } = useSnackbar();
  const { analysisSet } = useAnalysisSet();

  const [date, setDate] = useState<string | undefined>(analysisSet.meetingDate || undefined);

  const canEdit = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  const handleChangeDateChange = async (
    newDate?: string,
  ): Promise<void> => {
    if (newDate) {
      try {
        await zeroDashSdk.meetings.assignCurationMeeting({
          analysisSets: [analysisSet.analysisSetId],
          date: newDate,
        });
        setDate(newDate);
      } catch {
        enqueueSnackbar('Unable to update the curation meeting date', { variant: 'error' });
      }
    }
  };

  const handlePostToSlack = async (): Promise<void> => {
    try {
      await zeroDashSdk.meetings.assignCurationMeeting({
        analysisSets: [analysisSet.analysisSetId],
        date: dayjs(date || undefined).format('YYYY-MM-DD'),
      });
      await zeroDashSdk.services.notifications.createNotifications({
        type: 'MEETING_NOTES',
        title: `Clinical Curation Meeting Summary (${dayjs(date || undefined).format('DD/MM/YYYY')}):`,
        description: plateToMarkdown(parseText(summary?.note || '').value),
        entityMetadata: {
          analysisSetId: analysisSet.analysisSetId,
          patientId: analysisSet.patientId,
        },
        modes: ['SLACK_CHANNEL'],
        slackChannel: analysisSet.patientId,
      });
      enqueueSnackbar('Clinical curation meeting summary posted to slack!', { variant: 'success' });
    } catch {
      enqueueSnackbar('There was an error posting the message to slack!', { variant: 'error' });
    }
  };

  return (
    !filter ? (
      <Section
        label={label}
        open
      >
        <DatePicker
          onChange={(newDate): Promise<void> => handleChangeDateChange(newDate?.format('YYYY-MM-DD'))}
          value={dayjs(date || undefined)}
          label="Curation Meeting Date"
          format="DD/MM/YYYY"
          sx={{ marginLeft: '48px' }}
          slotProps={{
            inputAdornment: {
              sx: {
                position: 'relative',
                top: '-4px',
              },
            },
          }}
          disabled={!canEdit}
        />
        <SummaryBox
          summary={summary?.note || ''}
          submitChanges={(newSummary): void => submitChanges(newSummary, 'CURATION_MEETING')}
          title="Curation Meeting Notes"
          placeholder="Curation Meeting Notes"
          canEdit={canEdit}
        />
        {canEdit && (
          <Box
            display="flex"
            width="100%"
            padding="0px 48px 20px 48px"
            justifyContent="right"
          >
            <Tooltip
              title="Please save your changes"
              placement="top"
            >
              <span>
                <CustomButton
                  variant="bold"
                  label="Submit to Slack"
                  onClick={handlePostToSlack}
                />
              </span>
            </Tooltip>
          </Box>
        )}
      </Section>
    ) : (
      <div />
    )
  );
}
