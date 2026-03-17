import CustomTypography from '@/components/Common/Typography';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { ITPMData } from '@/types/RNAseq.types';
import {
  Box, Dialog, FormControlLabel,
  Switch,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import { useEffect, useState, type JSX } from 'react';
import { ItemSelectLayout } from '../../../layouts/FullScreenLayout/ItemSelectLayout';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import ZoomPanImageContainer from '../../ZoomPanImage/ZoomPanImageContainer';
import ExpressionViewer from '../ExpressionViewer';
import { TPMDiseaseSelection } from './TPMDiseaseSelection';
import { TPMPlotNavBar } from './TPMPlotNavBar';

const useStyles = makeStyles(() => ({
  content: {
    alignItems: 'center',
  },
  mode: {
    alignItems: 'center',
    minWidth: '100%',
    backgroundColor: '#FFFFFF',
  },
}));

interface IProps {
  geneName: string;
  geneId: number;
  handleClose: () => void;
  initialImageUrl?: string;
  handleSave: (file: File) => Promise<void>;
}

export function TPMPlotDialog({
  geneName,
  geneId,
  handleClose,
  initialImageUrl,
  handleSave,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { analysisSet, rnaBiosample } = useAnalysisSet();

  const [url, setUrl] = useState<string | undefined>(initialImageUrl);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInteractive, setIsInteractive] = useState<boolean>(false);
  const [plotData, setPlotData] = useState<ITPMData[]>([]);
  const [showCategory, setShowCategory] = useState<boolean>(false);
  const [selectedSubcat2, setSelectedSubcat2] = useState<string | undefined>(
    analysisSet.zero2Subcategory2,
  );
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    analysisSet.zero2Category,
  );

  useEffect(() => {
    async function getTPMData(): Promise<void> {
      setLoading(true);
      if (rnaBiosample?.biosampleId) {
        try {
          const resp = await zeroDashSdk.rna.getRNASeqGeneTPM(
            rnaBiosample?.biosampleId,
            geneId,
          );
          setPlotData(resp);
        } catch (err) {
          enqueueSnackbar('Could not load interactive plot', { variant: 'error' });
        } finally {
          setLoading(false);
        }
      }
    }
    getTPMData();
  }, [
    rnaBiosample?.biosampleId,
    enqueueSnackbar,
    geneId,
    zeroDashSdk.rna,
    selectedSubcat2,
    selectedCategory,
    showCategory,
  ]);

  return (
    <Dialog
      open
      fullScreen
      PaperProps={{
        sx: {
          width: '100vw',
          maxWidth: '100vw',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
        },
      }}
    >
      <ItemSelectLayout
        classNames={{
          mainContent: classes.content,
        }}
        navBar={(
          <TPMPlotNavBar geneName={geneName} handleClose={handleClose} />
        )}
        mainContent={(
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="flex-start"
            style={{
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            { isInteractive && plotData.length > 0 && rnaBiosample?.biosampleId && !loading && (
              <ExpressionViewer
                data={plotData}
                rnaSeqId={rnaBiosample?.biosampleId}
                gene={geneName}
                selectedSubcat2={selectedSubcat2}
                selectedCategory={selectedCategory}
                showCategory={showCategory}
              />
            )}
            { !isInteractive && (
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                width: '80vh',
                height: '80vh',
                minWidth: '650px',
                minHeight: '650px',
              }}
            >
              {url && !loading && (
                <ZoomPanImageContainer url={url} title={geneName} />
              )}
              {(loading && (
                <LoadingAnimation />
              ))}
            </Box>
            )}
          </Box>
        )}
        leftPaneNodes={(
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="flex-start"
            align-content="flex-start"
            gap="16px"
            paddingTop="16px"
          >
            <TPMDiseaseSelection
              geneName={geneName}
              title={(
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                  gap="16px"
                >
                  <CustomTypography variant="h5">
                    {geneName}
                  </CustomTypography>
                  <FormControlLabel
                    control={(
                      <Switch
                        onChange={(): void => setIsInteractive(!isInteractive)}
                        checked={isInteractive}
                      />
                    )}
                    label="Interactive mode"
                    labelPlacement="start"
                  />
                </Box>
              )}
              setUrl={setUrl}
              handleSave={handleSave}
              loading={loading}
              setLoading={setLoading}
              showCategory={showCategory}
              setShowCategory={setShowCategory}
              interactiveMode={isInteractive}
              selectedSubcat2={selectedSubcat2}
              setSelectedSubcat2={setSelectedSubcat2}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </Box>
        )}
      />
    </Dialog>
  );
}
