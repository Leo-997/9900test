import {
  Box,
  IconButton,
  Dialog as MuiDialog,
  styled,
  SxProps,
  Tooltip,
} from '@mui/material';
import { XIcon } from 'lucide-react';
import { ReactNode, useCallback, type JSX } from 'react';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import CustomButton from './Button';
import CustomTypography from './Typography';

const Dialog = styled(MuiDialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0px',
    position: 'relative',
    minWidth: '800px',
    maxWidth: 'min(1200px, 100vw - 60px)',
    background: theme.colours.core.white,
    borderRadius: '16px',
    overflow: 'hidden',
  },
}));

const DialogHeader = styled(Box)({
  width: '100%',
  padding: '24px 32px',
  gap: '8px',
  borderRadius: '16px 16px 0px 0px',
});

const DialogContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '24px',
  width: '100%',
});

const Action = styled(Box)({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: '16px 32px',
  background: '#FFFFFF',
  borderRadius: '0px 0px 16px 16px',
  gap: '16px',
});

interface IActions {
  cancel?: string;
  confirm?: string;
  secondary?: string;
}

interface IShowActions {
  cancel?: boolean;
  confirm?: boolean;
  secondary?: boolean;
}

interface IProps {
  title: ReactNode;
  content: ReactNode;
  open: boolean;
  variant?: 'create' | 'message' | 'alert';
  secondaryVariant?: 'create' | 'message' | 'alert';
  buttonText?: IActions;
  showActions?: IShowActions;
  overrideActions?: ReactNode;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  onSecondary?: () => void;
  confirmDisabled?: boolean;
  secondaryDisabled?: boolean;
  tooltipText?: ReactNode;
  sx?: SxProps;
}

export default function CustomModal({
  title,
  content,
  open,
  variant,
  secondaryVariant,
  buttonText = { cancel: 'Cancel', confirm: 'Confirm' },
  showActions = { cancel: true, confirm: true, secondary: false },
  overrideActions,
  onClose,
  onConfirm,
  onSecondary,
  confirmDisabled = false,
  secondaryDisabled = false,
  tooltipText,
  sx,
}: IProps): JSX.Element {
  const buttonVariant = useCallback((givenVariant: string) => {
    switch (givenVariant) {
      case 'alert':
        return 'warning';
      case 'create':
        return 'bold';
      default:
        return 'outline';
    }
  }, []);

  const handleConfirmClick = (): void => {
    if (onConfirm) onConfirm();
  };

  return (
    <Dialog disableEnforceFocus onClose={onClose} open={open} sx={sx}>
      <DialogHeader
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        {typeof title === 'string' ? (
          <CustomTypography variant="titleRegular" fontWeight="medium">
            {title}
          </CustomTypography>
        ) : (
          title
        )}
        <IconButton onClick={onClose}>
          <XIcon />
        </IconButton>
      </DialogHeader>
      <ScrollableSection
        className="CustomDialog-ScrollableSection"
        style={{
          maxHeight: 'calc(100vh - 200px - 64px)',
          minWidth: '800px',
          width: '1200px',
          maxWidth: 'min(1200px, 100vw - 60px)',
        }}
      >
        <DialogContent>
          {typeof content === 'string' || typeof content === 'number'
            ? (
              <CustomTypography variant="bodyRegular" style={{ whiteSpace: 'pre-wrap' }}>
                {content}
              </CustomTypography>
            ) : (
              content
            )}
        </DialogContent>
      </ScrollableSection>
      {Object.values(showActions).some(Boolean) && (
        <Action>
          {overrideActions || (
            <>
              {showActions.secondary && (
                <CustomButton
                  sx={{ marginRight: 'auto' }}
                  variant={buttonVariant(secondaryVariant || 'alert')}
                  label={buttonText?.secondary ?? 'Discard'}
                  onClick={onSecondary}
                  disabled={secondaryDisabled}
                />
              )}
              {showActions.cancel && (
                <CustomButton
                  variant="subtle"
                  label={buttonText?.cancel ?? 'Cancel'}
                  onClick={onClose}
                />
              )}
              {showActions.confirm && (
                tooltipText
                  ? (
                    <Tooltip
                      title={tooltipText}
                      placement="top"
                    >
                      <span>
                        <CustomButton
                          variant={buttonVariant(variant || 'create')}
                          label={buttonText?.confirm ?? 'Confirm'}
                          onClick={handleConfirmClick}
                          disabled={confirmDisabled}
                        />
                      </span>
                    </Tooltip>
                  )
                  : (
                    <CustomButton
                      variant={buttonVariant(variant || 'create')}
                      label={buttonText.confirm ?? 'Confirm'}
                      onClick={handleConfirmClick}
                      disabled={confirmDisabled}
                    />
                  )
              )}
            </>
          )}
        </Action>
      )}
    </Dialog>
  );
}
