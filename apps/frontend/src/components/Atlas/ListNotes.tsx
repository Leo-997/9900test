import { useEffect, useState, type JSX } from 'react';
import { Box } from '@mui/material';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { LoadingPage } from '@/pages/Loading/Loading';
import { IPanelReportableNote, ReportableNoteTypes } from '@/types/Reports/GeneLists.types';
import { GenePanel } from '@/types/Samples/Sample.types';
import LoadingAnimation from '../Animations/LoadingAnimation';
import NoteBox from './NoteBox';

interface IGeneNoteProps {
  genePanel: GenePanel;
  type: ReportableNoteTypes;
}

export default function GeneListNotes({
  genePanel,
  type,
}: IGeneNoteProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();

  const canEdit = useIsUserAuthorised('atlas.write');

  const [note, setNote] = useState<IPanelReportableNote | null>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNotes = async (): Promise<void> => {
      try {
        const res = await zeroDashSdk.services.reports.getReportableNotes({
          genePanel,
          type,
        });

        setNote(res[0] ?? null);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchNotes();
  }, [genePanel, type, zeroDashSdk.services.reports]);

  const handleSaveClick = async (newText: string): Promise<void> => {
    try {
      await zeroDashSdk.services.reports.updateReportableNote({
        genePanel,
        type,
        content: newText,
      });
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  if (isLoading) return <LoadingPage />;

  return note !== undefined ? (
    <Box px="32px">
      <NoteBox
        note={note?.content ?? ''}
        onUpdate={(newText): void => {
          handleSaveClick(newText);
        }}
        canEdit={canEdit}
      />
    </Box>
  ) : (
    <LoadingAnimation />
  );
}
