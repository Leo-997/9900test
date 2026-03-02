import React, { Dispatch, SetStateAction, useState, type JSX } from 'react';

import {
    Checkbox,
    Divider,
    Grid,
    styled,
} from '@mui/material';

import dayjs from 'dayjs';
import { IDataFile } from '../../../types/FileTracker/FileTracker.types';
import CustomTypography from '../../Common/Typography';

const Item = styled(Grid)(() => ({
  verticalAlign: 'top',
  padding: '8px',
  width: '150px',
  minWidth: '150px',
}));

const Paper = styled(Grid)(() => ({
  margin: 0,
  borderRadius: 0,
  border: 'none',
  background: 'auto',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  minWidth: '100%',
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

interface IProps {
  data: IDataFile;
  secondary?: boolean;
  setSelectedFiles: Dispatch<SetStateAction<string[]>>;
}

export function FileTrackerSubListItem({
  data,
  secondary = false,
  setSelectedFiles,
}: IProps): JSX.Element {
  const {
    fileId,
    fileName,
    fileType,
    fileSize,
    updatedAt,
  } = data;

  const [checked, setChecked] = useState<boolean>(false);

  const handleChecked = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.checked) {
      setSelectedFiles((prev: string[]) => [...prev, fileId]);
    } else {
      setSelectedFiles((prev: string[]) => prev.filter((id: string) => id !== fileId));
    }
    setChecked(!checked);
  };

  return (
    <>
      <Divider style={{ width: '95%', height: '1px', marginLeft: '5%' }} />
      <Paper>
        <StickySection>
          <Grid container height="100%" gap="8px" alignItems="center">
            <Grid size={secondary ? 1 : 2} />
            {secondary && (
              <Grid flex={1} container justifyContent="center">
                <Checkbox
                  checked={checked}
                  onChange={handleChecked}
                />
              </Grid>
            )}
            <Grid flex={10} direction="column" container>
              <CustomTypography
                variant="bodyRegular"
                fontWeight="bold"
                truncate
              >
                {fileName}
              </CustomTypography>
            </Grid>
          </Grid>
        </StickySection>
        <Item />
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
            {updatedAt ? dayjs(updatedAt).fromNow() : 'Unknown'}
          </CustomTypography>
        </Item>
      </Paper>
    </>
  );
}
