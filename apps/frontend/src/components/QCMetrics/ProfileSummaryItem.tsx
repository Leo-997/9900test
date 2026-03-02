import { corePalette } from '@/themes/colours';
import {
  Box, styled, Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { InfoIcon } from 'lucide-react';
import { CSSProperties, ReactNode, type JSX } from 'react';
import CustomTypography from '../Common/Typography';

const Card = styled(Box)(() => ({
  height: '100%',
  width: '100%',
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: 'none',
  position: 'relative',
}));

const useStyles = makeStyles(() => ({
  icon: {
    position: 'absolute',
    left: 4,
    top: 4,
  },
}));

interface IProps {
  title: string;
  content: string;
  tooltip: string;
  titleIcon?: ReactNode;
  status?: 'success' | 'error' | 'warn';
  bottom?: ReactNode;
}

export default function ProfileSummaryItem({
  title,
  content,
  tooltip,
  titleIcon = null,
  status,
  bottom = null,
}: IProps): JSX.Element {
  const classes = useStyles();

  const getStyles = (): CSSProperties => {
    const styles = {
      neutral: {
        backgroundColor: corePalette.grey30,
        color: corePalette.offBlack200,
        border: 'none',
      },
      success: {
        backgroundColor: corePalette.green10,
        color: corePalette.green150,
        border: `1px solid ${corePalette.green150}`,
      },
      warn: {
        backgroundColor: corePalette.yellow10,
        color: corePalette.orange100,
        border: `1px solid ${corePalette.orange100}`,
      },
      error: {
        backgroundColor: corePalette.warmRed10,
        color: corePalette.red100,
        border: `1px solid ${corePalette.red100}`,
      },
    };
    return styles[status ?? 'neutral'];
  };

  return (
    <Card sx={{
      ...getStyles(),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
    }}
    >
      <Box display="flex" flexDirection="column" alignItems="center" gap="4px">
        <Box display="flex" justifyContent="center" alignItems="center" gap="8px">
          {titleIcon && (
          <div className={classes.icon}>
            {titleIcon}
          </div>
          )}
          <CustomTypography variant="label">{title}</CustomTypography>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" gap="8px">
          <CustomTypography variant="h2" fontWeight="bold">
            {content}
          </CustomTypography>
          {tooltip !== '' && content !== '-' ? (
            <Tooltip
              title={<span style={{ whiteSpace: 'pre-line' }}>{tooltip}</span>}
              placement="right"
            >
              <InfoIcon width="20px" height="20px" />
            </Tooltip>
          ) : (
            <div />
          )}
        </Box>
      </Box>
      {bottom}
    </Card>
  );
}
