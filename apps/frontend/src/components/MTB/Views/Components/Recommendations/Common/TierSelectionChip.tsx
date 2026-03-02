import { corePalette } from '@/themes/colours';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Divider as MuiDivider,
  Popover,
  styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ChevronDownIcon } from 'lucide-react';
import { useState, type JSX } from 'react';
import { defaultTier } from '../../../../../../constants/MTB/tier';
import { tierClasses, tierLevels } from '../../../../../../constants/options';
import { TierType } from '../../../../../../types/MTB/Recommendation.types';
import getTierString from '../../../../../../utils/functions/getTierString';
import CustomButton from '../../../../../Common/Button';
import CustomTypography from '../../../../../Common/Typography';

const Divider = styled(MuiDivider)({
  height: '1px',
  width: '100%',
  margin: '24px 0',
});

const useStyles = makeStyles(() => ({
  menu: {
    width: 'min-content',
    height: '452px',
    padding: '16px',
    borderRadius: '8px',
  },
  tierBtn: {
    width: '48px',
    minWidth: '48px',
    height: '48px',
    padding: '0px',
    marginRight: '8px',
    borderRadius: '8px !important',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:disabled': {
      border: '1px solid #AEB9C5 !important',
      color: '#AEB9C5 !important',
    },
  },
}));

interface IProps {
  label: string;
  tier: TierType;
  updateTier: (tier: TierType) => void;
}

export default function TierSelectionChip({
  label,
  tier,
  updateTier,
}: IProps): JSX.Element {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleSelectLevel = (newLevel: string): void => {
    updateTier({
      ...tier,
      level: tier.level !== newLevel ? newLevel : undefined,
    });
  };

  const handleSelectClass = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const key = event.target.value.toLowerCase().slice(0, 1);
    updateTier({
      ...tier,
      class: {
        ...tier.class,
        [key]: event.target.checked,
      },
    });
  };

  const handleSelectNoTier = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateTier({
      level: undefined,
      class: {
        m: false,
        i: false,
        p: false,
      },
      noTier: event.target.checked,
    });
  };

  const onModalClose = (): void => {
    // Reset tier if missing level or class
    if (
      (!tier.level && Object.values(tier.class).some((v) => v))
      || (tier.level && Object.values(tier.class).every((v) => !v))
    ) {
      updateTier(defaultTier);
    }
    setAnchorEl(null);
  };

  return (
    <>
      <CustomButton
        variant="subtle"
        size="small"
        onClick={(e): void => setAnchorEl(e.currentTarget)}
        endIcon={<ChevronDownIcon />}
        label={(
          <>
            <CustomTypography
              variant="bodyRegular"
              marginLeft="8px"
              color={corePalette.grey100}
              whiteSpace="nowrap"
              fontWeight="regular"
              truncate
            >
              {label}
            </CustomTypography>
            <CustomTypography variant="bodyRegular" style={{ marginLeft: '8px' }}>
              {getTierString(tier) || 'Unspecified'}
            </CustomTypography>
          </>
        )}
      />
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={onModalClose}
        disableRestoreFocus
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          className={classes.menu}
        >
          <CustomTypography variant="label" marginBottom="16px">
            Strength of evidence in relationship to current published literature
          </CustomTypography>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            gap="8px"
          >
            {tierLevels.map((l) => (
              <CustomButton
                key={l}
                className={classes.tierBtn}
                variant="outline"
                label={l}
                onClick={(): void => handleSelectLevel(l)}
                disabled={tier.noTier}
                sx={{
                  border: tier.level?.includes(l)
                    ? `1px solid ${corePalette.green150}`
                    : `1px solid ${corePalette.grey200}`,
                  backgroundColor: tier.level?.includes(l)
                    ? corePalette.green150
                    : corePalette.white,
                  color: tier.level?.includes(l)
                    ? corePalette.white
                    : corePalette.grey200,
                }}
              />
            ))}
          </Box>
          <Divider />
          <CustomTypography variant="label" style={{ marginBottom: '16px' }}>
            Strength of evidence in relationship to PM diagnostic platform
          </CustomTypography>
          {tierClasses.map((c) => (
            <FormControlLabel
              key={c}
              value={c}
              control={(
                <Checkbox
                  disabled={tier.noTier}
                  checked={tier.class[c.slice(0, 1).toLowerCase()]}
                  onChange={(e): void => handleSelectClass(e)}
                />
              )}
              disabled={tier.noTier}
              sx={{ margin: '8px' }}
              label={c}
              labelPlacement="end"
            />
          ))}
          <Divider />
          <FormControlLabel
            value="No tier"
            control={(
              <Checkbox
                disabled={Boolean(tier.level) || Object.keys(tier.class).some((v) => v)}
                checked={tier.noTier}
                onChange={(e): void => handleSelectNoTier(e)}
              />
            )}
            disabled={Boolean(tier.level) || Object.values(tier.class).some((v) => v)}
            sx={{ margin: '8px' }}
            label="No tier"
            labelPlacement="end"
          />
        </Box>
      </Popover>
    </>
  );
}
