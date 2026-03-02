import { corePalette } from '@/themes/colours';
import {
  Divider,
  IconButton,
  styled,
  Tooltip,
} from '@mui/material';
import {
  AlignJustifyIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BookOpenTextIcon,
  EyeOffIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  WrapTextIcon,
} from 'lucide-react';
import { ICommentActions } from '../../../../types/Comments/CommonComments.types';

import type { JSX } from "react";

const Actions = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  borderRadius: 6,
  padding: 2,
  backgroundColor: theme.colours.core.white,
  border: `1px solid ${theme.colours.core.grey30}`,
  height: '38px',
  gap: '4px',
}));

interface IProps {
  isHidden: boolean;
  actions: ICommentActions;
  permissions: ICommentActions;
  onEdit?: () => void;
  onHide?: (hide: boolean) => void;
  onDelete?: () => void;
  onChangeOrder?: (
    operation: 'new' | 'up' | 'down' | 'remove',
  ) => void;
  onAddEvidence?: () => void;
  onAddLineBreak?: () => void;
  showOrder?: boolean;
  reportOrder?: number | null;
  hasLineBreak?: boolean;
}

export function CommentActions({
  isHidden,
  actions,
  permissions,
  onEdit,
  onDelete,
  onHide,
  onChangeOrder,
  onAddEvidence,
  onAddLineBreak,
  showOrder = false,
  reportOrder,
  hasLineBreak,
}: IProps): JSX.Element {
  return (
    <Actions>
      {showOrder
        && (
          <>
            {reportOrder && onChangeOrder && onAddLineBreak && (
              <>
                {actions.order && (
                  <>
                    <Tooltip title="Move up in report" placement="top">
                      <IconButton
                        onClick={(): void => onChangeOrder('up')}
                        disabled={!permissions.order}
                      >
                        <ArrowUpIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Move down in report" placement="top">
                      <IconButton
                        onClick={(): void => onChangeOrder('down')}
                        disabled={!permissions.order}
                      >
                        <ArrowDownIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={hasLineBreak ? 'Remove line break' : 'Add a line break after this comment'} placement="top">
                      <IconButton
                        onClick={onAddLineBreak}
                        disabled={!permissions.order}
                      >
                        {hasLineBreak ? <AlignJustifyIcon /> : <WrapTextIcon />}
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                {actions.addToReport && (
                  <Tooltip title="Remove from the report" placement="top">
                    <IconButton
                      onClick={(): void => onChangeOrder('remove')}
                      disabled={!permissions.order}
                    >
                      <Trash2Icon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
            {actions.addToReport && !reportOrder && onChangeOrder && (
              <Tooltip title="Add to report" placement="top">
                <IconButton
                  onClick={(): void => onChangeOrder('new')}
                  disabled={!permissions.order}
                >
                  <PlusIcon />
                </IconButton>
              </Tooltip>
            )}
            <Divider
              orientation="vertical"
              style={{
                height: '80%',
                backgroundColor: corePalette.grey30,
              }}
            />
          </>
        )}
      {actions.evidence && (
      <>
        <Tooltip title="Link evidence" placement="top">
          <IconButton
            onClick={onAddEvidence}
            disabled={!permissions.evidence}
          >
            <BookOpenTextIcon />
          </IconButton>
        </Tooltip>
        <Divider
          orientation="vertical"
          style={{
            height: '80%',
            backgroundColor: corePalette.grey30,
          }}
        />
      </>
      )}
      {actions.edit && (
        <Tooltip title="Edit" placement="top">
          <IconButton
            onClick={onEdit}
            disabled={!permissions.edit}
          >
            <PencilIcon />
          </IconButton>
        </Tooltip>
      )}
      {(actions.hide && onHide && (
        <Tooltip title={isHidden ? 'Unhide' : 'Hide'} placement="top">
          <IconButton
            style={{ color: isHidden ? corePalette.green150 : undefined }}
            onClick={(): void => onHide(!isHidden)}
            disabled={!permissions.hide}
          >
            <EyeOffIcon />
          </IconButton>
        </Tooltip>
      ))}
      {actions.delete && (
        <>
          <Divider
            orientation="vertical"
            style={{
              height: '80%',
              backgroundColor: corePalette.grey30,
            }}
          />
          <Tooltip title="Remove from this variant" placement="top">
            <IconButton
              onClick={onDelete}
              disabled={!permissions.delete}
            >
              <Trash2Icon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Actions>
  );
}
