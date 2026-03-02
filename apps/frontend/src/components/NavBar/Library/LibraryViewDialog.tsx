import {
  Box, Button,
  darken,
  IconButton,
  styled,
} from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { makeStyles } from '@mui/styles';
import { Maximize2Icon, Minimize2Icon, XIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useEffect, useState, type JSX } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { IResourceWithMeta } from '../../../types/Evidence/Resources.types';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import CustomTypography from '../../Common/Typography';
import { ScrollableSection } from '../../ScrollableSection/ScrollableSection';
import ZoomControllers from '../../ZoomPanImage/ZoomControllers';
import ZoomPanImageContainer from '../../ZoomPanImage/ZoomPanImageContainer';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const BreadcrumButton = styled(Button)(() => ({
  padding: '16px',
  textTransform: 'none',
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: darken('#FFFFFF', 0.1),
  },
  '&:focus': {
    backgroundColor: darken('#FFFFFF', 0.1),
    outline: 'none',
  },
}));

interface ILibraryViewDialogProps {
  closeLibrary: () => void;
  closeResourceView: () => void;
  isResourceExpanded: boolean;
  openResourceModal: () => void;
  resource: IResourceWithMeta;
}

const useStyles = makeStyles(() => ({
  expandIcon: {
    marginLeft: 'auto',
    display: 'inline',
    top: 10,
  },
  closeIconExpand: {
    marginLeft: 'auto',
    display: 'inline',
    top: 10,
    marginRight: '25px',
  },
  title: {
    maxWidth: '60%',
    marginLeft: '25px',
    marginTop: '20px',
  },
  fileName: {
    color: '#1E86FC',
    fontWeight: 700,
    marginLeft: 5,
  },
  pdfZoom: {
    right: 50,
    bottom: 200,
  },
}));

export default function LibraryViewDialog({
  resource,
  isResourceExpanded,
  openResourceModal,
  closeResourceView,
  closeLibrary,
}: ILibraryViewDialogProps): JSX.Element {
  const classes = useStyles();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(1);
  const [fileUrl, setFileUrl] = useState<string>('');

  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();

  const onDocumentLoadSuccess = (pages: number): void => {
    setNumPages(pages);
  };

  const zoomInPdf = (): void => {
    setScale(scale + 0.1);
  };

  const zoomOutPdf = (): void => {
    setScale(scale - 0.1);
  };

  useEffect(() => {
    const getFileLink = async (): Promise<void> => {
      try {
        if (resource.fileId) {
          const url = await zeroDashSdk.filetracker.downloadFile(resource.fileId);
          setFileUrl(URL.createObjectURL(url));
        }
      } catch {
        enqueueSnackbar('Unable to load the file', { variant: 'error' });
      }
      setLoading(false);
    };
    getFileLink();
  }, [enqueueSnackbar, resource.fileId, zeroDashSdk.filetracker]);

  return (
    <>
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          width="100%"
        >
          <Box display="flex" alignItems="center" gap="4px" className={classes.title}>
            <BreadcrumButton
              onClick={(): void => closeResourceView()}
            >
              <CustomTypography variant="h6" fontWeight="bold">
                Library
              </CustomTypography>
            </BreadcrumButton>
            <CustomTypography truncate variant="h6" className={classes.fileName}>
              /
              &nbsp;
              {resource.name}
            </CustomTypography>
          </Box>
          <Box>
            {isResourceExpanded ? (
              <IconButton
                className={classes.expandIcon}
                onClick={closeLibrary}
              >
                <Minimize2Icon />
              </IconButton>
            ) : (
              <IconButton
                className={classes.expandIcon}
                onClick={openResourceModal}
              >
                <Maximize2Icon />
              </IconButton>
            )}
            <IconButton
              className={classes.closeIconExpand}
              onClick={(): void => {
                closeLibrary();
                closeResourceView();
              }}
            >
              <XIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent style={{ padding: 0, position: 'relative', height: '100%' }}>
        {resource.type === 'PDF' ? (
          <>
            {loading && <LoadingAnimation />}
            {fileUrl && (
              <>
                <ScrollableSection style={{ height: '100%' }}>
                  <Box display="flex" justifyContent="center">
                    <Document
                      key={fileUrl}
                      file={fileUrl}
                      onLoadSuccess={(pdf): void => onDocumentLoadSuccess(pdf.numPages)}
                      onLoadError={(): void => {
                        enqueueSnackbar('Unable to load the file', { variant: 'error' });
                      }}
                    >
                      {Array.from(new Array(numPages), (el, index) => (
                        <Page
                          key={`page_${index + 1}`}
                          pageNumber={index + 1}
                          scale={isResourceExpanded ? scale * 3 : scale}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      ))}
                    </Document>
                  </Box>
                </ScrollableSection>
                <ZoomControllers
                  scale={scale}
                  zoomIn={zoomInPdf}
                  zoomOut={zoomOutPdf}
                  className={classes.pdfZoom}
                />
              </>
            )}
          </>
        ) : (
          <>
            {loading && <LoadingAnimation />}
            {fileUrl && (
              <ZoomPanImageContainer url={fileUrl} title="Circos Plot" />
            )}
          </>
        )}
      </DialogContent>
    </>
  );
}
