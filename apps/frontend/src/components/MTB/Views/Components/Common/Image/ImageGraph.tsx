import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { ISlideAttachment } from '../../../../../../types/MTB/MTB.types';
import CustomTypography from '../../../../../Common/Typography';
import ImageCard from './ImageCard';

const useStyle = makeStyles(() => ({
  root: {
    borderRadius: '8px',
    gap: '8px',
    background: '#FFFFFF',
    boxSizing: 'border-box',
  },
  bottomText: {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  },
  title: {
    fontWeight: 700,
    color: '#022034',
  },
  caption: {
    color: '#62728C',
  },
}));

interface IProps {
  file: ISlideAttachment;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Actions?: (props: {
    file: ISlideAttachment,
    condensed?: boolean,
    setCondensed?: Dispatch<SetStateAction<boolean>>,
  }) => JSX.Element;
}

export default function ImageGraph({
  file,
  Actions,
}: IProps): JSX.Element {
  const classes = useStyle();

  const [condensed, setCondensed] = useState<boolean>(file.isCondensed || false);

  return (
    <Box
      className={classes.root}
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      sx={{
        padding: condensed ? '0px' : '8px',
        border: condensed ? 'none' : '1px solid #ECF0F3',
      }}
    >
      <ImageCard
        file={file}
        actions={
          Actions
            ? (
              <Actions
                file={file}
                condensed={condensed}
                setCondensed={setCondensed}
              />
            ) : undefined
        }
      />

      {!condensed && (
        <Box
          display="flex"
          flexDirection="column"
          width="100%"
        >
          <Box width="100%">
            {file.title && (
            <CustomTypography
              className={clsx(classes.title, classes.bottomText)}
              variant="bodySmall"
            >
              {file.title}
            </CustomTypography>
            )}
          </Box>
          <Box width="100%" display="flex" justifyContent="flex-end" textAlign="right">
            {file.caption && (
              <CustomTypography
                className={clsx(classes.caption, classes.bottomText)}
                variant="bodySmall"
              >
                {file.caption}
              </CustomTypography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
