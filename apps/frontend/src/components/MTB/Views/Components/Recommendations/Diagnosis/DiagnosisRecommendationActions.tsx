import { useState, type JSX } from 'react';
import { IMolecularAlterationDetail } from '../../../../../../types/MTB/MolecularAlteration.types';
import { IFetchRecommendation, IRecommendationActions, RecommendationLinkEntity } from '../../../../../../types/MTB/Recommendation.types';
import DiagnosisRecommendationDialog from './DiagnosisRecommendationDialog';
import { RecommendationActionButtons } from '../Common/RecommendationActionButtons';

interface IProps {
  recommendation: IFetchRecommendation;
  actions: IRecommendationActions;
  permissions: IRecommendationActions;
  onSubmitRecommendation: (newRec: IFetchRecommendation) => void;
  onDelete?: () => void;
  onHide?: (isHidden: boolean) => void;
  onOrder?: (direction: 'up' | 'down') => void;
  isCondensed?: boolean;
  entity: RecommendationLinkEntity;
  alterations: IMolecularAlterationDetail[];
}

export default function DiagnosisRecommendationActions({
  recommendation,
  actions,
  permissions,
  onSubmitRecommendation,
  onDelete,
  onHide,
  onOrder,
  isCondensed,
  entity,
  alterations,
}: IProps): JSX.Element {
  const [openDiagnosisModal, setOpenDiagnosisModal] = useState<boolean>(false);

  return (
    <>
      <RecommendationActionButtons
        actions={actions}
        permissions={permissions}
        onEdit={(): void => setOpenDiagnosisModal(true)}
        onDelete={onDelete}
        onHide={onHide}
        onOrder={onOrder}
        isCondensed={isCondensed ?? false}
        isHidden={
          Boolean(recommendation.links?.find((l) => l.entityType === 'SLIDE' && l.entityId === entity.entityId)?.hidden)
        }
      />
      {
        openDiagnosisModal
        && (
          <DiagnosisRecommendationDialog
            alterations={alterations}
            open={openDiagnosisModal}
            setOpen={setOpenDiagnosisModal}
            existingRec={recommendation}
            entity={entity}
            onSubmitRecommendation={onSubmitRecommendation}
          />
        )
      }
    </>
  );
}
