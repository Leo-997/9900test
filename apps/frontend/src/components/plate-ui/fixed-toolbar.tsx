import { withCn } from '@udecode/cn';

import { Toolbar } from './toolbar';

export const FixedToolbar = withCn(
  Toolbar,
  'supports-backdrop-blur:bg-white/60 left-0 z-50 w-full justify-between overflow-x-auto rounded-t-lg border-b border-b-border bg-white/95 backdrop-blur dark:supports-backdrop-blur:bg-zinc-950/60 dark:bg-zinc-950/95',
);
