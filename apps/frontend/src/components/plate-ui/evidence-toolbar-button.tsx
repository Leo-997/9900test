/* eslint-disable indent */
import useEvidences from '@/api/useEvidences';
import { Icons } from '@/components/plate-ui/Icons';
import { Evidence } from '@/types/Evidence/Evidences.types';
import { withRef } from '@udecode/cn';
import { nanoid } from '@udecode/plate-core';
import { useEditorRef } from '@udecode/plate/react';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import CustomDialog from '../Common/CustomDialog';
import EvidenceArchive from '../Evidence/Archive/EvidenceArchive';
import { useRTEEvidence } from './Contexts/RTEEvidenceContext';
import { EvidencePlugin } from './Plugins/evidence';
import { useOpenState } from './dropdown-menu';
import { ToolbarButton } from './toolbar';

export const EvidenceToolbarButton = withRef<
  typeof ToolbarButton,
  {
    onAddEvidence?:(evidenceId: string, triggerReload?: boolean) => Promise<void>;
  }
>((rest, ref) => {
  const editor = useEditorRef();
  const openState = useOpenState();
  const { enqueueSnackbar } = useSnackbar();
  const { getCurationEvidence } = useEvidences();
  const { addEvidence } = useRTEEvidence();

  const onEvidenceSubmit = async (
    evidence: Evidence,
  ): Promise<void> => {
    try {
      editor.tf.insertNode({
        id: nanoid(),
        evidenceId: evidence.evidenceId,
        type: EvidencePlugin.key,
        children: [
          {
            text: '',
          },
        ],
      });
      addEvidence(evidence);
      if (rest.onAddEvidence) rest.onAddEvidence(evidence.evidenceId, false);
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
        <Icons.book />
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
              getEvidenceLinks={getEvidenceLinks}
              displayDiagnosisFilters={false}
            />
          )}
        />
      )}
    </>
  );
});
