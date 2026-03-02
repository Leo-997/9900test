import {
  Editor, ElementApi, NodeApi, Value,
} from '@udecode/plate';
import { InlineCitationPlugin } from '@/components/plate-ui/Plugins/inline-citation';

export const getRTEInlineCitations = (editor:Editor<Value>): string[] => {
  const evidenceIds: Set<string> = new Set();
  const elements = NodeApi.elements(editor);
  for (const [element] of elements) {
    if (ElementApi.isElement(element) && element.type === InlineCitationPlugin.key) {
      evidenceIds.add(element.evidenceId as string);
    }
  }
  return Array.from(evidenceIds);
};
