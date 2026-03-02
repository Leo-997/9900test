import CustomTypography from '@/components/Common/Typography';
import { corePalette } from '@/themes/colours';
import { Box } from '@mui/material';
import { IMolecularAlterationDetail } from '@/types/MTB/MolecularAlteration.types';
import { Dispatch, SetStateAction, type JSX } from 'react';
import RoundedAlterationChip from '../../Common/RoundedAlterationChip';

interface IProps {
  allTargets: IMolecularAlterationDetail[];
  selectedTargets: IMolecularAlterationDetail[];
  setSelectedTargets: Dispatch<SetStateAction<IMolecularAlterationDetail[]>>;
  subtitle: string;
  updateTitlePrefilling?: (newTargets: IMolecularAlterationDetail[]) => void;
}

export default function TargetSection({
  allTargets,
  selectedTargets,
  setSelectedTargets,
  subtitle,
  updateTitlePrefilling,
}: IProps): JSX.Element {
  const sortTargets = (target:IMolecularAlterationDetail): number => {
    let order: number;
    switch (target.mutationType) {
      case 'SNV':
        order = 0;
        break;
      case 'CNV':
        order = 1;
        break;
      case 'SV':
        order = 2;
        break;
      case 'RNA_SEQ':
        order = 3;
        break;
      case 'CYTOGENETICS':
      case 'CYTOGENETICS_ARM':
      case 'CYTOGENETICS_CYTOBAND':
        order = 4;
        break;
      case 'GERMLINE_CNV':
      case 'GERMLINE_CYTO':
      case 'GERMLINE_CYTO_ARM':
      case 'GERMLINE_CYTO_CYTOBAND':
      case 'GERMLINE_SNV':
      case 'GERMLINE_SV':
        order = 5;
        break;
      case 'METHYLATION':
      case 'METHYLATION_MGMT':
      case 'METHYLATION_CLASSIFIER':
      case 'METHYLATION_GENE':
        order = 6;
        break;
      case 'TMB':
        order = 7;
        break;
      case 'IPASS':
        order = 8;
        break;
      default:
        order = 9;
    }
    return order;
  };
  return (
    <Box display="flex" flexDirection="column">
      <CustomTypography variant="titleRegular" fontWeight="medium">
        Target
      </CustomTypography>
      <CustomTypography variant="bodyRegular" style={{ color: corePalette.grey100 }}>
        {subtitle}
      </CustomTypography>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        flexWrap="wrap"
        width="100%"
      >
        {allTargets
          .sort(
            (a, b) => (sortTargets(a) - sortTargets(b))
            || a.alteration.localeCompare(b.alteration),
          )
          .map(
            (a) => (
              <RoundedAlterationChip
                key={a.id}
                alteration={a}
                isSelected={selectedTargets.map((t) => t.id).includes(a.id)}
                setTargets={setSelectedTargets}
                updateTitlePrefilling={updateTitlePrefilling}
              />
            ),
          )}
      </Box>
    </Box>
  );
}
