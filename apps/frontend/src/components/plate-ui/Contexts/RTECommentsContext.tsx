import { CommentModes } from '@/components/Input/RichTextEditor/RichTextEditor';
import { createContext, ReactNode, useContext, useMemo, type JSX } from 'react';

export interface IRTEComments {
  hideComments: boolean;
  commentMode: CommentModes;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const RTECommentsContext = createContext<IRTEComments | undefined>(undefined);

export const useRTEComments = (): IRTEComments => {
  const ctx = useContext(RTECommentsContext);

  if (!ctx) {
    throw new Error('RTEComments context cannot be used at this scope');
  }

  return ctx;
};

interface IProps {
  hideComments: boolean;
  commentMode: CommentModes;
  children?: ReactNode;
}

export function RTECommentsProvider({ children, hideComments = false, commentMode = 'readOnly' }: IProps): JSX.Element {
  const value = useMemo(() => ({
    hideComments,
    commentMode,
  }), [hideComments, commentMode]);
  return (
    <RTECommentsContext.Provider value={value}>
      {children}
    </RTECommentsContext.Provider>
  );
}
