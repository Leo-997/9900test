import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import {
    Box, Grid, TextField,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { PlusIcon } from 'lucide-react';
import * as motion from 'motion/react-client';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { columnOptions } from '../../../../../constants/options';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { GroupRecommendationProvider } from '../../../../../contexts/GroupRecommendationContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import LayoutInput from '../../../../../layouts/LayoutInput';
import { IUpdateOrder } from '../../../../../types/Common.types';
import { IFetchRecommendation } from '../../../../../types/MTB/Recommendation.types';
import LoadingAnimation from '../../../../Animations/LoadingAnimation';
import CustomButton from '../../../../Common/Button';
import CustomTypography from '../../../../Common/Typography';
import { RichTextEditor } from '../../../../Input/RichTextEditor/RichTextEditor';
import { RecommendationCountChips } from '../Recommendations/Common/RecommendationCountChips';
import { RecommendationSection } from '../Recommendations/Common/RecommendationSection';
import GroupRecommendationActions from '../Recommendations/Group/GroupRecommendationActions';
import GroupRecommendationDialog from '../Recommendations/Group/GroupRecommendationDialog';
import TierReferenceGrid from './TierReferenceGrid';

const useStyles = makeStyles(() => ({
  editorWrapper: {
    width: '100%',
    padding: '24px 0px',
  },
  recsEmpty: {
    width: '100%',
    minWidth: '656px',
    height: '100%',
    minHeight: '234px',
    border: `1px solid ${corePalette.grey30}`,
    borderRadius: '8px',
  },
  recommendationWrapper: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '& #hide-row-button': {
        visibility: 'visible',
        opacity: 1,
      },
    },
  },
}));

interface IProps {
  isPresentationMode: boolean;
}

export default function DiscussionSlide({
  isPresentationMode,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    getSlides,
    clinicalVersion,
    updateDiscussionFields,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();

  const [title, setTitle] = useState<string | undefined>(clinicalVersion?.discussionTitle);
  const [recommendations, setRecommendations] = useState<IFetchRecommendation[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const canEditSlideData = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;
  const canComment = useIsUserAuthorised('common.sample.suggestion.write');

  const initialText = useRef<string>(clinicalVersion?.discussionNote || '');

  const slideRecommendationActions = useMemo(() => ({
    order: true,
    delete: true,
    edit: true,
    hide: true,
  }), []);

  const slideRecommendationPermissions = useMemo(() => ({
    order: canEditSlideData,
    delete: canEditSlideData,
    edit: canEditSlideData,
    hide: canEditSlideData,
  }), [canEditSlideData]);

  const handleTitleSave = (): void => {
    try {
      zeroDashSdk.mtb.clinical.updateClinicalVersionData(clinicalVersion.id, {
        discussionTitle: title,
      });
      updateDiscussionFields({
        discussionTitle: title,
      });
    } catch (err) {
      enqueueSnackbar('Could not update title, please try again', { variant: 'error' });
    }
  };

  const handleSave = (content: string): void => {
    try {
      zeroDashSdk.mtb.clinical.updateClinicalVersionData(clinicalVersion.id, {
        discussionNote: content,
      });
      updateDiscussionFields({
        discussionNote: content,
      });
    } catch (err) {
      enqueueSnackbar('Could not update note, please try again', { variant: 'error' });
    }
  };

  const handleUpdateLayout = (newLayout: string): void => {
    try {
      zeroDashSdk.mtb.clinical.updateClinicalVersionData(clinicalVersion.id, {
        discussionColumns: parseInt(newLayout, 10),
      });
      updateDiscussionFields({
        discussionColumns: parseInt(newLayout, 10),
      });
    } catch (err) {
      enqueueSnackbar('Could not update layout, please try again', { variant: 'error' });
    }
  };

  const getRecommendations = useCallback(async () => {
    if (clinicalVersion.id) {
      setLoading(true);
      const recommendationResp = await zeroDashSdk.mtb.recommendation.getAllRecommendations(
        clinicalVersion.id,
        {
          types: ['GROUP'],
          entityType: 'SLIDE',
          entityId: 'DISCUSSION',
        },
      );

      const getRecOrder = (rec: IFetchRecommendation): number => (
        rec.links?.find((l) => l.entityType === 'SLIDE' && l.entityId === 'DISCUSSION')?.order ?? 0
      );
      setRecommendations(recommendationResp.sort((a, b) => {
        if (!getRecOrder(a)) return -1;
        if (!getRecOrder(b)) return 1;
        return getRecOrder(a) - getRecOrder(b);
      }));
      setLoading(false);
    }
  }, [clinicalVersion.id, zeroDashSdk.mtb.recommendation]);

  const updateRecommendationOrder = useCallback(async (
    data: IUpdateOrder[],
  ): Promise<void> => {
    await zeroDashSdk.mtb.recommendation.updateRecommendationOrder(
      clinicalVersion.id,
      'SLIDE',
      'DISCUSSION',
      data,
    );
  }, [zeroDashSdk.mtb.recommendation, clinicalVersion.id]);

  const onRecommendationMove = useCallback((
    recommendation: IFetchRecommendation,
    direction: 'up' | 'down',
  ): void => {
    setRecommendations((prev) => {
      const newRecommendations = [...prev];
      const index = prev.findIndex((r) => r.id === recommendation.id);
      if (direction === 'up' && index > 0) {
        [
          newRecommendations[index - 1],
          newRecommendations[index],
        ] = [
          newRecommendations[index],
          newRecommendations[index - 1],
        ];
      } else if (direction === 'down' && index < newRecommendations.length - 1) {
        [
          newRecommendations[index + 1],
          newRecommendations[index],
        ] = [
          newRecommendations[index],
          newRecommendations[index + 1],
        ];
      }
      updateRecommendationOrder(newRecommendations.map((r, i) => ({
        id: r.id,
        order: i + 1,
      })));
      return newRecommendations;
    });
  }, [setRecommendations, updateRecommendationOrder]);

  const handleDeleteRecommendation = useCallback(async (
    recommendationId: string,
  ): Promise<void> => {
    try {
      await zeroDashSdk.mtb.recommendation.deleteRecommendation(
        clinicalVersion.id,
        recommendationId,
      );
      if (setRecommendations) {
        setRecommendations((prev) => {
          const newRecommendations = prev
            .filter((r) => r.id !== recommendationId)
            .map((r, i) => ({ ...r, slideOrder: i + 1 }));

          updateRecommendationOrder([
            ...newRecommendations.map((r, i) => ({
              id: r.id,
              order: i + 1,
            })),
          ]);

          return newRecommendations;
        });
      }
      enqueueSnackbar('Deleted recommendation successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Cannot delete recommendation, please try again later', { variant: 'error' });
    }
  }, [
    clinicalVersion.id,
    enqueueSnackbar,
    setRecommendations,
    updateRecommendationOrder,
    zeroDashSdk.mtb.recommendation,
  ]);

  const updateHidden = useCallback(async (
    recommendationId: string,
    isHidden: boolean,
  ): Promise<void> => {
    try {
      await zeroDashSdk.mtb.recommendation.createRecommendationsLink(
        clinicalVersion.id,
        {
          recommendationId,
          entityType: 'SLIDE',
          entityId: 'DISCUSSION',
          hidden: isHidden,
        },
      );
      if (setRecommendations) {
        setRecommendations((prev) => prev.map((r) => ({
          ...r,
          links: r.id === recommendationId
            ? r.links?.map((l) => ({
              ...l,
              hidden: l.entityType === 'SLIDE' && l.entityId === 'DISCUSSION'
                ? isHidden
                : l.hidden,
            }))
            : r.links,
        })));
      }
    } catch {
      enqueueSnackbar('Cannot update hidden status, please try again later', { variant: 'error' });
    }
  }, [clinicalVersion.id, enqueueSnackbar, zeroDashSdk.mtb.recommendation]);

  const getContent = (): JSX.Element => {
    if (loading) {
      return (
        <LoadingAnimation />
      );
    }

    const isRecHidden = (rec: IFetchRecommendation): boolean => (
      Boolean(rec.links?.find((l) => l.entityType === 'SLIDE' && l.entityId === 'DISCUSSION')?.hidden)
    );

    if (recommendations.filter((r) => !isPresentationMode || !isRecHidden(r)).length > 0) {
      return (
        <>
          {/* Classname is required for the slide export */}
          <Grid
            container
            spacing={2}
            className="discussion-recommendations"
          >
            {recommendations.filter((r) => !isPresentationMode || !isRecHidden(r)).map((r) => (
              <Grid
                key={r.id}
                size={{ xs: 12 / clinicalVersion.discussionColumns }}
              >
                <motion.div
                  layout
                  transition={{
                    ease: [0.19, 1, 0.22, 1],
                    duration: 0.4,
                  }}
                  className={clsx({
                    [classes.recommendationWrapper]: canEditSlideData && !isPresentationMode,
                  })}
                >
                  <RecommendationSection
                    recommendation={r}
                    isPresentationMode={isPresentationMode}
                    actions={!isPresentationMode ? (
                      <GroupRecommendationActions
                        recommendation={r}
                        entity={{
                          entityType: 'SLIDE',
                          entityId: 'DISCUSSION',
                        }}
                        onSubmitRecommendation={
                          (newRec: IFetchRecommendation): void => setRecommendations(
                            (prev) => prev.map((prevRec) => (
                              prevRec.id === r.id
                                ? newRec
                                : prevRec
                            )),
                          )
                        }
                        actions={slideRecommendationActions}
                        permissions={slideRecommendationPermissions}
                        onDelete={(): Promise<void> => handleDeleteRecommendation(r.id)}
                        onHide={(isHidden: boolean): Promise<void> => updateHidden(r.id, isHidden)}
                        onOrder={(dir: 'up' | 'down'): void => onRecommendationMove(r, dir)}
                      />
                    ) : <div />}
                    chips={<RecommendationCountChips recs={[r]} />}
                    onDrugValidationModalClose={getSlides}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
          {!isPresentationMode && (
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
              flexShrink="0"
              flexGrow="0"
              flexWrap="wrap"
              style={{ marginTop: '16px' }}
              gap="16px"
            >
              <CustomButton
                disabled={!canEditSlideData}
                label="Add recommendations"
                variant="outline"
                startIcon={<PlusIcon />}
                onClick={(): void => setOpen(true)}
              />
            </Box>
          )}
        </>
      );
    }

    return !isPresentationMode ? (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap="12px"
        className={classes.recsEmpty}
      >
        <CustomTypography
          variant="bodyRegular"
          style={{ color: '#8292A6' }}
        >
          No recommendations added. Click on the button below
          to add recommendations to the discussion.
        </CustomTypography>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          flexShrink="0"
          flexGrow="0"
          flexWrap="wrap"
          gap="16px"
        >
          <CustomButton
            disabled={!canEditSlideData}
            label="Add recommendations"
            variant="outline"
            startIcon={<PlusIcon />}
            onClick={(): void => setOpen(true)}
          />
        </Box>
      </Box>
    ) : (
      <div />
    );
  };

  useEffect(() => {
    getRecommendations();
  }, [getRecommendations]);

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        gap="24px"
        padding="16px 32px"
      >
        <Box
          display="flex"
          flexDirection="column"
          width="100%"
          maxWidth="calc(100% - 304px)"
        >
          {/* Discussion title */}
          {!isPresentationMode && (
            <CustomTypography
              variant="label"
            >
              Discussion Title
            </CustomTypography>
          )}
          <Box display="flex">
            {isPresentationMode ? (
              <CustomTypography
                variant="titleRegular"
                fontWeight="bold"
              >
                {title}
              </CustomTypography>
            ) : (
              <TextField
                disabled={!canEditSlideData}
                variant="standard"
                value={title}
                fullWidth
                slotProps={{
                  input: {
                    sx: {
                      fontSize: '24px',
                    },
                  },
                }}
                onChange={(e): void => setTitle(e.target.value)}
                onBlur={handleTitleSave}
              />
            )}
          </Box>
          {/* Discussion note */}
          <span className={classes.editorWrapper}>
            <RichTextEditor
              mode={!canEditSlideData || isPresentationMode ? 'readOnly' : 'autoSave'}
              commentMode={canComment ? 'edit' : 'readOnly'}
              hideComments={isPresentationMode}
              flexibleTableWidth={isPresentationMode}
              initialText={initialText.current}
              title={!isPresentationMode ? (
                <CustomTypography variant="label">
                  Discussion Note
                </CustomTypography>
              ) : undefined}
              onSave={handleSave}
              hideEvidence={isPresentationMode}
              hideEmptyEditor={isPresentationMode}
            />
          </span>

        </Box>
        <Box
          position="relative"
          width={isPresentationMode ? 'min(max(20vw, 280px), 460px)' : '280px'}
        >
          <TierReferenceGrid />
        </Box>
      </Box>

      {/* Recommendations */}
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        padding="16px 32px"
        gap="16px"
      >
        {!isPresentationMode && (
          <LayoutInput
            value={clinicalVersion.discussionColumns.toString()}
            onUpdate={handleUpdateLayout}
            options={columnOptions}
            disabled={!canEditSlideData}
          />
        )}
        {getContent()}
      </Box>
      <GroupRecommendationProvider
        entity={{
          entityType: 'SLIDE',
          entityId: 'DISCUSSION',
        }}
      >
        <GroupRecommendationDialog
          open={open}
          setOpen={setOpen}
          order={recommendations.length + 1}
          onSubmitRecommendation={(newRec): void => (
            setRecommendations((prev) => ([
              ...prev,
              newRec,
            ]))
          )}
        />
      </GroupRecommendationProvider>
    </>
  );
}
