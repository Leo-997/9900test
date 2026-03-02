/* eslint-disable @typescript-eslint/naming-convention */
// MUI
import { withStyles } from '@mui/styles';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

import type { JSX } from "react";

const SpinnerAdornment = withStyles({
  root: {
    color: '#006FED',
    verticalAlign: 'middle',
  },
})((props) => <CircularProgress size={18} {...props} />);

export const DefaultChip = withStyles({
  root: {
    backgroundColor: '#ECF0F3',
    color: '#273957',
  },
})(Chip);

const LoadingChipStyle = withStyles({
  root: {
    backgroundColor: '#ECF0F3',
    color: '#273957',
  },
})(Chip);

export function LoadingChip(props): JSX.Element {
  const { children, ...rest } = props;
  return (
    <LoadingChipStyle
      {...rest}
      label={(
        <div style={{ verticalAlign: 'middle' }}>
          <SpinnerAdornment {...rest} />
          {children}
        </div>
      )}
    />
  );
}

export const CountChip = withStyles({
  root: {
    color: '#006FED',
    backgroundColor: '#D7EAFC',
    '& .MuiChip-deleteIcon': {
      display: 'none',
    },
  },
  clickable: {
    color: '#006FED',
    backgroundColor: '#D7EAFC',
    '&:hover, $deletable&:hover': {
      color: '#006FED',
      backgroundColor: '#D7EAFC',
      border: '1px #006FED solid',
    },
    '&:focus, $deletable&:focus': {
      color: '#D7EAFC',
      backgroundColor: '#006FED',
      '& .MuiChip-deleteIcon': {
        display: 'block',
      },
    },
  },
  avatar: {
    color: 'inherit',
    backgroundColor: 'rgba(255,255,255,0)',
  },
  deletable: {
    backgroundColor: '#D7EAFC',
    '&:hover': { backgroundColor: '#006FED' },
    '&:focus': { backgroundColor: '#006FED' },
    '&:active': { backgroundColor: '#006FED' },
  },
  outlined: {
    color: '#D7EAFC',
    backgroundColor: '#FFFFFF',
    border: '1px solid #D7EAFC',
    '$clickable&:hover': {
      backgroundColor: '#D7EAFC',
      color: '#FFFFFF',
    },
    '$deletable&:hover': {
      backgroundColor: '#D7EAFC',
      color: '#FFFFFF',
    },
    '$clickable&:focus, $deletable&:focus': {
      backgroundColor: '#006FED',
      color: '#FFFFFF',
    },
  },
})(Chip);

export const FilterChip = withStyles({
  root: {
    color: 'white',
    backgroundColor: '#006FED',
    '& .MuiChip-deleteIcon': {
      display: 'none',
    },
  },
  clickable: {
    color: 'white',
    backgroundColor: '#006FED',
    '&:hover, $deletable&:hover': {
      color: 'white',
      backgroundColor: '#006FED',
      border: '1px #006FED solid',
    },
    '&:focus, $deletable&:focus': {
      color: '#006FED',
      backgroundColor: 'white',
      '& .MuiChip-deleteIcon': {
        display: 'block',
      },
    },
  },
  avatar: {
    color: 'inherit',
    backgroundColor: 'rgba(255,255,255,0)',
  },
  deletable: {
    backgroundColor: '#006FED',
    '&:hover': { backgroundColor: 'white' },
    '&:focus': { backgroundColor: 'white' },
    '&:active': { backgroundColor: 'white' },
  },
  outlined: {
    color: '#006FED',
    backgroundColor: '#FFFFFF',
    border: '1px solid #006FED',
    '$clickable&:hover': {
      backgroundColor: '#006FED',
      color: '#FFFFFF',
    },
    '$deletable&:hover': {
      backgroundColor: '#006FED',
      color: '#FFFFFF',
    },
    '$clickable&:focus, $deletable&:focus': {
      backgroundColor: 'white',
      color: '#FFFFFF',
    },
  },
})(Chip);
