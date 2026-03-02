import {
  Box, Card, CardMedia, Fade, styled,
} from '@mui/material';
import { ImageOffIcon } from 'lucide-react';
import { ReactElement, useEffect, useState, type JSX } from 'react';
import LoadingAnimation from '../Animations/LoadingAnimation';
import PlotCardHeader from './PlotCardHeader';
import PlotcardModal from './PlotcardModal';
import { PlotLegendItem } from './PlotInfoToolTip';

const MissingImage = styled(ImageOffIcon)(({ theme }) => ({
  transform: 'translate(-50%, -50%)',
  position: 'absolute',
  top: '50%',
  left: '50%',
  color: theme.colours.core.grey50,
}));

interface IPlotCardProps {
  title: string;
  url?: string;
  legendTitle: string;
  legendData: PlotLegendItem[]
}

export default function PlotCard({
  title,
  url,
  legendTitle,
  legendData,
}: IPlotCardProps): JSX.Element {
  const [plotOpen, setPlotOpen] = useState(false);
  const [image, setImage] = useState<ReactElement<any>>(
    <div style={{ height: '550px' }}>
      <LoadingAnimation />
    </div>,
  );

  useEffect(() => {
    if (url !== undefined) {
      const img = new Image();
      img.src = url;
      img.onload = (): void => {
        setImage(
          <img
            src={img.src}
            alt={title}
            width="100%"
          />,
        );
      };
      img.onerror = (): void => {
        setImage(
          <Box
            display="flex"
            justifyContent="center"
            paddingTop="50%"
          >
            <MissingImage
              size="30%"
            />
          </Box>,
        );
      };
    }
  }, [url, title]);

  // listeners
  const handleModalOpen = (): void => {
    setPlotOpen(true);
  };

  const handleModalClose = (): void => {
    setPlotOpen(false);
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '8px',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <PlotCardHeader
        title={title}
        url={url}
        legendTitle={legendTitle}
        legendData={legendData}
        openModal={handleModalOpen}
      />
      <CardMedia>
        <div style={{ position: 'relative' }}>
          {image ? (
            <Fade
              in={Boolean(image)}
              timeout={2000}
              easing="cubic-bezier(.19, 1, .22, 1)"
            >
              {image}
            </Fade>
          ) : (
            <div style={{ height: '550px' }}>
              <LoadingAnimation />
            </div>
          )}
        </div>
        <PlotcardModal
          url={url ? [url] : []}
          title={title}
          legendTitle={legendTitle}
          legendData={legendData}
          open={plotOpen}
          openModal={handleModalOpen}
          closeModal={handleModalClose}
        />
      </CardMedia>
    </Card>
  );
}
