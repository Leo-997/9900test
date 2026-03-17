/* eslint-disable indent */
import useEvidences from '@/api/useEvidences';
import { Icons } from '@/components/plate-ui/Icons';
import { Evidence, isCitation } from '@/types/Evidence/Evidences.types';
import { withRef } from '@udecode/cn';
import { nanoid } from '@udecode/plate-core';
import {
  useEditorRef,
} from '@udecode/plate/react';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import CustomDialog from '../Common/CustomDialog';
import EvidenceArchive from '../Evidence/Archive/EvidenceArchive';
import { useRTECitations } from './Contexts/RTECitationContext';
import { useOpenState } from './dropdown-menu';
import { InlineCitationPlugin } from './Plugins/inline-citation';
import { ToolbarButton } from './toolbar';

export const InlineCitationToolbarButton = withRef<
  typeof ToolbarButton,
  {
    onAddEvidence?:(evidenceId: string, triggerReload?: boolean) => Promise<void>;
  }
>((rest, ref) => {
  const editor = useEditorRef();
  const openState = useOpenState();
  const { enqueueSnackbar } = useSnackbar();
  const { getCurationEvidence } = useEvidences();
  const { addCitation } = useRTECitations();

  const formatCitation = useCallback((evidence: Evidence) => {
    if (evidence && isCitation(evidence)) {
      const authorsArr = evidence.authors?.split(',').map((a) => a.trim().replace(/\.$/, '')) || [];
      const firstAuthor = authorsArr[0];
      return `(${firstAuthor}, ${evidence.year})`;
    }
    return '';
  }, []);

  const onEvidenceSubmit = async (
    evidence: Evidence,
  ): Promise<void> => {
    try {
      editor.tf.insertNode({
        id: nanoid(),
        evidenceId: evidence.evidenceId,
        citation: formatCitation(evidence),
        type: InlineCitationPlugin.key,
        children: [
          {
            text: '',
          },
        ],
      });
      if (isCitation(evidence)) {
        addCitation(evidence);
      }
      if (rest.onAddEvidence) rest.onAddEvidence(evidence.evidenceId, false);
      enqueueSnackbar('Citation has been added to the comment', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not upload evidence, please try again', { variant: 'error' });
    }
  };

  const getEvidenceLinks = useCallback(async (evidenceLinkFilters): Promise<Evidence[]> => (
    getCurationEvidence({ evidenceLinkFilters })
      .then((resp) => resp.allEvidence)
  ), [getCurationEvidence]);

  return (
    <>
      <ToolbarButton
        ref={ref}
        tooltip="Evidence"
        pressed={openState.open}
        onClick={(): void => openState.onOpenChange(true)}
        {...rest}
      >
        <Icons.blockquote />
      </ToolbarButton>
      {openState.open && (
        <CustomDialog
          open={openState.open}
          onClose={(): void => openState.onOpenChange(false)}
          title="Add evidence"
          content={(
            <EvidenceArchive
              handlePickEvidence={(evidence): void => {
                onEvidenceSubmit(evidence);
              }}
              canSelectEvidence
              initialFilters={{
                type: 'CITATION',
              }}
              getEvidenceLinks={getEvidenceLinks}
              displayDiagnosisFilters={false}
            />
          )}
        />
      )}
    </>
  );
});
