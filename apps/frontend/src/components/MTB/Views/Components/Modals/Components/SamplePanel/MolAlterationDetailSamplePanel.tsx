import { useClinical } from '@/contexts/ClinicalContext';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useCallback, useEffect, useState, type JSX } from 'react';
import {
  CNVTableMapperArray,
  CytogeneticsArmTableMapperArray,
  GermlineSNVTableMapperArray,
  MethylationClassifierTableMapperArray,
  MethylationMGMTTableMapperArray,
  mutationalSigTableMapperArray,
  RNATableMapperArray,
  SampleTableMapperArray,
  SomaticSNVTableMapperArray,
  SVTableMapperArray,
} from '../../../../../../../constants/alterationDetailSample';
import { useZeroDashSdk } from '../../../../../../../contexts/ZeroDashSdkContext';
import {
  IMolAlterationSampleDetails,
  IMolSelectedRow,
  ISampleTableMapper,
} from '../../../../../../../types/MTB/MolecularAlteration.types';
import LoadingAnimation from '../../../../../../Animations/LoadingAnimation';
import CustomTypography from '../../../../../../Common/Typography';
import { ScrollableSection } from '../../../../../../ScrollableSection/ScrollableSection';
import CommentDetail from './CommentDetail';
import SampleDetail from './SampleDetail';

const useStyles = makeStyles(() => ({
  msgWrapper: {
    position: 'relative',
    top: '50%',
    color: '#8292a6',
    opacity: 1,
    display: 'flex',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 700,
  },
  headerTextBox: {
    boxSizing: 'border-box',
    height: '68px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '24px 24px 16px',
    background: '#FFFFFF',
    width: '100%',
  },
  headerText: {
    height: '28px',
    fontWeight: 500,
    color: '#030313',
  },
  anchorBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '8px 0px 8px 24px',
    width: '100%',
    height: '40px',
    background: '#F3F5F7',
  },
  anchorInfoText: {
    minWidth: '67px',
    height: '24px',
    fontWeight: 500,
    color: '#62728C',
  },
  therapyContainer: {
    height: '760px',
  },
  anchorBtn: {
    height: '24px',
    padding: '8px',
    marginLeft: '16px',
  },
}));

interface IProps {
  selectedMolRow: IMolSelectedRow;
}

const initialSampleData: IMolAlterationSampleDetails = {
  additionalData: {},
  analysisSetId: '',
  gene: '',
  geneId: '',
  clinicalTargetable: false,
  curationComment: '',
  curationTargetable: false,
  zero2Category: '',
  zero2Subcat1: '',
  zero2Subcat2: '',
  zero2FinalDiagnosis: '',
  mtbMeeting: '',
  mtbReport: '',
  mutationType: 'SNV',
  pathway: '',
  patientId: '',
  reportComment: '',
};

export default function MolAlterationDetailSamplePanel({
  selectedMolRow,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { clinicalVersion } = useClinical();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [sampleData, setSampleData] = useState<IMolAlterationSampleDetails>(initialSampleData);

  const fetchMolAlterationSampleData = useCallback(
    async (molRowObject: IMolSelectedRow) => {
      setLoading(true);
      try {
        setError('');
        const molSampleDetails = await zeroDashSdk.mtb.molAlteration.getMolSampleDetailsByIds(
          clinicalVersion.id,
          molRowObject.groupId,
          molRowObject.molId,
        );
        setSampleData((prev) => ({
          ...prev,
          ...molSampleDetails,
        }));
      } catch (err) {
        setLoading(false);
        setError('Could not load mol alteration sample data');
      } finally {
        setLoading(false);
      }
    },
    [clinicalVersion.id, zeroDashSdk.mtb.molAlteration],
  );

  useEffect(() => {
    fetchMolAlterationSampleData(selectedMolRow);
  }, [selectedMolRow, fetchMolAlterationSampleData]);

  const getMolSampleMapper = (mutationType: string): ISampleTableMapper[] => {
    switch (mutationType) {
      case 'SNV':
        return SomaticSNVTableMapperArray;

      case 'CNV':
      case 'GERMLINE_CNV':
        return CNVTableMapperArray;

      case 'SV':
      case 'GERMLINE_SV':
        return SVTableMapperArray;

      case 'GERMLINE_SNV':
        return GermlineSNVTableMapperArray;

      case 'RNA_SEQ':
        return RNATableMapperArray;

      case 'CYTOGENETICS_ARM':
      case 'CYTOGENETICS_CYTOBAND':
      case 'GERMLINE_CYTO_ARM':
      case 'GERMLINE_CYTO_CYTOBAND':
        return CytogeneticsArmTableMapperArray;

      case 'METHYLATION_MGMT':
        return MethylationMGMTTableMapperArray;

      case 'METHYLATION_CLASSIFIER':
        return MethylationClassifierTableMapperArray;

      case 'MUTATIONAL_SIG':
        return mutationalSigTableMapperArray;

      default:
        return SomaticSNVTableMapperArray;
    }
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return (
      <div className={classes.msgWrapper}>
        {error}
      </div>
    );
  }

  return (
    <>
      {/* HeaderText */}
      <Box className={classes.headerTextBox}>
        <CustomTypography variant="h5" fontWeight="medium">
          Patient ID:
          {' '}
          {sampleData.patientId}
        </CustomTypography>
      </Box>

      <ScrollableSection
        style={{
          maxHeight: '70vh',
          overflowX: 'hidden',
        }}
      >
        {/* Sample Section */}
        <SampleDetail
          isCurrentMolSample={selectedMolRow.isCurrentSample}
          sampleTableMapperArray={SampleTableMapperArray}
          molAlterationTableMapperArray={getMolSampleMapper(sampleData.mutationType)}
          data={sampleData}
        />

        {/* Comment Section */}
        <CommentDetail
          isCurrentMolSample={selectedMolRow.isCurrentSample}
          data={sampleData}
        />

        {/* Therapy Section */}
        {!selectedMolRow.isCurrentSample && (
          <Box className={classes.therapyContainer}>Therapy</Box>
        )}
      </ScrollableSection>
    </>
  );
}
