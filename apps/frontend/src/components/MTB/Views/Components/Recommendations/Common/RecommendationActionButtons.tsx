import { corePalette } from '@/themes/colours';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  ArrowDownIcon, ArrowUpIcon, EllipsisVerticalIcon, EyeOffIcon, MoreVerticalIcon,
} from 'lucide-react';
import { useState, type JSX } from 'react';
import { useClinical } from '../../../../../../contexts/ClinicalContext';
import { IRecommendationActions } from '../../../../../../types/MTB/Recommendation.types';
import CustomModal from '../../../../../Common/CustomModal';

export interface IRecommendationActionButtonsProps {
  isHidden: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onHide?: (isHidden: boolean) => void;
  onOrder?: (direction: 'up' | 'down') => void;
  isCondensed?: boolean;
  actions?: IRecommendationActions;
  permissions?: IRecommendationActions;
}

export function RecommendationActionButtons({
  isHidden,
  onEdit,
  onDelete,
  onHide,
  onOrder,
  isCondensed = false,
  actions = {
    order: true, delete: true, edit: true, hide: true,
  },
  permissions = {
    order: true, delete: true, edit: true, hide: true,
  },
}: IRecommendationActionButtonsProps): JSX.Element {
  const { isPresentationMode } = useClinical();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [editMenu, setEditMenu] = useState<HTMLElement | null>(null);

  return (
    <div
      style={{
        marginLeft: 'auto',
      }}
    >
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
        gap="5px"
        width="max-content"
      >
        {isCondensed ? (
          <>
            {isHidden && (
              <EyeOffIcon />
            )}
            {(Object.values(actions).some((a) => a)) && (
              <IconButton
                onClick={(e): void => setEditMenu(e.currentTarget)}
              >
                <EllipsisVerticalIcon />
              </IconButton>
            )}
          </>
        ) : (
          !isPresentationMode && (
            <>
              {actions.hide && (
                <Tooltip
                  title={`${isHidden ? 'Display' : 'Hide'} in presentation mode`}
                  placement="top"
                >
                  <IconButton
                    id="hide-row-button"
                    disabled={!permissions.hide}
                    onClick={(): void => {
                      if (onHide) onHide(!isHidden);
                    }}
                    sx={{
                      color: corePalette.grey200,
                      left: '8px',
                      opacity: isHidden ? 1 : 0,
                      visibility: isHidden ? 'visible' : 'hidden',
                      transition: 'all 0.5s cubic-bezier(.19,1,.22,1)',
                    }}
                  >
                    <EyeOffIcon />
                  </IconButton>
                </Tooltip>
              )}
              {actions.order && (
                <>
                  <IconButton
                    disabled={!permissions.order}
                    style={{ marginLeft: '12px' }}
                    onClick={(): void => {
                      if (onOrder) onOrder('down');
                    }}
                  >
                    <ArrowDownIcon />
                  </IconButton>
                  <IconButton
                    disabled={!permissions.order}
                    onClick={(): void => {
                      if (onOrder) onOrder('up');
                    }}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                </>
              )}
              {(actions.edit || actions.delete) && (
                <IconButton
                  onClick={(e): void => setEditMenu(e.currentTarget)}
                >
                  <MoreVerticalIcon />
                </IconButton>
              )}
            </>
          )
        )}
      </Box>
      <Menu
        id="edit-menu"
        anchorEl={editMenu}
        open={Boolean(editMenu)}
        onClose={(): void => setEditMenu(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        variant="menu"
      >
        {isCondensed && (
          <>
            {actions.order && (
              <>
                <MenuItem
                  onClick={(): void => {
                    if (onOrder) onOrder('up');
                    setEditMenu(null);
                  }}
                  disabled={!permissions.order}
                >
                  Move up
                </MenuItem>
                <MenuItem
                  onClick={(): void => {
                    if (onOrder) onOrder('down');
                    setEditMenu(null);
                  }}
                  disabled={!permissions.order}
                >
                  Move down
                </MenuItem>
              </>
            )}
            {actions.hide && (
              <MenuItem
                onClick={(): void => {
                  if (onHide) onHide(!isHidden);
                  setEditMenu(null);
                }}
                disabled={!permissions.hide}
              >
                {isHidden ? 'Show' : 'Hide'}
                {' '}
                recommendation
              </MenuItem>
            )}
          </>
        )}
        {actions.edit && (
          <MenuItem
            onClick={(): void => {
              if (onEdit) onEdit();
              setEditMenu(null);
            }}
            disabled={!permissions.edit}
          >
            Edit recommendation
          </MenuItem>
        )}
        {actions.delete && (
          <MenuItem
            sx={{ color: corePalette.red200 }}
            onClick={(): void => {
              setDeleteConfirmOpen(true);
              setEditMenu(null);
            }}
            disabled={!permissions.delete}
          >
            Delete recommendation
          </MenuItem>
        )}
      </Menu>
      <CustomModal
        title="Delete recommendation"
        content={'Are you sure you want to delete this recommendation?\nThis action cannot be undone.'}
        open={deleteConfirmOpen}
        onClose={(): void => setDeleteConfirmOpen(false)}
        onConfirm={(): void => {
          if (onDelete) onDelete();
          setDeleteConfirmOpen(false);
        }}
        variant="alert"
        buttonText={{
          cancel: 'No, don\'t delete',
          confirm: 'Yes, delete',
        }}
      />
    </div>
  );
}
