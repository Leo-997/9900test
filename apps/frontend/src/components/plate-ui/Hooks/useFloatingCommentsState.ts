import { BaseCommentsPlugin } from '@udecode/plate-comments';
import {
  useEditorPlugin,
  usePluginOption,
} from '@udecode/plate/react';

import { useEffect, useState } from 'react';

type FloatingCommentsState = {
  activeCommentId: string | null;
  loaded: boolean;
};

export const useFloatingCommentsState = (): FloatingCommentsState => {
  const { api } = useEditorPlugin(BaseCommentsPlugin);

  const activeCommentId = usePluginOption(
    BaseCommentsPlugin,
    'activeCommentId',
  );

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // reset comment editing value when active comment id changes
  useEffect(() => {
    if (activeCommentId) {
      api.comment.resetNewCommentValue();
    }
  }, [activeCommentId, api.comment]);

  return {
    activeCommentId,
    loaded,
  };
};
