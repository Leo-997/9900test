import { useState, type JSX } from 'react';
import { Tooltip } from '@mui/material';
import { PauseCircleIcon, PlayCircleIcon } from 'lucide-react';
import { useClinical } from '../../../contexts/ClinicalContext';
import CustomButton from '../../Common/Button';

export default function PresentationModeButton(): JSX.Element {
  const {
    isPresentationMode,
    updatePresentationMode,
  } = useClinical();

  const [loading, setLoading] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const handleButtonClick = (): void => {
    setLoading(true);
    updatePresentationMode();
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <Tooltip
      title={`${isPresentationMode ? 'Disable' : 'Enable'} presentation mode`}
      placement="bottom"
      disableFocusListener
      disableHoverListener
      // using a controlled tooltip as there was weird behaviour when
      // setting the screen to full screen
      open={showTooltip}
    >
      <span
        onMouseEnter={(): void => setShowTooltip(true)}
        onMouseLeave={(): void => setShowTooltip(false)}
      >
        <CustomButton
          sx={{
            width: '32px',
            height: '32px',
          }}
          variant="bold"
          size="small"
          label={isPresentationMode ? <PauseCircleIcon /> : <PlayCircleIcon />}
          loading={loading}
          onClick={(): void => {
            handleButtonClick();
            setShowTooltip(false);
          }}
        />
      </span>
    </Tooltip>
  );
}
