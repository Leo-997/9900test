import {
  Editor, ElementApi, NodeApi, Value,
} from '@udecode/plate';
import { EvidencePlugin } from '@/components/plate-ui/Plugins/evidence';

export const getRTEEvidence = (editor:Editor<Value>): string[] => {
  const evidenceIds: Set<string> = new Set();
  const elements = NodeApi.elements(editor);
  for (const [element] of elements) {
    if (ElementApi.isElement(element) && element.type === EvidencePlugin.key) {
      evidenceIds.add(element.evidenceId as string);
    }
  }
  return Array.from(evidenceIds);
};
