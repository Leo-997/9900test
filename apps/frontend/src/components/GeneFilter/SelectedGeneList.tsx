import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import {
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react';
import { PlusIcon } from 'lucide-react';
import { IGene } from '../../types/Common.types';
import ChipsList from '../Chips/ChipsList';
import CustomButton from '../Common/Button';

const useStyles = makeStyles(() => ({
  menu: {
    overflowY: 'auto',
  },
  menuItem: {
    height: '48px',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#022034',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      backgroundColor: '#F3F7FF',
    },
  },
  checkboxChecked: {
    color: '#1E86FC !important',
  },
  checkboxUnchecked: {
    color: '#273957 !important',
  },
  crossIcon: {
    marginLeft: 16,
    width: 24,
    height: 24,
  },
  containerBox: {
    width: 473,
    minHeight: 45,
  },
  applyFilterBtn: {
    height: 48,
  },
  clearAllBtn: {
    height: 48,
  },
  btn: {
    padding: '10px 10px',
    borderRadius: '8px',
    width: 140,
    height: 40,
    textTransform: 'none',
    color: '#000',
    backgroundColor: '#ECF0F3',
    boxShadow: '0 2px 2px 0 rgba(0, 126, 255, 0.12)',
  },
  btnDiscard: {
    marginRight: 16,
    color: '#000',
    backgroundColor: '#ECF0F3',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      backgroundColor: 'rgba(236, 240, 243, 0.8)',
    },
  },
  btnMargin: {
    marginRight: 16,
  },
  btnFlag: {
    color: '#FFF',
    backgroundColor: '#1E86FC',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      backgroundColor: 'rgba(30, 134, 252, 0.8)',
    },
  },
}));

interface IProps {
  defaultValue: IGene[];
  onChange: (newList: IGene[]) => void;
  selectedGeneList: IGene[];
  setSelectedGeneList: Dispatch<SetStateAction<IGene[]>>;
  setAnchorElGeneList: Dispatch<SetStateAction<HTMLElement | null>>;
  setViewPastedGeneList: Dispatch<SetStateAction<boolean>>;
  setInvalidGeneList: Dispatch<SetStateAction<IGene[]>>;
  setNewListSection: Dispatch<SetStateAction<boolean>>;
}

export default function SelectedGeneList({
  defaultValue,
  onChange,
  selectedGeneList,
  setSelectedGeneList,
  setAnchorElGeneList,
  setViewPastedGeneList,
  setInvalidGeneList,
  setNewListSection,
}: IProps): JSX.Element {
  const classes = useStyles();

  const [latestList, setLatestList] = useState<IGene[]>([]);

  const canEdit = useIsUserAuthorised('curation.gene.list.write');

  const handleDelete = (geneId: string): void => {
    const updatedGenelist = selectedGeneList.filter(
      (item: IGene) => item.gene !== geneId,
    );
    setSelectedGeneList(updatedGenelist);
  };

  const handleSubmit = (): void => {
    onChange([...selectedGeneList]);
    setLatestList(selectedGeneList.slice());
    setViewPastedGeneList(false);
    setAnchorElGeneList(null);
    setSelectedGeneList([]);
  };

  const geneListsEqual = (
    latestGeneList: IGene[],
    newGeneList: IGene[],
  ): boolean => {
    if (latestGeneList.length !== newGeneList.length) {
      return false;
    }

    for (const latestGene of latestGeneList) {
      if (newGeneList.every((selectedGene) => selectedGene.gene !== latestGene.gene)) {
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    if (defaultValue.length === 0) {
      setLatestList(defaultValue);
    }
  }, [defaultValue]);

  return (
    <Box display="flex" flexDirection="column" style={{ margin: 12 }}>
      <ChipsList
        type="success"
        chips={selectedGeneList.map((g) => ({
          label: g.gene,
          key: g.gene,
        }))}
        handleDelete={handleDelete}
        successTitle="CUSTOM GENE LIST"
        errorTitle="THE FOLLOWING GENES COULD NOT BE ADDED AS THEY COULD NOT BE VALIDATED"
      />
      <Box
        display="flex"
        flexDirection="row"
        style={{ marginTop: 12, gap: '8px' }}
        justifyContent="flex-end"
      >
        <CustomButton
          size="small"
          className={classes.btnMargin}
          onClick={(): void => {
            setSelectedGeneList([]);
            setInvalidGeneList([]);
          }}
          label="Clear all"
          variant="subtle"
        />
        {canEdit && (
          <CustomButton
            className={clsx(classes.btnMargin)}
            onClick={(): void => {
              setNewListSection(true);
              setViewPastedGeneList(false);
            }}
            label="Save new list"
            variant="outline"
            startIcon={<PlusIcon />}
            size="small"
          />
        )}
        <CustomButton
          size="small"
          variant="bold"
          label={`Apply Filter (${selectedGeneList.length})`}
          disabled={geneListsEqual(latestList, selectedGeneList)}
          onClick={handleSubmit}
        />
      </Box>

    </Box>
  );
}
