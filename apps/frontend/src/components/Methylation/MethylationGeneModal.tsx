import { mgmtStatuses, yesNoOptions } from '@/constants/options';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { boolToStr, strToBool } from '@/utils/functions/bools';
import { getMGMTStatusBackgroundColour } from '@/utils/functions/getMGMTStatusIcon';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import { useState, type JSX } from 'react';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IMethGeneTable, IMethylationGeneData, MethylationStatus } from '../../types/Methylation.types';
import { toFixed } from '../../utils/math/toFixed';
import LoadingAnimation from '../Animations/LoadingAnimation';
import DataPanel from '../Common/DataPanel';
import CustomTypography from '../Common/Typography';
import CircleIcon from '../CustomIcons/CircleIcon';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';

const useStyles = makeStyles(() => ({
  wrapper: {
    paddingTop: '40px',
    gap: '10px',
    width: '100%',
  },

  plot: {
    position: 'relative',
    maxWidth: '100%',
    height: 'auto',
    objectFit: 'contain',
    margin: '-73px 0 0 -30px',

  },
  lightText: {
    marginTop: '5px',
    color: 'rgba(94, 104, 113, 1)',
  },
  hairline: {
    border: 'none',
    borderTop: '1px dashed #D0D9E2',
    width: '90%',
    margin: 0,
  },
  dataTable: {
    marginLeft: 0,
    maxWidth: '90%',
    boxShadow: 'none',
  },
  values: {
    gap: '10px',
    marginBottom: '3px',
    width: '90%',
  },
}));

interface IMethylationGeneModalProps {
  data: IMethylationGeneData;
  updateData: (newData: Partial<IMethylationGeneData>) => void;
  table: IMethGeneTable[];
  loading: boolean;
}

export default function MethylationGeneModal({
  data,
  updateData,
  table,
  loading,
}: IMethylationGeneModalProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    methBiosample,
  } = useAnalysisSet();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: methBiosample?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const [researchCandidate, setResearchCandidate] = useState<string>(
    boolToStr(data.researchCandidate),
  );

  const canEditAssigned = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;
  const canEditAllCurators = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  const handleChange = async (newData: Partial<IMethylationGeneData>): Promise<void> => {
    if (methBiosample?.biosampleId) {
      try {
        await zeroDashSdk.methylation.updateMethylationGene(
          newData,
          methBiosample.biosampleId,
          data.geneId,
        );

        updateData(newData);
        enqueueSnackbar('MGMT promoter data has been updated.', { variant: 'success' });
      } catch {
        enqueueSnackbar('There was an issue updating MGMT data.', { variant: 'error' });
      }
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      justifyContent="flex-start"
      className={classes.wrapper}
    >
      <img
        className={classes.plot}
        src={data.genePlot || ''}
        alt="Gene methylation status prediction"
      />
      <hr className={classes.hairline} />
      <Box
        display="flex"
        flexDirection="row"
        alignItems="flex-start"
        justifyContent="space-between"
        className={classes.values}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          <CustomTypography variant="label">METHYLATION STATUS</CustomTypography>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="flex-start"
            justifyContent="flex-start"
          >
            <CircleIcon
              text=""
              textColor=""
              iconColor={getMGMTStatusBackgroundColour(data.status)}
              margin="5px 10px 10px 0"
              height={25}
              width={25}
            />
            <CustomTypography variant="bodyRegular">
              {data
                  && data.status
                  && (
                  <AutoWidthSelect
                    options={mgmtStatuses
                      .filter((o) => o !== 'Ambiguous')
                      .map((o) => ({ name: o, value: o.toLowerCase() }))}
                    value={data.status}
                    onChange={(e): Promise<void> => handleChange({
                      status: e.target.value as MethylationStatus,
                    })}
                    overrideReadonlyMode={
                      !canEditAssigned
                      || isReadOnly
                    }
                  />
                  )}
            </CustomTypography>
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          <CustomTypography variant="label">MEDIAN BETA VALUE (RANGE)</CustomTypography>
          <CustomTypography
            variant="bodyRegular"
            className={classes.lightText}
          >
            {`${data.median} (${
              data.lowest ? toFixed(data.lowest, 2) : '-'
            } - ${
              data.highest ? toFixed(data.highest, 2) : '-'
            })`}
          </CustomTypography>
        </Box>
        <DataPanel
          label="Research candidate"
          value={(
            <AutoWidthSelect
              options={yesNoOptions}
              overrideReadonlyMode={
                isReadOnly
                || !canEditAllCurators
              }
              value={researchCandidate}
              onChange={(e): void => {
                setResearchCandidate(e.target.value as string);
                handleChange({ researchCandidate: strToBool(e.target.value as string) });
              }}
              defaultValue={boolToStr(data.researchCandidate)}
            />
          )}
        />
      </Box>
      <hr className={classes.hairline} />
      {loading ? (
        <Box
          width="90%"
          height="150px"
        >
          <LoadingAnimation />
        </Box>
      ) : (
        table.length > 0 && (
          <TableContainer
            component={Paper}
            className={classes.dataTable}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>beta</TableCell>
                  <TableCell>mValue</TableCell>
                  <TableCell>chr</TableCell>
                  <TableCell>start</TableCell>
                  <TableCell>end</TableCell>
                  <TableCell>Island</TableCell>
                  <TableCell>Regulatory feature group</TableCell>
                  <TableCell>UCSC refGene group</TableCell>
                  <TableCell>Probe ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {table.map((row) => (
                  <TableRow>
                    {Object.values(row).map((val) => (
                      <TableCell>{val}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
    </Box>
  );
}
