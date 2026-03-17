import { useEditorRef, useEditorSelector, withRef } from '@udecode/plate/react';
import { Redo2Icon, Undo2Icon } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export const RedoToolbarButton = withRef<typeof ToolbarButton>((props, ref) => {
  const editor = useEditorRef();
  const disabled = useEditorSelector(
    (e) => e.history.redos.length === 0,
    [],
  );

  return (
    <ToolbarButton
      ref={ref}
      disabled={disabled}
      onClick={(): void => editor.redo()}
      onMouseDown={(e): void => e.preventDefault()}
      tooltip="Redo"
      {...props}
    >
      <Redo2Icon />
    </ToolbarButton>
  );
});

export const UndoToolbarButton = withRef<typeof ToolbarButton>((props, ref) => {
  const editor = useEditorRef();
  const disabled = useEditorSelector(
    (e) => e.history.undos.length === 0,
    [],
  );

  return (
    <ToolbarButton
      ref={ref}
      disabled={disabled}
      onClick={(): void => editor.undo()}
      onMouseDown={(e): void => e.preventDefault()}
      tooltip="Undo"
      {...props}
    >
      <Undo2Icon />
    </ToolbarButton>
  );
});
