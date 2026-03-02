import { cn } from '@udecode/cn';
import {
  useCommentDeleteButton,
  useCommentEditButton,
} from '@udecode/plate-comments/react';

import { Menu, MenuItem } from '@mui/material';
import { useState, type JSX } from 'react';
import { Icons } from '@/components/plate-ui/Icons';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from './dropdown-menu';

export function CommentMoreDropdown(): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { props: editProps } = useCommentEditButton();
  const { props: deleteProps } = useCommentDeleteButton();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          onClick={(event): void => setAnchorEl(event.currentTarget)}
          variant="ghost"
          className={cn('h-6 p-1 text-zinc-500 dark:text-zinc-400')}
        >
          <Icons.more className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={(e, reason): void => {
          if (reason === 'backdropClick') {
            setAnchorEl(null);
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        disablePortal
      >
        <MenuItem
          {...editProps}
          onClick={(): void => {
            editProps.onClick();
            setAnchorEl(null);
          }}
        >
          Edit comment
        </MenuItem>
        <MenuItem {...deleteProps}>
          Delete comment
        </MenuItem>
      </Menu>
    </DropdownMenu>
  );
}
