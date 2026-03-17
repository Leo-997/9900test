import {
  Box,
  Grid, IconButton, SelectChangeEvent, styled,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { ImageIcon, MaximizeIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useEffect, useState, type JSX } from 'react';
import { FileWithPath } from 'react-dropzone';
import { boolToStr, strToBool } from '@/utils/functions/bools';
import { ReportType } from '@/types/Reports/Reports.types';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { yesNoOptions } from '@/constants/options';
import { useCuration } from '../../contexts/CurationContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { ISummary } from '../../types/Common.types';
import { ISomaticRna, IUpdateRnaSeqBody } from '../../types/RNAseq.types';
import { toFixed } from '../../utils/math/toFixed';
import { ScoreChip } from '../Chips/ScoreChip';
import CustomButton from '../Common/Button';
import DataPanel from '../Common/DataPanel';
import { CustomFileUpload } from '../Common/FileUpload';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';
import { TPMPlotDialog } from './TMPPlotDialog/TPMPlotDialog';

const ExpandImage = styled(IconButton)(() => ({
  position: 'absolute',
  top: 0,
  right: 0,
  fontSize: 18,
  padding: '5px',
}));

const MissingImage = styled(ImageIcon)(({ theme }) => ({
  transform: 'translate(-50%, -50%)',
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '40px',
  height: '40px',
  color: theme.colours.core.grey100,
}));

const useStyles = makeStyles(() => createStyles({
  fileDropZone: {
    marginTop: 20,
    width: '100%',
  },
  button: {
    width: '100%',
    marginTop: 20,
  },
  imgBox: {
    boxSizing: 'border-box',
    borderRadius: '8px',
    width: '100%',
    height: 'auto',
    position: 'relative',
    minHeight: '120px',
  },
  zScoreChip: {
    width: 'min(176px, 90%)',
    borderRadius: '8px',
    fontWeight: 'bold',
    color: '#022034',
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  photoContainer: {
    marginLeft: -15,
  },
  root: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
  },
  section: {
    marginTop: 6,
    marginBottom: 6,
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
  },
  subText: {
    color: '#022034',
    margin: '2px',
  },
  subTextLabel: {
    color: '#5E6871',
    margin: '2px',
  },
  missingImg: {
    transform: 'translate(-50%, -50%)',
    position: 'absolute',
    color: '#5E6871',
    top: '50%',
    left: '50%',
    fontSize: 40,
  },
  select: {
    paddingBottom: 0,
    paddingTop: 0,
    borderRadius: 8,
  },
  selectItem: {
    height: 44,
    '&:hover': {
      background: '#F3F7FF',
    },
  },
  header: {
    marginBottom: 8,
    lineHeight: 1.5,
  },
  hairline: {
    border: 'none',
    borderTop: '1px solid #D0D9E2',
    width: '90%',
    margin: 0,
  },
  link: {
    color: '#1E86FC',
    textDecoration: 'underline',
  },
  arrowIcon: {
    color: '#1E86FC',
    marginLeft: '10px',
    verticalAlign: 'text-bottom',
    transform: 'matrix(-0.71, 0.71, 0.71, 0.71, 0, 0)',
  },
  foldChanger: {
    fontWeight: 500,
  },
  imageItem: {
    height: 'auto',
    width: '100%',
    borderRadius: 'inherit',
  },
  expandImg: {
    position: 'absolute',
    top: 0,
    right: 0,
    fontSize: 18,
    padding: '5px',
  },
}));

interface IProps {
  data: ISomaticRna;
  rnaSummary: ISummary
  imgUrl?: string;
  handleUpdateData: (body: IUpdateRnaSeqBody, reports?: ReportType[]) => Promise<ReportType[]>;
  handleGraphUpload: (file: File) => Promise<void>;
  uploadStatus?: boolean;
  setUploadStatus: (status: boolean) => void;
  setGeneExpression: (expression: string | null) => void;
}

export default function RNASeqModal({
  data,
  rnaSummary,
  handleUpdateData,
  handleGraphUpload,
  imgUrl,
  uploadStatus,
  setUploadStatus,
  setGeneExpression: updateGeneExpression,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const { enqueueSnackbar } = useSnackbar();
  const { rnaBiosample } = useAnalysisSet();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: rnaBiosample?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;

  const {
    meanZScore,
    foldChange,
    patientTPM,
    medianTPM,
    patientFPKM,
    medianFPKM,
    geneExpression: initialExpression,
    geneId,
    gene,
    researchCandidate: initialRCandidate,
  } = data;

  const [selectedFile, setSelectedFile] = useState<string | Blob>();
  const [preview, setPreview] = useState<string>();
  const [geneExpression, setGeneExpression] = useState<string | null>(initialExpression);
  const [researchCandidate, setResearchCandidate] = useState<string>(
    boolToStr(initialRCandidate),
  );
  const [plotOpen, setPlotOpen] = useState<boolean>(false);

  const canEditAssigned = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;
  const canEditAllCurators = useIsUserAuthorised('curation.sample.write') && !isReadOnly;

  const handleUpdateGeneExpression = async (
    event: SelectChangeEvent<unknown>,
  ): Promise<void> => {
    if (rnaBiosample?.biosampleId) {
      try {
        const expression = event.target.value === '' ? null : event.target.value as string;
        await zeroDashSdk.rna.updateRnaSeq(
          {
            geneExpression: expression,
          },
          rnaBiosample?.biosampleId,
          geneId,
        );
        setGeneExpression(expression);
        updateGeneExpression(expression);
      } catch {
        enqueueSnackbar('Error updating gene expression', {
          variant: 'error',
        });
      }
    }
  };

  const handleResearchCandidateChange = (
    event: SelectChangeEvent<unknown>,
  ): void => {
    setResearchCandidate(event.target.value as string);
    handleUpdateData({
      researchCandidate: strToBool(event.target.value as string),
    });
  };

  useEffect(() => {
    setPreview((prev) => {
      if (imgUrl && !prev) {
        return imgUrl;
      }
      if (!selectedFile && !imgUrl) {
        return undefined;
      }
      if (selectedFile) {
        return URL.createObjectURL(selectedFile as Blob);
      }
      return prev;
    });
  }, [imgUrl, selectedFile]);

  const onUploadGraph = (): void => {
    if (!selectedFile || typeof selectedFile !== 'object') {
      enqueueSnackbar('Please select a file', { variant: 'error' });
    } else {
      handleGraphUpload(
        new File(
          [selectedFile],
          `${rnaBiosample?.biosampleId}-${gene}.png`,
        ),
      );
    }
  };

  const handleSaveGeneratedGraph = async (file: File): Promise<void> => {
    setPreview(URL.createObjectURL(file));
    await handleGraphUpload(file);
  };

  const setGeneFile = (acceptedFiles: FileWithPath[]): void => {
    const newFile = acceptedFiles.length > 0 ? acceptedFiles[0] : undefined;
    setSelectedFile(newFile);
    setUploadStatus(false);
  };

  const cancelUpload = (): void => {
    setSelectedFile(undefined);
    setPreview(undefined);
    setUploadStatus(false);
  };

  return (
    <Grid className={classes.rowContainer} container>
      <Grid className={classes.root} size={{ xs: 8 }}>
        <Grid
          container
          alignItems="flex-start"
          style={{ marginBottom: 6 }}
          spacing={2}
        >
          <Grid size={{ xs: 6 }} className={classes.panel}>
            <DataPanel
              label="Gene Expression"
              value={(
                <AutoWidthSelect
                  options={[
                    { value: 'High', name: 'High' },
                    { value: 'Medium', name: 'Medium' },
                    { value: 'Low', name: 'Low' },
                    { value: 'None', name: 'None' },
                    { value: '', name: 'Leave as blank' },
                  ]}
                  sx={{ minWidth: '50%' }}
                  variant="outlined"
                  value={geneExpression}
                  onChange={handleUpdateGeneExpression}
                  overrideReadonlyMode={
                    isReadOnly
                    || !canEditAssigned
                  }
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 6 }} className={classes.panel}>
            <DataPanel
              label="Research candidate"
              value={(
                <AutoWidthSelect
                  options={yesNoOptions}
                  sx={{ maxWidth: '80%' }}
                  overrideReadonlyMode={
                    isReadOnly
                    || !canEditAllCurators
                  }
                  value={researchCandidate}
                  onChange={handleResearchCandidateChange}
                  defaultValue={boolToStr(initialRCandidate)}
                />
            )}
            />
          </Grid>
        </Grid>
        <hr className={classes.hairline} />
        <Grid
          container
          alignItems="flex-start"
          className={classes.section}
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 6 }} className={classes.panel}>
            <DataPanel
              label="GENE"
              value={gene}
            />
          </Grid>
        </Grid>
        <hr className={classes.hairline} />
        <Grid
          container
          alignItems="flex-start"
          className={classes.section}
          spacing={2}
        >
          <Grid size={{ xs: 6 }} className={classes.panel}>
            <DataPanel
              label="MEAN Z-SCORE"
              value={(
                <ScoreChip
                  min={parseFloat(toFixed(rnaSummary.min, 2))}
                  max={parseFloat(toFixed(rnaSummary.max, 2))}
                  mid={0}
                  value={
                    Number.isNaN(parseFloat(meanZScore))
                      ? undefined
                      : Number(toFixed(parseFloat(meanZScore), 2))
                  }
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 6 }} className={classes.panel}>
            <DataPanel
              label="FOLD CHANGE"
              value={Number.isNaN(parseFloat(foldChange))
                ? null
                : toFixed(parseFloat(foldChange), 2)}
            />
          </Grid>
        </Grid>
        <hr className={classes.hairline} />
        <Grid
          container
          alignItems="flex-start"
          className={classes.section}
          spacing={2}
        >
          <Grid size={{ xs: 6 }} className={classes.panel}>
            <DataPanel
              label="PATIENT TPM"
              value={Number.isNaN(parseFloat(patientTPM))
                ? null
                : parseFloat(toFixed(parseFloat(patientTPM), 2))}
            />
          </Grid>
          <Grid size={{ xs: 6 }} className={classes.panel}>
            <DataPanel
              label="MEDIAN TPM"
              value={Number.isNaN(parseFloat(medianTPM))
                ? null
                : parseFloat(toFixed(parseFloat(medianTPM), 2))}
            />
          </Grid>
        </Grid>
        <hr className={classes.hairline} />
        <Grid
          container
          alignItems="flex-start"
          className={classes.section}
          spacing={2}
        >
          <Grid size={{ xs: 6 }} className={classes.panel}>
            <DataPanel
              label="PATIENT FPKM"
              value={Number.isNaN(parseFloat(patientFPKM))
                ? null
                : parseFloat(toFixed(parseFloat(patientFPKM), 2))}
            />
          </Grid>
          <Grid size={{ xs: 6 }} className={classes.panel}>
            <DataPanel
              label="MEDIAN FPKM"
              value={Number.isNaN(parseFloat(medianFPKM))
                ? null
                : parseFloat(toFixed(parseFloat(medianFPKM), 2))}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid className={classes.photoContainer} size={4}>
        <div
          className={classes.imgBox}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview img"
              className={classes.imageItem}
            />
          ) : (
            <MissingImage />
          )}
          <ExpandImage
            onClick={(): void => setPlotOpen(true)}
          >
            <MaximizeIcon />
          </ExpandImage>
        </div>

        {selectedFile
        && !uploadStatus
        && canEditAssigned
        && !isReadOnly ? (
          <>
            <CustomButton
              variant="bold"
              label="Save update"
              onClick={onUploadGraph}
            />
            <CustomButton
              variant="subtle"
              label="Discard"
              onClick={cancelUpload}
            />
          </>
          ) : (
            canEditAssigned && (
            <Box display="flex" flexDirection="column" padding="8px" gap="8px">
              <CustomFileUpload
                label="Upload new plot"
                onChange={setGeneFile}
                disabled={isReadOnly}
              />
              <CustomButton
                variant="subtle"
                label="Generate a new plot"
                disabled={isReadOnly}
                onClick={(): void => setPlotOpen(true)}
              />
            </Box>
            )
          )}
      </Grid>
      {plotOpen && (
        <TPMPlotDialog
          handleClose={(): void => setPlotOpen(false)}
          geneName={gene}
          geneId={geneId}
          initialImageUrl={preview || imgUrl}
          handleSave={handleSaveGeneratedGraph}
        />
      )}
    </Grid>
  );
}
