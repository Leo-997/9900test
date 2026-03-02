import { useState, type JSX } from 'react';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomTypography from '../components/Common/Typography';
import Select from '../components/Input/Select';
import { ISelectOption } from '../types/misc.types';

const useStyles = makeStyles({
  menu: {
    overflowY: 'auto',
    width: '100%',
    height: '42px',
  },
});

interface IProps {
  value: string;
  onUpdate: (newVal: string) => void;
  options: ISelectOption<string>[];
  disabled?: boolean;
  showLabel?: boolean;
}

export default function LayoutInput({
  value,
  onUpdate,
  options,
  disabled = false,
  showLabel = false,
}: IProps): JSX.Element {
  const classes = useStyles();

  const [val, setVal] = useState<string>(value);

  const handleChange = (newVal: string): void => {
    onUpdate(newVal);
    setVal(newVal);
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="flex-end"
      alignItems="center"
      gap="16px"
    >
      {showLabel && (
        <CustomTypography variant="bodyRegular">
          Layout:
        </CustomTypography>
      )}
      <Select
        key={value}
        variant="outlined"
        className={classes.menu}
        options={options}
        disabled={disabled}
        value={val}
        onChange={(e): void => handleChange(e.target.value as string)}
      />
    </Box>
  );
}
