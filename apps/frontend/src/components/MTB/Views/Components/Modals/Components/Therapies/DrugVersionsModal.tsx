import { IExternalDrug } from '@/types/Drugs/Drugs.types';
import {
  Box,
} from '@mui/material';
import { useCallback, useEffect, useState, type JSX } from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import LoadingAnimation from '@/components/Animations/LoadingAnimation';
import CustomModal from '@/components/Common/CustomModal';
import { makeStyles } from '@mui/styles';
import { DrugDetailGrid } from './DrugDetailGrid';
import DrugVersionListItem from './DrugVersionListItem';

const useStyles = makeStyles(() => ({
  leftPanel: {
    flex: '4',
    padding: '8px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  rightPanel: {
    flex: '6',
  },
}));

interface IProps {
  drug: IExternalDrug;
  open: boolean;
  onClose: () => void;
}

export default function DrugVersionsModal({
  drug,
  open,
  onClose,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [versions, setVersions] = useState<IExternalDrug[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchVersionsByDrugId = useCallback(
    async () => {
      const allVersions = await zeroDashSdk.services.drugs.getDrugs({
        ids: [drug.id],
        fetchAllVersions: true,
      });
      allVersions.sort((a, b) => b.version - a.version);
      setVersions(allVersions);
      setActiveIndex(allVersions.findIndex((version) => version.versionId === drug.versionId));
      setLoading(false);
    },
    [drug.id, drug.versionId, zeroDashSdk.services.drugs],
  );

  useEffect(() => {
    fetchVersionsByDrugId();
  }, [fetchVersionsByDrugId]);

  return (
    <CustomModal
      title={`All versions of ${drug.name}`}
      content={
        loading ? (
          <LoadingAnimation />
        ) : (
          <Box
            display="flex"
            flexDirection="row"
          >
            <Box className={classes.leftPanel}>
              {versions.map((version, index) => (
                <DrugVersionListItem
                  key={version.versionId}
                  isActive={index === activeIndex}
                  drug={version}
                  handleClick={(): void => setActiveIndex(index)}
                />
              ))}
            </Box>
            <Box className={classes.rightPanel}>
              <DrugDetailGrid drug={versions[activeIndex]} />
            </Box>
          </Box>
        )
      }
      open={open}
      variant="message"
      showActions={{ confirm: false, cancel: false }}
      onClose={onClose}
    />
  );
}
