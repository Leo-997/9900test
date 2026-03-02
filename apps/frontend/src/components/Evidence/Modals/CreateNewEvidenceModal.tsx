import {
  DialogContent,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import { useCallback, useState, type JSX } from 'react';
import CustomModal from '@/components/Common/CustomModal';
import { evidenceInputOptions } from '@/constants/Common/evidence';
import { ResourceType } from '@/types/Evidence/Resources.types';
import { ISelectOption } from '@/types/misc.types';
import { CitationSource, IExternalCitation } from '@/types/Evidence/Citations.types';
import useEvidences from '../../../api/useEvidences';
import { evidenceInputSchema } from '../../../schemas/evidenceInput.schema';
import { InputEvidence } from '../../../types/Evidence/EvidenceInput.types';
import { IGeneralEvidenceData } from '../../../types/Evidence/Evidences.types';
import AddEvidenceItem from './Items/AddEvidenceItem';
import { AddNewEvidenceLevel } from './Items/AddNewEvidenceLevel';

const useStyles = makeStyles(() => ({
  dialogRoot: {
    width: '100%',
    maxWidth: '1024px',
    borderRadius: '16px',
    justifyContent: 'space-between',
  },
  header: {
    width: '100%',
    padding: '32px 72px',
  },
  iconBtn: {
    width: '24px',
    height: '24px',
    position: 'absolute',
    top: '34px',
    left: '32px',
  },
  content: {
    paddingLeft: '72px',
    paddingRight: '72px',
  },
  footer: {
    padding: '32px 0',
  },
  btnBox: {
    marginRight: '32px',
  },
  saveBtn: {
    minWidth: '68px',
    marginLeft: '8px',
  },
  cancelBtn: {
    minWidth: '84px',
  },
  tabContentWrapper: {
    height: 'calc(100% - 172px)',
    overflowX: 'hidden',
  },
}));

interface IProps {
  open: boolean;
  onClose: () => void;
  hideEvidenceLevel?: boolean;
  hideClinicalSummary?: boolean;
  onSubmit?: (
    evidenceId: string,
    evidenceData?: IGeneralEvidenceData,
  ) => void;
  inputOptions?: ISelectOption<'CITATION' | ResourceType>[];
}

export default function CreateNewEvidenceModal({
  open,
  onClose,
  hideEvidenceLevel = true,
  hideClinicalSummary = true,
  onSubmit,
  inputOptions = evidenceInputOptions,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const { createNewEvidence } = useEvidences();

  const [evidence, setEvidence] = useState<InputEvidence>({
    ui: null,
    errors: { invalid: 'No evidence type picked' },
  });
  const [pubmedCitation, setPubmedCitation] = useState<IExternalCitation | undefined | 'loading'>();
  const [loading, setLoading] = useState<boolean>(false);
  const [clinicalSummary, setClinicalSummary] = useState<string>('');
  const [levels, setLevels] = useState<string[]>([]);

  const validateInput = useCallback((): boolean => {
    let isItemValid = false;

    if (evidence.ui) {
      evidenceInputSchema[evidence.ui]
        .validate(evidence, { abortEarly: false })
        .catch((rawErrors) => {
          const errors = {};
          rawErrors.inner.forEach((e) => {
            Object.assign(errors, { [e.path]: e.message });
          });
          // showing error states only if the user is submitting
          setEvidence((prev) => ({ ...prev, errors }));
        });
      isItemValid = evidenceInputSchema[evidence.ui].isValidSync(evidence);
    }

    return isItemValid;
  }, [evidence]);

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);

    if (!validateInput()) {
      enqueueSnackbar(
        'Missing or invalid input. Please review before submitting',
        { variant: 'error' },
      );
      setLoading(false);
      return;
    }

    const evidenceData: IGeneralEvidenceData = {
      clinicalSummary,
      evidenceLevels: levels,
    };

    try {
      if (evidence.ui === 'CITATION') {
        // type casting here cause we can never reach here
        // without these being set
        // But as the user is entering the data
        // Some the fields will be undefined
        evidenceData.citation = {
          title: evidence.title as string,
          publication: evidence.publication,
          year: evidence.year,
          source: evidence.source as CitationSource,
          link: evidence.link,
          externalId: evidence.externalId,
          authors: evidence.authors,
        };
      } else if (evidence.ui === 'LINK') {
        evidenceData.resource = {
          type: 'LINK',
          name: evidence.name,
          url: evidence.url,
        };
      } else if (evidence.ui === 'PDF' || evidence.ui === 'IMG') {
        evidenceData.resource = {
          type: evidence.ui,
          name: evidence.name,
          file: evidence.file,
        };
      }

      const evidenceId = await createNewEvidence(evidenceData, '');
      if (onSubmit) {
        onSubmit(evidenceId, evidenceData);
      }

      enqueueSnackbar('Added evidence successfully', { variant: 'success' });
      setLoading(false);
      onClose();
    } catch {
      enqueueSnackbar('Error submitting evidence, please try again', { variant: 'error' });
      setLoading(false);
    }
  };

  return (
    <CustomModal
      title="Add evidence"
      open={open}
      onClose={onClose}
      buttonText={{ cancel: 'Close', confirm: 'Save' }}
      onConfirm={handleSubmit}
      confirmDisabled={
        loading
        || (typeof pubmedCitation === 'object' && Boolean(pubmedCitation.duplicateId))
      }
      variant="create"
      content={(
        <DialogContent className={classes.content}>
          <AddEvidenceItem
            item={evidence}
            updateItem={(data): void => setEvidence(data)}
            pubmedCitation={pubmedCitation}
            setPubmedCitation={setPubmedCitation}
            evidenceInputOptions={inputOptions}
          />
          {!hideClinicalSummary && (
            <AddNewEvidenceLevel
              hideEvidenceLevel={hideEvidenceLevel}
              evidence={evidence}
              setClinicalSummary={setClinicalSummary}
              levels={levels}
              setLevels={setLevels}
            />
          )}
        </DialogContent>
      )}
    />
  );
}
