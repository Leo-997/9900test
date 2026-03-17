import { Box, styled } from '@mui/material';
import { PlusIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import {
  useCallback, useEffect, useState, type JSX,
} from 'react';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '../../../contexts/CurationContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { LinxPlot } from '../../../types/Plot.types';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import CustomButton from '../../Common/Button';
import CustomTypography from '../../Common/Typography';
import { ScrollableSection } from '../../ScrollableSection/ScrollableSection';
import SearchBar from '../../Search/SearchBar';
import LinxList from './LinxList';

const Wrapper = styled(Box)(() => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  width: '100%',
  marginBottom: '14px',
  borderRadius: '0px 4px 4px 4px',
  boxSizing: 'border-box',
  alignItems: 'center',
  gap: '16px',
}));

const SearchBarStyled = styled(SearchBar)(({ theme }) => ({
  ...theme.typography.body2,
  position: 'relative',
  borderRadius: '4px',
  boxSizing: 'border-box',
  boxShadow: 'none',
  width: '100% !important',
  marginBottom: '10px !important',
}));

const AddBtnBox = styled(Box)(() => ({
  marginBottom: '20px',
  width: '100%',
  maxWidth: '600px',
}));

interface ILinxContentProps {
  refetch: boolean;
  plots: LinxPlot[];
  setRefetch: (state: boolean) => void;
  setPlots: (state: LinxPlot[]) => void;
  setCurrentPlot: (plot: string) => void;
  setNewPlotModal: (open: boolean) => void;
}

function LinxContent({
  refetch,
  plots,
  setRefetch,
  setPlots,
  setCurrentPlot,
  setNewPlotModal,
}: ILinxContentProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { isAssignedCurator, isReadOnly } = useCuration();
  const { enqueueSnackbar } = useSnackbar();
  const { primaryBiosample } = useAnalysisSet();

  const [allPlots, setAllPlots] = useState<LinxPlot[]>([]);

  const canGenerate = useIsUserAuthorised('curation.sample.download', isAssignedCurator) && !isReadOnly;

  const filterPlots = (query: string): void => {
    const lowerCaseQuery = query.toLowerCase();
    const newPlots = allPlots.filter((d) => d.sampleId.toLowerCase().includes(lowerCaseQuery)
      || d.chr?.toLowerCase().includes(lowerCaseQuery)
      || d.genes?.some((g) => g.toLowerCase().includes(lowerCaseQuery)));
    setPlots(newPlots);
  };

  const getLinxPlots = useCallback(async () => {
    if (primaryBiosample?.biosampleId) {
      const resp = await zeroDashSdk.plots.getLinxPlots(
        primaryBiosample.biosampleId,
      );
      setPlots(resp);
      setAllPlots(resp);
    }
  }, [zeroDashSdk.plots, primaryBiosample?.biosampleId, setPlots]);

  const deleteLinxPlot = async (plot: LinxPlot): Promise<void> => {
    if (primaryBiosample?.biosampleId) {
      try {
        await zeroDashSdk.plots.deleteLinxPlot(primaryBiosample.biosampleId, plot.fileId);
        getLinxPlots();
      } catch (err) {
        console.error(err);
        enqueueSnackbar('There was an issue while deleting this item, please try again later', { variant: 'error' });
      }
    }
  };

  useEffect(() => {
    if (refetch) {
      getLinxPlots().then(() => setRefetch(false));
    }
  }, [getLinxPlots, refetch, setRefetch]);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Wrapper>
        <SearchBarStyled
          searchMethod={filterPlots}
          searchOnChange
          ignoreStyles
          placeholder="Search on sample ID, chromosome, or gene"
        />
        <Box
          display="flex"
          flexDirection="column"
          width="100%"
          flex={1}
          height="calc(100% - 100px)"
          alignItems="flex-start"
        >
          {plots.length > 0 && !refetch ? (
            <ScrollableSection style={{ height: '100%', maxHeight: 'calc(100vh - 303px)', width: '100%' }}>
              <LinxList
                plots={plots}
                setCurrentPlot={setCurrentPlot}
                handleDeletePlot={deleteLinxPlot}
              />
            </ScrollableSection>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              width="100%"
            >
              {refetch
                ? (
                  <LoadingAnimation />
                ) : (
                  <CustomTypography variant="bodyRegular" style={{ color: '#8292A6', textAlign: 'center' }}>
                    No plots found for this sample.
                    <br />
                    Generate a new plot below.
                  </CustomTypography>
                )}
            </Box>
          )}
        </Box>
      </Wrapper>

      {canGenerate && (
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
        >
          <AddBtnBox>
            <CustomButton
              variant="outline"
              label="Generate new plot"
              startIcon={<PlusIcon />}
              onClick={(): void => setNewPlotModal(true)}
              style={{ width: '100%' }}
            />
          </AddBtnBox>
        </Box>
      )}
    </Box>
  );
}

export default LinxContent;
