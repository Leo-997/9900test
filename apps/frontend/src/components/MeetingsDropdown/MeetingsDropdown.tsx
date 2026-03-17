import { Menu, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DashboardMeetingType } from '../../types/Dashboard.types';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  popover: {
    '& .MuiPaper-root': {
      top: '64px !important',
    },
  },
}));

interface IProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
  setMeetingType: (type: DashboardMeetingType) => void;
}

export function MeetingsDropdown({
  anchorEl,
  setAnchorEl,
  setMeetingType,
}: IProps): JSX.Element {
  const classes = useStyles();

  const handleClick = (type: DashboardMeetingType): void => {
    setAnchorEl(null);
    setMeetingType(type);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={(): void => setAnchorEl(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      className={classes.popover}
      PopoverClasses={{ paper: classes.popover }}
    >
      <MenuItem
        onClick={(): void => handleClick('Curation')}
      >
        Curation
      </MenuItem>
      <MenuItem
        onClick={(): void => handleClick('Clinical')}
      >
        Clinical
      </MenuItem>
    </Menu>
  );
}
