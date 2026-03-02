import {
  Box,
  debounce,
  styled,
  Typography,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { SearchIcon } from 'lucide-react';
import { useEffect, useState, type JSX } from 'react';
import LoadingAnimation from '@/components/Animations/LoadingAnimation';
import GeneListCard from '@/components/Atlas/GeneListCard';
import GenePanelCard from '@/components/Atlas/GenePanelCard';
import TSOPanel from '@/components/Atlas/TSOPanel';
import CustomTypography from '@/components/Common/Typography';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';
import { baseGenePanels } from '@/constants/sample';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { corePalette } from '@/themes/colours';
import { IGeneList, IGeneListGene } from '@/types/Reports/GeneLists.types';

const Content = styled(ScrollableSection)({
  width: '100vw',
  height: 'calc(100vh - 129px)',
});

const HeaderWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
});

const HighRiskWrapper = styled('div')({
  display: 'flex',
  padding: '16px',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '20px',
  alignSelf: 'stretch',
  borderRadius: '8px',
  backgroundColor: corePalette.grey30,
});

const CardWrapper = styled('div')({
  display: 'flex',
  alignItems: 'stretch',
  gap: '24px',
  alignSelf: 'stretch',
  flexWrap: 'wrap',
});

const GeneGroupsWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '48px',
});

const PanelWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '20px',
  alignSelf: 'stretch',
  height: '100%',
});

export default function GeneDashboard(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();

  const [geneLists, setGeneLists] = useState<IGeneList[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGeneLists = async (): Promise<void> => {
      try {
        const res = await zeroDashSdk.services.reports.getGeneLists({});
        setGeneLists(res);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch tabs:', err);
      }
    };

    fetchGeneLists();
  }, [zeroDashSdk.services.reports]);

  const handleInputChange = debounce((e: React.ChangeEvent<HTMLInputElement>): void => {
    const query = e.target.value.trim()?.toLowerCase();
    setSearchQuery(query.trim());
  }, 350);

  const getMatchingGenes = (list: IGeneList): IGeneListGene[] => (
    (list.genes ?? []).filter(
      (g) => g.gene.toLowerCase().includes(searchQuery),
    )
  );

  // Name might be the full name or the abbreviation
  const doesListMatch = (list: IGeneList, name: string): boolean => (
    Boolean(
      getMatchingGenes(list)?.length
      || name.toLowerCase().includes(searchQuery),
    )
  );

  const escapeRegex = (input: string): string => {
    if (typeof input !== 'string' || !input) {
      return '';
    }
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightMatch = (
    listName: string,
    query: string,
  ): JSX.Element => {
    const escapedQuery = escapeRegex(query);
    const regex = new RegExp(`(${escapedQuery})`, 'i');
    const parts = listName.split(regex);
    // getKey generates a unique key for each substring of list name
    const getKey: (value: string) => string = ((): ((value: string) => string) => {
      const keyMap = new Map<string, number>();
      return (value: string): string => {
        const count = keyMap.get(value) || 0;
        keyMap.set(value, count + 1);
        return `${value}-${count}`;
      };
    })();

    return (
      <>
        {parts.map((part) => (
          <span
            key={getKey(part)}
            style={regex.test(part) ? { backgroundColor: corePalette.green10 } : {}}
          >
            {part}
          </span>
        ))}
      </>
    );
  };

  const highRiskLists = geneLists
    .filter((l) => l.isHighRisk && doesListMatch(l, l.name));
  const highRisk = highRiskLists.length ? (
    <HighRiskWrapper>
      <CustomTypography variant="titleRegular" fontWeight="medium">
        ZERO2 Core (High Risk) Gene Lists
      </CustomTypography>
      <CardWrapper>
        {geneLists
          .filter((l) => l.isHighRisk && doesListMatch(l, l.name))
          .map((list: IGeneList) => (
            <GeneListCard
              key={list.id}
              id={list.id}
              name={list.name}
              geneCount={list.geneCount}
              version={list.version}
              lastUpdated={list.updatedAt}
              highlightedName={searchQuery
                ? highlightMatch(
                  list.name,
                  searchQuery,
                ) : undefined}
              sx={{ height: 'unset' }}
              geneMatchCount={searchQuery ? getMatchingGenes(list).length : undefined}
            />
          ))}
        {!searchQuery && (
          <TSOPanel />
        )}
      </CardWrapper>
    </HighRiskWrapper>
  ) : <div />;

  const makePanel = (lists: IGeneList[]): JSX.Element => {
    const somaticList = lists.find((item) => item.type === 'somatic');
    const germlineList = lists.find((item) => item.type === 'germline');
    return (
      <GenePanelCard
        name={lists[0].genePanel || ''}
        abbreviation={lists[0].titleAbbreviation || ''}
        somaticObject={somaticList ? {
          list: somaticList,
          matchingGenesCount: searchQuery && somaticList
            ? getMatchingGenes(somaticList).length
            : undefined,
        } : undefined}
        germlineObject={germlineList ? {
          list: germlineList,
          matchingGenesCount: searchQuery && germlineList
            ? getMatchingGenes(germlineList).length
            : undefined,
        } : undefined}
        highlightedName={
          searchQuery
            ? highlightMatch(
              lists[0].titleAbbreviation,
              searchQuery,
            ) : undefined
        }
      />
    );
  };

  // render content to avoid nested ternaries and improve readability
  const renderContent = (): JSX.Element => {
    if (isLoading) {
      return (
        <Box sx={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh',
        }}
        >
          <LoadingAnimation />
        </Box>
      );
    }

    const matchingLists = geneLists.filter((l) => doesListMatch(l, l.titleAbbreviation ?? l.name));
    if (searchQuery && !matchingLists.length) {
      return (
        <PanelWrapper>
          <CustomTypography variant="h6" fontWeight={400} color={corePalette.offBlack100}>No genes or gene lists were found</CustomTypography>
        </PanelWrapper>
      );
    }

    return (
      <GeneGroupsWrapper>
        {highRisk}
        {matchingLists.some((l) => baseGenePanels.some((p) => p === l.genePanel)) && (
          <PanelWrapper>
            <CustomTypography variant="titleRegular" fontWeight="medium">ZERO2 Virtual Gene Panel</CustomTypography>
            <CardWrapper>
              {baseGenePanels.map((panel) => {
                const list = matchingLists.filter((l) => l.genePanel === panel);
                return list && list.length > 0 ? (
                  <div key={panel}>
                    {makePanel(list)}
                  </div>
                ) : null;
              })}
            </CardWrapper>
          </PanelWrapper>
        )}
        {matchingLists.some((l) => l.type === 'rna' && !l.genePanel) && (
          <PanelWrapper>
            <CustomTypography variant="titleRegular" fontWeight="medium">ZERO2 RNA Gene Lists</CustomTypography>
            <CardWrapper>
              {matchingLists.filter((list) => list.type === 'rna' && !list.genePanel).map((list) => (
                <GeneListCard
                  key={list.id}
                  id={list.id}
                  name={list.name}
                  geneCount={list.geneCount}
                  version={list.version}
                  lastUpdated={list.updatedAt}
                  highlightedName={searchQuery
                    ? highlightMatch(
                      list.name,
                      searchQuery,
                    ) : undefined}
                  geneMatchCount={searchQuery ? getMatchingGenes(list).length : undefined}
                />
              ))}
            </CardWrapper>
          </PanelWrapper>
        )}
        {matchingLists.some((l) => l.type === 'other' && !l.genePanel) && (
          <PanelWrapper>
            <CustomTypography variant="titleRegular" fontWeight="medium">Other Gene Lists</CustomTypography>
            <CardWrapper>
              {matchingLists?.filter((list) => list.type === 'other' && !list.genePanel).map((list) => (
                <GeneListCard
                  key={list.id}
                  id={list.id}
                  name={list.name}
                  geneCount={list.geneCount}
                  version={list.version}
                  lastUpdated={list.updatedAt}
                  highlightedName={searchQuery
                    ? highlightMatch(
                      list.name,
                      searchQuery,
                    ) : undefined}
                  geneMatchCount={searchQuery ? getMatchingGenes(list).length : undefined}
                />
              ))}
            </CardWrapper>
          </PanelWrapper>
        )}
      </GeneGroupsWrapper>
    );
  };

  return (
    <Content>
      <Box
        padding="32px"
        display="flex"
        flexDirection="column"
        gap="32px"
      >
        <HeaderWrapper>
          <Typography variant="h1" fontWeight={500}>
            ZeroDash Gene Lists
          </Typography>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            gap="32px"
            alignItems="center"
          >
            <TextField
              id="outlined-basic"
              placeholder="Search genes or gene lists"
              variant="outlined"
              size="small"
              onChange={handleInputChange}
              slotProps={{ input: { startAdornment: <SearchIcon /> } }}
              sx={{ width: '640px' }}
            />
            {/* <CustomButton
              label="Request update to a gene list"
            >
              Request update to a gene list
            </CustomButton> */}
          </Box>
        </HeaderWrapper>
        {renderContent()}
      </Box>
    </Content>
  );
}
