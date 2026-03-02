import CustomOutlinedInput from '@/components/Common/Input';
import { Grid } from '@mui/material';
import { IUrlResourceInput } from '../../../../types/Evidence/EvidenceInput.types';

import type { JSX } from "react";

type AddUrlProps = {
  data: IUrlResourceInput;
  onChangeData: (data: IUrlResourceInput) => void;
};

function AddUrl({ data, onChangeData }: AddUrlProps): JSX.Element {
  const handleOnChangevalues = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ): void => {
    const { name, value } = event.target;
    onChangeData({ ...data, [name]: value });
  };

  return (
    <Grid container spacing={2} width="100%">
      <Grid size={6}>
        <CustomOutlinedInput
          label="CUSTOM RESOURCE TITLE"
          name="name"
          value={data.name ? data.name : ''}
          error={!!data.errors?.name}
          onChange={handleOnChangevalues}
          errorMessage={data.errors?.name}
        />
      </Grid>
      <Grid size={6}>
        <CustomOutlinedInput
          label="URL / EMBED LINK"
          name="url"
          value={data.url ? data.url : ''}
          error={!!data.errors?.url}
          onChange={handleOnChangevalues}
          errorMessage={data.errors?.url}
        />
      </Grid>
    </Grid>
  );
}

export default AddUrl;
