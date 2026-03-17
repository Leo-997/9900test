import {
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { CheckIcon, MinusIcon, PlusIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { useClinical } from '../../../../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../../../../contexts/ZeroDashSdkContext';
import { IFetchRecommendation } from '../../../../../../types/MTB/Recommendation.types';
import CustomButton from '../../../../../Common/Button';
import CustomTypography from '../../../../../Common/Typography';

const useStyles = makeStyles(() => ({
  icon: {
    width: '32px',
    height: '32px',
    color: '#022034',
  },
  btnText: {
    textTransform: 'none',
    fontWeight: 500,
    color: '#00AB59',
  },
  slideBtn: {
    backgroundColor: '#E4F9EE80',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:disabled': {
      backgroundColor: '#E4F9EE80',
    },
  },
  menuItem: {
    padding: '12px',
  },
}));

export interface IPastRecommendationActionButtonsProps {
  recommendation: IFetchRecommendation;
  setHTSRecs: Dispatch<SetStateAction<IFetchRecommendation[]>>;
  isAdded: boolean;
}

export function PastRecommendationActionButtons({
  recommendation,
  setHTSRecs,
  isAdded,
}: IPastRecommendationActionButtonsProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { activeAddendum } = useClinical();

  const [loading, setLoading] = useState<boolean>(false);

  const onAddToSlide = async (): Promise<void> => {
    if (activeAddendum && activeAddendum.addendumType === 'hts') {
      setLoading(true);
      try {
        await zeroDashSdk.mtb.addendum.updatePastRecommendation(
          activeAddendum.id,
          {
            recommendationId: recommendation.id,
            mode: 'add',
          },
        );
        setHTSRecs((prev) => ([
          ...prev,
          recommendation,
        ]));
      } catch (err) {
        enqueueSnackbar('Could not add to slide, please try again', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const onRemoveFromSlide = async (): Promise<void> => {
    if (activeAddendum && activeAddendum.addendumType === 'hts') {
      setLoading(true);
      try {
        await zeroDashSdk.mtb.addendum.updatePastRecommendation(
          activeAddendum.id,
          {
            recommendationId: recommendation.id,
            mode: 'remove',
          },
        );
        setHTSRecs((prev) => prev.filter((r) => r.id !== recommendation.id));
      } catch (err) {
        enqueueSnackbar('Could not remove from slide, please try again', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
        gap="16px"
        width="max-content"
      >
        {isAdded && (
          <CustomButton
            size="medium"
            startIcon={<CheckIcon style={{ marginRight: '5px' }} />}
            label={(
              <CustomTypography variant="bodySmall" className={classes.btnText}>
                Added
              </CustomTypography>
            )}
            variant="bold"
            className={classes.slideBtn}
            disableElevation
            disabled
          />
        )}
        <CustomButton
          variant="outline"
          label={`${isAdded ? 'Remove from' : 'Add to'} slide`}
          startIcon={isAdded ? <MinusIcon /> : <PlusIcon />}
          size="small"
          loading={loading}
          onClick={(): void => {
            if (isAdded) {
              onRemoveFromSlide();
            } else {
              onAddToSlide();
            }
          }}
        />
      </Box>
    </div>
  );
}
