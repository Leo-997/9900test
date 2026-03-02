import {
  Box, DialogContent, DialogTitle, IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  Maximize2Icon, Minimize2Icon, RotateCcwIcon,
  SquareArrowOutDownRightIcon, SquareArrowOutUpLeftIcon, XIcon,
} from 'lucide-react';
import { useState, type JSX } from 'react';
import { IResourceWithMeta } from '../../../types/Evidence/Resources.types';
import CustomTypography from '../../Common/Typography';
import LibraryContent from './LibraryContent';
import LibraryViewDialog from './LibraryViewDialog';

const useStyles = makeStyles(() => ({
  title: {
    paddingLeft: '25px',
    paddingTop: '20px',
  },
  expandIcon: {
    marginLeft: 'auto',
    display: 'inline',
    top: 10,
  },
  closeIconExpand: {
    marginLeft: 'auto',
    display: 'inline',
    top: 10,
    marginRight: '25px',
  },
  stickIconExpand: {
    marginLeft: 'auto',
    display: 'inline',
    top: 10,
  },
  modalExpanIcon: {
    display: 'inline',
    marginTop: '15px',
    width: '40px',
    height: '40px',
    background: '#FFFFFF',
    border: '1px solid #ECF0F3',
    boxSizing: 'border-box',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
    borderRadius: '100px',
    position: 'absolute',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      background: '#F3F5F7',
    },
  },
  modalExpanIconReverse: {
    marginLeft: 'auto',
    display: 'inline',
    marginTop: '15px',
    width: '40px',
    height: '40px',
    background: '#FFFFFF',
    border: '1px solid #ECF0F3',
    boxSizing: 'border-box',
    borderRadius: '100px',
    transform: 'rotate(-180deg)',
    position: 'absolute',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      background: '#F3F5F7',
    },
  },
}));

interface ILibraryViewProps {
  expandedView: boolean;
  isDock: boolean;
  toggleExpandedView: (state: boolean) => void;
  handleClose: () => void;
  toggleDock: (state: boolean) => void;
}

export default function LibraryView({
  expandedView,
  isDock,
  toggleExpandedView,
  handleClose,
  toggleDock,
}: ILibraryViewProps): JSX.Element {
  const classes = useStyles();

  const [resource, setResource] = useState<IResourceWithMeta | null>(null);
  const [refetch, setRefetch] = useState<boolean>(false);

  return resource ? (
    <LibraryViewDialog
      resource={resource}
      closeLibrary={(): void => toggleExpandedView(false)}
      closeResourceView={(): void => setResource(null)}
      isResourceExpanded={expandedView}
      openResourceModal={(): void => toggleExpandedView(true)}
    />
  ) : (
    <>
      <DialogTitle
        style={{ position: 'initial' }}
        id="draggable-dialog-title"
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          width="100%"
        >
          <CustomTypography
            variant="h6"
            fontWeight="bold"
            className={classes.title}
          >
            Library
          </CustomTypography>

          <Box>
            <IconButton
              className={classes.expandIcon}
              onClick={(): void => setRefetch(true)}
            >
              <RotateCcwIcon />
            </IconButton>
            {expandedView ? (
              <IconButton
                className={classes.expandIcon}
                onClick={(): void => toggleExpandedView(false)}
              >
                <Minimize2Icon />
              </IconButton>
            ) : (
              <IconButton
                className={classes.expandIcon}
                onClick={(): void => toggleExpandedView(true)}
              >
                <Maximize2Icon />
              </IconButton>
            )}
            {!expandedView && !isDock && (
              <IconButton
                className={classes.stickIconExpand}
                onClick={(): void => toggleDock(true)}
              >
                <SquareArrowOutUpLeftIcon />
              </IconButton>
            )}
            {!expandedView && isDock && (
              <IconButton
                className={classes.stickIconExpand}
                onClick={(): void => toggleDock(false)}
              >
                <SquareArrowOutDownRightIcon />
              </IconButton>
            )}
            <IconButton
              className={classes.closeIconExpand}
              onClick={handleClose}
            >
              <XIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box style={{ height: '100%', width: '100%' }}>
          <LibraryContent
            refetch={refetch}
            setRefetch={setRefetch}
            onViewResource={(r): void => setResource(r)}
          />
        </Box>
      </DialogContent>
    </>
  );
}
