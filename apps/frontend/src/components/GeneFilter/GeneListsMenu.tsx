import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { IGene } from '@/types/Common.types';
import { IGeneList } from '@/types/Reports/GeneLists.types';
import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react';
import ListMenu from '../SearchFilterBar/ListMenu';

interface IProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
  selectedGeneList: IGene[];
  setSelectedGeneList: Dispatch<SetStateAction<IGene[]>>;
}

export function GeneListsMenu({
  anchorEl,
  setAnchorEl,
  selectedGeneList,
  setSelectedGeneList,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const [options, setOptions] = useState<IGeneList[]>();
  const [selectedLists, setSelectedLists] = useState<IGeneList[]>([]);

  useEffect(() => {
    if (anchorEl) {
      zeroDashSdk.services.reports.getGeneLists({ isActive: true })
        .then((resp) => setOptions(resp))
        .catch(() => setOptions([]));
    }
  }, [zeroDashSdk.services.reports, anchorEl]);

  const handleChange = async (newVal: string[]): Promise<void> => {
    const newList = options?.filter(
      (l) => newVal.map((n) => n.split('::')[1]).includes(l.versionId),
    ) || [];
    const removedLists = selectedLists
      .filter((l) => !newList.some((n) => n.versionId === l.versionId));
    const newGenes = newList.map((l) => l.genes || []).flat();
    // fetch the new genes if there are any new lists added
    setSelectedGeneList((prev) => {
      if (removedLists.length) {
        return prev
          .filter(
            (gene) => !removedLists.some((l) => l.genes?.some((g) => g.geneId === gene.geneId)),
          );
      }
      return [...prev, ...newGenes.filter((gene) => !prev.some((p) => p.geneId === gene.geneId))];
    });
  };

  useEffect(() => {
    setSelectedLists(
      options
        ?.filter((l) => l.genes?.length)
        .filter((l) => l.genes?.every(
          (g) => selectedGeneList.some((gene) => gene.geneId === g.geneId),
        )) || [],
    );
  }, [options, selectedGeneList]);

  return options ? (
    <ListMenu
      anchorEl={anchorEl}
      setAnchorEl={setAnchorEl}
      menuOptions={
        options
          .filter((l) => l.genes?.length)
          .map((l) => `${l.name} version ${l.version}::${l.versionId}`)
          .sort((a, b) => a.localeCompare(b))
      }
      value={
        selectedLists
          .map((l) => `${l.name} version ${l.version}::${l.versionId}`)
      }
      customLabel={(l): string => l.split('::')[0]}
      onChange={handleChange}
    />
  ) : <div />;
}
