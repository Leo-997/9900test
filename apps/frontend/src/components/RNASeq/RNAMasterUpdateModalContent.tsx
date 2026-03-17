import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { corePalette } from '@/themes/colours';
import { ISelectOption } from '@/types/misc.types';
import {
  Box,
  TextField,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dispatch, ReactNode, SetStateAction, useEffect, useState, type JSX } from 'react';
import CustomAutocomplete from '../Common/Autocomplete';
import CustomChip from '../Common/Chip';

const useStyles = makeStyles(() => ({
  warning: {
    display: 'flex',
    height: 'auto',
    padding: '29px 24px',
    gap: '10px',
    borderRadius: '4px',
    background: corePalette.violet10,
    width: '100%',
  },
}));

interface IProps {
  setSelectedSubcat2: Dispatch<SetStateAction<string | undefined>>;
  warning?: boolean,
}

export default function RNAMasterUpdateModalContent({
  setSelectedSubcat2,
  warning,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { analysisSet } = useAnalysisSet();

  const [subcat2Options, setSubcat2Options] = useState<string[]>([]);

  useEffect(() => {
    zeroDashSdk.curation.analysisSets.getZero2Subcategory2()
      .then((resp) => setSubcat2Options(resp));
  }, [analysisSet?.zero2Subcategory2, zeroDashSdk.curation.analysisSets]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      justifyContent="flex-start"
      align-content="flex-start"
      width="100%"
      gap="16px"
    >
      <CustomAutocomplete
        id="get-subcat2Options-dropdown"
        label={`ZERO2 SUBCATEGORY2 ${warning !== false ? ' *' : ''}`}
        options={
          subcat2Options
            .map((d) => ({ name: d, value: d }))
        }
        defaultValue={{
          name: analysisSet.zero2Subcategory2,
          value: analysisSet.zero2Subcategory2,
        }}
        getOptionLabel={(option: ISelectOption<string>): string => option.name || ''}
        isOptionEqualToValue={(option, value): boolean => option.value === value.value}
        onChange={(e, val): void => setSelectedSubcat2(val.value)}
        renderInput={(params): ReactNode => (
          <TextField {...params} variant="outlined" fullWidth />
        )}
        clearOnBlur
        disableClearable
        wrapperSx={{ width: '50%' }}
      />
      { warning !== false && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="flex-start"
          align-content="space-around"
          className={classes.warning}
        >
          <CustomChip
            label="WARNING"
            backgroundColour={corePalette.violet30}
            colour={corePalette.violet300}
          />
          Once confirmed, all existing RNASeq plots will be overwritten.
        </Box>
      )}
    </Box>
  );
}
