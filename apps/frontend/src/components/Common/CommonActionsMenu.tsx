import { Menu, MenuItem } from '@mui/material';
import { ICommentActions } from '../../types/Comments/CommonComments.types';

import type { JSX } from "react";

interface IProps {
  isHidden?: boolean;
  actions: ICommentActions;
  permissions: ICommentActions;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onOrder?: (operation: 'up' | 'down') => void;
  onEdit?: () => void;
  onHide?: () => void;
  onDelete?: () => void;
  onAddEvidence?: () => void;
}

export default function CommonActionsMenu({
  isHidden = false,
  actions,
  permissions,
  anchorEl,
  onClose,
  onOrder,
  onEdit,
  onHide,
  onDelete,
  onAddEvidence,
}: IProps): JSX.Element {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      disableAutoFocusItem
      disableRestoreFocus
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      {actions.order && onOrder && (
        <MenuItem
          key="edit-comment-menu-item"
          onClick={(): void => {
            onOrder('up');
            onClose();
          }}
          disabled={!permissions.order}
        >
          Move up
        </MenuItem>
      )}
      {actions.order && onOrder && (
        <MenuItem
          key="edit-comment-menu-item"
          onClick={(): void => {
            onOrder('down');
            onClose();
          }}
          disabled={!permissions.order}
        >
          Move down
        </MenuItem>
      )}
      {actions.evidence && onAddEvidence && (
        <MenuItem
          key="edit-comment-menu-item"
          onClick={(): void => {
            onAddEvidence();
            onClose();
          }}
          disabled={!permissions.evidence}
        >
          Link evidence
        </MenuItem>
      )}
      {actions.edit && onEdit && (
        <MenuItem
          key="edit-comment-menu-item"
          onClick={(): void => {
            onEdit();
            onClose();
          }}
          disabled={!permissions.edit}
        >
          Edit
        </MenuItem>
      )}
      {actions.hide && onHide && (
        <MenuItem
          key="hide-comment-menu-item"
          onClick={(): void => {
            onHide();
            onClose();
          }}
          disabled={!permissions.hide}
        >
          {isHidden ? 'Show' : 'Hide'}
        </MenuItem>
      )}
      {actions.delete && onDelete && (
        <MenuItem
          key="delete-comment-menu-item"
          onClick={(): void => {
            onDelete();
            onClose();
          }}
          disabled={!permissions.delete}
        >
          Delete
        </MenuItem>
      )}
    </Menu>
  );
}
