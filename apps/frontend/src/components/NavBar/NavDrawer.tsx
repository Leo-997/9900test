/* eslint-disable @typescript-eslint/naming-convention */
import {
  Drawer,
  IconButton,
  Dialog as MuiDialog,
  Paper, PaperProps, styled,
} from '@mui/material';
import { ArrowLeftIcon } from 'lucide-react';
import { ReactElement, useState, type JSX } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

interface IStyleProps {
  expandedView?: boolean;
  isDrawerExpand?: boolean;
}

interface IExpandIconButtonProps {
  reversed?: boolean;
}

const ExpandIconButton = styled(IconButton)<IExpandIconButtonProps>(({ theme, reversed }) => ({
  background: theme.colours.core.white,
  border: `1px solid ${theme.colours.core.grey30}`,
  boxSizing: 'border-box',
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
  borderRadius: '100px',
  position: 'absolute',
  right: -18,
  top: 34,
  zIndex: 600,
  transition: 'all 0.7s cubic-bezier(.19,1,.22,1)',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '&:hover': {
    background: theme.colours.core.grey10,
  },
  ...(
    reversed ? {
      marginLeft: 'auto',
      transform: 'rotate(-180deg)',
    } : {}
  ),
}));

const Dialog = styled(MuiDialog)<IStyleProps>(() => ({
  '& .MuiPaper-root': {
    width: '620px',
    height: 'calc(100% - 220px)',
    zIndex: 1300,
    position: 'absolute',
    right: 18,
    top: 80,
  },
}));

interface IProps {
  isDock: boolean;
  isExpand: boolean;
  expandedView: boolean;
  handleClose(): void;
  DrawerContent: JSX.Element;
}

export default function NavDrawer({
  isDock,
  isExpand,
  expandedView,
  handleClose,
  DrawerContent,
}: IProps): ReactElement<any> {
  const [position, setPosition] = useState({ position: { x: 0, y: 0 } });
  const [isDrawerExpand, setIsDrawerExpand] = useState<boolean>(false);

  const onStop = (event: DraggableEvent, data: DraggableData): void => {
    event.preventDefault();
    if (data?.x === position.position.x) return;

    if (data?.y > -111 && data?.y < 759 && data?.x > -1840 && data?.x < 625) {
      setPosition({ position: { x: data?.x, y: data?.y } });
    } else if (data?.y < -111 || data?.y > 759) {
      if (data?.y > 0) {
        setPosition({ position: { x: data?.x, y: 750 } });
      } else {
        setPosition({ position: { x: data?.x, y: -110 } });
      }
    } else if (data?.x < -1840 || data?.x > 625) {
      if (data?.x > 0) {
        setPosition({ position: { x: 620, y: data?.y } });
      } else {
        setPosition({ position: { x: -1835, y: data?.y } });
      }
    }
  };

  const paperComponent = (props: PaperProps): JSX.Element => (
    <Draggable
      handle="#draggable-dialog-title"
      position={position.position}
      cancel='[class*="MuiDialogContent-root"]'
      onStop={(event, data): void => onStop(event, data)}
    >
      <Paper {...props} />
    </Draggable>
  );

  return (
    isDock && !expandedView ? (
      <Dialog
        open={isExpand}
        onClose={handleClose}
        PaperComponent={expandedView ? undefined : paperComponent}
        aria-labelledby="draggable-dialog-title"
        style={{ position: 'initial' }}
        hideBackdrop
        disableEnforceFocus
        fullScreen={expandedView}
      >
        {DrawerContent}
      </Dialog>
    ) : (
      <Drawer
        open={isExpand}
        variant="persistent"
        slotProps={{ backdrop: { invisible: true } }}
        anchor="right"
        onClose={handleClose}
        PaperProps={{
          sx: {
            ...(expandedView && {
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }),
            ...(!expandedView && {
              width: '620px',
              height: 'calc(100% - 64px)',
              zIndex: 1300,
              overflowY: 'unset',
              top: 64,
              ...(isDrawerExpand && {
                right: window.innerWidth > 1440 ? 120 : 95,
              }),
              ...(!isDrawerExpand && {
                right: 18,
              }),
            }),
          },
        }}
      >
        {!expandedView && !isDock && isExpand ? (
          <ExpandIconButton
            reversed={isDrawerExpand}
            onClick={(): void => setIsDrawerExpand(!isDrawerExpand)}
          >
            <ArrowLeftIcon />
          </ExpandIconButton>
        ) : null}
        {DrawerContent}
      </Drawer>
    )
  );
}
