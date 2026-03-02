import clsx from 'clsx';
import { ReactNode, useRef, type JSX } from 'react';

import { Box, Grid, styled } from '@mui/material';

import { makeStyles } from '@mui/styles';
import LoadingAnimation from '../../Animations/LoadingAnimation';

import CustomTypography from '../../Common/Typography';
import { ScrollableSection } from '../../ScrollableSection/ScrollableSection';

interface IStyleProps {
  isLoading: boolean;
}

const Loading = styled(Box)<IStyleProps>(({ isLoading }) => ({
  margin: '0',
  textAlign: 'center',
  fontWeight: 'bold',
  height: isLoading ? '200px' : 'auto',
}));

const useStyles = makeStyles(() => ({
  listWrapper: {
    maxHeight: 'calc(100vh - 80px)',
    width: '100%',
    height: '100%',
    margin: 0,
    padding: '8px 0px',
  },
  hide: {
    display: 'none',
  },
}));

interface IProps<T> {
  isLoading: boolean;
  items?: T[];
  row?: (item: T) => ReactNode;
  className?: string;
}

export default function DataContentWrapper<T>({
  isLoading,
  items,
  row,
  className = '',
}: IProps<T>): JSX.Element {
  const classes = useStyles();
  const loader = useRef<HTMLDivElement>(null);

  return (
    <span style={{ padding: '0px 8px', width: '100%' }}>
      <ScrollableSection className={clsx(className || 'default', classes.listWrapper)}>
        {items?.map((item) => row && row(item))}

        {isLoading || !items || items?.length === 0 ? (
          <Loading isLoading={isLoading} ref={loader}>
            <Grid container justifyContent="center" alignItems="center" style={{}}>
              <Grid>
                {isLoading && (
                  <LoadingAnimation
                    msg={(
                      <>
                        <CustomTypography
                          variant="bodyRegular"
                          sx={{ marginBottom: '5px' }}
                        >
                          LOADING...
                        </CustomTypography>
                        <br />
                        <CustomTypography variant="bodyRegular">
                          Give us a moment. The data will be ready shortly.
                        </CustomTypography>
                      </>
                    )}
                  />
                )}
              </Grid>
            </Grid>
          </Loading>
        ) : (
          <div />
        )}
      </ScrollableSection>
    </span>
  );
}
