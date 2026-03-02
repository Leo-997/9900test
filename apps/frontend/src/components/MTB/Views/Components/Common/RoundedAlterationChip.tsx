import CustomChip from '@/components/Common/Chip';
import { corePalette } from '@/themes/colours';
import { Box } from '@mui/material';
import { CheckIcon, PlusIcon } from 'lucide-react';
import { Dispatch, SetStateAction, type JSX } from 'react';
import { VariantType } from '../../../../../types/misc.types';
import { IMolecularAlterationDetail } from '../../../../../types/MTB/MolecularAlteration.types';
import { getGeneOrNonGene } from '../../../../../utils/functions/getGeneOrNonGeneBasedAlteration';
import mapMutationType from '../../../../../utils/functions/mapMutationType';
import CustomTypography from '../../../../Common/Typography';

interface IProps {
  alteration: IMolecularAlterationDetail;
  isSelected: boolean;
  setTargets: Dispatch<SetStateAction<IMolecularAlterationDetail[]>>;
  updateTitlePrefilling?: (newTargets: IMolecularAlterationDetail[]) => void;
}

export default function RoundedAlterationChip({
  alteration,
  isSelected,
  setTargets,
  updateTitlePrefilling,
}: IProps): JSX.Element {
  const handleClick = (): void => {
    if (isSelected) {
      setTargets((prev) => {
        const newTargets = prev.filter((s) => s.id !== alteration.id);
        updateTitlePrefilling?.(newTargets);
        return newTargets;
      });
    } else {
      setTargets((prev) => {
        const newTargets = [...prev, alteration];
        updateTitlePrefilling?.(newTargets);
        return newTargets;
      });
    }
  };

  return (
    <CustomChip
      variant="outlined"
      onClick={handleClick}
      colour={isSelected ? corePalette.green150 : corePalette.grey100}
      backgroundColour={isSelected ? corePalette.green10 : corePalette.white}
      sx={{
        marginTop: '8px',
        marginRight: '8px',
        borderColor: isSelected ? corePalette.green150 : corePalette.grey100,
      }}
      pill
      size="medium"
      label={(
        <Box display="flex" flexDirection="row" alignItems="center">
          <Box display="flex" flexDirection="row" alignItems="center" height="100%" paddingRight="8px">
            {isSelected ? (
              <CheckIcon />
            ) : (
              <PlusIcon />
            )}
          </Box>
          <Box display="flex" flexDirection="row" alignItems="baseline">
            <CustomTypography
              truncate
              variant="bodyRegular"
              fontWeight="bold"
              sx={{
                color: isSelected ? corePalette.green150 : corePalette.offBlack100,
                maxWidth: '120px',
              }}
            >
              {getGeneOrNonGene(alteration)}
            </CustomTypography>
            <CustomTypography
              variant="bodySmall"
              fontWeight="regular"
              sx={{
                color: isSelected ? corePalette.green150 : corePalette.grey100,
                marginLeft: '5px',
              }}
            >
              {mapMutationType(alteration.mutationType as VariantType)}
            </CustomTypography>
          </Box>
        </Box>
      )}
    />
  );
}
