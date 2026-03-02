import { useState, type JSX } from 'react';
import {
  Box, FilledInput, Link,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@mui/styles';
import { ArrowUpRightIcon } from 'lucide-react';
import { corePalette } from '@/themes/colours';
import CustomTypography from '../../../Common/Typography';
import CustomButton from '../../../Common/Button';
import { IResourceWithEvidence } from '../../../../types/Evidence/Evidences.types';
import { useZeroDashSdk } from '../../../../contexts/ZeroDashSdkContext';

const useStyles = makeStyles(() => ({
  link: {
    display: 'flex',
    flexDirection: 'row',
    color: corePalette.green100,
    textDecoration: 'underline',
    '&:hover': {
      color: corePalette.green100,
    },
    '&:visited': {
      color: corePalette.green100,
    },
  },
  input: {
    backgroundColor: 'rgba(243, 245, 247, 0.5)',
    minHeight: 0,
    borderRadius: '4px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& input': {
      paddingTop: '12px',
    },
  },
}));

interface IProps {
  resource: IResourceWithEvidence;
  onUpdate?: (newResource: IResourceWithEvidence) => void;
  isEditing?: boolean;
  setIsEditing?: (value: boolean) => void;
}

export default function LibraryResourceTitle({
  resource,
  onUpdate,
  isEditing = false,
  setIsEditing,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const [name, setName] = useState<string>(resource.name);

  const handleUpdateResource = async (): Promise<void> => {
    try {
      await zeroDashSdk.services.evidence.updateResource(resource.id, { name });
      if (onUpdate) onUpdate({ ...resource, name });
      if (setIsEditing) setIsEditing(false);
    } catch (error) {
      enqueueSnackbar('Could not update resource, please try again', { variant: 'error' });
    }
  };

  const handlePressEnter = (event): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (name) {
        handleUpdateResource();
      }
    }
  };

  const titleText = isEditing
    ? (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-end"
        position="relative"
      >
        <FilledInput
          fullWidth
          disableUnderline
          onChange={(e): void => setName(e.target.value)}
          onKeyPress={handlePressEnter}
          value={name}
          classes={{
            root: classes.input,
          }}
        />
        <Box
          display="flex"
          position="absolute"
          right="0"
          top="100%"
          gap="4px"
          paddingTop="4px"
        >
          <CustomButton
            variant="subtle"
            size="small"
            label="Cancel"
            onClick={(): void => {
              if (setIsEditing) setIsEditing(false);
              setName(resource.name);
            }}
          />
          <CustomButton
            variant="text"
            size="small"
            label="Save Changes"
            title="Edit"
            disabled={!name}
            onClick={handleUpdateResource}
          />
        </Box>
      </Box>
    ) : (
      <CustomTypography variant="bodyRegular">
        {name}
      </CustomTypography>
    );

  return resource.fileId || isEditing
    ? (
      titleText
    ) : (
      <Link
        href={resource.url?.includes('http') ? resource.url : `http://${resource.url}`}
        className={classes.link}
        rel="noopener noreferrer"
        target="_blank"
      >
        {titleText}
        <ArrowUpRightIcon />
      </Link>
    );
}
