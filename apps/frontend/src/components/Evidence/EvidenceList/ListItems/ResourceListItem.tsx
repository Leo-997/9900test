import { ListItemAvatar, Menu, MenuItem } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import {
  DownloadIcon,
  EllipsisVerticalIcon, FileTextIcon, ImageIcon, LinkIcon,
  PencilIcon, Trash2Icon,
} from 'lucide-react';
import { ReactElement, ReactNode, useState } from 'react';
import { useZeroDashSdk } from '../../../../contexts/ZeroDashSdkContext';
import { IEvidenceActions, IResourceWithEvidence } from '../../../../types/Evidence/Evidences.types';
import { IResourceWithMeta } from '../../../../types/Evidence/Resources.types';
import CustomTypography from '../../../Common/Typography';
import LibraryResourceTitle from './LibraryResourceTitle';

interface IListItemProps {
  resource: IResourceWithEvidence;
  onClick?: (resource: IResourceWithEvidence) => void;
  onDelete?: () => void;
  onUpdate?: (data: IResourceWithEvidence) => void;
  evidenceSelectButton?: ReactElement<any>;
  permissions?: IEvidenceActions
}

const useStyles = makeStyles(() => ({
  container: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiListItem-container': {
      listStyleType: 'none',
    },
  },
  listItem: {
    paddingTop: 30,
    paddingBottom: 30,
    width: '100%',
    minHeight: '92px',
    cursor: 'pointer',
  },
  divider: {
    border: '1px dashed #D0D9E2',
    opacity: '0.24',
    width: '100%',
  },
}));

interface IAction {
  handler: () => void;
  label: string;
  icon: ReactNode;
}

function LibraryResourceListItem({
  resource,
  onClick,
  onDelete,
  onUpdate,
  evidenceSelectButton,
  permissions,
}: IListItemProps): ReactElement<any> {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const getListItemAvatar = (item: IResourceWithMeta): ReactElement<any> => {
    switch (item.type) {
      case 'PDF':
        return <FileTextIcon />;
      case 'IMG':
        return <ImageIcon />;
      default:
        return <LinkIcon />;
    }
  };

  const canDownload = (): boolean => (
    Boolean(
      resource.fileId
      && permissions?.download,
    )
  );

  const canDelete = (): boolean => (
    Boolean(
      permissions?.delete
      && onDelete,
    )
  );

  const canUpdate = (): boolean => (
    Boolean(
      permissions?.edit
      && onUpdate,
    )
  );

  const handleDownload = async (selectedResource: IResourceWithEvidence): Promise<void> => {
    if (selectedResource.fileId) {
      const blob = await zeroDashSdk.filetracker.downloadFile(
        selectedResource.fileId,
      );
      const type = selectedResource.type === 'IMG'
        ? 'png'
        : 'pdf';
      const element = document.createElement('a');
      element.href = URL.createObjectURL(blob);
      element.download = `${selectedResource.name}.${type}`;
      element.target = '_blank';
      document.body.appendChild(element);
      element.click();
      element.remove();
    }
  };

  const getAllowableActions = (): IAction[] => {
    const actions: IAction[] = [];

    if (canDownload()) {
      actions.push({
        label: 'Download',
        icon: <DownloadIcon />,
        handler: (): void => {
          handleDownload(resource);
          handleClose();
        },
      });
    }

    if (canUpdate() && onUpdate) {
      actions.push({
        label: 'Update',
        icon: <PencilIcon />,
        handler: (): void => {
          setIsEditing(true);
          handleClose();
        },
      });
    }

    if (canDelete() && onDelete) {
      actions.push({
        label: 'Delete',
        icon: <Trash2Icon />,
        handler: (): void => {
          onDelete();
          handleClose();
        },
      });
    }

    return actions;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      flex={1}
      className={classes.container}
    >
      <ListItem
        className={classes.listItem}
        style={{
          cursor: isEditing ? 'default' : 'pointer',
          backgroundColor: isEditing ? '#FFFFFF' : undefined,
        }}
        onClick={(): void => {
          if (!isEditing && resource.fileId && onClick && permissions?.download) {
            onClick(resource);
          }
        }}
      >
        <ListItemAvatar>{getListItemAvatar(resource)}</ListItemAvatar>
        <Box display="flex" flexDirection="column" style={{ width: '100%' }}>
          <ListItemText style={{ width: '100%', maxWidth: 'calc(100% - 75px)' }}>
            <LibraryResourceTitle
              resource={resource}
              onUpdate={onUpdate}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          </ListItemText>
          <ListItemText>
            <CustomTypography variant="bodySmall">
              added on&nbsp;
              {dayjs(resource.createdAt).format('DD/MM/YYYY, hh:mm a')}
            </CustomTypography>
          </ListItemText>
        </Box>
        <ListItemSecondaryAction
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column-reverse',
            width: '48px',
          }}
        >
          {evidenceSelectButton}
          {getAllowableActions().length === 1 && (
            <IconButton
              onClick={getAllowableActions()[0].handler}
            >
              {getAllowableActions()[0].icon}
            </IconButton>
          )}
          {getAllowableActions().length > 1 && (
            <>
              <IconButton
                onClick={handleClick}
              >
                <EllipsisVerticalIcon />
              </IconButton>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {getAllowableActions().map((action) => (
                  <MenuItem
                    key={action.label}
                    onClick={action.handler}
                  >
                    {action.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </ListItemSecondaryAction>
      </ListItem>
      <Divider className={classes.divider} />
    </Box>
  );
}

export default LibraryResourceListItem;
