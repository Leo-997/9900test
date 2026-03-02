import useEvidences from '@/api/useEvidences';
import { ICitationWithMeta } from '@/types/Evidence/Citations.types';
import { PlateEditor } from '@udecode/plate-core/react';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from 'react';
import { getRTEInlineCitations } from '@/utils/editor/getRTEInlineCitations';

interface IRTECitationContext {
  getCitation: (id: string) => ICitationWithMeta | undefined
  addCitation: (evidence: ICitationWithMeta) => void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const RTECitationContext = createContext<IRTECitationContext | undefined>(undefined);

export const useRTECitations = (): IRTECitationContext => {
  const ctx = useContext(RTECitationContext);

  if (!ctx) {
    throw new Error('RTEComments context cannot be used at this scope');
  }

  return ctx;
};

interface IProps {
  editor: PlateEditor;
  children?: ReactNode;
}

export function RTECitationProvider({
  editor,
  children,
}: IProps): JSX.Element {
  const { getAllEvidence } = useEvidences();
  const [citations, setCitations] = useState<Record<string, ICitationWithMeta>>({});

  const citationIds = useMemo(() => getRTEInlineCitations(editor), [editor]);

  const value = useMemo(() => ({
    getCitation: (id: string) => citations[id],
    addCitation: (newCitation: ICitationWithMeta): void => {
      setCitations((prev) => ({ ...prev, [newCitation.evidenceId as string]: newCitation }));
    },
  }), [citations]);

  useEffect(() => {
    if (citationIds.length) {
      getAllEvidence({
        evidenceDetailsFilters: {
          ids: citationIds,
        },
      })
        .then(({ citations: allCitations }) => {
          setCitations(
            allCitations.reduce<Record<string, ICitationWithMeta>>(
              (prev, current) => ({ ...prev, [current.evidenceId as string]: current }),
              {},
            ),
          );
        });
    }
  }, [citationIds, getAllEvidence]);

  return (
    <RTECitationContext.Provider value={value}>
      {children}
    </RTECitationContext.Provider>
  );
}
