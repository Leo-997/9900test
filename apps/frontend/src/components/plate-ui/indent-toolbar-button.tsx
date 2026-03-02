import { withRef } from '@udecode/cn';
import { useIndentButton } from '@udecode/plate-indent/react';

import { Icons } from '@/components/plate-ui/Icons';

import { useEditorRef } from '@udecode/plate/react';
import { indentListItems } from '@udecode/plate-list';
import { ToolbarButton } from './toolbar';

export const IndentToolbarButton = withRef<typeof ToolbarButton>(
  (rest, ref) => {
    const { props } = useIndentButton();
    const editor = useEditorRef();

    const handleClick = (): void => {
      indentListItems(editor);
      props.onClick();
    };

    return (
      <ToolbarButton ref={ref} tooltip="Indent" {...props} onClick={handleClick} {...rest}>
        <Icons.indent />
      </ToolbarButton>
    );
  },
);
