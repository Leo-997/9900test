import { cn, withRef } from '@udecode/cn';
import {
  type FloatingToolbarState,
  flip,
  offset,
  useFloatingToolbar,
  useFloatingToolbarState,
} from '@udecode/plate-floating';
import {
  useComposedRef,
  useEditorId,
  useEventEditorValue,
} from '@udecode/plate/react';

import { Toolbar } from './toolbar';

export const FloatingToolbar = withRef<
  typeof Toolbar,
  {
    state?: FloatingToolbarState;
  }
>(({ children, state, ...props }, componentRef) => {
  const editorId = useEditorId();
  const focusedEditorId = useEventEditorValue('focus');

  const floatingToolbarState = useFloatingToolbarState({
    editorId,
    focusedEditorId,
    hideToolbar: false,
    ...state,
    floatingOptions: {
      placement: 'right',
      middleware: [
        offset(12),
        flip({
          fallbackPlacements: [
            'top-start',
            'top-end',
            'bottom-start',
            'bottom-end',
          ],
          padding: 12,
        }),
      ],
      ...state?.floatingOptions,
    },
  });

  const {
    clickOutsideRef,
    hidden,
    props: rootProps,
    ref: floatingRef,
  } = useFloatingToolbar(floatingToolbarState);

  const ref = useComposedRef<HTMLDivElement>(componentRef, floatingRef);

  if (hidden) return null;

  return (
    <div ref={clickOutsideRef}>
      <Toolbar
        ref={ref}
        className={cn(
          'absolute z-50 whitespace-nowrap border border-zinc-200 bg-white px-1 opacity-100 shadow-md print:hidden dark:border-zinc-800 dark:bg-zinc-950',
          'max-w-[80vw] empty:hidden',
        )}
        {...rootProps}
        {...props}
      >
        {children}
      </Toolbar>
    </div>
  );
});
