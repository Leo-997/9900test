import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import {
  Box, IconButton,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { ChevronRight, CircleArrowDown } from 'lucide-react';
import { useEffect, useState, type JSX } from 'react';
import { useReport } from '../../../../contexts/Reports/CurrentReportContext';
import { useZeroDashSdk } from '../../../../contexts/ZeroDashSdkContext';
import { IDataFile } from '../../../../types/FileTracker/FileTracker.types';
import { IReport } from '../../../../types/Reports/Reports.types';
import SubItemButton from '../../../Buttons/SubItemButton';

const useStyles = makeStyles(() => ({
  rightIcon: {
    textAlign: 'center',
    color: 'inherit',
    height: '12px',
    width: '8px',
    marginRight: '16px',

    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& path': {
      strokeWidth: 2,
    },
  },
  downloadBtn: {
    width: '32px',
    height: '32px',
  },
}));

interface IProps {
  report: IReport;
  version: number;
}

export default function GeneratedReportButton({
  report,
  version,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const {
    selectedReport,
    setSelectedReport,
    demographics,
    downloadReport,
    isGeneratingReport,
  } = useReport();

  const [reportFile, setReportFile] = useState<IDataFile>();

  const canDownload = useIsUserAuthorised('report.download');

  useEffect(() => {
    if (report.fileId) {
      zeroDashSdk.filetracker.getFile(report.fileId)
        .then((resp) => setReportFile(resp));
    }
  }, [report.fileId, zeroDashSdk.filetracker]);

  return (
    <Box
      marginTop="8px"
      display="flex"
      gap="8px"
      alignItems="center"
      justifyContent="space-between"
    >
      <SubItemButton
        mainText={`Version ${version}`}
        subText={`${dayjs(report.approvedAt).format('DD/MM/YYYY')}`}
        handleClick={(): void => setSelectedReport(report)}
        isActive={selectedReport?.id === report.id}
        endIcon={<ChevronRight />}
        disabled={reportFile?.fileType !== 'pdf' || Boolean(isGeneratingReport)}
        tooltipText={
          reportFile?.fileType !== 'pdf'
            ? `This file cannot be previewed as it is a ${reportFile?.fileType} file. Please use 'Preview Mode' to see the report, or download it directly.`
            : undefined
        }
      />
      {canDownload && (
        <IconButton
          className={classes.downloadBtn}
          onClick={(): Promise<void> => downloadReport(report)}
          disabled={!demographics?.firstName || !demographics?.lastName}
          color="primary"
        >
          <Tooltip
            title="Download report"
          >
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
            >
              <CircleArrowDown />
            </Box>
          </Tooltip>
        </IconButton>
      )}
    </Box>
  );
}
