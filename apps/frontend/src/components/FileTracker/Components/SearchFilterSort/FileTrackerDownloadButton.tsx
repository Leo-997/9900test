import {
    Box,
    Divider,
    Grid,
    IconButton,
    Menu,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import copy from 'copy-to-clipboard';
import { ArrowDownCircleIcon, ChevronDownIcon, CopyIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useState, type JSX } from 'react';
import { useZeroDashSdk } from '../../../../contexts/ZeroDashSdkContext';
import { IDownloadURL } from '../../../../types/FileTracker/FileTracker.types';
import LoadingAnimation from '../../../Animations/LoadingAnimation';
import CustomButton from '../../../Common/Button';
import CustomTypography from '../../../Common/Typography';
import { ScrollableSection } from '../../../ScrollableSection/ScrollableSection';

const useStyles = makeStyles(() => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '45px',
  },
  exportIcon: {
    width: '24px',
    height: '24px',
  },
  exportLabel: {
    marginLeft: '10px',
  },
  icon: {
    width: '24px',
    height: '24px',
  },
  containerGrid: {
    width: 500,
  },
  content: {
    width: '100%',
    height: '100%',
    minHeight: '150px',
    padding: '15px',
  },
  scrollWrapper: {
    width: '100%',
    maxHeight: '300px',
  },
  item: {
    padding: '4px 15px',
  },
  btnMargin: {
    margin: '0 8px 15px 8px',
  },
}));

interface IProps {
  selectedFiles: string[];
}

export default function DownloadButton({
  selectedFiles,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [urls, setUrls] = useState<IDownloadURL[]>([]);

  const generateURLs = async (): Promise<void> => {
    if (selectedFiles.length > 0) {
      const resp = await zeroDashSdk.filetracker.generateDownloadURLs(selectedFiles);
      setUrls(resp);
    }
  };

  const copyURL = (url: string): void => {
    copy(url);
    enqueueSnackbar('Copied to clipboard', { variant: 'success' });
  };

  const exportAsTXT = (): void => {
    const element = document.createElement('a');
    const file = new Blob([urls.map((f) => f.url).join('\n')], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'urls.txt';
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div className={classes.wrapper}>
      <CustomButton
        variant="text"
        label="Get URLs"
        startIcon={(<ArrowDownCircleIcon />)}
        endIcon={(<ChevronDownIcon />)}
        disabled={selectedFiles.length === 0}
        onClick={(e): void => {
          generateURLs();
          setAnchorEl(e.currentTarget);
        }}
        size="small"
      />
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        keepMounted
        MenuListProps={{ disablePadding: true }}
        open={Boolean(anchorEl)}
        onClose={(): void => setAnchorEl(null)}
      >
        <Grid container direction="column" className={classes.containerGrid}>
          <Grid className={classes.content}>
            {urls.length > 0 ? (
              <ScrollableSection className={classes.scrollWrapper}>
                {urls.map((file) => (
                  <>
                    <Grid
                      container
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="center"
                      className={classes.item}
                      key={file.fileId}
                    >
                      <Grid style={{ width: '390px' }}>
                        <CustomTypography variant="bodyRegular" fontWeight="bold" truncate>
                          {file.fileName}
                        </CustomTypography>
                      </Grid>
                      <Grid style={{ marginLeft: 'auto' }}>
                        <IconButton
                          onClick={(): void => copyURL(file.url)}
                        >
                          <CopyIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                    <Divider style={{ width: '98%', height: '1px' }} />
                  </>
                ))}
              </ScrollableSection>
            ) : (
              <div style={{
                width: '100%', height: '100%', minHeight: '50px', marginTop: '100px',
              }}
              >
                <LoadingAnimation />
              </div>
            )}
          </Grid>
          <Grid padding="16px">
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              flexDirection="row"
              gap="16px"
            >
              <CustomButton
                variant="bold"
                size="small"
                label="Copy all"
                className={classes.btnMargin}
                onClick={(): boolean => copy(urls.map((file) => file.url).join('\n'))}
              />
              <CustomButton
                variant="bold"
                size="small"
                label="Download as TXT"
                className={classes.btnMargin}
                style={{ marginRight: '16px' }}
                onClick={exportAsTXT}
              />
            </Box>
          </Grid>
        </Grid>
      </Menu>
    </div>
  );
}
