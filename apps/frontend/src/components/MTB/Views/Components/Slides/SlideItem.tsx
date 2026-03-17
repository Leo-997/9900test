import CustomChip from '@/components/Common/Chip';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import {
  Box,
  IconButton as MuiIconButton,
  styled,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  ChevronLeftIcon, ChevronRightIcon, EllipsisVerticalIcon, EyeOffIcon, PlusIcon,
} from 'lucide-react';
import { useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { IMolecularAlterationDetail } from '../../../../../types/MTB/MolecularAlteration.types';
import { ISlide } from '../../../../../types/MTB/Slide.types';
import SlideMolecularAlterationChip from '../../../../Chips/SlideMolecularAlterationChip';
import CustomTypography from '../../../../Common/Typography';
import SlideMenu from './SlideMenu';

const IconButton = styled(MuiIconButton)({
  width: '32px',
  height: '32px',
  padding: '8px',
  position: 'absolute',
  top: '8px',
  transition: 'all 0.5s cubic-bezier(.19,1,.22,1)',
});

interface IStyleProps {
  data?: ISlide;
}

const Root = styled(Box)<IStyleProps>(({
  theme,
  data,
}) => {
  let backgroundColor = theme.colours.core.offBlack200;
  if (data) backgroundColor = theme.colours.core.white;

  return {
    width: '336px',
    height: '280px',
    position: 'relative',
    borderRadius: '8px',
    backgroundColor,
    border: data ? 'none' : `1px dashed ${theme.colours.core.white}`,
    padding: '40px',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: data ? 'flex-start' : 'center',
    alignItems: data ? 'flex-start' : 'center',
    transition: 'margin-right cubic-bezier(.19,1,.22,1) 1s',

    '&:hover': {
    // eslint-disable-next-line @typescript-eslint/naming-convention
      '& #hide-button': {
        visibility: 'visible',
        opacity: 1,
      },
    },
  };
});

const useStyles = makeStyles(() => ({
  cursorPointer: {
    cursor: 'pointer',
  },
  cursorGrab: {
    cursor: 'grab',
  },
  cursorGrabbing: {
    cursor: 'grabbing',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  indexIcon: {
    width: '24px',
    height: '24px',
    position: 'absolute',
    bottom: '8px',
    left: '50%',
    transform: 'translateX(-50%)',
    border: '1px solid #F3F5F7',
    borderRadius: '50%',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

interface IProps {
  data?: ISlide;
  index?: number;
  isLastItem?: boolean;
  onClick?: () => void;
  onSlideMove?: (dir: 'left' | 'right') => void;
}

export default function SlideItem({
  data,
  index,
  isLastItem = false,
  onClick,
  onSlideMove,
}: IProps): JSX.Element {
  const {
    setSlides,
    mtbBaseUrl,
    clinicalVersion,
    isReadOnly,
    isPresentationMode,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();
  const zeroDashSdk = useZeroDashSdk();

  const [isHidden, setIsHidden] = useState<boolean>(data?.hidden || false);
  const [menu, setMenu] = useState<HTMLElement | null>(null);

  const canViewSlide = useIsUserAuthorised('clinical.sample.read');
  const canEditSlide = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;

  const classes = useStyles({ data });

  const handleHideSlide = async (): Promise<void> => {
    if (data) {
      await zeroDashSdk.mtb.slides.updateSlide(clinicalVersion.id, data.id, { hidden: !isHidden });
      setIsHidden((prev) => !prev);
      setSlides((prev) => prev.map((s) => ({
        ...s,
        hidden: s.id === data.id
          ? !isHidden
          : s.hidden,
      })));
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <Root
      data={data}
      onClick={onClick}
    >
      {data ? (
        <>
          <CustomTypography variant="h5" truncate style={{ marginTop: '4px' }}>
            {canViewSlide ? (
              <Link
                className={classes.link}
                to={`/${mtbBaseUrl}/${data.id}`}
              >
                {data.title || 'Untitled slide'}
              </Link>
            ) : (
              data.title || 'Untitled slide'
            )}
          </CustomTypography>
          {data.alterations && (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="flex-start"
              marginTop="auto"
              width="100%"
            >
              <CustomTypography variant="label">MOLECULAR ALTERATIONS</CustomTypography>
              <Box
                display="flex"
                flexDirection="row"
                flexWrap="wrap"
                justifyContent="flex-start"
                alignItems="center"
                width="100%"
              >
                {data.alterations.length > 3 ? (
                  <>
                    {data.alterations
                      .slice(0, 3)
                      .map((a: IMolecularAlterationDetail) => (
                        <SlideMolecularAlterationChip
                          key={a.id}
                          data={a}
                        />
                      ))}
                    <CustomChip
                      label={(
                        <CustomTypography
                          variant="bodyRegular"
                          tooltipText={data.alterations
                            .slice(3, data.alterations.length)
                            .map((a) => a.gene || a.alteration)
                            .join(', ')}
                        >
                          +
                          {data.alterations.length - 3}
                          {' '}
                          more
                        </CustomTypography>
                      )}
                      sx={{
                        height: '36px',
                        margin: '8px 8px 0 0',
                        borderRadius: '8px',
                        border: `1px solid ${corePalette.grey30}`,
                        backgroundColor: corePalette.grey10,
                      }}
                    />
                  </>
                ) : (
                  data.alterations.map((a: IMolecularAlterationDetail) => (
                    <SlideMolecularAlterationChip
                      key={a.id}
                      data={a}
                    />
                  ))
                )}
              </Box>
            </Box>
          )}
          {!isPresentationMode && (
            <IconButton
              onClick={(e): void => setMenu(e.currentTarget)}
              sx={{ right: '8px' }}
            >
              <EllipsisVerticalIcon />
            </IconButton>
          )}
          <Box className={classes.indexIcon}>
            <CustomTypography
              fontWeight="bold"
              sx={{ fontSize: '12px', color: corePalette.grey100 }}
            >
              {index !== undefined && (index + 1)}
            </CustomTypography>
          </Box>
          {canEditSlide && !isPresentationMode && (
            <Tooltip
              title={`${isHidden ? 'Display' : 'Hide'} slide in presentation mode`}
              placement="top"
            >
              <IconButton
                id="hide-button"
                onClick={handleHideSlide}
                sx={{
                  color: corePalette.grey200,
                  left: '8px',
                  opacity: isHidden ? 1 : 0,
                  visibility: isHidden ? 'visible' : 'hidden',
                }}
              >
                <EyeOffIcon />
              </IconButton>
            </Tooltip>
          )}
          {index !== 0 && !isPresentationMode && canEditSlide && (
            <Tooltip title="Swap left">
              <IconButton
                sx={{
                  position: 'absolute',
                  // 36 is the height of the icon (32) + padding bewlow it (4)
                  top: 'calc(100% - 36px)',
                  left: '4px',
                }}
                onClick={(): void => onSlideMove?.('left')}
              >
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
          )}
          {!isLastItem && !isPresentationMode && canEditSlide && (
            <Tooltip title="Swap right">
              <IconButton
                sx={{
                  position: 'absolute',
                  // 36 is the height of the icon (32) + padding bewlow it (4)
                  top: 'calc(100% - 36px)',
                  right: '4px',
                }}
                onClick={(): void => onSlideMove?.('right')}
              >
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      ) : (
        <PlusIcon color={corePalette.white} />
      )}
      {data && (
        <SlideMenu
          data={data}
          anchorEl={menu}
          setAnchorEl={setMenu}
        />
      )}
    </Root>
  );
}
