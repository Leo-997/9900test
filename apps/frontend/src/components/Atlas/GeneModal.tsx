import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IGeneList, IGeneListGene } from '@/types/Reports/GeneLists.types';
import {
  Box,
} from '@mui/material';
import { DnaIcon } from 'lucide-react';
import { Fragment, useEffect, useState, type JSX } from 'react';
import LoadingAnimation from '../Animations/LoadingAnimation';
import CustomModal from '../Common/CustomModal';
import CustomTypography from '../Common/Typography';
import { RichTextEditor } from '../Input/RichTextEditor/RichTextEditor';
import GeneTable from './GeneTable';

interface IGeneModalProps {
  open: boolean;
  onClose: () => void;
  gene: IGeneListGene;
  listType: string;
}

export interface IPanelItem {
  name: string;
  chip: string | null;
  isGermline: boolean,
  version: string;
}

export default function GeneModal({
  open, onClose, gene, listType,
}: IGeneModalProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const [geneLists, setGeneLists] = useState<IGeneList[]>();
  const [note, setNote] = useState<string>(gene.note || '');

  const canEdit = useIsUserAuthorised('atlas.write');

  // fetch gene data
  useEffect(() => {
    const fetchGeneData = async (): Promise<void> => {
      try {
        const resp = await zeroDashSdk.services.reports.getGeneLists({
          geneId: gene.geneId,
          isActive: 'all',
          orderBy: ['version:asc'],
          includeGenes: false,
        });
        setGeneLists(resp);
      } catch (err) {
        console.error('Failed to fetch gene data:', err);
      }
    };
    if (open) {
      setGeneLists(undefined);
      fetchGeneData();
    }
  }, [gene.geneId, zeroDashSdk.services.reports, open]);

  const handleClose = (): void => {
    onClose();
  };

  const handleSave = async (newText: string): Promise<void> => {
    await zeroDashSdk.services.reports.updateGeneNote({
      geneId: gene.geneId,
      note: newText,
    });
    setNote(newText);
  };

  // get panel names, chips, versions, links
  const getPanels = (prev: IGeneList[]): IPanelItem[] => {
    const panels: Record<string, IPanelItem> = {};

    for (const list of prev) {
      const panel: IPanelItem = {
        name: '',
        chip: null,
        isGermline: false,
        version: '',
      };

      panel.name = list.titleAbbreviation ?? list.name;
      panel.chip = list.codeAbbreviation ?? '';
      panel.isGermline = list.type === 'germline';
      panel.version = list.version;
      if (!panels[panel.name]) {
        panels[panel.name] = panel;
      }
    }

    return [...Object.values(panels)];
  };

  return (
    <CustomModal
      title={(
        <Box display="flex" flexDirection="row" alignItems="center" gap="8px">
          <CustomTypography variant="titleRegular" fontWeight="medium">
            {gene.gene}
          </CustomTypography>
          {gene.isSomaticGermline && listType === 'somatic' ? <DnaIcon /> : <Fragment key="empty-fragment" />}
        </Box>
      )}
      open={open}
      onClose={handleClose}
      content={(
        <>
          {geneLists === undefined ? (
            <LoadingAnimation />
          ) : (
            <GeneTable geneData={getPanels(geneLists)} />
          )}
          <Box
            mt={3}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              '& .editor': {
                maxHeight: '400px',
              },
            }}
          >
            <RichTextEditor
              title={(
                <CustomTypography variant="titleRegular" fontWeight="medium" sx={{ mr: 2 }}>Notes</CustomTypography>
              )}
              mode={canEdit ? 'normal' : 'readOnly'}
              initialText={note}
              onSave={handleSave}
              classNames={{
                editor: 'editor',
              }}
            />
          </Box>
        </>
      )}
      showActions={{ cancel: false, confirm: false, secondary: false }}
      sx={{
        '& .MuiPaper-root, .CustomDialog-ScrollableSection': {
          maxWidth: 'min(800px, 100vw - 60px) !important',
        },
      }}
    />
  );
}
