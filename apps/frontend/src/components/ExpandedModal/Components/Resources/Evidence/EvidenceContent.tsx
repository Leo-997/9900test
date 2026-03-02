import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { PlusIcon } from 'lucide-react';
import type { JSX } from 'react';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useCuration } from '../../../../../contexts/CurationContext';
import { VariantType } from '../../../../../types/misc.types';
import CustomButton from '../../../../Common/Button';
import EvidenceList from '../../../../Evidence/EvidenceList/EvidenceList';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';

const useStyles = makeStyles({
  root: {
    paddingTop: 12,
  },
  btnText: {
    textTransform: 'none',
    color: '#1E86FC',
  },
});

interface IEvidenceContentProps {
  variantType: VariantType;
  variantId: string | number;
  handleExpandPanel: () => void;
}

function EvidenceContent({
  variantType,
  variantId,
  handleExpandPanel,
}: IEvidenceContentProps): JSX.Element {
  const classes = useStyles();
  const { getBiosampleForVariantType } = useAnalysisSet();
  const { isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({
    biosampleId: getBiosampleForVariantType(variantType)?.biosampleId,
  });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const canAddEvidence = useIsUserAuthorised('curation.evidence.write');

  return (
    <Box
      display="flex"
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="flex-start"
      className={classes.root}
    >
      {!isReadOnly && canAddEvidence && (
        <CustomButton
          size="small"
          variant="text"
          label="Add Evidence"
          startIcon={<PlusIcon />}
          onClick={handleExpandPanel}
          style={{ marginLeft: '8px' }}
        />
      )}
      <EvidenceList variantId={variantId} variantType={variantType} />
    </Box>
  );
}

export default EvidenceContent;
