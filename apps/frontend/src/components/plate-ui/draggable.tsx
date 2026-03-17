import { cn, withRef } from '@udecode/cn';
import { isType } from '@udecode/plate';
import { useDraggable, useDropLine } from '@udecode/plate-dnd';
import {
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
} from '@udecode/plate-media/react';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import {
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import {
  type PlateRenderElementProps,
  MemoizedChildren,
  ParagraphPlugin,
  RenderNodeWrapper,
  useEditorRef,
  useElement,
  usePath,
  usePluginOption,
  useReadOnly, useSelected,
} from '@udecode/plate/react';
import { GripVertical } from 'lucide-react';
import React, { useMemo } from 'react';

export const STRUCTURAL_TYPES: string[] = [
  TablePlugin.key,
  TableRowPlugin.key,
  TableCellPlugin.key,
];

const UNDRAGGABLE_KEYS = [
  TableRowPlugin.key,
  TableCellPlugin.key,
];

const Gutter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const editor = useEditorRef();
  const element = useElement();
  const path = usePath();
  const isSelectionAreaVisible = usePluginOption(
    BlockSelectionPlugin,
    'isSelectionAreaVisible',
  );
  const selected = useSelected();

  const isNodeType = (keys: string[] | string): boolean => isType(editor, element, keys);

  const isInColumn = path.length === 3;
  const isInTable = path.length === 4;

  return (
    <div
      ref={ref}
      className={cn(
        'slate-gutterLeft',
        'absolute -top-px z-50 flex h-full -translate-x-full cursor-text hover:opacity-100 sm:opacity-0',
        STRUCTURAL_TYPES.includes(element.type)
          ? 'main-hover:group-hover/structural:opacity-100'
          : 'main-hover:group-hover:opacity-100',
        isSelectionAreaVisible && 'hidden',
        !selected && 'opacity-0',
        isNodeType(ParagraphPlugin.key) && 'pb-0 pt-[3px]',
        isNodeType(['ul', 'ol']) && 'pb-0',
        isNodeType([
          ImagePlugin.key,
          MediaEmbedPlugin.key,
        ]) && 'py-0',
        isNodeType([PlaceholderPlugin.key, TablePlugin.key]) && 'pb-0 pt-3',
        isInColumn && 'mt-2 h-4 pt-0',
        isInTable && 'size-4',
        className,
      )}
      contentEditable={false}
      {...props}
    >
      {children}
    </div>
  );
});
Gutter.displayName = 'Gutter';

const DragHandle = React.memo(() => {
  const editor = useEditorRef();

  return (
    <GripVertical
      className="size-4 text-muted-foreground"
      onClick={(event): void => {
        event.stopPropagation();
        event.preventDefault();
      }}
      onMouseDown={(): void => {
        editor
          .getApi(BlockSelectionPlugin)
          .blockSelection?.resetSelectedIds();
      }}
    />
  );
});
DragHandle.displayName = 'DragHandle';

const DropLine = React.memo(
  React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
      const { dropLine } = useDropLine();

      if (!dropLine) return null;

      return (
        <div
          ref={ref}
          {...props}
          className={cn(
            'slate-dropLine',
            'absolute inset-x-0 h-0.5 opacity-100 transition-opacity',
            'bg-brand/50',
            dropLine === 'top' && '-top-px',
            dropLine === 'bottom' && '-bottom-px',
            className,
          )}
        />
      );
    },
  ),
);

export const Draggable = withRef<'div', PlateRenderElementProps>(
  ({ ...props }, ref) => {
    const {
      children, editor, element, path,
    } = props;
    const { isDragging, previewRef, handleRef } = useDraggable({ element });

    const isInColumn = path.length === 3;
    const isInTable = path.length === 4;

    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          isDragging && 'opacity-50',
          STRUCTURAL_TYPES.includes(element.type) ? 'group/structural' : 'group',
        )}
      >
        <Gutter>
          <div
            className={cn(
              'slate-blockToolbarWrapper',
              'flex h-[1.5em]',
              isInColumn && 'h-4',
              isInTable && 'mt-1 size-4',
            )}
          >
            <div
              className={cn(
                'slate-blockToolbar',
                'pointer-events-auto mr-1 flex items-center',
                isInColumn && 'mr-1.5',
              )}
            >
              <div ref={handleRef} className="size-4">
                <DragHandle />
              </div>
            </div>
          </div>
        </Gutter>

        <div className="slate-blockWrapper">
          <MemoizedChildren>{children}</MemoizedChildren>

          <DropLine />
        </div>
      </div>
    );
  },
);

export const DraggableAboveNodes: RenderNodeWrapper = (props) => {
  const { editor, element, path } = props;
  const readOnly = useReadOnly();

  const enabled = useMemo(() => {
    if (readOnly) return false;
    if (path.length === 1 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      return true;
    }
    if (path.length === 4 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: {
          type: editor.getType(TablePlugin),
        },
      });

      if (block) {
        return true;
      }
    }

    return false;
  }, [editor, element, path, readOnly]);

  if (!enabled) return;

  // eslint-disable-next-line consistent-return
  return function DraggableNode(draggableProps) {
    return <Draggable {...draggableProps} />;
  };
};
