import { withRef } from '@udecode/cn';
import { useOutdentButton } from '@udecode/plate-indent/react';

import { Icons } from '@/components/plate-ui/Icons';

import { unindentListItems } from '@udecode/plate-list';
import { useEditorRef } from '@udecode/plate/react';
import { ToolbarButton } from './toolbar';

export const OutdentToolbarButton = withRef<typeof ToolbarButton>(
  (rest, ref) => {
    const { props } = useOutdentButton();
    const editor = useEditorRef();

    const handleClick = (): void => {
      unindentListItems(editor);
      props.onClick();
    };

    return (
      <ToolbarButton ref={ref} tooltip="Outdent" {...props} onClick={handleClick} {...rest} id="rte-outdent-button">
        <Icons.outdent />
      </ToolbarButton>
    );
  },
);
