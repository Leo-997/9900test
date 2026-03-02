import React, { ReactNode, useState, type JSX } from 'react';
import { Box } from '@mui/material';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { makeStyles } from '@mui/styles';
import { getClinicalSVGenes } from '@/utils/functions/getSVGenes';
import { DisruptedTypes, SvType } from '@/types/SV.types';
import CustomTypography from '../../../../../../Common/Typography';
import mapMutationType from '../../../../../../../utils/functions/mapMutationType';
import AlterationSummaryEditModal from '../../../Summary/AlterationSummaryEditModal';
import { useZeroDashSdk } from '../../../../../../../contexts/ZeroDashSdkContext';
import {
  nonGeneAlterationTypes,
} from '../../../../../../../constants/alterations';
import { useClinical } from '../../../../../../../contexts/ClinicalContext';
import CustomButton from '../../../../../../Common/Button';
import { IMolecularAlterationDetail } from '../../../../../../../types/MTB/MolecularAlteration.types';
import { useActiveSlide } from '../../../../../../../contexts/ActiveSlideContext';

const useStyles = makeStyles(() => ({
  header: {
    width: '100%',
    height: '88px',
    padding: '24px 32px',
    backgroundColor: '#FAFBFC',
    borderBottom: '1px solid #D0D9E2',
  },
}));

interface IModalHeaderProps {
  alteration: IMolecularAlterationDetail;
  title?: ReactNode;
}

export default function ModalHeader({
  alteration,
  title,
}: IModalHeaderProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const {
    clinicalVersion,
    isPresentationMode,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();
  const {
    slide,
    updateSlideData,
  } = useActiveSlide();

  const [open, setOpen] = useState<boolean>(false);

  const canEditAlterationDetails = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;

  const updateAlteration = async (): Promise<void> => {
    const newAlt = await zeroDashSdk.mtb.molAlteration.getMolAlterationById(
      clinicalVersion.id,
      alteration.id,
    );
    updateSlideData('alterations', slide?.alterations?.map((a) => ({
      ...(a.id === alteration.id
        ? newAlt
        : a
      ),
    })));
  };

  const getHeader = (alt: IMolecularAlterationDetail): string => {
    const isNonGene = nonGeneAlterationTypes.includes(alt.mutationType);

    if (!isNonGene) {
      const gene = alt.mutationType.includes('SV') && alt.additionalData
        ? getClinicalSVGenes({
          startGene: alt.additionalData.startGene.toString(),
          endGene: alt.additionalData.endGene.toString(),
          markDisrupted: alt.additionalData.markDisrupted as DisruptedTypes,
          svType: alt.additionalData.svType as SvType,
        })
        : alt.gene;
      return `${mapMutationType(alt.mutationType)} on gene ${gene}`;
    }

    try {
      switch (alt.mutationType) {
        case 'CYTOGENETICS_CYTOBAND':
        case 'CYTOGENETICS_ARM':
        case 'GERMLINE_CYTO_CYTOBAND':
        case 'GERMLINE_CYTO_ARM':
          return `${mapMutationType(alt.mutationType)} - ${
            alt.additionalData?.chromosome
          }${alt.additionalData?.arm} ${
            alt.additionalData?.type
          }`;

        case 'METHYLATION_MGMT':
          return `${mapMutationType(alt.mutationType)} - MGMT`;

        case 'METHYLATION_CLASSIFIER':
          return `${mapMutationType(alt.mutationType)} - ${
            alt.additionalData?.classifier
          }`;

        case 'MUTATIONAL_SIG':
          return alt.alteration;

        default:
          return alt.gene;
      }
    } catch (error) {
      return `${mapMutationType(alt.mutationType)} - `;
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      className={classes.header}
    >
      <CustomTypography truncate variant="h3" fontWeight="medium">
        {getHeader(alteration)}
      </CustomTypography>
      {title}
      {!isPresentationMode && (
        <CustomButton
          disabled={!canEditAlterationDetails}
          variant="text"
          size="small"
          label="Manage Clinical Interpretation"
          onClick={(): void => setOpen(true)}
        />
      )}
      <AlterationSummaryEditModal
        open={open}
        closeModal={(): void => setOpen(false)}
        molAlterationId={alteration.id}
        onDataChange={updateAlteration}
        isModalView
        isForNonGeneType={nonGeneAlterationTypes.includes(alteration.mutationType)}
      />
    </Box>
  );
}
