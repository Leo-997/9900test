import {
  MenuItem,
  styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { CircleXIcon } from 'lucide-react';
import CustomButton from '../Common/Button';

import type { JSX } from "react";

const ClearFiltersContainer = styled(MenuItem)({
  padding: '0',
  margin: '0',
  '&.Mui-disabled': {
    opacity: 1,
  },
});

const ClearButton = styled(CustomButton)({
  borderRadius: '0px',
  width: '100%',
  '& > .MuiBox-root': {
    justifyContent: 'space-between',
  },
});

const useStyles = makeStyles(() => ({
  menuItem: {
    height: '48px',
    display: 'flex',
    justifyContent: 'space-between',
    '&:hover': {
      backgroundColor: '#F3F7FF',
    },
  },
  radio: {
    visibility: 'hidden',
    width: '0',
    height: '0',
  },
  label: {
    width: '100%',
    height: '100%',
  },
  clearItem: {
    color: 'rgb(255, 255, 255)',
    backgroundColor: 'rgba(2, 32, 52, 1)',
    '&:hover': {
      backgroundColor: 'rgba(32, 62, 82, 1) !important',
    },
  },
  clearItemDisabled: {
    backgroundColor: 'rgba(236, 240, 243, 1)',
  },
  closeIcon: {
    width: '20px',
    height: '20px',
  },
}));

interface IProps {
  clearDisabled?: boolean;
  onChange: (value: string) => void;
}

export default function ClearSortMenuItem({
  clearDisabled,
  onChange,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <ClearFiltersContainer
      className={clsx(
        classes.menuItem,
        clearDisabled ? classes.clearItemDisabled : classes.clearItem,
      )}
      disabled={clearDisabled}
      onClick={(): void => onChange('')}
    >
      <ClearButton
        onClick={(): void => onChange('')}
        disabled={clearDisabled}
        label="Clear sort"
        endIcon={<CircleXIcon />}
      />
    </ClearFiltersContainer>
  );
}
