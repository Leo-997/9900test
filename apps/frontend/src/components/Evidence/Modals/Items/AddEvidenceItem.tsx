import LabelledInputWrapper from '@/components/Common/LabelledInputWrapper';
import { ResourceType } from '@/types/Evidence/Resources.types';
import { ISelectOption } from '@/types/misc.types';
import { SelectChangeEvent } from '@mui/material';
import Box from '@mui/material/Box';
import { makeStyles } from '@mui/styles';
import { Dispatch, ReactNode, SetStateAction, type JSX } from 'react';
import { IExternalCitation } from '@/types/Evidence/Citations.types';
import { InputEvidence } from '../../../../types/Evidence/EvidenceInput.types';
import LoadingAnimation from '../../../Animations/LoadingAnimation';
import Select from '../../../Input/Select';
import AddCitation from '../../EvidenceList/EvidenceInputs/AddCitation';
import AddFile from '../../EvidenceList/EvidenceInputs/AddFile';
import AddUrl from '../../EvidenceList/EvidenceInputs/AddUrl';
import PubMedPreview from '../../EvidenceList/EvidenceInputs/PubMedPreview';

const useStyles = makeStyles(() => ({
  root: {
    width: 'calc(100% - 48px)',
  },
  selectButton: {
    display: 'flex',
    flex: 1,
    height: 54,
    borderRadius: 4,
    marginRight: 16,
  },
  select: {
    paddingRight: 16,
    width: 160,
    '& .MuiSelect-select:focus': {
      border: 'none',
      backgroundColor: 'white',
    },
  },
  selectItem: {
    height: 44,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      background: '#F3F7FF',
    },
  },
  textField: {
    height: 54,
    width: '100%',
  },
  deleteIcon: {
    marginTop: 16,
  },
}));

interface IProps<T extends InputEvidence> {
  item: T;
  updateItem: (data: T) => void;
  pubmedCitation: IExternalCitation | undefined | 'loading';
  setPubmedCitation: Dispatch<SetStateAction<IExternalCitation | undefined | 'loading'>>;
  evidenceInputOptions?: ISelectOption<'CITATION' | ResourceType>[];
}

function AddEvidenceItem<T extends InputEvidence>({
  item,
  updateItem,
  pubmedCitation,
  setPubmedCitation,
  evidenceInputOptions,
}: IProps<T>): JSX.Element {
  const classes = useStyles();

  const getInputComponent = (): ReactNode => {
    switch (item.ui) {
      case 'CITATION':
        return (
          <AddCitation
            onChangeData={(data): void => updateItem(data as T)}
            data={item}
            setPubmedCitation={setPubmedCitation}
          />
        );
      case 'IMG':
        return (
          <AddFile onChangeData={(data): void => updateItem(data as T)} data={{ ...item, type: 'IMG' }} />
        );
      case 'PDF':
        return (
          <AddFile onChangeData={(data): void => updateItem(data as T)} data={{ ...item, type: 'PDF' }} />
        );
      case 'LINK':
        return (
          <AddUrl onChangeData={(data): void => updateItem(data as T)} data={{ ...item, type: 'LINK' }} />
        );
      default:
        return null;
    }
  };

  const handleOnChangeOptions = (
    event: SelectChangeEvent<unknown>,
  ): void => {
    const newItem = {
      ...item,
      ui: event.target.value as typeof item.ui,
      errors: {},
    };
    setPubmedCitation(undefined);
    updateItem(newItem);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      flex={1}
    >
      <Box display="flex">
        <LabelledInputWrapper label="Resource type">
          <Select
            placeholder="Select type"
            value={item.ui ?? ''}
            inputContainerClassName={classes.select}
            options={evidenceInputOptions || []}
            onChange={handleOnChangeOptions}
          />
        </LabelledInputWrapper>
        {item.ui && getInputComponent()}
      </Box>
      {pubmedCitation === 'loading' && (
        <div style={{ minHeight: '264px', display: 'flex', alignItems: 'center' }}>
          <LoadingAnimation />
        </div>
      )}
      {pubmedCitation && pubmedCitation !== 'loading' && (
        <PubMedPreview pubmedCitation={pubmedCitation} />
      )}
    </Box>
  );
}

export default AddEvidenceItem;
