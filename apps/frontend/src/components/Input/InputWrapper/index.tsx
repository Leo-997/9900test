import { ReactNode, type JSX } from 'react';
import Box from '@mui/material/Box';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import CustomTypography from '../../Common/Typography';

const useStyles = makeStyles(() => ({
  header: {
    marginBottom: '4px',
  },
  headerTooltip: {
    display: 'flex',
    alignItems: 'self-end',
    gap: '5px',
  },
}));

interface ISelectInputProps {
  headerTitle?: string | ReactNode;
  inputContainerClassName?: string;
  children: ReactNode;
  titleTooltip?: ReactNode;
}

function InputWrapper({
  headerTitle,
  inputContainerClassName,
  children,
  titleTooltip,
}: ISelectInputProps): JSX.Element {
  const classes = useStyles({titleTooltip});
  return (
    <Box
      display="flex"
      className={inputContainerClassName}
      flexDirection="column"
    >
      {headerTitle && (
        <div
          className={clsx(
            classes.header,
            titleTooltip && classes.headerTooltip,
          )}
        >
          <CustomTypography variant="label">{headerTitle}</CustomTypography>
          {titleTooltip}
        </div>
      )}
      {children}
    </Box>
  );
}

export default InputWrapper;
