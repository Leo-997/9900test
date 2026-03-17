import {
    Box,
    Grid,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { ReactNode, useEffect, useRef, useState, type JSX } from 'react';
import useFetch from '../../api/useFetch';
import LoadingAnimation from '../Animations/LoadingAnimation';
import CustomTypography from '../Common/Typography';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';

const useStyles = makeStyles(() => ({
  listWrapper: {
    maxHeight: 'calc(100vh - 210px)',
    width: '100%',
    position: 'relative',
  },
  loading: {
    margin: '0',
    textAlign: 'center',
    fontWeight: 'bold',
    position: 'sticky',
    left: 0,
  },
  hide: {
    display: 'none',
  },
  scrollBar: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .simplebar-scrollbar': {
      top: 53,
    },
  },
}));

interface IProps<T> {
  fetch: (page: number, limit: number) => Promise<T[]>;
  mapping: (
    data: T,
    key: number,
    update?: (value: T) => void,
  ) => ReactNode;
  beforeMappingContent?: ReactNode;
  customEmptyContent?: ReactNode;
  className?: string;
  updateCount?: (count: number) => void;
  loadOnce?: boolean;
  parentLoading?: boolean;
}

export default function TabContentWrapper<T>({
  fetch,
  mapping,
  beforeMappingContent,
  customEmptyContent,
  className = 'default',
  updateCount,
  loadOnce,
  parentLoading = false,
}: IProps<T>): JSX.Element {
  const classes = useStyles();

  const [page, setPage] = useState<number>(0);
  const [empty, setEmpty] = useState<boolean>(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const loader = useRef<HTMLDivElement>(null);
  const id = useRef<string>(`wrapper-${Date.now()}`);

  const {
    loading, error, list, setList,
  } = useFetch(
    fetch,
    page,
    setPage,
    setEmpty,
  );

  useEffect(() => {
    if (updateCount !== undefined) {
      updateCount(list.length);
    }
  }, [list, updateCount]);

  useEffect(() => {
    function handleObserver(entries: IntersectionObserverEntry[]): void {
      const target = entries[0];
      if (target.isIntersecting) {
        setPage((prev) => prev + 1);
      }
    }

    const options = {
      root: document.getElementById(id.current),
      rootMargin: '0px',
      threshold: 0,
    };

    if (page === 0) {
      if (observer.current !== null) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver(handleObserver, options);
      if (loader.current) {
        observer.current.observe(loader.current);
      }
    }
  }, [id, page]);

  return (
    <ScrollableSection
      key={id.current}
      className={clsx(classes.listWrapper, className || '')}
      styleClassOveride={beforeMappingContent ? clsx(classes.scrollBar) : undefined}
    >
      <Box display="flex" flexDirection="column" position="relative">
        {beforeMappingContent}
        {list.map(
          (item, key) => mapping(
            item,
            key,
            (newItem: typeof item) => {
              const newList = [...list];
              newList[key] = newItem;
              setList(newList);
            },
          ),
        )}
        {(loading || !loadOnce) && (
          <div
            className={classes.loading}
            ref={loader}
            style={{
              minHeight: '200px',
            }}
          >
            <Grid
              container
              justifyContent="center"
              style={{
                height: '100%',
                width: '100%',
              }}
            >
              <Grid size={12}>
                {empty && list.length === 0 && customEmptyContent && (
                  customEmptyContent
                )}
                {empty && !parentLoading && !customEmptyContent && (
                  <CustomTypography variant="bodySmall" fontWeight="bold">
                    No
                    {list.length ? ' more' : ''}
                    {' '}
                    data to load
                  </CustomTypography>
                )}
                {(loading || parentLoading) && (
                  <LoadingAnimation
                    msg={
                      list.length === 0 ? (
                        <>
                          <CustomTypography
                            variant="bodyRegular"
                            sx={{ marginBottom: '5px' }}
                          >
                            LOADING...
                          </CustomTypography>
                          <br />
                          <CustomTypography variant="bodyRegular">
                            Give us a moment. The data will be ready
                            shortly.
                          </CustomTypography>
                        </>
                      ) : (
                        <div />
                      )
                    }
                  />
                )}
                {error && <p>Error!</p>}
              </Grid>
            </Grid>
          </div>
        )}
      </Box>
    </ScrollableSection>
  );
}
