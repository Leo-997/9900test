import CustomOutlinedInput from '@/components/Common/Input';
import LabelledInputWrapper from '@/components/Common/LabelledInputWrapper';
import {
    Box,
    Grid,
    SelectChangeEvent,
    Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { InfoIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import axios from 'axios';
import { ISelectOption } from '@/types/misc.types';
import { isValidPMCID } from '@/utils/functions/pubmed/isValidPMCID';
import { isExternalCitationSource } from '@/utils/externalCitation/isExternalCitationSource';
import { CitationSource, IExternalCitation } from '../../../../types/Evidence/Citations.types';
import { ICitationInput } from '../../../../types/Evidence/EvidenceInput.types';
import CustomTypography from '../../../Common/Typography';
import SelectInput from '../../../Input/Select';

const useStyles = makeStyles(() => ({
  selectButton: {
    display: 'flex',
    flex: 1,
    height: 54,
    borderRadius: 4,
    marginRight: 16,
  },
  select: {
    paddingBottom: 0,
    paddingTop: 0,
    borderRadius: 8,
  },
  selectItem: {
    height: 44,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      background: '#F3F7FF',
    },
  },
  textField: {
    height: 54,
    width: '100%',
  },
  colHalf: {
    flex: 0.5,
    paddingRight: 16,
  },
  col1: {
    flex: 1,
    paddingRight: 16,
  },
  col2: {
    flex: 2,
    paddingRight: 16,
  },
  row: {
    marginBottom: 20,
  },
  pubmedMessage: {
    width: 'fit-content',
    padding: '8px 8px 8px 0px',
  },
  dateSelectContainer: {
    width: '100px',
    paddingRight: 16,
  },
  input: {
    height: '38px',
  },
  datePickerPopover: {
    zIndex: 1,
    top: '85px !important',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0px 10px 24px 0px rgba(18, 47, 92, 0.12)',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiPickersYear-root': {
      width: '100px',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiPickersBasePicker-pickerView': {
      minWidth: '100px',
    },
    '& .MuiPickersYearSelection-container': {
      overflowX: 'hidden',
    },
    '& .MuiPickersStaticWrapper-staticWrapperRoot': {
      minWidth: '100px',
    },
  },
  noInnerBorder: {
    '& .MuiSelect-select:focus': {
      border: 'none',
      backgroundColor: 'white',
    },
  },
}));

interface IProps {
  data: ICitationInput;
  onChangeData: (data: ICitationInput) => void;
  setPubmedCitation: Dispatch<SetStateAction<IExternalCitation | 'loading' | undefined>>;
}

export default function AddCitation({
  data,
  onChangeData,
  setPubmedCitation,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();

  const [citationUi, setCitationUi] = useState<CitationSource>();
  const [pubmedError, setPubmedError] = useState<string>('');

  const isPMC = data.source === 'PMC';

  const handleOnChangeValues = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ): void => {
    const { name, value } = event.target;
    onChangeData({
      ...data,
      [name]: value,
    });
  };

  const handleOnChangeSource = (
    event: SelectChangeEvent<unknown>,
  ): void => {
    const { value } = event.target as ISelectOption<CitationSource>;
    if (!['PUBMED', 'PMC'].includes(value)) {
      setPubmedCitation(undefined);
    }
    setCitationUi(value);

    onChangeData({
      ui: data.ui,
      source: value,
    });
  };

  const handleOnChangeYear = (value: number): void => {
    if (value > dayjs().year()) {
      onChangeData({
        ...data,
        year: dayjs().year(),
      });
    } else {
      onChangeData({
        ...data,
        year: value,
      });
    }
  };

  const getPubMedInfo = async (): Promise<void> => {
    const empty: ICitationInput = {
      ...data,
      title: '',
      authors: '',
      year: dayjs().year(),
      ui: 'CITATION',
    };
    setPubmedError('');

    // Data validation
    let parsedId = data.externalId?.trim().toUpperCase();

    if (!parsedId) {
      onChangeData(empty);
      setPubmedCitation(undefined);
      return;
    }

    // PubMedCentral-specific validation
    if (isPMC) {
      if (!isValidPMCID(parsedId)) {
        onChangeData(empty);
        setPubmedCitation(undefined);
        setPubmedError('Invalid PMCID format');
        return;
      }

      if (!parsedId.startsWith('PMC')) {
        parsedId = `PMC${parsedId}`;
      }
    }

    // API call
    setPubmedCitation('loading');
    try {
      if (data.source && isExternalCitationSource(data.source)) {
        const article = await zeroDashSdk.services.evidence.getExternalCitation({
          externalId: parsedId,
          source: data.source,
        });

        onChangeData({
          ...data,
          externalId: article.externalId.toString(),
          link: article.url,
          title: article.title || '',
          authors: article.authors || '',
          year: article.publicationYear ?? undefined,
          publication: article.publicationName || '',
        });
        setPubmedCitation(article);
      }
    } catch (error) {
      onChangeData(empty);
      setPubmedCitation(undefined);

      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setPubmedError('No data found for this ID');
      } else {
        setPubmedError('An unexpected error occurred while fetching citation data');
      }
    }
  };

  return (
    <Box display="flex" flex={1} flexDirection="column">
      <Box display="flex" flex={1} className={classes.row}>
        <LabelledInputWrapper label="Source">
          <SelectInput
            options={[
              { name: 'PubMed', value: 'PUBMED' },
              { name: 'PubMed Central', value: 'PMC' },
              { name: 'Journal', value: 'JOURNAL' },
              { name: 'Book', value: 'BOOK' },
              { name: 'Conference Abstract', value: 'CONFERENCE' },
            ]}
            name="source"
            sx={{ minWidth: 195 }}
            value={data.source ?? ''}
            inputContainerClassName={clsx({
              [classes.col1]: citationUi && citationUi !== 'PUBMED',
              [classes.colHalf]: citationUi === 'PUBMED',
              [classes.noInnerBorder]: true,
            })}
            onChange={handleOnChangeSource}
            errorText={data.errors?.source}
          />
        </LabelledInputWrapper>
        {citationUi && ['PUBMED', 'PMC'].includes(citationUi) && (
          <Box
            display="flex"
            flexDirection="column"
            width="100%"
          >
            <CustomOutlinedInput
              label="ID"
              name="externalId"
              value={data.externalId ? data.externalId : ''}
              error={!!(pubmedError || data.errors?.externalId)}
              onChange={handleOnChangeValues}
              errorMessage={pubmedError || data.errors?.externalId}
              type={isPMC ? 'text' : 'number'}
              sx={isPMC
                ? undefined
                : {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                  '& input[type=number]': {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '-moz-appearance': 'textfield',
                  },
                }}
              onBlur={getPubMedInfo}
              endAdornment={(
                <Tooltip
                  title={(
                    <CustomTypography variant="bodyRegular" fontWeight="medium">
                      The PubMed details will automatically load when you click away or submit.
                    </CustomTypography>
                  )}
                  placement="right"
                >
                  <InfoIcon />
                </Tooltip>
              )}
            />
          </Box>
        )}
        {citationUi && ['BOOK', 'JOURNAL', 'CONFERENCE'].includes(citationUi) && (
          <Grid container spacing={2} width="100%">
            <Grid size={3}>
              <LabelledInputWrapper label="Year" errorMessage={data.errors?.year}>
                <DatePicker
                  onChange={(newDate): void => handleOnChangeYear(Number(newDate?.format('YYYY')))}
                  defaultValue={dayjs()}
                  format="YYYY"
                  slotProps={{
                    inputAdornment: {
                      sx: {
                        position: 'relative',
                        top: '-4px',
                      },
                    },
                    popper: {
                      sx: {
                        '& .MuiDateCalendar-root': {
                          height: 'auto',
                        },
                      },
                    },
                  }}
                  views={['year']}
                />
              </LabelledInputWrapper>
            </Grid>
            <Grid size={9}>
              <CustomOutlinedInput
                label="URL LINK (OPTIONAL)"
                name="link"
                value={data.link ?? ''}
                onChange={handleOnChangeValues}
              />
            </Grid>
          </Grid>
        )}
      </Box>
      {citationUi && ['BOOK', 'JOURNAL', 'CONFERENCE'].includes(citationUi) && (
        <>
          <Grid container marginBottom="12px">
            <Grid size={12}>
              <CustomOutlinedInput
                label="TITLE"
                value={data.title ?? ''}
                name="title"
                errorMessage={data.errors?.title}
                onChange={handleOnChangeValues}
              />
            </Grid>
          </Grid>
          <Grid container marginBottom="12px" spacing={2}>
            <Grid size={6}>
              <CustomOutlinedInput
                label="AUTHOR"
                value={data.authors ?? ''}
                name="authors"
                errorMessage={data.errors?.authors}
                onChange={handleOnChangeValues}
              />
            </Grid>
            <Grid size={6}>
              <CustomOutlinedInput
                label={`${citationUi} Name (optional)`}
                value={data.publication ?? ''}
                name="publication"
                onChange={handleOnChangeValues}
              />
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
