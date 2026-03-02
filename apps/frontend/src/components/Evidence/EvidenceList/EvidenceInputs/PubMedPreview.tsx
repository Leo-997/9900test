import { Box } from '@mui/material';
import { ExternalCitationSource, IExternalCitation } from '@/types/Evidence/Citations.types';
import CustomTypography from '@/components/Common/Typography';
import { corePalette } from '@/themes/colours';
import TextPreviewField from '../../../TextPreviewField/TextPreviewField';

import type { JSX } from "react";

interface IProps {
  pubmedCitation: IExternalCitation;
}

function PubMedPreview({
  pubmedCitation,
}: IProps): JSX.Element {
  const {
    source,
    publicationYear,
    url,
    title,
    authors,
    publicationName,
    duplicateId,
  } = pubmedCitation;

  const sourceToLabelMap: Record<ExternalCitationSource, string> = {
    PUBMED: 'PubMed',
    PMC: 'PubMed Central',
  };

  return (
    <Box display="flex" flexDirection="column" rowGap="24px">
      { duplicateId && (
      <Box display="flex" columnGap="16px" width="100%">
        <CustomTypography variant="label" color={corePalette.red200}>
          This citation has already been added to the evidence library.
          Please search for it using its ID:
          {' '}
          {duplicateId}
        </CustomTypography>
      </Box>
      )}
      <Box display="flex" columnGap="16px">
        <TextPreviewField title="Source" value={sourceToLabelMap[source]} style={{ width: '200px' }} />
        <TextPreviewField title="Year" value={publicationYear || '-'} style={{ width: '200px' }} />
        <TextPreviewField title="URL link (Optional)" value={url} style={{ width: '360px' }} />
      </Box>
      <Box display="flex" columnGap="16px" width="100%">
        <TextPreviewField title="Title" value={title || '-'} style={{ width: '100%' }} />
      </Box>
      <Box display="flex" columnGap="16px">
        <TextPreviewField title="Author" value={authors || '-'} style={{ width: '390px' }} />
        <TextPreviewField title="Publication Name" value={publicationName || '-'} style={{ width: '386px' }} />
      </Box>
    </Box>
  );
}

export default PubMedPreview;
