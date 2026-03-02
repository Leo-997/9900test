import {
  MenuItem,
} from '@mui/material';
import { ISortMenuOption } from '../../types/misc.types';

import type { JSX } from "react";

interface ISortMenuProps {
  onChange: (value: string) => void;
  menuItems: ISortMenuOption<string>[];
}

export default function SortMenu(
  { onChange, menuItems }: ISortMenuProps,
): JSX.Element {
  return (
    <>
      {menuItems.map((menuItem, index) => (
        <MenuItem
          // eslint-disable-next-line react/no-array-index-key
          key={`${menuItem.name}-${index}`}
          onClick={(): void => onChange(menuItem.value)}
          sx={{
            height: '48px',
            minWidth: '230px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {menuItem.name}
          {menuItem.icon}
        </MenuItem>
      ))}
    </>
  );
}
