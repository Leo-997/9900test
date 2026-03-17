import { Box, darken, styled } from '@mui/material';
import {
  DownloadIcon, FileTextIcon, LayoutGridIcon, PlusIcon,
} from 'lucide-react';
import {
  Dispatch, SetStateAction, useState, type JSX,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { corePalette } from '@/themes/colours';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useClinical } from '../../../../../../contexts/ClinicalContext';
import { Views } from '../../../../../../types/MTB/MTB.types';
import { ISlide } from '../../../../../../types/MTB/Slide.types';
import CustomButton from '../../../../../Common/Button';
import CustomTypography from '../../../../../Common/Typography';
import VerticalDivider from '../../../../../Common/VerticalDivider';
import { ScrollableSection } from '../../../../../ScrollableSection/ScrollableSection';
import MTBExport from '../../../MTBExport';
import ReportsDialog from '../../Modals/Components/ReportsDialog';
import IndexBarSlide from './IndexBarSlide';

interface IStyleProps {
  activeView: Views;
}

const Root = styled(Box)(({ theme }) => ({
  width: 'calc(100vw - 240px)',
  height: '90px',
  position: 'absolute',
  bottom: 0,
  left: 120,
  backgroundColor: theme.colours.core.offBlack100,
  borderRadius: '12px 12px 0 0',
  zIndex: 100,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
}));

const StyledScrollableSection = styled(ScrollableSection)({
  flex: 2,
  height: '100%',
  overflowX: 'auto',
  '& .simplebar-wrapper': {
    width: '100%',
  },
  '& .simplebar-content': {
    height: '100%',
  },
});

const StyledDivider = styled(VerticalDivider)({
  margin: '0 !important',
});

const Button = styled(CustomButton)(({ theme }) => ({
  color: theme.colours.core.white,
  backgroundColor: theme.colours.core.blank,
  '&:hover': {
    backgroundColor: `${darken(theme.colours.core.grey200, 0.1)}`,
  },
}));

const IndexButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'activeView',
})<IStyleProps>(({ activeView }) => ({
  margin: '0 16px',
  color: activeView === 'OVERVIEW' ? corePalette.yellow100 : corePalette.white,
}));

interface IProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function IndexBar({
  setOpen,
}: IProps): JSX.Element {
  const navigate = useNavigate();
  const {
    slides,
    activeView,
    mtbBaseUrl,
    isReadOnly,
    isPresentationMode,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();

  const [reportDialogOpen, setReportDialogOpen] = useState<boolean>(false);
  const [exportPageOpen, setExportPageOpen] = useState<boolean>(false);

  const canAddSlide = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;
  const canSeeReports = useIsUserAuthorised('report.read');
  const canExport = useIsUserAuthorised('clinical.sample.write');

  const handleIndexView = (): void => {
    navigate(`/${mtbBaseUrl}/OVERVIEW`);
  };

  return (
    <Root>
      <IndexButton
        variant="subtle"
        size="small"
        label="Index"
        activeView={activeView}
        startIcon={
          <LayoutGridIcon color={activeView === 'OVERVIEW' ? corePalette.yellow100 : corePalette.white} />
        }
        onClick={handleIndexView}
      />
      <StyledScrollableSection>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          height="100%"
          gap="16px"
        >
          <IndexBarSlide
            key="clinical_information"
            value="CLINICAL_INFORMATION"
            slideTitle="Clinical Information"
            onClick={() => {
              navigate(`/${mtbBaseUrl}/CLINICAL_INFORMATION`);
            }}
          >
            <CustomTypography fontWeight="bold" style={{ fontSize: '10px' }}>
              Clinical
            </CustomTypography>
            <CustomTypography fontWeight="bold" style={{ fontSize: '10px' }}>
              Information
            </CustomTypography>
          </IndexBarSlide>
          <IndexBarSlide
            key="molecular_findings"
            value="MOLECULAR_FINDINGS"
            slideTitle="Molecular Findings"
            onClick={() => {
              navigate(`/${mtbBaseUrl}/MOLECULAR_FINDINGS`);
            }}
          >
            <CustomTypography fontWeight="bold" style={{ fontSize: '10px' }}>
              Molecular
            </CustomTypography>
            <CustomTypography fontWeight="bold" style={{ fontSize: '10px' }}>
              Findings
            </CustomTypography>
          </IndexBarSlide>
          <StyledDivider />
          {slides
            .map((s: ISlide, index: number) => (
              <IndexBarSlide
                key={s.id}
                value={s.id}
                slideTitle={s.title || 'Untitled slide'}
                onClick={() => {
                  navigate(`/${mtbBaseUrl}/${s.id}`);
                }}
                isCustomSlide
              >
                <CustomTypography
                  variant="bodySmall"
                  color={corePalette.white}
                  margin="0 5px 3px 0"
                >
                  {index + 1}
                </CustomTypography>
              </IndexBarSlide>
            ))}
          {canAddSlide && !isPresentationMode && (
            <IndexBarSlide
              slideTitle="Add new slide"
              variant="outline"
              onClick={(): void => setOpen(true)}
            >
              <PlusIcon />
            </IndexBarSlide>
          )}
          <StyledDivider />
          <IndexBarSlide
            key="discussion"
            value="DISCUSSION"
            slideTitle="Discussion"
            onClick={() => {
              navigate(`/${mtbBaseUrl}/DISCUSSION`);
            }}
          >
            <CustomTypography fontWeight="bold" style={{ fontSize: '10px' }}>
              Discussion
            </CustomTypography>
          </IndexBarSlide>
        </Box>
      </StyledScrollableSection>
      {!isPresentationMode && canExport && (
        <Button
          variant="subtle"
          size="small"
          label="Export"
          startIcon={<DownloadIcon />}
          onClick={(): void => setExportPageOpen(true)}
          sx={{
            margin: '0 16px',
          }}
        />
      )}
      {!isPresentationMode && canSeeReports && (
        <Button
          variant="subtle"
          size="small"
          label="Reports"
          startIcon={<FileTextIcon />}
          onClick={(): void => setReportDialogOpen(true)}
          sx={{
            marginRight: '16px',
          }}
        />
      )}
      <ReportsDialog
        open={reportDialogOpen}
        onClose={(): void => setReportDialogOpen(false)}
      />
      {exportPageOpen && (
        <MTBExport
          open={exportPageOpen}
          onClose={(): void => setExportPageOpen(false)}
        />
      )}
    </Root>
  );
}
