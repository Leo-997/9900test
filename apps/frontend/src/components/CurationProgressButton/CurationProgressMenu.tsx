import { Menu, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { NextCurationStatus } from '../../types/Samples/Sample.types';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  menuItem: {
    backgroundColor: '#006FED',
    fontWeight: 500,
    padding: '12px 10px',
    justifyContent: 'center',

    '&.MuiListItem-root:focus:focus': {
      backgroundColor: '#006FED',
    },
  },
  menu: {
    backgroundColor: '#1E86FC',
    color: 'white',
    boxShadow: 'none',
    minWidth: '298px',
    borderRadius: '0px 0px 8px 8px',

    '& .MuiList-padding': {
      paddingTop: '0px',
      paddingBottom: '0px',
    },
  },
}));

interface ICurationProgressMenuProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
  options: NextCurationStatus[];
  setNextCurationStatus: (nextCurationStatus: NextCurationStatus) => void;
}

export default function CurationProgressMenu({
  anchorEl,
  setAnchorEl,
  options,
  setNextCurationStatus,
}: ICurationProgressMenuProps): JSX.Element {
  const classes = useStyles();

  const selectOption = (option: NextCurationStatus): void => {
    setNextCurationStatus(option);
    setAnchorEl(null);
  };

  return (
    <Menu
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      onClose={(): void => setAnchorEl(null)}
      PaperProps={{
        className: classes.menu,
      }}
      disableAutoFocusItem
      disableRestoreFocus
      transitionDuration={0}
    >
      {options.map((option) => (
        <MenuItem
          className={classes.menuItem}
          onClick={(): void => selectOption(option)}
        >
          {option.label}
        </MenuItem>
      ))}
    </Menu>
  );
}
