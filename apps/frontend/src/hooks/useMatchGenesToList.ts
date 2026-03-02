import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { IGene } from '@/types/Common.types';
import { IGeneList } from '@/types/Reports/GeneLists.types';
import { useCallback, useEffect, useState } from 'react';

export default function useMatchGenesToList(genes: IGene[]): () => string {
  const zeroDashSdk = useZeroDashSdk();

  const [matchingGeneListName, setMatchingGeneListName] = useState('');
  const [genesLists, setGenesLists] = useState<IGeneList[]>([]);

  useEffect(() => {
    async function fetchGeneLists(): Promise<void> {
      try {
        const lists = await zeroDashSdk.services.reports.getGeneLists({});
        setGenesLists(lists);
      } catch (err) {
        console.error(err);
      }
    }

    if (!genesLists.length) {
      fetchGeneLists();
    }
  }, [genesLists.length, zeroDashSdk.services.reports]);

  const getMatchingList = useCallback((): string => {
    const genesIds = genes.map((g) => g.geneId);
    // Get the selected gene list with highest gene count (in case users selects multiple lists)
    const highestMatchingList = genesLists
      .sort((a, b) => {
        if (a.genes && b.genes) {
          return b.genes.length - a.genes.length;
        }
        return 0; // this line is just for eslint, as script should never fall in here
      })
      .find((list) => list.genes?.every((g) => genesIds.includes(g.geneId)));

    // Case 1: there are existing matching lists and possibly isolated genes selected
    // e.g. 1 gene list + numerous isolated genes OR +1 gene lists
    if (highestMatchingList?.genes?.length) {
      setMatchingGeneListName(`${highestMatchingList.name} version ${highestMatchingList.version}${genes.length > highestMatchingList.genes.length ? `\u00A0+ ${genes.length - highestMatchingList.genes.length} more genes` : ''}`);
      return matchingGeneListName;
    }
    // Case 2: no existing matching lists; user only selected isolated genes
    if (genes.length > 4) {
      setMatchingGeneListName(
        `${genes
          .slice(0, 4)
          .map((g) => g.gene.toUpperCase())
          .join('; ')} + ${genes.length - 4} more`,
      );
    }
    if (genes.length <= 4) {
      setMatchingGeneListName(
        `${genes
          .map((g) => g.gene.toUpperCase())
          .join('; ')}`,
      );
    }

    return matchingGeneListName;
  }, [genes, genesLists, matchingGeneListName]);

  return getMatchingList;
}
