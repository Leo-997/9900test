import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState, type JSX } from 'react';
import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { ICurationComment } from '@/types/Comments/CurationComments.types';
import Section from '../SharedComponents/Section';

interface ISectionProps {
  label: string | JSX.Element;
}

export default function MolecularSummaryTab({
  label,
}: ISectionProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { analysisSet } = useAnalysisSet();

  const [comment, setComment] = useState<ICurationComment>();

  // comment functions and effects
  useEffect(() => {
    const getComment = async (): Promise<void> => {
      // find comment directly attached to this report
      const reportThreads = (await zeroDashSdk.curationComments.getCommentThreads({
        threadType: ['MOLECULAR'],
        entityType: ['MOLECULAR_REPORT'],
        analysisSetIds: [analysisSet.analysisSetId],
        includeComments: true,
      }))
        .sort((a, b) => dayjs(b.createdAt).diff(a.createdAt));

      if (reportThreads.length && reportThreads[0].comments?.find((c) => c.type === 'MOLECULAR_SUMMARY')) {
        setComment({
          ...reportThreads[0].comments?.find((c) => c.type === 'MOLECULAR_SUMMARY') as ICurationComment,
          thread: reportThreads[0],
        });
      } else {
        setComment(undefined);
      }
    };
    getComment();
  }, [analysisSet.analysisSetId, zeroDashSdk.curationComments]);

  return (
    <Section
      label={label}
      open
    >
      <Box padding="8px 48px" display="flex" justifyContent="center" width="100%">
        <RichTextEditor
          key={comment?.versions?.[0]?.comment}
          title=""
          mode="readOnly"
          hideComments
          commentMode="readOnly"
          initialText={comment?.versions?.[0]?.comment}
        />
      </Box>
    </Section>
  );
}
