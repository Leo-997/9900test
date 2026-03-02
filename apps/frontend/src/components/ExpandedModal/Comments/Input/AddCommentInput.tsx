import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import {
  Dispatch, SetStateAction, useEffect, useRef, useState, type JSX,
} from 'react';
import { IRTERef, RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { CommonCommentTypes, ICommentTagOption } from '../../../../types/Comments/CommonComments.types';
import CommentTag from '../Tags/CommentTag';
import { CommentTagMenu } from '../Tags/CommentTagMenu';

interface IStyleProps {
  showTags?: boolean;
  tag?: ICommentTagOption<string>
}

const InputWrapper = styled(Box)<IStyleProps>(({ tag, showTags }) => ({
  position: 'relative',
  '& .rte-comments-editor-toolbar': {
    backgroundColor: tag ? `${tag.backgroundColor} !important` : undefined,
    borderColor: tag ? `${tag.color} !important` : undefined,
    '& button': {
      '&:hover': {
        // 14 is 20% in hex
        backgroundColor: tag ? `${tag.color}14 !important` : undefined,
        color: tag ? `${tag.color} !important` : undefined,
      },
      '&[aria-checked="true"]': {
        // 14 is 20% in hex
        backgroundColor: tag ? `${tag.color}14 !important` : undefined,
        color: tag ? `${tag.color} !important` : undefined,
      },
    },
    '& .plate-toolbar-divider': {
      backgroundColor: tag ? `${tag.color} !important` : undefined,
    },
  },
  '& .rte-comments-editor': {
    paddingBottom: showTags ? '36px' : undefined,
    maxHeight: '200px',
    borderColor: tag ? `${tag.color} !important` : undefined,
  },
}));

interface IProps<T extends string = CommonCommentTypes> {
  draftComment?: string | null;
  handleSubmit: (
    comment: string,
    tag?: T,
    evidence?: string[],
  ) => void;
  showTags?: boolean;
  tagOptions: ICommentTagOption<T>[];
  onChange?: (newComment: string) => void;
  onCancel?: () => void;
  readonly?: boolean;
  initialText?: string;
}

export function AddCommentInput<T extends string = CommonCommentTypes>({
  draftComment,
  handleSubmit,
  showTags = false,
  tagOptions,
  onChange,
  onCancel,
  readonly = false,
  initialText,
}: IProps<T>): JSX.Element {
  const [tagMenuAnchorEl, setTagMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [tag, setTag] = useState<ICommentTagOption<T> | undefined>(
    showTags && tagOptions.length ? tagOptions[0] : undefined,
  );
  const [isEmpty, setIsEmpty] = useState<boolean>(true);

  const editorRef = useRef<IRTERef | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  const submitComment = (newText: string): void => {
    handleSubmit(newText, tag?.value as T, editorRef.current?.getInlineCitations());
    editorRef?.current?.clear();
  };

  useEffect(() => {
    if (showTags && tagOptions.length > 0 && !tag) {
      setTag(tagOptions[0]);
    }
  }, [showTags, tag, tagOptions]);

  return (
    <Box display="flex" flexDirection="column">
      <InputWrapper
        tag={!isEmpty ? tag as ICommentTagOption<T> : undefined}
        showTags={showTags}
        ref={editorContainerRef}
      >
        <RichTextEditor
          ref={editorRef}
          initialText={draftComment || initialText}
          placeholder="Enter a comment."
          mode={readonly && !draftComment ? 'readOnly' : 'manualSave'}
          commentMode="readOnly"
          hideComments
          onSave={submitComment}
          onCancel={(): void => {
            editorRef.current?.clear();
            onCancel?.();
          }}
          disableSaveOnEmpty
          disablePlugins={[
            'text-bg',
            'text-colour',
            'table',
            'evidence',
          ]}
          classNames={{
            toolbar: 'rte-comments-editor-toolbar',
            editor: 'rte-comments-editor',
          }}
          onChange={(newText): void => {
            setIsEmpty(editorRef.current?.isEmpty() ?? true);
            onChange?.(newText);
          }}
        />
        {showTags && tag && (
          <Box position="absolute" bottom="53px" right="5px">
            <CommentTag
              commentType={tag.value}
              isEdit={!readonly}
              tagOptions={tagOptions}
              handleSetTag={setTag}
            />
          </Box>
        )}
      </InputWrapper>
      <CommentTagMenu<T>
        anchorEl={tagMenuAnchorEl}
        handleClose={(): void => setTagMenuAnchorEl(null)}
        handleSetTag={setTag as Dispatch<SetStateAction<ICommentTagOption<T>>>}
        tagOptions={tagOptions}
      />
    </Box>
  );
}
