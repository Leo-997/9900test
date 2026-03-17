import {
  Box,
  styled,
} from '@mui/material';
import {
  JSX, useEffect, useState,
} from 'react';
import { corePalette } from '@/themes/colours';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import TumourClassifierNote from './TumourClassifierNote';
import LoadingAnimation from '@/components/Animations/LoadingAnimation';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';
import type { IClassifierVersion } from '@/types/Classifiers.types';

const Content = styled(ScrollableSection)({
  width: '100vw',
  height: 'calc(100vh - 129px)',
});

export default function TumourClassifiers(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const [classifiers, setClassifiers] = useState<IClassifierVersion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      zeroDashSdk.methylation.getClassifiers({
        showInAtlas: true,
      }),
      zeroDashSdk.rna.getClassifiers({
        showInAtlas: true,
      }),
    ])
      .then((cs) => {
        setClassifiers(cs.flat());
        setIsLoading(false);
      });
  }, [zeroDashSdk.methylation, zeroDashSdk.rna]);

  return (
    <Content>
      {isLoading ? (
        <Box height="calc(100vh - 129px)" alignItems="center">
          <LoadingAnimation />
        </Box>
      ) : (
        <Box
          padding="32px"
          bgcolor={corePalette.grey10}
          display="flex"
          flexDirection="column"
          gap="24px"
        >
          {classifiers.map((classifier) => (
            <TumourClassifierNote
              key={`${classifier.name}-${classifier.version}`}
              classifier={classifier}
            />
          ))}
        </Box>
      )}

    </Content>
  );
}
