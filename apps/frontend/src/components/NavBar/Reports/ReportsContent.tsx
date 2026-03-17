import clsx from 'clsx';
import { useState, useEffect, type JSX } from 'react';
import { Box } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@mui/styles';
import { ReportPreview } from './ReportPreview';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import { useReport } from '../../../contexts/Reports/CurrentReportContext';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const useStyles = makeStyles(() => ({
  body: {
    overflow: 'hidden',
    maxHeight: 'calc(100vh - 80px)',
    position: 'relative',
    height: '100%',
    width: '100%',
    flexGrow: 1,
    background: '#FAFBFC',
    flexWrap: 'nowrap',
    margin: 0,
  },
  gridSection: {
    background: '#FAFAFC',
    borderRadius: '8px',
    padding: '16px !imontant',
    height: '100%',
  },
  reportWrapper: {
    height: '100%',
    width: '100%',
    borderRadius: '16px 16px 0 0',
    backgroundColor: '#F0F4F7',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  report: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  previewWrapper: {
    height: '100%',
    width: '100%',
    maxWidth: '800px',
    minWidth: '800px',
    backdropFilter: 'blur(4.5px)',
    boxShadow: '0px 3px 21px rgba(19, 81, 150, 0.21)',
    borderRadius: '8px',
  },
  filterScroll: {
    maxHeight: 'calc(100vh - 80px)',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  selectBoxContainer: {
    background: '#FFFFFF',
    marginBottom: 12,
    '& .MuiSelect-outlined.MuiSelect-outlined': {
      paddingLeft: '36px',
    },
  },
  page: {
    '& canvas': {
      boxShadow: '0px 3px 21px rgba(19, 81, 150, 0.21)',
      borderRadius: '8px',
    },
  },
  pageMargin: {
    '& canvas': {
      marginBottom: '32px',
    },
  },
}));

export default function ReportsContent(): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedReport, setSelectedReport, reportType } = useReport();

  const [reportData, setReportData] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);

  const handlePDFLoadError = (): void => {
    enqueueSnackbar('Could not load PDF file, please try again.', { variant: 'error' });
    // go to the report preview
    setSelectedReport(null);
  };

  useEffect(() => {
    async function getReportData(): Promise<void> {
      if (selectedReport?.fileId) {
        try {
          const data = await zeroDashSdk.filetracker.downloadFile(
            selectedReport.fileId,
          );
          setReportData(URL.createObjectURL(data));
        } catch {
          enqueueSnackbar('Could not load report, please try again.', { variant: 'error' });
        }
      } else {
        setReportData('');
      }
    }

    if (selectedReport && selectedReport.fileId) {
      getReportData();
    } else {
      setReportData(null);
    }
  }, [enqueueSnackbar, selectedReport, zeroDashSdk.filetracker]);

  if (!selectedReport || selectedReport.status === 'pending') {
    return (
      <Box className={classes.previewWrapper}>
        <ReportPreview
          reportType={reportType}
        />
      </Box>
    );
  } if (reportData) {
    return (
      <Document
        key={reportData}
        file={reportData}
        onLoadSuccess={({ numPages: loadedPages }): void => setNumPages(loadedPages)}
        onLoadError={handlePDFLoadError}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            className={clsx({
              [classes.page]: true,
              [classes.pageMargin]: index !== (numPages || 0) - 1,
            })}
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={800}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    );
  }

  return (
    <LoadingAnimation />
  );
}
