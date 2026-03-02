import { Box, Link } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ArrowUpRightIcon } from 'lucide-react';
import { useMemo, type JSX } from 'react';
import CustomDialog from '@/components/Common/CustomDialog';
import CustomTypography from '@/components/Common/Typography';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';
import { corePalette } from '@/themes/colours';
import { ClinicalThreadEntityTypes } from '@/types/Comments/ClinicalComments.types';
import { IRelatedThread } from '@/types/Comments/CommonComments.types';
import { CurationThreadEntityTypes } from '@/types/Comments/CurationComments.types';
import { groupThreadsBySampleId } from '@/utils/functions/comments/groupThreadsBySampleId';
import mapEntityType from '@/utils/functions/mapEntityType';

const useStyles = makeStyles({
  modal: {
    '& .MuiPaper-root': {
      minHeight: 'auto',
      minWidth: '800px',
      maxHeight: '90%',
    },
    '& .MuiDialogContent-root': {
      overflowY: 'scroll',
    },
  },
});

interface IProps {
  open: boolean;
  onClose: () => void;
  threads: IRelatedThread[];
  isClinicalComment?: boolean;
}

export default function RelatedThreadsModal({
  open,
  onClose,
  threads,
  isClinicalComment = false,
}: IProps): JSX.Element {
  const classes = useStyles();

  const groupedThreads = useMemo(() => groupThreadsBySampleId(threads), [threads]);

  return (
    <CustomDialog
      title="Related threads"
      overrideClasses={classes.modal}
      content={(
        <ScrollableSection scrollbarMaxSize={500}>
          <CustomTypography variant="bodyRegular">
            Click the link below to be directed to the corresponding case.
          </CustomTypography>
          {groupedThreads.map((thread) => (
            <Box
              key={thread.analysisSetId}
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              gap="8px"
              margin="15px 0"
            >
              {thread.entityTypes.map((entityType) => (
                <Link
                  key={`${thread.patientId}-${thread.analysisSetId}-reportType=${thread.interpretationReportType}`}
                  href={isClinicalComment
                    ? `/${thread.patientId}/${thread.analysisSetId}/reports?reportType=${thread.interpretationReportType}`
                    : `/${thread.patientId}/${thread.analysisSetId}/curation/${entityType.toLowerCase()}`}
                  target="_blank"
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="8px"
                  >
                    <CustomTypography variant="titleRegular" fontWeight="bold" color={corePalette.green150}>
                      {`${thread.patientId} - 
                        ${thread.zero2FinalDiagnosis} - 
                        ${mapEntityType((thread.interpretationReportType ?? entityType) as CurationThreadEntityTypes | ClinicalThreadEntityTypes)}`}
                    </CustomTypography>
                    <ArrowUpRightIcon />
                  </Box>
                </Link>
              ))}
            </Box>
          ))}
        </ScrollableSection>
      )}
      open={open}
      onClose={onClose}
    />
  );
}
