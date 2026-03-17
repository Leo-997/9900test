import { cn, PortalBody } from '@udecode/cn';
import {
  CommentProvider,
  CommentsPlugin,
  CommentsPositioner,
  SCOPE_ACTIVE_COMMENT,
  useCommentsPositioner,
  useCommentsPositionerState,
  useFloatingCommentsContentState,
} from '@udecode/plate-comments/react';

import { useEditorPlugin } from '@udecode/plate-core/react';
import { useEffect, useRef, type JSX } from 'react';
import { CommentModes } from '../Input/RichTextEditor/RichTextEditor';
import { CommentCreateForm } from './comment-create-form';
import { CommentItem } from './comment-item';
import { CommentReplyItems } from './comment-reply-items';
import { useFloatingCommentsState } from './Hooks/useFloatingCommentsState';
import { popoverVariants } from './popover';

export type FloatingCommentsContentProps = {
  disableForm?: boolean;
  commentMode: CommentModes;
};

export function CommentsPopoverContent(props: FloatingCommentsContentProps): JSX.Element {
  const { disableForm, commentMode } = props;

  const {
    activeCommentId, hasNoComment, myUserId,
  } = useFloatingCommentsContentState();

  const scrollableRef = useRef<HTMLDivElement | null>(null);

  return activeCommentId ? (
    <CommentProvider
      key={activeCommentId}
      id={activeCommentId}
      scope={SCOPE_ACTIVE_COMMENT}
    >
      <div className={cn(popoverVariants(), 'relative w-[500px] max-h-[80vh] flex flex-col')}>
        {!hasNoComment && (
          <div
            ref={scrollableRef}
            className="overflow-y-auto flex-grow max-h-[calc(80vh-100px)] pr-3"
          >
            <div className="space-y-4">
              <CommentItem
                key={activeCommentId}
                commentId={activeCommentId}
                commentMode={commentMode}
              />
              <CommentReplyItems commentMode={commentMode} />
            </div>
          </div>
        )}

        {!!myUserId && !disableForm && commentMode === 'edit' && (
          <div className="sticky bottom-0 bg-white pt-3">
            <CommentCreateForm scrollableRef={scrollableRef} />
          </div>
        )}
      </div>
    </CommentProvider>
  ) : <div />;
}

interface IProps {
  commentPopoverAnchor: HTMLElement | null;
  commentMode: CommentModes;
}

export function CommentsPopover({
  commentPopoverAnchor,
  commentMode,
}: IProps): JSX.Element {
  const { loaded, activeCommentId } = useFloatingCommentsState();
  const { setOption } = useEditorPlugin(CommentsPlugin);
  const { position } = useCommentsPositionerState();
  const { props: { style } } = useCommentsPositioner({ activeCommentId, position });

  const popperRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
    */
    function handleClickOutside(event): void {
      if (
        commentPopoverAnchor
        && !commentPopoverAnchor.contains(event.target)
        && popperRef.current
        && !popperRef.current.contains(event.target)
      ) {
        event.preventDefault();
        event.stopPropagation();
        setOption('activeCommentId', null);
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [commentPopoverAnchor, setOption]);

  if (!loaded || !activeCommentId) return <div />;

  return (
    <div ref={contentRef}>
      <PortalBody>
        <CommentsPositioner
          className="absolute z-[1300] w-[500px] pb-4"
          data-popover
          ref={popperRef}
          state={{
            activeCommentId,
            position: {
              left: Math.max(window.innerWidth - 540, 0),
              top: Math.min(
                style.top,
                window.innerHeight - (popperRef.current?.clientHeight ?? 0) - 50,
              ),
            },
          }}
        >
          <CommentsPopoverContent commentMode={commentMode} />
        </CommentsPositioner>
      </PortalBody>
    </div>
  );
}
