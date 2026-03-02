import { useUser } from '@/contexts/UserContext';
import { Plugins } from '@/types/Editor/editor.types';
import { parseText } from '@/utils/editor/parser';
import { Value } from '@udecode/plate';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import {
  computeDiff,
} from '@udecode/plate-diff';
import { cloneDeep } from 'lodash';
import { useEffect, useMemo, type JSX } from 'react';
import { CustomPlateEditor } from './plate-editor';
import { useCreateEditor } from './use-create-editor';

interface IClassNames {
  root?: string;
  editor?: string;
}

interface IProps {
  current: string;
  another: string;
  classNames?: IClassNames;
  disablePlugins?: Plugins[];
  hideComments: boolean;
  hideEvidence?: boolean;
}

export function DiffEditor({
  current,
  another,
  classNames,
  disablePlugins = [],
  hideComments,
  hideEvidence,
}: IProps): JSX.Element {
  const { currentUser } = useUser();
  const { value: currentValue, comments: currentComments } = useMemo(() => (
    parseText(current)
  ), [current]);

  const { value: prevValue } = useMemo(() => (
    parseText(another)
  ), [another]);

  const diffValue = useMemo(() => (
    computeDiff(prevValue, cloneDeep(currentValue), {
      getUpdateProps: (node, properties, newProperties) => {
        const removedProps = { ...properties };
        for (const key in removedProps) {
          if (key.startsWith('comment_')) {
            delete removedProps[key];
          }
        }

        const addedProps = { ...newProperties };
        for (const key in addedProps) {
          if (key.startsWith('comment_')) {
            delete addedProps[key];
          }
        }

        return {
          diff: true,
          diffOperation: {
            type: 'update',
            properties: removedProps,
            newProperties: addedProps,
          },
        };
      },
      ignoreProps: ['id'],
    }) as Value
  ), [prevValue, currentValue]);

  const editor = useCreateEditor(
    {
      disablePlugins,
      value: diffValue,
    },
    [diffValue],
  );

  useEffect(() => {
    editor.setOptions(
      CommentsPlugin,
      {
        onCommentAdd: () => {},
        onCommentDelete: () => {},
        onCommentUpdate: () => {},
        comments: currentComments,
        myUserId: currentUser?.id as string,
      },
    );
  }, [currentUser?.id, editor, currentComments]);

  return (
    <CustomPlateEditor
      key={JSON.stringify(diffValue)}
      editor={editor}
      classNames={classNames}
      readonly
      hideToolbar
      disablePlugins={disablePlugins}
      commentMode="readOnly"
      hideComments={hideComments}
      hideEvidence={hideEvidence}
    />
  );
}
