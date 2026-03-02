import React, { Dispatch, SetStateAction, useState, type JSX } from 'react';

import {
    Checkbox,
    Grid,
    Paper as MuiPaper,
    styled,
} from '@mui/material';

import CustomChip from '@/components/Common/Chip';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import dayjs from 'dayjs';
import { IDataFile } from '../../../types/FileTracker/FileTracker.types';
import CustomTypography from '../../Common/Typography';
import { FileTrackerSubListItem } from './FileTrackerSubListItem';
import PlatformChip from './PlatformChip';

const Paper = styled(MuiPaper)(() => ({
  margin: 0,
  borderRadius: 0,
  border: 'none',
  background: 'auto',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  minWidth: '100%',
  height: '75px',
}));

const StickySection = styled(Grid)(({ theme }) => ({
  position: 'sticky',
  left: '0px',
  paddingLeft: '8px',
  zIndex: 1,
  backgroundColor: theme.colours.core.white,
  flexShrink: 0,
  paddingRight: '8px',
  width: '45%',
  minWidth: '700px',
}));

const Item = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  verticalAlign: 'top',
  padding: '8px',
  width: '150px',
  minWidth: '150px',
}));

interface IProps {
  data: IDataFile;
  selectedFiles: string[];
  setSelectedFiles: Dispatch<SetStateAction<string[]>>;
}

export function FileTrackerListItem({
  data,
  selectedFiles,
  setSelectedFiles,
}: IProps): JSX.Element {
  const {
    fileId,
    patientId,
    sampleId,
    refGenome,
    fileName,
    fileType,
    fileSize,
    platform,
    collections,
    secondaryFiles,
    updatedAt,
  } = data;

  const [checked, setChecked] = useState<boolean>(selectedFiles.includes(fileId));
  const [open, setOpen] = useState<boolean>(false);

  const canDownload = useIsUserAuthorised('file.download');

  const handleChecked = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.checked) {
      setSelectedFiles((prev: string[]) => [...prev, data.fileId]);
    } else {
      setSelectedFiles((prev: string[]) => prev.filter((id: string) => id !== fileId));
    }
    setChecked(!checked);
  };

  return (
    <Grid container justifyContent="flex-start" alignItems="center" direction="column">
      <Paper elevation={0}>
        <StickySection>
          <Grid container height="100%" gap="8px" alignItems="center">
            <Grid flex={1} container justifyContent="center">
              {(platform !== 'ncimdss' && canDownload) && (
                <Checkbox
                  checked={checked}
                  onChange={handleChecked}
                />
              )}
            </Grid>
            <Grid flex={6} direction="column" container>
              <CustomTypography
                variant="bodyRegular"
                fontWeight="bold"
                truncate
                onClick={(): void => setOpen(!open)}
                sx={{
                  cursor: secondaryFiles?.length || collections?.length
                    ? 'pointer'
                    : 'default',
                }}
              >
                {fileName}
              </CustomTypography>
              <Grid style={{ marginRight: 'auto', marginTop: '5px' }}>
                <Grid container justifyContent="flex-start" alignItems="center" direction="row">
                  <Grid style={{ marginRight: platform ? '5px' : '0px' }}>
                    {platform && (
                      <PlatformChip platform={platform} />
                    )}
                  </Grid>
                  <Grid>
                    {collections && collections?.length > 0 && (
                      <CustomChip
                        colour={corePalette.grey200}
                        backgroundColour={corePalette.grey30}
                        label="COLLECTION"
                      />
                    )}
                    {secondaryFiles && secondaryFiles?.length > 0 && (
                      <CustomChip
                        colour={corePalette.grey200}
                        backgroundColour={corePalette.grey30}
                        label="SECONDARY FILES"
                      />
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid flex={5} direction="column" container>
              <CustomTypography variant="bodyRegular" fontWeight="bold">
                {sampleId || '-'}
              </CustomTypography>
              <CustomTypography display="inline">
                Patient Id:
                {' '}
                {patientId}
              </CustomTypography>
            </Grid>
          </Grid>
        </StickySection>
        <Item>
          <CustomTypography variant="bodyRegular">
            {refGenome || '-'}
          </CustomTypography>
        </Item>
        <Item>
          <CustomTypography variant="bodyRegular">
            {fileType}
          </CustomTypography>
        </Item>
        <Item>
          <CustomTypography variant="bodyRegular">
            {fileSize}
          </CustomTypography>
        </Item>
        <Item>
          <CustomTypography variant="bodyRegular">
            {dayjs(updatedAt).fromNow()}
          </CustomTypography>
        </Item>
      </Paper>
      <Grid
        container
        justifyContent="flex-start"
        alignItems="center"
      >
        {open && collections?.map((c) => (
          <FileTrackerSubListItem
            key={c.fileId}
            data={c}
            setSelectedFiles={setSelectedFiles}
          />
        ))}
        {open && secondaryFiles?.map((s) => (
          <FileTrackerSubListItem
            key={s.fileId}
            data={s}
            secondary
            setSelectedFiles={setSelectedFiles}
          />
        ))}
      </Grid>
    </Grid>
  );
}
