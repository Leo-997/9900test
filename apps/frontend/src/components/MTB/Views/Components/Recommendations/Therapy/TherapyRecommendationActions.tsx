import { useState, type JSX } from 'react';
import { TherapyRecommendationProvider } from '../../../../../../contexts/TherapyRecommendationContext';
import { IMolecularAlterationDetail } from '../../../../../../types/MTB/MolecularAlteration.types';
import { IFetchRecommendation, IRecommendationActions, RecommendationLinkEntity } from '../../../../../../types/MTB/Recommendation.types';
import TherapyRecommendationDialog from './TherapyRecommendationDialog';
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

export default function TherapyRecommendationActions({
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
  const [openTherapyModal, setOpenTherapyModal] = useState<boolean>(false);

  return (
    <>
      <RecommendationActionButtons
        actions={actions}
        permissions={permissions}
        onEdit={(): void => setOpenTherapyModal(true)}
        onDelete={onDelete}
        onHide={onHide}
        onOrder={onOrder}
        isCondensed={isCondensed ?? false}
        isHidden={
          Boolean(recommendation.links?.find((l) => l.entityType === 'SLIDE' && l.entityId === entity.entityId)?.hidden)
        }
      />
      {
        openTherapyModal && (
          <TherapyRecommendationProvider
            entity={entity}
            existingRec={recommendation}
          >
            <TherapyRecommendationDialog
              alterations={alterations}
              open={openTherapyModal}
              setOpen={setOpenTherapyModal}
              onSubmitRecommendation={onSubmitRecommendation}
            />
          </TherapyRecommendationProvider>
        )
      }
    </>
  );
}
