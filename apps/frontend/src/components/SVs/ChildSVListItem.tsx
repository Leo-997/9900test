import { Box } from '@mui/material';
import type { JSX } from 'react';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { getCurationSVGenes } from '@/utils/functions/getSVGenes';
import { useCuration } from '../../contexts/CurationContext';
import { SVVariants } from '../../types/SV.types';
import CustomButton from '../Common/Button';
import CustomTypography from '../Common/Typography';
import InframeTooltip from '../Tooltip/InframeTooltip';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';

interface IProps<T extends SVVariants> {
  sv: T;
  handleSetDefaultSV: (promotedSV: T) => Promise<void>;
}

export default function ChildSVListItem<T extends SVVariants>({
  sv,
  handleSetDefaultSV,
}: IProps<T>): JSX.Element {
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: sv?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const canEdit = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="16px"
      padding="8px 12px"
      borderTop="1px solid #D0D9E2"
    >
      <Box
        display="flex"
        gap="16px"
        position="sticky"
        left="12px"
        paddingRight="16px"
        paddingLeft="12px"
        minWidth="388px"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <Box width="120px" display="flex" justifyContent="center">
          <CustomButton
            variant="text"
            label="Default"
            size="small"
            onClick={() => { handleSetDefaultSV(sv); }}
            disabled={!canEdit}
          />
        </Box>
        <CustomTypography
          variant="titleRegular"
          fontWeight="medium"
        >
          {getCurationSVGenes(sv)}
        </CustomTypography>
      </Box>
      <CustomTypography truncate style={{ flex: 1 }}>
        {sv.svType}
      </CustomTypography>
      <CustomTypography truncate style={{ flex: 4 }}>
        {
          sv.startFusion.includes(':') && sv.startFusion.split(':')[1]
            ? `${sv.startFusion.split(':')[1].replace('Exon', '')} of ${sv.startGeneExons} ${sv.startGeneExons === 1 ? 'exon' : 'exons'}`
            : sv.startFusion
        }
      </CustomTypography>
      <CustomTypography truncate style={{ flex: 4 }}>
        {
          sv.endFusion.includes(':') && sv.endFusion.split(':')[1]
            ? `${sv.endFusion.split(':')[1].replace('Exon', '')} of ${sv.endGeneExons} ${sv.endGeneExons === 1 ? 'exon' : 'exons'}`
            : sv.endFusion
        }
      </CustomTypography>
      <CustomTypography truncate style={{ flex: 3 }}>
        {sv.rnaconf || 'None'}
      </CustomTypography>
      <CustomTypography truncate style={{ flex: 2 }}>
        {sv.platforms}
      </CustomTypography>
      <CustomTypography
        style={{ flex: 2 }}
        truncate
        tooltipText={sv.inframe ? <InframeTooltip inframe={sv.inframe} /> : ''}
      >
        {!sv.inframe ? 'Unknown' : sv.inframe}
      </CustomTypography>
    </Box>
  );
}
