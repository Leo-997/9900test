import { CustomFileUpload } from '@/components/Common/FileUpload';
import CustomOutlinedInput from '@/components/Common/Input';
import { Grid } from '@mui/material';
import { IFileResourceInput } from '../../../../types/Evidence/EvidenceInput.types';

import type { JSX } from "react";

type AddFileProps = {
  data: IFileResourceInput;
  onChangeData: (data: IFileResourceInput) => void;
};

function AddFiles({
  data,
  onChangeData,
}: AddFileProps): JSX.Element {
  const handleOnChangeValues = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ): void => {
    const { name, value } = event.target;
    onChangeData({ ...data, [name]: value });
  };

  const setResourceFile = (
    acceptedFiles: File[],
  ): void => {
    if (acceptedFiles.length === 0) {
      return;
    }
    const file = acceptedFiles[0];
    onChangeData({ ...data, file });
  };

  return (
    <Grid container spacing={2} width="100%">
      <Grid size={6}>
        <CustomOutlinedInput
          label="RESOURCE TITLE"
          name="name"
          value={data.name ? data.name : ''}
          onChange={handleOnChangeValues}
          error={!!data.errors?.name}
          errorMessage={data.errors?.name}
        />
      </Grid>
      <Grid size={6}>
        <CustomFileUpload
          size="small"
          label="Upload file"
          onChange={setResourceFile}
          errorMessage={data.errors?.file}
          acceptedFileTypes={data.ui === 'PDF' ? {
            'application/pdf': [],
          } : {
            'image/*': [],
          }}
        />
      </Grid>
    </Grid>
  );
}

export default AddFiles;
