import {
  Box,
  Divider, Menu,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { PlusIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useCallback, useState, type JSX } from 'react';
import { geneVariantTypeOptions } from '../../constants/Common/variants';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IGeneMutation } from '../../types/Common.types';
import { VariantType } from '../../types/misc.types';
import ChipsList from '../Chips/ChipsList';
import CustomButton from '../Common/Button';
import CustomTypography from '../Common/Typography';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';
import ListMenu from './ListMenu';

const useStyles = makeStyles(() => ({
  menuPaper: {
    padding: '16px',
    maxWidth: '500px',
  },
  chip: {
    backgroundColor: '#D7EAFC',
    color: '#006FED',
    margin: 4,

    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiChip-deleteIcon': {
      color: '#75B6FF',
    },
  },
  select: {
    width: '200px',
  },
}));

interface IProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
  onChange: (newList: IGeneMutation[]) => void;
}

export default function GeneMutationFilterMenu({
  anchorEl,
  setAnchorEl,
  onChange,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();

  const [selectedType, setSelectedType] = useState<VariantType | ''>('');
  const [geneMenuAnchorEl, setGeneMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedMutations, setSelectedMutations] = useState<IGeneMutation[]>([]);

  const getGeneOptions = useCallback(async (search?: string) => {
    const resp = await zeroDashSdk.gene.getGenes({ gene: search || '' });
    return resp.map(({ gene }) => gene);
  }, [zeroDashSdk.gene]);

  const handleClear = (): void => {
    setSelectedMutations([]);
    setSelectedType('');
  };

  const getChipLabel = (mutation: IGeneMutation): string => (
    `${geneVariantTypeOptions.find(
      (v) => v.value === mutation.variantType,
    )?.name}:${mutation.gene}`
  );

  return (
    <Menu
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      onClose={(): void => setAnchorEl(null)}
      disableRestoreFocus
      PaperProps={{
        className: classes.menuPaper,
      }}
    >
      <Box display="flex" flexDirection="column" gap="16px">
        <Box display="flex" flexDirection="column" gap="8px">
          <CustomTypography variant="label">
            Mutation type
          </CustomTypography>
          <Box display="flex" gap="8px" alignItems="center">
            <AutoWidthSelect
              options={[{ name: 'Select option', value: '' }, ...geneVariantTypeOptions]}
              defaultValue=""
              value={selectedType}
              className={classes.select}
              title="Variant Type"
              onChange={(e): void => setSelectedType(e.target.value as VariantType)}
            />
            <CustomButton
              label="Add Genes"
              variant="text"
              startIcon={<PlusIcon />}
              onClick={(e): void => setGeneMenuAnchorEl(e.currentTarget)}
              disabled={!selectedType}
            />
            <ListMenu
              value={
                selectedMutations
                  .filter((mutation) => mutation.variantType === selectedType)
                  .map(({ gene }) => gene)
              }
              onChange={(val): void => {
                if (selectedType) {
                  setSelectedMutations((prev) => [
                    ...prev.filter((mutation) => mutation.variantType !== selectedType),
                    ...val.map((gene) => ({ variantType: selectedType, gene })),
                  ]);
                }
              }}
              anchorEl={geneMenuAnchorEl}
              setAnchorEl={setGeneMenuAnchorEl}
              menuOptionsFetch={getGeneOptions}
            />
          </Box>
        </Box>
        <Divider />
        <Box display="flex" flexDirection="column" gap="8px">
          <ChipsList
            type="success"
            chips={selectedMutations.map((m) => ({
              key: getChipLabel(m),
              label: getChipLabel(m),
            }))}
            handleDelete={(m): void => setSelectedMutations((prev) => prev.filter(
              (prevMutation) => (
                getChipLabel(prevMutation) !== m
              ),
            ))}
            successTitle="Selected Mutations"
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" gap="8px">
          <CustomButton
            variant="subtle"
            label="Clear"
            size="small"
            onClick={handleClear}
          />
          <CustomButton
            variant="bold"
            label="Apply"
            size="small"
            onClick={(): void => onChange(selectedMutations)}
          />
        </Box>
      </Box>
    </Menu>
  );
}
