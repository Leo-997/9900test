import { ReactElement } from 'react';
import CitationListItem from './CitationListItem';
import { Evidence, IEvidenceActions, isCitation } from '../../../../types/Evidence/Evidences.types';
import LibraryResourceListItem from './ResourceListItem';
import { EvidencePickerButton } from '../../Archive/EvidencePickerButton';
import { useIsUserAuthorised } from '../../../../hooks/useIsUserAuthorised';

interface IListItemProps<T extends Evidence> {
  evidence: T;
  isSelected?: boolean;
  allowDeselecting?: boolean;
  canSelect?: boolean;
  // Adding the evidence variant / recommendation / text box etc
  onSelect?: (evidence: T) => void;
  // Clicking the list item itself. Eg to preview in the library resource etc
  onClick?: () => void;
  onDelete?: (id: string) => void;
  onUpdate?: (newEvidence: T) => void;
  permissions?: IEvidenceActions;
}

function EvidenceListItem<T extends Evidence>({
  evidence,
  isSelected,
  allowDeselecting,
  canSelect = false,
  onSelect,
  onClick,
  onDelete,
  onUpdate,
  permissions,
}: IListItemProps<T>): ReactElement<any> {
  const canEditEvidence = useIsUserAuthorised('evidence.write');
  const canDownloadEvidence = useIsUserAuthorised('evidence.download');

  const handleDelete = (): void => {
    if (evidence.internalEvidenceId && onDelete) {
      onDelete(evidence.internalEvidenceId);
    }
  };

  const evidenceSelectButton = (isSelected !== undefined && onSelect)
    ? (
      <EvidencePickerButton
        onSelect={(): void => onSelect(evidence)}
        isSelected={isSelected}
        allowDeselecting={allowDeselecting}
        disabled={!canSelect}
      />
    ) : undefined;

  return evidence
    && (
      isCitation(evidence)
        ? (
          <CitationListItem
            citation={evidence}
            evidenceSelectButton={evidenceSelectButton}
            onDelete={onDelete ? handleDelete : undefined}
            onClick={onClick}
            permissions={{
              edit: canEditEvidence,
              delete: canEditEvidence,
            }}
          />
        ) : (
          <LibraryResourceListItem
            resource={evidence}
            onDelete={onDelete ? handleDelete : undefined}
            onUpdate={(newResource): void => {
              // We know that newResource will be a resource,
              // And that onUpdate will expect a resource at this point
              // Since isCitation(evidence) check will ensure that.
              // But TypeScript still wants to complain so we have to cast it
              if (onUpdate) onUpdate(newResource as T);
            }}
            evidenceSelectButton={evidenceSelectButton}
            onClick={onClick}
            permissions={permissions || {
              edit: canEditEvidence,
              delete: canEditEvidence,
              download: canDownloadEvidence,
            }}
          />
        )
    );
}

export default EvidenceListItem;
