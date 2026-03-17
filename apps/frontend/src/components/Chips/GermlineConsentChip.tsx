import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useUser } from '@/contexts/UserContext';
import { corePalette } from '@/themes/colours';
import { IPatientGermlineConsent } from '@/types/Patient/Patient.types';
import { Box, Menu, MenuItem } from '@mui/material';
import { DnaIcon } from 'lucide-react';
import { useMemo, useState, type JSX } from 'react';
import CustomChip from '../Common/Chip';
import { CustomCheckbox } from '../Input/CustomCheckbox';

interface IProps {
  germlineConsent: IPatientGermlineConsent;
}

export function GermlineConsentChip({
  germlineConsent,
}: IProps): JSX.Element {
  const { currentUser } = useUser();
  const { updateDemographics, demographics } = useAnalysisSet();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const isNonProd = [
    'local',
    'development',
    'staging',
  ].includes(import.meta.env.VITE_ENV);

  const canChangeConsent = currentUser?.roles.some((r) => r.name === 'ZeroDash Admin') && isNonProd;

  const label = useMemo(() => {
    if (germlineConsent.germlineConsent || germlineConsent.category2Consent) {
      return 'CONSENT GIVEN';
    }
    if (germlineConsent.category1Consent) {
      return 'CAT 2 DECLINED';
    }
    if (germlineConsent.category1Consent === false) {
      return 'DECLINED (18+)';
    }
    return undefined;
  }, [
    germlineConsent.category1Consent,
    germlineConsent.category2Consent,
    germlineConsent.germlineConsent,
  ]);

  const props = useMemo(() => ({
    backgroundColour: germlineConsent.germlineConsent || germlineConsent.category2Consent
      ? corePalette.white
      : corePalette.red10,
    colour: germlineConsent.germlineConsent || germlineConsent.category2Consent
      ? corePalette.offBlack100
      : corePalette.red200,
    border: `1px solid ${
      germlineConsent.germlineConsent || germlineConsent.category2Consent
        ? corePalette.offBlack100
        : corePalette.red200
    }`,
  }), [germlineConsent.category2Consent, germlineConsent.germlineConsent]);

  return label ? (
    (<>
      <CustomChip
        label={(
          <Box display="flex" gap="4px" alignItems="center">
            <DnaIcon size={16} />
            {label}
          </Box>
        )}
        onClick={canChangeConsent ? (e): void => setMenuAnchor(e.currentTarget) : undefined}
        sx={{
          ':hover': {
            cursor: canChangeConsent ? 'pointer' : 'default',
          },
        }}
        {...props}
      />
      {menuAnchor && (
        <Menu
          open={Boolean(menuAnchor)}
          anchorEl={menuAnchor}
          onClose={(): void => setMenuAnchor(null)}
        >
          <MenuItem>
            <CustomCheckbox
              labelProps={{ label: 'Old germline consent' }}
              checked={Boolean(demographics?.germlineConsent)}
              onChange={(e, checked): void => {
                updateDemographics(
                  demographics
                    ? { ...demographics, germlineConsent: checked }
                    : demographics,
                );
              }}
            />
          </MenuItem>
          <MenuItem>
            <CustomCheckbox
              labelProps={{ label: 'Category 1 consent' }}
              checked={Boolean(demographics?.category1Consent)}
              onChange={(e, checked): void => {
                updateDemographics(
                  demographics
                    ? { ...demographics, category1Consent: checked }
                    : demographics,
                );
              }}
            />
          </MenuItem>
          <MenuItem>
            <CustomCheckbox
              labelProps={{ label: 'Category 2 consent' }}
              checked={Boolean(demographics?.category2Consent)}
              onChange={(e, checked): void => {
                updateDemographics(
                  demographics
                    ? { ...demographics, category2Consent: checked }
                    : demographics,
                );
              }}
            />
          </MenuItem>
        </Menu>
      )}
    </>)
  // eslint-disable-next-line react/jsx-no-useless-fragment
  ) : <></>;
}
