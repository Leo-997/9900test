import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import {
  Box, Checkbox, FormControlLabel,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import {
  ChangeEvent,
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useActiveSlide } from '../../../../../../../contexts/ActiveSlideContext';
import { useClinical } from '../../../../../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../../../../../contexts/ZeroDashSdkContext';
import {
  IMolAlterationSampleDetails,
  ISampleTableMapper,
} from '../../../../../../../types/MTB/MolecularAlteration.types';
import { IAlterationAttachment } from '../../../../../../../types/MTB/MTB.types';
import { ISlide } from '../../../../../../../types/MTB/Slide.types';
import { getSlideAttachmentCaption, getSlideAttachmentTitle } from '../../../../../../../utils/functions/slideAttachementHelpers';
import CustomTypography from '../../../../../../Common/Typography';
import { ScrollableSection } from '../../../../../../ScrollableSection/ScrollableSection';
import ImageGraph from '../../../Common/Image/ImageGraph';
import SampleTableHeader from './SampleTableHeader';
import SampleTableListItem from './SampleTableListItem';

const useStyles = makeStyles(() => ({
  sampleBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '24px',
    minHeight: '408px',
    height: '100%',
    background: '#FAFBFC',
    gap: '24px',
    width: '100%',
  },
  sampleText: {
    color: '#030313',
    fontWeight: 700,
    height: '24px',
    width: '100%',
  },
  sampleDetailsBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0px',
    height: '312px',
    gap: '32px',
    width: '100%',
  },
  sampleContentBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0px',
    gap: '16px',
    height: '140px',
    width: '100%',
  },
  sampleContentText: {
    display: 'flex',
    alignItems: 'center',
    textTransform: 'uppercase',
    color: '#022034',
    height: '16px',
    width: '100%',
  },
  sampleTableBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '24px',
    gap: '30px',
    height: '108px',
    background: '#FFFFFF',
    borderRadius: '8px',
    width: '100%',
  },
  tpmImageRoot: {
    padding: '0px',
    gap: '16px',
    minHeight: '232px',
  },
  imageHeader: {
    display: 'flex',
    color: '#022034',
    height: '16px',
    alignItems: 'center',
    textTransform: 'uppercase',
  },
  imageInnerBox: {
    padding: '0px',
    gap: '24px',
    minHeight: '200px',
    borderRadius: '8px',
  },
  checkboxChecked: {
    color: '#1E86FC !important',
  },
  checkboxUnchecked: {
    color: '#273957 !important',
  },
  checkBoxDisabled: {
    color: 'grey !important',
  },
}));

interface IProps {
  isCurrentMolSample: boolean;
  sampleTableMapperArray: ISampleTableMapper[];
  molAlterationTableMapperArray: ISampleTableMapper[];
  data: IMolAlterationSampleDetails;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const SampleDetail = forwardRef(
  (
    {
      sampleTableMapperArray,
      molAlterationTableMapperArray,
      data,
      isCurrentMolSample,
    }: IProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const classes = useStyles();
    const zeroDashSdk = useZeroDashSdk();
    const { enqueueSnackbar } = useSnackbar();
    const {
      clinicalVersion,
      isReadOnly,
      isPresentationMode,
      isAssignedCurator,
      isAssignedClinician,
    } = useClinical();
    const {
      slide,
      getSlideFiles,
    } = useActiveSlide();

    const [file, setFile] = useState<IAlterationAttachment>({
      fileId: '',
      fileType: 'png',
      url: '',
      title: '',
      caption: '',
      checked: false,
    });

    const canEditSlide = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;

    const fetchAlterationFile = useCallback(
      async (molData: IMolAlterationSampleDetails, currSlide: ISlide) => {
        try {
          if (!isCurrentMolSample) return;

          if (molData.additionalData && molData.additionalData.fileId) {
            // Check if the file is added
            const existingFile = await zeroDashSdk.mtb.slides.getSlideAttachmentById(
              clinicalVersion.id,
              currSlide.id,
              molData.additionalData.fileId as string,
            );
            if (existingFile.fileId) {
              setFile((prev) => ({
                ...prev,
                checked: true,
              }));
            }

            const fileBlob = await zeroDashSdk.filetracker.downloadFile(
              molData.additionalData.fileId as string,
            );

            if (fileBlob) {
              const url = URL.createObjectURL(fileBlob);
              setFile((prev) => ({
                ...prev,
                fileId: molData.additionalData.fileId as string,
                url,
              }));
            }
          }
        } catch (error) {
          enqueueSnackbar('Could not fetch alteration file', { variant: 'error' });
        }
      },
      [
        isCurrentMolSample,
        zeroDashSdk.mtb.slides,
        zeroDashSdk.filetracker,
        clinicalVersion.id,
        enqueueSnackbar,
      ],
    );

    useEffect(() => {
      fetchAlterationFile(data, slide as ISlide);
    }, [fetchAlterationFile, data, slide]);

    const getMolSampleTableTitle = (mutationType: string): string => {
      switch (mutationType) {
        case 'SNV':
          return 'Somatic SNV/indel';

        case 'CNV':
          return 'Copy Number';

        case 'SV':
          return `Fusion of gene ${data.additionalData.startGene} & ${data.additionalData.endGene}`;

        case 'GERMLINE_SV':
          return `Germline fusion of gene ${data.additionalData.startGene} & ${data.additionalData.endGene}`;

        case 'GERMLINE_CNV':
          return 'Germline copy number';

        case 'GERMLINE_SNV':
          return 'Germline SNV';

        case 'RNA_SEQ':
          return 'RNA expression';

        case 'CYTOGENETICS_ARM':
        case 'CYTOGENETICS_CYTOBAND':
          return 'ARM CNV';

        case 'GERMLINE_CYTO_ARM':
        case 'GERMLINE_CYTO_CYTOBAND':
          return 'GERMLINE ARM CNV';

        case 'METHYLATION_MGMT':
        case 'METHYLATION_CLASSIFIER':
          return 'Methylation';

        case 'MUTATIONAL_SIG':
          return 'Signature Contribution';

        default:
          return 'Somatic SNV/indel';
      }
    };

    const onFileChecked = async (
      checked: boolean,
      selectedFile: IAlterationAttachment,
    ): Promise<void> => {
      if (checked && slide) {
        // Add the file to slide attachment table
        const result = await zeroDashSdk.mtb.slides.addSlideAttachment(
          clinicalVersion.id,
          slide.id,
          {
            fileId: selectedFile.fileId,
            fileType: selectedFile.fileType,
            title: getSlideAttachmentTitle(data),
            caption: getSlideAttachmentCaption(data),
            width: 2,
          },
        );

        if (result) {
          setFile((prev) => ({
            ...prev,
            checked: true,
          }));
          getSlideFiles(slide.id);
        }
      } else if (slide) {
        // Delete the file from slide attachment table
        const result = await zeroDashSdk.mtb.slides.deleteFileBySlideId(
          clinicalVersion.id,
          slide.id,
          selectedFile.fileId,
        );

        if (result) {
          setFile((prev) => ({
            ...prev,
            checked: false,
          }));
          getSlideFiles(slide.id);
        }
      }
    };

    return (
      <div ref={ref}>
        <Box className={classes.sampleBox}>
          <CustomTypography variant="h6" className={classes.sampleText}>
            Sample
          </CustomTypography>
          <Box className={classes.sampleDetailsBox}>
            <Box className={classes.sampleContentBox}>
              <CustomTypography
                variant="label"
                className={classes.sampleContentText}
              >
                Overview
              </CustomTypography>
              <ScrollableSection
                style={{
                  maxWidth: 'calc(100vw - 24px)',
                  width: '100%',
                  overflowY: 'hidden',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                }}
              >
                <Box className={classes.sampleTableBox}>
                  <SampleTableHeader
                    sampleTableMapper={sampleTableMapperArray}
                  />
                  <SampleTableListItem
                    sampleTableMapper={sampleTableMapperArray}
                    listData={data}
                  />
                </Box>
              </ScrollableSection>
            </Box>
            <Box className={classes.sampleContentBox}>
              <CustomTypography
                variant="label"
                className={classes.sampleContentText}
              >
                {getMolSampleTableTitle(data.mutationType)}
              </CustomTypography>
              <ScrollableSection
                style={{
                  maxWidth: 'calc(100vw - 24px)',
                  width: '100%',
                  overflowY: 'hidden',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                }}
              >
                <Box className={classes.sampleTableBox}>
                  <SampleTableHeader
                    sampleTableMapper={molAlterationTableMapperArray}
                  />
                  <SampleTableListItem
                    sampleTableMapper={molAlterationTableMapperArray}
                    listData={data}
                  />
                </Box>
              </ScrollableSection>
            </Box>
          </Box>
          {/* Alteration file */}
          {isCurrentMolSample
            && data.additionalData
            && data.additionalData.fileId as string && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                className={classes.tpmImageRoot}
              >
                <CustomTypography className={classes.imageHeader} variant="label">
                  {getSlideAttachmentCaption(data)}
                </CustomTypography>
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  className={classes.imageInnerBox}
                >
                  <ImageGraph
                    file={{
                      ...file,
                      slideId: slide?.id || '',
                      title: getSlideAttachmentTitle(data),
                      caption: getSlideAttachmentCaption(data),
                      width: 2,
                      order: 0,
                      isDeleted: !file.checked,
                    }}
                  />
                  {!isPresentationMode && (
                    <FormControlLabel
                      control={(
                        <Checkbox
                          disabled={isPresentationMode || !canEditSlide}
                          classes={{
                            root: file.checked
                              ? classes.checkboxChecked
                              : classes.checkboxUnchecked,
                            disabled: classes.checkBoxDisabled,
                          }}
                          checked={file.checked}
                          onChange={(
                            event: ChangeEvent<HTMLInputElement>,
                            checked: boolean,
                          ): void => {
                            onFileChecked(checked, file);
                          }}
                        />
                      )}
                      label="Show in slide"
                      labelPlacement="end"
                    />
                  )}
                </Box>
              </Box>
          )}
        </Box>
      </div>
    );
  },
);
export default SampleDetail;
