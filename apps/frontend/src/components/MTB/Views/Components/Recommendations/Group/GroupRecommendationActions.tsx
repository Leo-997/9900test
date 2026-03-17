import { useState, type JSX } from 'react';
import { GroupRecommendationProvider } from '../../../../../../contexts/GroupRecommendationContext';
import { IFetchRecommendation, IRecommendationActions, RecommendationLinkEntity } from '../../../../../../types/MTB/Recommendation.types';
import GroupRecommendationDialog from './GroupRecommendationDialog';
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
}

export default function GroupRecommendationActions({
  recommendation,
  actions,
  permissions,
  onSubmitRecommendation,
  onDelete,
  onHide,
  onOrder,
  isCondensed,
  entity,
}: IProps): JSX.Element {
  const [openModal, setOpenModal] = useState<boolean>(false);

  return (
    <>
      <RecommendationActionButtons
        actions={actions}
        permissions={permissions}
        onEdit={(): void => setOpenModal(true)}
        onDelete={onDelete}
        onHide={onHide}
        onOrder={onOrder}
        isCondensed={isCondensed ?? false}
        isHidden={
          Boolean(recommendation.links?.find((l) => l.entityType === 'SLIDE' && l.entityId === entity.entityId)?.hidden)
        }
      />
      {
        openModal && (
          <GroupRecommendationProvider
            entity={entity}
            existingRec={recommendation}
          >
            <GroupRecommendationDialog
              open={openModal}
              setOpen={setOpenModal}
              onSubmitRecommendation={onSubmitRecommendation}
            />
          </GroupRecommendationProvider>
        )
      }
    </>
  );
}
