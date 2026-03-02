import { ElementApi } from '@udecode/plate';
import { PlateEditor } from '@udecode/plate-core/react';
import dayjs from 'dayjs';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from 'react';
import { Node } from 'slate';
import useEvidences from '@/api/useEvidences';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { Evidence, isResource } from '@/types/Evidence/Evidences.types';
import { IResourceWithMeta } from '@/types/Evidence/Resources.types';
import { IDownloadURL } from '@/types/FileTracker/FileTracker.types';
import { EvidencePlugin } from '../Plugins/evidence';

export interface IRTEEvidence {
  getEvidenceById: (evidenceId: string) => Evidence | undefined;
  getUrl: (resource: IResourceWithMeta) => IDownloadURL | undefined;
  addEvidence: (evidence: Evidence) => Promise<void>;
  readonly: boolean;
  hideEvidence: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const RTEEvidenceContext = createContext<IRTEEvidence | undefined>(undefined);

export const useRTEEvidence = (): IRTEEvidence => {
  const ctx = useContext(RTEEvidenceContext);

  if (!ctx) {
    throw new Error('RTEEvidence context cannot be used at this scope');
  }

  return ctx;
};

interface IProps {
  readonly: boolean;
  hideEvidence: boolean;
  children?: ReactNode;
  editor: PlateEditor;
}

export function RTEEvidenceProvider({
  readonly,
  children,
  hideEvidence = false,
  editor,
}: IProps): JSX.Element {
  const { getAllEvidence } = useEvidences();
  const zeroDashSdk = useZeroDashSdk();

  const [evidence, setEvidence] = useState<Record<string, Evidence>>({});
  const [urls, setUrls] = useState<Record<string, IDownloadURL>>({});

  const evidenceIds = useMemo((): string[] => {
    const ids: string[] = [];
    const elements = Node.elements(editor);
    for (const [element] of elements) {
      if (ElementApi.isElement(element) && element.type === EvidencePlugin.key) {
        ids.push(element.evidenceId as string);
      }
    }
    return ids;
  }, [editor]);

  const getUrl = useCallback(async (resource: IResourceWithMeta) => (
    zeroDashSdk.filetracker.downloadFile(resource.fileId as string)
      .then((resp) => {
        const newUrl = {
          fileId: resource.fileId as string,
          fileName: resource.name,
          url: URL.createObjectURL(resp),
          expiry: dayjs().add(1, 'hour').toISOString(),
        };
        setUrls((prev) => ({
          ...prev,
          [newUrl.fileId]: newUrl,
        }));
        return newUrl;
      })
  ), [zeroDashSdk.filetracker]);

  const value = useMemo(() => ({
    getEvidenceById: (evidenceId: string) => evidence[evidenceId],
    getUrl: (resource: IResourceWithMeta) => urls[resource.fileId as string],
    addEvidence: async (newEvidence: Evidence): Promise<void> => {
      setEvidence((prev) => ({ ...prev, [newEvidence.evidenceId]: newEvidence }));
      if (isResource(newEvidence) && newEvidence.fileId) {
        const url = await getUrl(newEvidence);
        setUrls((prev) => ({ ...prev, [url.fileId]: url }));
      }
    },
    readonly,
    hideEvidence,
  }), [evidence, getUrl, urls, hideEvidence, readonly]);

  useEffect(() => {
    if (
      evidenceIds.length
      && evidenceIds.some((id) => !evidence[id])
    ) {
      getAllEvidence({
        evidenceDetailsFilters: {
          ids: evidenceIds,
        },
      })
        .then(({ resources, allEvidence }) => {
          setEvidence(
            allEvidence.reduce<Record<string, Evidence>>(
              (prev, current) => ({ ...prev, [current.evidenceId]: current }),
              {},
            ),
          );
          Promise.all(
            resources
              .filter((resource) => resource.fileId)
              .map((resource) => getUrl(resource)),
          )
            .then((resp) => {
              setUrls(
                resp.reduce<Record<string, IDownloadURL>>(
                  (prev, current) => ({ ...prev, [current.fileId]: current }),
                  {},
                ),
              );
            });
        });
    }
  }, [evidence, evidenceIds, getAllEvidence, getUrl]);

  return (
    <RTEEvidenceContext.Provider value={value}>
      {children}
    </RTEEvidenceContext.Provider>
  );
}
