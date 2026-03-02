import { Box, Tooltip } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import type { JSX } from 'react';
import CustomButton from '@/components/Common/Button';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { ICurationSummary } from '@/types/Analysis/AnalysisSets.types';
import { parseText } from '@/utils/editor/parser';
import plateToMarkdown from '@/utils/editor/plateToMarkdown';
import { useCuration } from '../../../contexts/CurationContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { IFilter, Sections } from '../../../types/Summary/Summary.types';
import Section from '../SharedComponents/Section';
import SummaryBox from '../SharedComponents/SummaryBox';

interface ISectionProps {
  summary?: ICurationSummary;
  label: string | JSX.Element;
  filter?: IFilter;
  submitChanges: (
    newSummary: string,
    section: Sections,
    date?: string,
  ) => Promise<void>;
}

export default function MTBMeeting({
  summary,
  label,
  filter,
  submitChanges,
}: ISectionProps): JSX.Element {
  const { analysisSet } = useAnalysisSet();
  const { isReadOnly } = useCuration();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();

  const canEdit = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  const handlePostToSlack = async (): Promise<void> => {
    try {
      await zeroDashSdk.services.notifications.createNotifications({
        type: 'MEETING_NOTES',
        title: `MTB Meeting Summary (${dayjs(summary?.date || undefined).format('DD/MM/YYYY')}):`,
        description: plateToMarkdown(parseText(summary?.note || '').value),
        entityMetadata: {
          analysisSetId: analysisSet.analysisSetId,
          patientId: analysisSet.patientId,
        },
        modes: ['SLACK_CHANNEL'],
        slackChannel: analysisSet.patientId,
      });
      enqueueSnackbar('MTB meeting summary posted to slack!', { variant: 'success' });
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
          onChange={(date) => {
            submitChanges(summary?.note || '', 'MTB_MEETING', date?.format('YYYY-MM-DD'));
          }}
          value={dayjs(summary?.date || undefined)}
          label="MTB Meeting Date"
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
          title="MTB Meeting Notes"
          placeholder="MTB Meeting Notes"
          submitChanges={(newSummary) => {
            submitChanges(newSummary, 'MTB_MEETING', summary?.date);
          }}
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
                  onClick={() => {
                    handlePostToSlack();
                  }}
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
