import { GermlineConsentChip } from '@/components/Chips/GermlineConsentChip';
import CustomChip from '@/components/Common/Chip';
import { Notifications } from '@/components/Notifications/Notifications';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { usePatient } from '@/contexts/PatientContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import mapEvent from '@/utils/functions/mapEvent';
import {
  Badge,
  darken,
  Divider,
  AppBar as MuiAppBar,
  IconButton as MuiIconButton,
  Toolbar as MuiToolbar,
  styled,
} from '@mui/material';
import Box from '@mui/material/Box';
import { makeStyles } from '@mui/styles';
import { MessageCircleIcon, SearchIcon } from 'lucide-react';
import { useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { useClinical } from '../../../../contexts/ClinicalContext';
import CustomTypography from '../../../Common/Typography';
import ZeroLogoWithRec from '../../../CustomIcons/ZeroLogoWithRec';
import ClinicalProgressButton from '../../CommonButtons/ClinicalProgressButton';
import PresentationModeButton from '../../CommonButtons/PresentationModeButton';
import { SlideCommentModal } from '../Modal/SlideCommentModal';
import { AssigneeButton } from './AssigneeButton';
import { MoreAssigneesModal } from './MoreAssigneesModal';

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  height: '80px',
  backgroundColor: theme.colours.core.offBlack100,
  color: theme.colours.core.white,
  boxShadow: 'none',
  position: 'relative',
}));

const Toolbar = styled(MuiToolbar)({
  height: '100%',
  width: '100vw',
  padding: '0 32px !important',
  display: 'flex',
  justifyContent: 'space-between',
});

const IconButton = styled(MuiIconButton)(({ theme }) => ({
  width: '36px',
  height: '36px',
  marginRight: '10px',
  padding: 0,
  '&:hover': {
    backgroundColor: `${darken(theme.colours.core.grey200, 0.1)}`,
  },
}));

const useStyles = makeStyles(() => ({
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingLeft: 8,
    width: '100%',
  },
  avatarButton: {
    padding: 0,
    marginRight: '-6px',
  },
  reviewerButton: {
    padding: 0,
    cursor: 'pointer',
    marginRight: '-3px',
  },
  avatarPanel: {
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginRight: '20px',
  },
  clinicalStatusChip: {
    height: '22px',
    border: '0.01em solid #D0D9E2',
    borderRadius: '4px',
    backgroundColor: '#030313',
    color: '#FAFBFC',
    textTransform: 'uppercase',
    fontSize: '11px',
    marginRight: '10px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& span': {
      padding: '0 6px',
    },
  },
  button: {
    marginRight: '20px',
    padding: '6px 12px 6px 12px',
  },
  commentBadge: {
    right: 5,
    top: 5,
    backgroundColor: corePalette.yellow150,
  },
  iconBox: {
    borderRadius: '4px',
    paddingLeft: '8px',
  },
  diagnosisText: {
    color: '#FFFFFF',
  },
}));

interface IProps {
  onOpenArchive: () => void;
  // onOpenAwaitingApproval: () => void;
}

export default function NavBar({
  onOpenArchive,
  // onOpenAwaitingApproval,
}: IProps): JSX.Element {
  const classes = useStyles();
  const {
    clinicalVersion,
    clinicalStatus,
    assignClinicalReviewer,
    updateMTBChair,
    updateAssignee,
    updateReviewStatus,
    isReadOnly,
    isPresentationMode,
    isAssignedCurator,
    isAssignedClinician,
    // unvalidatedDrugs,
  } = useClinical();
  const { analysisSet, demographics } = useAnalysisSet();
  const { patient } = usePatient();

  const [openSlideCommentModal, setOpenSlideCommentModal] = useState<boolean>(false);

  const canUpdateUser = useIsUserAuthorised('clinical.sample.write');
  const canViewSampleData = useIsUserAuthorised('clinical.sample.read');
  const canRequestReview = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician);

  return (
    <AppBar>
      <Toolbar>
        {!isPresentationMode && (
          <Link to="/clinical">
            <ZeroLogoWithRec fill={corePalette.offBlack100} />
          </Link>
        )}
        <Box className={classes.header}>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
            width="100%"
          >
            <CustomTypography variant="titleRegular" color={corePalette.white} marginRight="8px">
              Patient ID:
              {' '}
              {patient?.patientId}
            </CustomTypography>
          </Box>
          <Box display="flex" flexDirection="row" alignItems="center">
            <CustomTypography variant="bodyRegular" color={corePalette.grey50}>
              {mapEvent(analysisSet.sequencedEvent, true)}
            </CustomTypography>
            <CustomChip
              label={clinicalVersion.status}
              className={classes.clinicalStatusChip}
              colour={corePalette.grey10}
              backgroundColour={corePalette.offBlack200}
              sx={{
                marginLeft: '8px',
                border: `1px solid ${corePalette.grey10}`,
              }}
            />
            {demographics && (
              <GermlineConsentChip germlineConsent={demographics} />
            )}
          </Box>
        </Box>
        <Box display="flex" alignItems="center" height="100%" padding="24px 0px">
          {!isPresentationMode && (
            <Box className={classes.avatarPanel}>
              <MoreAssigneesModal />
              <span style={{ marginRight: '-8px' }}>
                <AssigneeButton
                  options={{
                    id: clinicalVersion.reviewers.find(
                      (r) => r.group === 'Clinicians',
                    )?.user?.id || null,
                    type: 'reviewer',
                    disabled: !canUpdateUser || clinicalStatus.status === 'Done',
                    group: 'Clinicians',
                    groupLabel: 'Reviewing Clinician',
                    reviewStatus: clinicalVersion.reviewers.find(
                      (r) => r.group === 'Clinicians',
                    )?.status,
                    onSelect: (user) => assignClinicalReviewer(
                      user,
                      'Clinicians',
                    ),
                  }}
                  defaultBackgroundColour="#022034"
                  iconColour="#FFFFFF"
                  updateReviewStatus={(group, status): void => {
                    updateReviewStatus(group, status);
                  }}
                  canRequestReview={
                    !isReadOnly
                    && canRequestReview
                    && clinicalStatus.canAskToReview
                  }
                />
              </span>
              <span style={{ marginRight: '-8px' }}>
                <AssigneeButton
                  options={{
                    id: clinicalVersion.clinician?.id || null,
                    type: 'assignee',
                    disabled: !canUpdateUser || clinicalStatus.status === 'Done',
                    group: 'Clinicians',
                    groupLabel: 'Clinician',
                    onSelect: (user) => updateAssignee('clinicianId', user),
                  }}
                  updateReviewStatus={(group, status): void => {
                    updateReviewStatus(group, status);
                  }}
                  canRequestReview={
                    !isReadOnly
                    && canRequestReview
                    && clinicalStatus.canAskToReview
                  }
                  iconColour="#FFFFFF"
                  defaultBackgroundColour="#022034"
                />
              </span>
              <span style={{ marginRight: '8px' }}>
                <AssigneeButton
                  options={{
                    id: clinicalVersion.mtbChair?.id || null,
                    type: 'chair',
                    disabled: !canUpdateUser || clinicalStatus.status === 'Done',
                    group: 'MTBChairs',
                    groupLabel: 'MTB Chair',
                    reviewStatus: clinicalVersion.reviewers.find(
                      (r) => r.group === 'MTBChairs',
                    )?.status,
                    onSelect: updateMTBChair,
                  }}
                  defaultBackgroundColour="#022034"
                  iconColour="#FFFFFF"
                  updateReviewStatus={(group, status): void => {
                    updateReviewStatus(group, status);
                  }}
                  canRequestReview={
                    !isReadOnly
                    && canRequestReview
                    && clinicalStatus.canAskToReview
                  }
                />
              </span>
            </Box>
          )}
          {!isPresentationMode && canViewSampleData && (
            <>
              <Divider orientation="vertical" sx={{ margin: '0 10px 0 0' }} />
              <IconButton
                onClick={onOpenArchive}
              >
                <SearchIcon width={20} height={20} color={corePalette.white} />
              </IconButton>
              {/* This should be removed in ticket ZDP2 786
              https://childrenscancerinstitute.atlassian.net/browse/ZDP2-786 */}
              {/* <IconButton
                onClick={onOpenAwaitingApproval}
              >
                <Badge
                  badgeContent={unvalidatedDrugs.length}
                  invisible={unvalidatedDrugs.length === 0}
                  sx={{
                    '& .MuiBadge-badge': {
                      color: corePalette.white,
                      backgroundColor: corePalette.yellow150,
                      right: '0px',
                      bottom: '-3px',
                    },
                  }}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                >
                  <PillIcon
                    stroke={corePalette.white}
                    size={20}
                  />
                </Badge>

              </IconButton> */}
              <IconButton
                onClick={(): void => setOpenSlideCommentModal((prev) => !prev)}
              >
                <Badge
                  invisible
                  classes={{
                    dot: classes.commentBadge,
                  }}
                  overlap="circular"
                  variant="dot"
                  badgeContent=""
                >
                  <MessageCircleIcon width={20} height={20} color={corePalette.white} />
                </Badge>
              </IconButton>
            </>
          )}
          <Box sx={{ marginRight: '10px' }}>
            <Notifications colour={corePalette.white} backgroundColour={corePalette.grey200} />
          </Box>
          <Box display="flex" gap="12px">
            <PresentationModeButton />
            {!isPresentationMode && clinicalStatus.nextStatuses.length !== 0 && (
              <ClinicalProgressButton />
            )}
          </Box>
          <SlideCommentModal
            key={`slide-comment-modal-${openSlideCommentModal}`}
            onModalClose={(): void => setOpenSlideCommentModal(false)}
            open={openSlideCommentModal}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
