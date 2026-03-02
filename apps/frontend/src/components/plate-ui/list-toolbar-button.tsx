import React from 'react';
import { withRef } from '@udecode/cn';
import {
  BulletedListPlugin,
  useListToolbarButton,
  useListToolbarButtonState,
} from '@udecode/plate-list/react';

import { ToolbarButton } from './toolbar';
import { Icons } from './Icons';

export const ListToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: string;
  }
>(({ nodeType = BulletedListPlugin.key, ...rest }, ref) => {
  const state = useListToolbarButtonState({ nodeType });
  const { props } = useListToolbarButton(state);

  return (
    <ToolbarButton
      ref={ref}
      tooltip={nodeType === BulletedListPlugin.key ? 'Bulleted List' : 'Numbered List'}
      {...props}
      {...rest}
    >
      {nodeType === BulletedListPlugin.key ? <Icons.ul /> : <Icons.ol />}
    </ToolbarButton>
  );
});
