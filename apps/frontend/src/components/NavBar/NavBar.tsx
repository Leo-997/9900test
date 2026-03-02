import {
  Box,
  IconButton,
  MenuItem,
  AppBar as MuiAppBar,
  Toolbar as MuiToolbar,
  styled,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { SettingsIcon } from 'lucide-react';
import {
  ReactNode, useEffect, useState, type JSX,
} from 'react';
import { Link } from 'react-router-dom';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { IPipeline } from '@/types/Analysis/Biosamples.types';
import { getSecCuratorAvatarStatus } from '@/utils/components/avatar/getSecCuratorAvatarStatus';
import mapEvent from '@/utils/functions/mapEvent';
import { usePatient } from '../../contexts/PatientContext';
import { useUser } from '../../contexts/UserContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { CuratorType, IUser } from '../../types/Auth/User.types';
import { GermlineConsentChip } from '../Chips/GermlineConsentChip';
import CustomChip from '../Common/Chip';
import CustomTypography from '../Common/Typography';
import CurationProgressButton from '../CurationProgressButton/CurationProgressButton';
import FlagCorrections from '../CurationValidationTabs/FlagCorrections';
import { AvatarWithBadge } from '../CustomIcons/AvatarWithBadge';
import ZeroLogoWithRec from '../CustomIcons/ZeroLogoWithRec';
import { Notifications } from '../Notifications/Notifications';
import Settings from '../Settings/Settings';
import UsersMenu from '../UsersMenu/UsersMenu';
import Gender from '../VitalStatus/Gender';

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  height: '80px',
  backgroundColor: theme.colours.core.white,
  color: theme.colours.core.offBlack100,
  boxShadow: 'none',
  position: 'relative',
  zIndex: 0,
}));

const Toolbar = styled(MuiToolbar)({
  height: '100%',
  padding: 0,
});

const useStyles = makeStyles(() => ({
  header: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: 'auto',
    paddingLeft: 21,
  },
  saveBtn: {
    textTransform: 'none',
  },
  topNavCuratorButton: {
    padding: 0,
  },
  primaryCuratorButton: {
    padding: 0,
    marginLeft: 28,
  },
  secondaryCuratorButton: {
    padding: 0,
    marginRight: 8,
  },
  userPanel: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  logoButton: {
    marginLeft: -8,
  },
}));

interface ICuratorMenuOptions {
  anchorEl: HTMLElement | null;
  curatorType: CuratorType | null;
  showAskForReview: boolean;
}

export default function NavBar(): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const {
    curationStatus,
    updateCurator,
  } = useCuration();
  const { analysisSet, primaryBiosample, demographics } = useAnalysisSet();
  const { patient, isReadOnly } = usePatient();
  const { currentUser, users } = useUser();

  const [pipelines, setPipelines] = useState<IPipeline[]>();
  const [anchorElProfile, setAnchorElProfile] = useState<HTMLElement | null>(null);
  const [curatorMenuOptions, setCuratorMenuOptions] = useState<ICuratorMenuOptions>({
    anchorEl: null,
    curatorType: null,
    showAskForReview: false,
  });

  const canView = useIsUserAuthorised('curation.sample.read');
  const canEdit = useIsUserAuthorised('curation.sample.write')
    && !isReadOnly;

  const isGermlineOnly = analysisSet.cohort === 'Cohort 13: Germline only';
  const isTSO = primaryBiosample?.sampleType === 'panel';

  const handleCloseCuratorMenu = (): void => {
    setCuratorMenuOptions({
      anchorEl: null,
      curatorType: null,
      showAskForReview: false,
    });
  };

  function handleCuratorClick(curatorType: CuratorType) {
    return function handleEvent(event: React.MouseEvent<HTMLButtonElement>) {
      const showAskForReview = (
        analysisSet.secondaryCurationStatus === 'Not Started'
        && currentUser?.id !== analysisSet.secondaryCuratorId
        && curationStatus?.status === 'In Progress'
        && Boolean(analysisSet.secondaryCuratorId)
        && curatorType === 'Secondary'
      );
      setCuratorMenuOptions({
        anchorEl: event.currentTarget,
        curatorType,
        showAskForReview,
      });
    };
  }

  const handleUpdateCurator = async (
    curator: IUser | null,
  ): Promise<void> => {
    if (curatorMenuOptions.curatorType) {
      handleCloseCuratorMenu();
      await updateCurator(curatorMenuOptions.curatorType, curator);
    }
  };

  const getStatusChips = (): ReactNode => {
    const chips: ReactNode[] = [];
    if (curationStatus) {
      chips.push(
        <CustomChip
          label={curationStatus.chipProps?.status?.toUpperCase()}
          backgroundColour={corePalette.white}
          colour={
              curationStatus.status === 'Failed'
                ? corePalette.red200
                : corePalette.offBlack100
            }
          border={`1px solid ${
            curationStatus.status === 'Failed'
              ? corePalette.red200
              : corePalette.offBlack100
          }`}
        />,
      );
    }
    if (
      curationStatus?.status === 'In Pipeline'
      && pipelines
      && pipelines.length > 0
    ) {
      chips.push(
        <CustomChip
          label={dayjs(pipelines[0].runDate).format('DD/MM/YYYY')}
          backgroundColour={corePalette.white}
          colour={corePalette.offBlack100}
          border={`1px solid ${corePalette.offBlack100}`}
          tooltipText={(
            pipelines.map((pipeline) => (
              <Box display="flex" flexDirection="column">
                {`${pipeline.pipelineName}: ${pipeline.taskStatus}`}
              </Box>
            ))
          )}
        />,
      );
    }
    return chips;
  };

  const filterCuratorOptions = (curator: IUser): boolean => (
    curator.id !== analysisSet.primaryCuratorId
    && curator.id !== analysisSet.secondaryCuratorId
  );

  useEffect(() => {
    if (
      analysisSet.curationStatus === 'In Pipeline'
      && analysisSet.biosamples?.length
    ) {
      zeroDashSdk.curation.biosamples.getPipelines(
        {
          biosamples: analysisSet.biosamples.map((b) => b.biosampleId),
        },
      )
        .then((resp) => {
          resp.sort((a, b) => dayjs(a.runDate).diff(dayjs(b.runDate)));
          setPipelines(resp);
        });
    } else {
      setPipelines(undefined);
    }
  }, [analysisSet.biosamples, analysisSet.curationStatus, zeroDashSdk.curation.biosamples]);

  return (
    <AppBar>
      <Toolbar disableGutters>
        <Link to="/">
          <ZeroLogoWithRec />
        </Link>
        <Box className={classes.header}>
          <Box display="flex" alignItems="center" gap="10px">
            <CustomTypography variant="titleRegular" fontWeight="medium">
              Patient ID:
              &nbsp;
              {patient?.patientId}
            </CustomTypography>
            {analysisSet.vitalStatus && (
              <Gender vitalStatus={analysisSet.vitalStatus} gender={analysisSet.gender} />
            )}
            {isTSO && (
              <CustomChip
                label="TSO500"
                backgroundColour={corePalette.magenta10}
                colour={corePalette.magenta200}
              />
            )}
            {isGermlineOnly && (
              <CustomChip
                label="Germline Only"
                backgroundColour={corePalette.orange10}
                colour={corePalette.orange200}
              />
            )}
          </Box>
          <Box display="flex" alignItems="center" flexWrap="wrap" gap="10px">
            <CustomTypography variant="bodyRegular" truncate>
              {mapEvent(analysisSet.sequencedEvent, true)}
            </CustomTypography>
            <Box display="flex" gap="4px">
              {getStatusChips()}
              {analysisSet.genePanel && (
                <Tooltip
                  title={`Gene panel: ${analysisSet.genePanel}`}
                >
                  <CustomChip
                    style={{ maxWidth: '115px' }}
                    label={analysisSet.genePanel}
                    backgroundColour={corePalette.white}
                    colour={corePalette.offBlack100}
                    border={`1px solid ${corePalette.offBlack100}`}
                  />
                </Tooltip>
              )}
              {demographics && (
                <GermlineConsentChip germlineConsent={demographics} />
              )}
            </Box>
          </Box>
        </Box>
        <IconButton
          onClick={(e): void => setAnchorElProfile(e.currentTarget)}
          sx={{ marginRight: '16px' }}
        >
          <SettingsIcon />
        </IconButton>
        {canView && (
          <FlagCorrections />
        )}
        <Notifications />
        <Box className={classes.userPanel}>
          <IconButton
            className={classes.primaryCuratorButton}
            disabled={!canEdit}
            onClick={handleCuratorClick('Primary')}
          >
            <AvatarWithBadge
              key={analysisSet.primaryCuratorId}
              user={users.find((u) => u.id === analysisSet.primaryCuratorId)}
              badgeText="1"
            />
          </IconButton>

          <Box>
            <IconButton
              className={classes.secondaryCuratorButton}
              onClick={handleCuratorClick('Secondary')}
              disabled={!canEdit}
            >
              <AvatarWithBadge
                key={analysisSet.secondaryCuratorId}
                user={users.find((u) => u.id === analysisSet.secondaryCuratorId)}
                badgeText="2"
                status={getSecCuratorAvatarStatus(analysisSet.secondaryCurationStatus)}
              />
            </IconButton>
          </Box>
        </Box>
        <Settings
          anchorEl={anchorElProfile}
          setAnchorEl={setAnchorElProfile}
        />
        <UsersMenu
          anchorEl={curatorMenuOptions.anchorEl}
          onClose={handleCloseCuratorMenu}
          handleUserSelect={handleUpdateCurator}
          group="Curators"
          customFilterFn={filterCuratorOptions}
          additionalItems={(
            <MenuItem disabled>
              <CustomTypography variant="bodySmall">
                {(curatorMenuOptions.curatorType === 'Primary' && !analysisSet.primaryCuratorId)
                  || (curatorMenuOptions.curatorType === 'Secondary' && !analysisSet.secondaryCuratorId)
                  ? 'Assign'
                  : 'Reassign'}
                &nbsp;
                {curatorMenuOptions.curatorType}
              </CustomTypography>
            </MenuItem>
          )}
        />
        <CurationProgressButton />
      </Toolbar>
    </AppBar>
  );
}
