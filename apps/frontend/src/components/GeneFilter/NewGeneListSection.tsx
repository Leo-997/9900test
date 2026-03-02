import { geneListTypes } from '@/constants/Reports/geneLists';
import { genePanels } from '@/constants/sample';
import { GeneListType, IGeneList } from '@/types/Reports/GeneLists.types';
import { GenePanel } from '@/types/Samples/Sample.types';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import { useState, type JSX } from 'react';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IGene } from '../../types/Common.types';
import CustomButton from '../Common/Button';
import CustomTypography from '../Common/Typography';
import { CustomCheckbox } from '../Input/CustomCheckbox';
import OutlinedTextInput from '../Input/OutlinedTextInput';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';

const useStyles = makeStyles(() => ({
  textInput: {
    padding: 5,
    width: '100%',
  },
}));

interface INewGeneListSectionProps {
  selectedGeneList: IGene[];
  setNewListSection: (val: boolean) => void;
}

export default function NewGeneListSection({
  selectedGeneList,
  setNewListSection,
}: INewGeneListSectionProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();

  const [error, setError] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [version, setVersion] = useState<string>('');
  const [type, setType] = useState<GeneListType>(geneListTypes[0]);
  const [genePanel, setGenePanel] = useState<GenePanel | 'NONE'>(genePanels[0]);
  const [isHighRisk, setHighRisk] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    try {
      const lists = await zeroDashSdk.services.reports.getGeneLists({});
      const nameExists = lists.some(
        (list: IGeneList) => (
          list.name.toLowerCase() === name.toLowerCase() && list.version === version
        ),
      );
      if (nameExists) {
        setError('This name already exists');
      } else {
        await zeroDashSdk.services.reports.createGeneList({
          name,
          version,
          type,
          genePanel: genePanel === 'NONE' ? undefined : genePanel,
          isHighRisk,
          deactivateOldVersions: true,
          geneIds: selectedGeneList.map((gene) => gene.geneId),
        });
        setError('');
        setName('');
        setNewListSection(false);
        enqueueSnackbar('New list created successfully', { variant: 'success' });
      }
    } catch (err) {
      console.error(err);
      let errorMsg = '';
      if (name === '') {
        errorMsg = 'Name cannot be empty';
      } else if (selectedGeneList.length === 0) {
        errorMsg = 'Gene list cannot be empty';
      } else {
        errorMsg = 'All genes selected could not be found';
      }
      enqueueSnackbar(errorMsg, { variant: 'error' });
      setError(errorMsg);
    }
  };

  const handleCancel = (): void => {
    setName('');
    setError('');
    setNewListSection(false);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ margin: 15, gap: 8 }}
      justifyContent="flex-end"
    >
      <Box display="flex" gap="8px">
        <Box display="flex" flexDirection="column" flex={1}>
          <OutlinedTextInput
            headerTitle="New list name"
            className={classes.textInput}
            error={error !== ''}
            errorText={error}
            onChange={(e): void => setName(e.target.value)}
            value={name}
          />
        </Box>
        <Box display="flex" flexDirection="column" flex={1}>
          <OutlinedTextInput
            headerTitle="Version"
            className={classes.textInput}
            error={error !== ''}
            errorText={error}
            onChange={(e): void => setVersion(e.target.value)}
            value={version}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="row" gap="8px">
        <Box display="flex" flexDirection="column" flex={1}>
          <CustomTypography variant="label" style={{ marginBottom: 8 }}>
            Type
          </CustomTypography>
          <AutoWidthSelect
            options={geneListTypes.map((t) => ({ value: t, name: t.toUpperCase() }))}
            value={type}
            variant="outlined"
            onChange={(e): void => setType(e.target.value as GeneListType)}
          />
        </Box>
        <Box display="flex" flexDirection="column" flex={1}>
          <CustomTypography variant="label" style={{ marginBottom: 8 }}>
            Gene Panel
          </CustomTypography>
          <AutoWidthSelect
            sx={{ maxWidth: '243px' }}
            options={[{ value: 'NONE', name: 'NONE' }, ...genePanels.map((t) => ({ value: t, name: t.toUpperCase() }))]}
            value={genePanel}
            variant="outlined"
            onChange={(e): void => setGenePanel(e.target.value as GenePanel)}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="row" gap="8px">
        <CustomCheckbox
          labelProps={{
            label: 'High risk?',
          }}
          value={isHighRisk}
          onChange={(e, checked): void => setHighRisk(checked)}
        />
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-end"
      >
        <CustomButton
          style={{ marginRight: 16 }}
          variant="subtle"
          size="small"
          label="Cancel"
          onClick={handleCancel}
        />
        <CustomButton
          disabled={selectedGeneList.length === 0 || name === '' || version === ''}
          variant="bold"
          size="small"
          label="Save"
          onClick={handleSubmit}
        />
      </Box>
    </Box>
  );
}
