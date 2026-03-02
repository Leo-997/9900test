import { makeStyles } from '@mui/styles';
import {
  ReactNode, useCallback, useEffect, useState, type JSX,
} from 'react';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { IDataFile } from '../../types/FileTracker/FileTracker.types';
import { IFileTrackerSearchOptions } from '../../types/Search.types';
import { createURLQuery } from '../../utils/files/createURLQuery';
import { getFTFilterFromQuery } from '../../utils/files/getFTFilterFromQuery';
import TabContentWrapper from '../PreCurationTabs/TabContentWrapper';
import { FileTrackerHeader } from './Components/FileTrackerHeader';
import { FileTrackerListItem } from './Components/FileTrackerListItem';
import FileTrackerSearchFilterBar from './Components/SearchFilterSort/FileTrackerSearchFilterBar';

const useStyles = makeStyles(() => ({
  root: {
    background: '#FFFFFF',
    height: '100%',
    width: '100%',
    maxWidth: '100%',
  },
}));

interface IFileTrackerTabContentProps {
  query: URLSearchParams;
}

export function FileTrackerTabContent({
  query,
}: IFileTrackerTabContentProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();

  const emptyOptions: IFileTrackerSearchOptions = {
    searchId: [],
    fileType: [],
    sampleType: [],
    refGenome: [],
    platform: [],
    fileSize: {
      min: 0,
      max: Infinity,
      defaults: [0, Infinity],
      unit: 'MB',
    },
    sortColumns: [],
    sortDirections: [],
  };
  const [fileFilters, setFileFilters] = useState<IFileTrackerSearchOptions>({
    ...emptyOptions,
    ...getFTFilterFromQuery(query),
  });

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getTotal(): Promise<void> {
      const mappedFilters = fileFilters
        ? zeroDashSdk.filetracker.mapFileTrackerFilters(fileFilters)
        : undefined;
      const total = await zeroDashSdk.filetracker.getAllFilesCount(
        {
          ...mappedFilters,
        },
      );
      setTotalCount(total);
    }
    getTotal();
  }, [fileFilters, zeroDashSdk.filetracker]);

  const fetchFiles = useCallback(
    async (page: number) => {
      async function fetchFilesFn(
        newPage: number,
        newLimit: number,
      ): Promise<IDataFile[]> {
        setLoading(true);
        const mappedFilters = fileFilters
          ? zeroDashSdk.filetracker.mapFileTrackerFilters(fileFilters)
          : undefined;
        const files = await zeroDashSdk.filetracker.getAllFiles(
          {
            ...mappedFilters,
          },
          newPage,
          newLimit,
        );
        return files;
      }
      const files = await fetchFilesFn(page, 20);
      setLoading(false);
      return files;
    },
    [fileFilters, zeroDashSdk.filetracker],
  );

  useEffect(() => {
    const currentURL = window.location.href;
    const newURL = fileFilters
      ? `${
        window.location.protocol
      }//${
        window.location.host
      }${window.location.pathname
      }?${
        createURLQuery(fileFilters)
      }`
      : currentURL;

    if (newURL !== currentURL) {
      window.history.pushState({ path: newURL }, '', newURL);
    }
  }, [fileFilters]);

  const mapping = (data: IDataFile, key: number): ReactNode => (
    <FileTrackerListItem
      key={key}
      data={data}
      selectedFiles={selectedFiles}
      setSelectedFiles={setSelectedFiles}
    />
  );

  return (
    <div className={classes.root}>
      <FileTrackerSearchFilterBar
        toggled={fileFilters || emptyOptions}
        setToggled={setFileFilters}
        emptyOptions={emptyOptions}
        selectedFiles={selectedFiles}
        counts={{ current: count, total: totalCount }}
        loading={loading}
      />
      <TabContentWrapper
        fetch={fetchFiles}
        updateCount={setCount}
        beforeMappingContent={<FileTrackerHeader />}
        mapping={mapping}
      />
    </div>
  );
}
