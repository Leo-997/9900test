import { Box, Grid, IconButton } from '@mui/material';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useState, type JSX } from 'react';
import { getCurationSVGenes } from '@/utils/functions/getSVGenes';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useCuration } from '../../contexts/CurationContext';
import { SVVariants } from '../../types/SV.types';
import CustomButton from '../Common/Button';
import CustomTypography from '../Common/Typography';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';

interface IProps<T extends SVVariants> {
  sv: T;
  handleSetDefaultSV: (promotedSV: T) => Promise<void>;
}

export default function ChildSVModalListItem<T extends SVVariants>({
  sv,
  handleSetDefaultSV,
}: IProps<T>): JSX.Element {
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: sv?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const canEdit = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;

  return (
    <Box
      display="flex"
      flexDirection="column"
      padding="8px 12px"
      borderTop="1px solid #D0D9E2"
      minWidth="588px"
      gap="16px"
    >
      <Box
        display="flex"
        alignItems="center"
        gap="16px"
        position="relative"
      >

        <IconButton
          style={{ padding: '4px' }}
          onClick={(): void => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? (
            <ChevronUpIcon />
          ) : (
            <ChevronDownIcon />
          )}
        </IconButton>
        <CustomTypography
          truncate
          style={{
            flex: 2,
            minWidth: '110px',
          }}
        >
          {getCurationSVGenes(sv)}
        </CustomTypography>
        <CustomTypography
          truncate
          style={{
            minWidth: '40px',
          }}
        >
          {sv.svType}
        </CustomTypography>
        <CustomTypography
          truncate
          style={{
            flex: 1,
            minWidth: '80px',
          }}
        >
          {
            sv.startFusion.includes(':') && sv.startFusion.split(':')[1]
              ? `${sv.startFusion.split(':')[1].replace('Exon', '')} of ${sv.startGeneExons} ${sv.startGeneExons === 1 ? 'exon' : 'exons'}`
              : sv.startFusion
          }
        </CustomTypography>
        <CustomTypography
          truncate
          style={{
            flex: 1,
            minWidth: '80px',
          }}
        >
          {
            sv.endFusion.includes(':') && sv.endFusion.split(':')[1]
              ? `${sv.endFusion.split(':')[1].replace('Exon', '')} of ${sv.endGeneExons} ${sv.endGeneExons === 1 ? 'exon' : 'exons'}`
              : sv.endFusion
          }
        </CustomTypography>
        <CustomTypography
          truncate
          style={{
            flex: 1,
            minWidth: '80px',
          }}
        >
          {sv.rnaconf || 'None'}
        </CustomTypography>
        <Box
          position="sticky"
          right="0px"
          height="100%"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <CustomButton
            variant="text"
            label="Default"
            size="small"
            onClick={(): void => { handleSetDefaultSV(sv); }}
            disabled={!canEdit}
          />
        </Box>
      </Box>
      {isExpanded && (
        <Grid
          container
          wrap="wrap"
          spacing={2}
        >
          <Grid size={{ xs: 12, md: 3, lg: 2 }}>
            <CustomTypography variant="label">
              Gene exons
            </CustomTypography>
            <CustomTypography truncate>
              Start:
              {' '}
              {sv.startGeneExons}
            </CustomTypography>
            <CustomTypography truncate>
              End:
              {' '}
              {sv.endGeneExons}
            </CustomTypography>
          </Grid>
          <Grid size={{ xs: 12, md: 5, lg: 7 }}>
            <CustomTypography variant="label">
              Location
            </CustomTypography>
            <CustomTypography truncate>
              {sv.startFusion}
            </CustomTypography>
            <CustomTypography truncate>
              {sv.endFusion}
            </CustomTypography>
          </Grid>
          <Grid size={{ xs: 12, md: 3, lg: 2 }}>
            <CustomTypography variant="label">
              Ploidy
            </CustomTypography>
            <CustomTypography truncate>
              {sv.ploidy}
            </CustomTypography>
          </Grid>
          <Grid size={{ xs: 12, md: 3, lg: 3 }}>
            <CustomTypography variant="label">
              Disrupted
            </CustomTypography>
            <CustomTypography truncate>
              {sv.predictedDisrupted || 'Unknown'}
            </CustomTypography>
          </Grid>
          <Grid size={{ xs: 12, md: 3, lg: 3 }}>
            <CustomTypography variant="label">
              WGS Confidence
            </CustomTypography>
            <CustomTypography truncate>
              {sv.wgsconf}
            </CustomTypography>
          </Grid>
          <Grid size={{ xs: 12, md: 2, lg: 3 }}>
            <CustomTypography variant="label">
              In frame
            </CustomTypography>
            <CustomTypography truncate>
              {sv.inframe}
            </CustomTypography>
          </Grid>
          <Grid size={{ xs: 12, md: 2, lg: 3 }}>
            <CustomTypography variant="label">
              Platform
            </CustomTypography>
            <CustomTypography truncate>
              {sv.platforms}
            </CustomTypography>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
