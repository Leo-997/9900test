import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { makeStyles } from '@mui/styles';
import { useRef, type JSX } from 'react';
import CustomTypography from '../../../../Common/Typography';
import { RichTextEditor } from '../../../../Input/RichTextEditor/RichTextEditor';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  histopathButton: {
    marginRight: '10px',
  },
  button: {
    textTransform: 'none',
    marginBottom: '10px',
    height: '32px',
  },
  buttonLabel: {
    paddingRight: '10px',
  },
}));

interface IProps {
  clinicalHistory?: string;
  readonly?: boolean;
  isPresentationMode?: boolean;
  isArchive?: boolean;
  onUpdate?: (clinicalHistory: string) => void;
}

export default function ClinicalHistory({
  clinicalHistory,
  onUpdate,
  readonly = false,
  isPresentationMode = false,
  isArchive = false,
}: IProps): JSX.Element {
  const classes = useStyles();

  const canComment = useIsUserAuthorised('common.sample.suggestion.write');

  const initialText = useRef<string>(clinicalHistory || '');

  return (
    <div className={classes.root}>
      {/* TODO - Uncomment when reports are available */}
      {/* <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        width="100%"
      >
        <Box>
          <Button
            disabled={!isPresentationMode}
            variant="outlined"
            className={clsx(classes.histopathButton, classes.button)}
          >
            <CustomTypography variant="bodyRegular" className={classes.buttonLabel}>
              Histopath Report
            </CustomTypography>
            <span style={{ transform: 'rotate(90deg)' }}>
              <StickIcon />
            </span>
          </Button>
          <Button
            disabled={!isPresentationMode}
            variant="outlined"
            className={classes.button}
          >
            <CustomTypography variant="bodyRegular" className={classes.buttonLabel}>
              Pathology Report
            </CustomTypography>
            <span style={{ transform: 'rotate(90deg)' }}>
              <StickIcon />
            </span>
          </Button>
        </Box>
      </Box> */}
      {clinicalHistory !== undefined && (
        <RichTextEditor
          mode={readonly ? 'readOnly' : 'autoSave'}
          commentMode={canComment ? 'edit' : 'readOnly'}
          hideComments={isPresentationMode || isArchive}
          initialText={initialText.current}
          title={(
            <CustomTypography
              variant={isPresentationMode ? 'titleRegular' : 'bodyRegular'}
              fontWeight="bold"
              padding="8px 0"
            >
              Clinical History
            </CustomTypography>
          )}
          onSave={onUpdate}
          hideEvidence={readonly}
          hideEmptyEditor={isPresentationMode}
          flexibleTableWidth={isPresentationMode}
          // classname is used for the export function
          classNames={{
            root: 'clinical-history-editor-root',
          }}
        />
      )}
    </div>
  );
}
