import { Box, styled, TabProps } from '@mui/material';
import {
  useEffect, useRef, useState, type JSX,
} from 'react';
import { useParams } from 'react-router-dom';
import LoadingAnimation from '@/components/Animations/LoadingAnimation';
import ArchiveAccordion from '@/components/Atlas/ArchiveAccordion';
import GeneListNotes from '@/components/Atlas/ListNotes';
import GeneGrid from '@/components/Atlas/ListTable';
import TableSearchAndFilter from '@/components/Atlas/TableSearchAndFilter';
import ViewPageHeader from '@/components/Atlas/ViewPageHeader';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { corePalette } from '@/themes/colours';
import {
  IGeneList, IGeneListGene, ReportableNoteTypes,
} from '@/types/Reports/GeneLists.types';
import { GenePanel } from '@/types/Samples/Sample.types';
import Pagination from '@/components/Common/DataGrid/Pagination';

export interface IGeneListArchive {
  id: string;
  version: string;
  note: string | null;
  genes: IGeneListGene[];
}

export type GeneContext = {
  listType: string;
};

const StickyHeader = styled(Box)({
  position: 'sticky',
  top: 0,
});

const MainContent = styled(ScrollableSection)({
  height: 'calc(100vh - 314px)',
  overflowY: 'auto',
  gap: '24px',
  backgroundColor: corePalette.grey10,
});

const SearchFilterWraper = styled(Box)({
  height: '64px',
  display: 'flex',
  alignItems: 'top',
  backgroundColor: corePalette.white,
});

const TableContent = styled(Box)({
  paddingLeft: '32px',
  paddingRight: '32px',
  flex: 1,
  backgroundColor: corePalette.white,
  maxHeight: '55vh',
});

const TableToolWrapper = styled(Box)({
  height: '64px',
  display: 'flex',
  justifyContent: 'right',
  alignItems: 'center',
  backgroundColor: corePalette.white,
});

export default function PanelListView(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { idName, type } = useParams();

  const [genePanel, setGenePanel] = useState<IGeneList[]>([]);
  const [genePanelTabs, setGenePanelTabs] = useState<TabProps[]>([]);
  const [archivedGenePanels, setArchivedGenePanels] = useState<IGeneList[]>([]);
  const [currentTabValue, setCurrentTabValue] = useState<number>(0);
  const [alphaTabValue, setAlphaTabValue] = useState<number | boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [genesInList, setGenesInList] = useState<IGeneListGene[]>([]);
  const [filteredGenes, setFilteredGenes] = useState<IGeneListGene[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [name, setName] = useState<string>('');
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [archiveOpen, setArchiveOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const tableRef = useRef<HTMLDivElement>(null);
  const scrollableTableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPanel = async (): Promise<void> => {
      try {
        const lists: IGeneList[] = [];
        if (type === 'gene-panel' && idName) {
          // get gene lists by panel
          lists.push(...(await zeroDashSdk.services.reports.getGeneLists({
            genePanel: idName as GenePanel,
            isActive: true,
          })));
        } else if (idName) {
          const list = await zeroDashSdk.services.reports.getGeneListById(idName);
          if (list) {
            lists.push(list);
          }
        }
        const sortedLists = lists.sort((a, b) => a.type.localeCompare(b.type));
        setGenePanel(sortedLists);
        const listName = sortedLists[0].titleAbbreviation ?? sortedLists[0].name;
        setName(listName);
        setGenePanelTabs(sortedLists.sort((a) => (a.type === 'somatic' ? -1 : 1)).map((item, index) => ({
          label: item.titleAbbreviation
            ? `${item.titleAbbreviation} ${item.type} v${item.version}`
            : `${item.name} v${item.version}`,
          value: index,
        })));
      } catch (err) {
        console.error('Failed to fetch', err);
      }
    };
    if (idName) fetchPanel();
  }, [idName, type, zeroDashSdk.services.reports]);

  useEffect(() => {
    const fetchGenes = async (): Promise<void> => {
      try {
        const { genes } = genePanel[currentTabValue];
        if (genes) {
          setGenesInList(genes);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch genes: ', err);
      }
    };

    const fetchArchive = async (): Promise<void> => {
      try {
        const resp = await zeroDashSdk.services.reports.getGeneLists({
          name: genePanel[currentTabValue]?.name,
          isActive: false,
          type: genePanel[currentTabValue]?.type,
          isHighRisk: genePanel[currentTabValue]?.isHighRisk,
        });
        setArchivedGenePanels(
          resp.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true })),
        );
      } catch (err) {
        console.error('Failed to fetch archives: ', err);
      }
    };

    if (genePanel[currentTabValue]?.id) {
      fetchGenes();
      fetchArchive();
    }
  }, [currentTabValue, genePanel, rowsPerPage, zeroDashSdk.services.reports]);

  useEffect(() => {
    let filtered = genesInList;

    if (alphaTabValue !== false) {
      const letter = String.fromCharCode(65 + Number(alphaTabValue));
      filtered = genesInList.filter((gene) => gene.gene.toUpperCase().startsWith(letter));
      setIsFiltering(true);
    } else {
      setIsFiltering(false);
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((gene) => gene.gene.toLowerCase().includes(query));
    }

    setFilteredGenes(filtered);
    setCurrentPage(0);
  }, [genesInList, alphaTabValue, searchQuery]);

  useEffect(() => {
    setCurrentPage(0);
    scrollableTableRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [rowsPerPage, currentTabValue]);

  useEffect(() => {
    setAlphaTabValue(false);
    setSearchQuery('');
    setArchiveOpen(false);
  }, [currentTabValue]);

  useEffect(() => {
    setSearchQuery('');
  }, [alphaTabValue]);

  const renderScrollableSection = (): JSX.Element => {
    if (filteredGenes.length === 0) {
      return (
        <Box sx={{ paddingTop: '2vh', paddingLeft: '1vh' }}>
          No genes found.
        </Box>
      );
    }

    const isPanel = type === 'gene-panel';
    const listType = isPanel ? genePanel[currentTabValue]?.type : '';
    const listId = isPanel ? genePanel[currentTabValue]?.id : idName;
    return listId ? (
      <GeneGrid
        genes={filteredGenes}
        listType={listType}
        rowsPerPage={rowsPerPage}
        currentPage={currentPage}
        searchQuery={searchQuery}
        filteredLetter={String.fromCharCode(65 + Number(alphaTabValue))}
        isFiltering={isFiltering}
        numGenes={filteredGenes.length}
      />
    ) : <div />;
  };

  return (
    <>
      <StickyHeader>
        <ViewPageHeader
          name={name}
          geneTabNames={genePanelTabs}
          currentTabValue={currentTabValue}
          setCurrentTabValue={setCurrentTabValue}
          setIsLoading={setIsLoading}
          type={type}
        />
      </StickyHeader>
      {typeof currentTabValue === 'number' ? (
        <MainContent>
          <SearchFilterWraper>
            <TableSearchAndFilter
              name={name}
              panelOrList={type}
              alphaTabValue={alphaTabValue}
              setAlphaTabValue={setAlphaTabValue}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              numGenes={filteredGenes.length}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              genes={genesInList}
            />
          </SearchFilterWraper>

          {isLoading ? (
            <Box sx={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', height: '55vh',
            }}
            >
              <LoadingAnimation />
            </Box>
          ) : (
            <TableContent ref={tableRef}>
              <ScrollableSection
                scrollableNodeProps={{ ref: scrollableTableRef }}
                style={{
                  maxHeight: '55vh',
                  width: '100%',
                }}
              >
                {renderScrollableSection()}
              </ScrollableSection>
            </TableContent>
          )}
          <TableToolWrapper>
            {filteredGenes.length !== 0 && (
            <Pagination
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={setRowsPerPage}
              currentPage={currentPage}
              onCurrentPageChange={setCurrentPage}
              totalResults={genesInList.length}
            />
            )}
          </TableToolWrapper>
          <Box sx={{ padding: '2vh' }}>
            <ArchiveAccordion
              archivedLists={archivedGenePanels}
              name={name}
              listType={type === 'gene-panel' ? genePanel[currentTabValue]?.type : ''}
              archiveOpen={archiveOpen}
              setArchiveOpen={setArchiveOpen}
            />
          </Box>
        </MainContent>
      ) : (
        <GeneListNotes
          key={`${idName}-${currentTabValue}-tab-content`}
          genePanel={idName as GenePanel}
          type={currentTabValue as ReportableNoteTypes}
        />
      )}
    </>
  );
}
