import Box from '@mui/material/Box';

import {
  Dispatch, SetStateAction, useState, type JSX,
} from 'react';

import { TextField } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { CornerDownLeftIcon } from 'lucide-react';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IGene } from '../../types/Common.types';
import CustomButton from '../Common/Button';

const useStyles = makeStyles(() => createStyles({
  input: {
    backgroundColor: '#FFF',

    '& label.Mui-focused': {
      color: '#AEB9C5',
    },

    '& .MuiOutlinedInput-root': {

      '& fieldset': {
        borderColor: '#AEB9C5',
      },

      '&.Mui-focused fieldset': {
        borderColor: '#AEB9C5',
      },
    },
  },
  inputWrapper: {
    // position: "relative",
  },
  inputTextArea: {
    //  maxHeight: 450,
    fontSize: 16,
    color: '#022034',
  },
  submitBtn: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    color: '#006FED',

    '&:disabled': {
      color: '#AEB9C5',
    },
  },
  actionbtn: {
    padding: 0,
  },
  unread_dot: {
    top: '30%',
    bottom: '30%',
    left: '30%',
    right: '30%',
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#F39D41',
  },
  textArea: {
    width: '451px',
    fontSize: '16px',
    padding: '10px 10px',
  },
  btnAddGeneList: {
    color: '#006FED',
  },
}));

interface IProps {
  selectedGeneList: IGene[];
  setSelectedGeneList: Dispatch<SetStateAction<IGene[]>>;
  setInvalidGenes: Dispatch<SetStateAction<IGene[]>>;
}

export function PasteGeneInput({
  selectedGeneList,
  setSelectedGeneList,
  setInvalidGenes,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();

  const [value, setValue] = useState<string>('');

  const handleChange = (event): void => {
    setValue(event.target.value);
  };

  const handleSubmit = async (): Promise<void> => {
    const delim = /\s*;\s*/;
    if (value && value.length > 0) {
      const valArr = value.replace(/\n/g, ';').split(delim);
      let uniqueValArr = [...new Set(valArr)];
      uniqueValArr = uniqueValArr.filter((val) => val !== '');
      if (uniqueValArr && uniqueValArr.length > 0) {
        const filteredGenes = await zeroDashSdk.gene.getFilteredGenes(uniqueValArr);

        const uniqueGenes = filteredGenes.validGenes.filter(
          (item: IGene) => selectedGeneList.every((gene) => gene.gene !== item.gene),
        );

        setSelectedGeneList([...selectedGeneList, ...uniqueGenes]);
        setInvalidGenes(filteredGenes.invalidGenes);
      }

      setValue('');
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap="8px">
      <Box className={classes.inputWrapper}>
        <form noValidate autoComplete="off">
          <TextField
            id="outlined-textarea"
            placeholder="Paste a list of genes"
            multiline
            rows={5}
            value={value}
            onChange={handleChange}
            variant="outlined"
            className={classes.textArea}
          />
        </form>
      </Box>
      <Box display="flex" flexDirection="row" gap="8px">
        <CustomButton
          variant="subtle"
          className={classes.actionbtn}
          onClick={(): void => setValue('')}
          label="Cancel"
          size="small"
        />
        <CustomButton
          variant="text"
          label="Add genes to list"
          startIcon={<CornerDownLeftIcon />}
          className={value && value.length > 0 ? classes.btnAddGeneList : ''}
          disabled={!value || value === ''}
          onClick={handleSubmit}
          size="small"
        />
      </Box>
    </Box>
  );
}
