import CustomModal from '@/components/Common/CustomModal';
import CustomTypography from '@/components/Common/Typography';
import { AvatarWithBadge } from '@/components/CustomIcons/AvatarWithBadge';
import { IRTERef, RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
  type JSX,
} from 'react';
import { useUser } from '../../../../../contexts/UserContext';
import { ScrollableSection } from '../../../../ScrollableSection/ScrollableSection';
import Gender from '../../../../VitalStatus/Gender';

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: 16,
    overflowY: 'unset',
    margin: 0,
  },
  modal: {
    maxWidth: '800px',
  },
  closeButton: {
    position: 'absolute',
    right: '-15px',
    top: '-15px',
    width: '40px',
    height: '40px',
    padding: '0px',
    minWidth: '40px',
  },
  dialogTitle: {
    backgroundColor: '#F3F5F7',
    height: '66px',
    width: '100%',
    paddingLeft: '45px',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  overline: {
    marginTop: '25px',
    marginBottom: '10px',
  },
  dialogContent: {
    height: '100%',
    width: '100%',
  },
  header: {
    padding: 8,
  },
  commentList: {
    width: '100%',
    height: '100%',
    maxHeight: '300px',
    marginTop: '15px',
    marginBottom: '15px',
  },
  comment: {
    marginTop: '20px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      backgroundColor: 'rgb(250, 251, 252)',
    },
  },
  commentListRTE: {
    backgroundColor: 'inherit',
  },
  commentEditor: {
    maxHeight: '100px',
  },
  footer: {
    height: '90px',
    width: '100%',
    borderTop: '1px solid rgb(236, 240, 243)',
  },
}));

type Comment = {
  id: string,
  comment: string,
  createdBy?: string,
  createdAt?: string,
}

type ModalData = {
  patientId: string;
  vitalStatus: string;
  gender: string;
};

interface IProps {
  data: ModalData;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  addComment: (comment: string) => Promise<void>;
  fetchComments: () => Promise<Comment[]>;
  disabled?: boolean;
}

export default function CommentModal({
  data,
  isOpen,
  setIsOpen,
  addComment,
  fetchComments,
  disabled = false,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { users } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const [comment, setComment] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);

  const editorRef = useRef<IRTERef | null>(null);

  const getComments = useCallback(async (): Promise<void> => {
    const resp = await fetchComments();
    setComments(resp);
  }, [fetchComments]);

  const handleValidation = async (): Promise<void> => {
    try {
      await addComment(comment);
      enqueueSnackbar('Comment posted successfully!', { variant: 'success' });
      await getComments();
      editorRef.current?.clear();
    } catch (e) {
      console.error(e);
      enqueueSnackbar('Failed to post comment, please try again', { variant: 'error' });
    }
  };

  useEffect(() => {
    getComments();
  }, [getComments]);

  return (
    <CustomModal
      title="Add or view comments"
      open={isOpen}
      onClose={(): void => setIsOpen(false)}
      buttonText={{ confirm: 'Comment' }}
      onConfirm={handleValidation}
      confirmDisabled={editorRef.current?.isEmpty()}
      content={(
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          className={classes.dialogContent}
        >
          {/* Title */}
          <CustomTypography variant="titleRegular" fontWeight="medium">
            {data.patientId}
            : Add comments
          </CustomTypography>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap="10px"
          >
            <CustomTypography display="inline">
              Patient Id:
              {' '}
              {data.patientId}
            </CustomTypography>
            {data.vitalStatus && <Gender vitalStatus={data.vitalStatus} gender={data.gender} />}
          </Box>
          {/* Previous comments */}
          {comments.length > 0 ? (
            <ScrollableSection className={classes.commentList}>
              {comments
                .sort((a, b) => dayjs(a.createdAt).diff(dayjs(b.createdAt)))
                .map((c) => {
                  const user = users.find((u) => u.id === c.createdBy);
                  const fullName = user ? `${user.givenName} ${user.familyName}` : 'Unknown user';
                  return (
                    <Card key={c.id} className={classes.comment} elevation={0}>
                      <CardHeader
                        avatar={<AvatarWithBadge user={user} />}
                        className={classes.header}
                        title={(
                          <Box display="flex" flexDirection="column">
                            <CustomTypography
                              variant="bodySmall"
                              style={{ fontWeight: 500, marginRight: 8 }}
                            >
                              {fullName}
                            </CustomTypography>
                            <CustomTypography
                              variant="bodySmall"
                              style={{ color: 'rgba(98, 114, 140, 1)' }}
                            >
                              {c.createdAt
                                ? dayjs(c.createdAt).format(
                                  'DD/MM/YYYY[, ]h:mm A',
                                )
                                : 'Date Unknown'}
                            </CustomTypography>
                          </Box>
                        )}
                      />
                      <CardContent style={{ padding: '5px 0 5px 5px' }}>
                        <RichTextEditor
                          initialText={c.comment}
                          condensed
                          mode="readOnly"
                          classNames={{
                            editor: classes.commentListRTE,
                          }}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
            </ScrollableSection>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="150px"
              width="100%"
            >
              <CustomTypography variant="bodySmall" style={{ color: 'rgb(130, 146, 166)' }}>
                No comments for this sample yet. Consider adding one below.
              </CustomTypography>
            </Box>
          )}
          {/* Comment Input */}
          <Box display="flex" width="100%">
            <RichTextEditor
              ref={editorRef}
              classNames={{
                editor: classes.commentEditor,
              }}
              title={(
                <CustomTypography variant="label" className={classes.overline}>
                  COMMENT *
                </CustomTypography>
              )}
              mode={disabled ? 'readOnly' : 'autoSave'}
              disablePlugins={['table', 'evidence', 'inline-citation']}
              onChange={
                (value): void => setComment(editorRef.current?.isEmpty() ? '' : JSON.stringify(JSON.parse(value).value))
              }
            />
          </Box>
        </Box>
      )}
    />
  );
}
