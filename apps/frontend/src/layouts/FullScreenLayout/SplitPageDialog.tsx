import {
  Box,
  Dialog as MuiDialog,
  DialogActions,
  DialogContent,
  IconButton,
  Tooltip,
  styled,
} from '@mui/material';
import { ReactNode, forwardRef, useImperativeHandle, useState, type JSX } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { ArrowLeftIcon } from 'lucide-react';
import CustomButton from '../../components/Common/Button';

interface IStyleProps {
  leftPanelSize: number;
}

const CollapseIconButton = styled(IconButton)<IStyleProps>(({ leftPanelSize, theme }) => ({
  backgroundColor: theme.colours.core.white,
  color: theme.colours.core.offBlack100,
  padding: '8px',
  border: `1px solid ${theme.colours.core.grey50}`,
  zIndex: 20,
  position: 'absolute',
  top: '32px',
  transition: 'left 0.7s cubic-bezier(.19, 1, .22, 1)',
  left: `calc(${leftPanelSize}% - 18px)`,
  '&:hover': {
    backgroundColor: theme.colours.core.grey30,
  },
}));

const Dialog = styled(MuiDialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100vw',
    height: '100vh',
    maxWidth: '100vw',
    maxHeight: '100vh',
    overflow: 'hidden',
    borderRadius: '0px',
    margin: '0px',
    padding: '0px',
    backgroundColor: theme.colours.core.grey10,
  },
}));

const Content = styled(DialogContent)({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0px',
  overflow: 'hidden',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '&:first-child': {
    paddingTop: '0px',
  },
  position: 'relative',
});

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: '#FAFBFC',
  },
  footer: {
    width: '100%',
    height: '80px',
    padding: '0px 24px',
    borderTop: '1px solid #ECF0F3',
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  navBar: {
    height: '80px',
  },
  rightPanel: {
    height: '100%',
    position: 'relative',
    borderRadius: '16px 0px 0px 0px',
    padding: '48px',
    backgroundColor: '#FFFFFF',
  },
  discardBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #F91D5F',
    borderRadius: '8px',
    padding: '12px 16px',
    height: '48px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& > span > div': {
      color: '#F91D5F',
    },
  },
  panelTransition: {
    transition: 'width 0.7s cubic-bezier(.19, 1, .22, 1)',
  },
  icon: {
    transition: 'transform 0.7s cubic-bezier(.19, 1, .22, 1)',
  },
  iconRight: {
    transform: 'rotate(180deg)',
  },
}));

interface IProps {
  open: boolean;
  onClose: () => void;
  handleSubmit?: () => (Promise<void> | void);
  submitDisabled?: boolean;
  getSubmitTooltip?: () => NonNullable<ReactNode>;

  navBar?: ReactNode;
  header?: ReactNode;
  leftPanelContent?: ReactNode;
  rightPanelContent?: ReactNode;

  flexibleWidths?: boolean;
}

export interface ISplitPageDialogRef {
  collapseLeftPanel: () => void;
  collapseRightPanel: () => void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const SplitPageDialog = forwardRef<ISplitPageDialogRef, IProps>(({
  open,
  onClose,
  handleSubmit,
  submitDisabled,
  getSubmitTooltip,
  navBar,
  header,
  leftPanelContent,
  rightPanelContent,
  flexibleWidths = false,
}: IProps, ref): JSX.Element => {
  const classes = useStyles();

  const [loading, setLoading] = useState<boolean>(false);
  const [leftPanelSize, setLeftPanelSize] = useState<number>(
    flexibleWidths
      ? 65
      : 50,
  );

  const onSubmit = async (): Promise<void> => {
    if (handleSubmit) {
      setLoading(true);
      await handleSubmit();
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    collapseLeftPanel: () => setLeftPanelSize(35),
    collapseRightPanel: () => setLeftPanelSize(65),
  }), []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      disableEscapeKeyDown
      disableEnforceFocus
    >
      {navBar && (
        <Box className={classes.navBar}>
          {navBar}
        </Box>
      )}
      {header && (
        header
      )}
      <Content>
        <Box
          display="flex"
          flexDirection="column"
          width={`${leftPanelSize}%`}
          height="100%"
          padding="24px"
          paddingRight="24px"
          className={classes.panelTransition}
        >
          {leftPanelContent}
        </Box>
        {flexibleWidths && (
          <CollapseIconButton
            leftPanelSize={leftPanelSize}
            onClick={(): void => setLeftPanelSize((prev) => 100 - prev)}
          >
            <ArrowLeftIcon
              className={clsx({
                [classes.icon]: true,
                [classes.iconRight]: leftPanelSize < 50,
              })}
            />
          </CollapseIconButton>
        )}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          width={`calc(100% - ${leftPanelSize}%)`}
          className={clsx(classes.rightPanel, classes.panelTransition)}
        >
          {rightPanelContent}
        </Box>
      </Content>
      <DialogActions style={{ padding: '0px' }}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          className={classes.footer}
        >
          <CustomButton
            label="Discard"
            variant="subtle"
            className={classes.discardBtn}
            onClick={onClose}
          />
          <Tooltip
            title={getSubmitTooltip ? getSubmitTooltip() : ''}
            placement="top"
          >
            <span>
              <CustomButton
                onClick={onSubmit}
                label="Submit"
                variant="bold"
                style={{ minWidth: '85px' }}
                disabled={submitDisabled || loading}
                loading={loading}
              />
            </span>
          </Tooltip>
        </Box>
      </DialogActions>
    </Dialog>
  );
});

export default SplitPageDialog;
