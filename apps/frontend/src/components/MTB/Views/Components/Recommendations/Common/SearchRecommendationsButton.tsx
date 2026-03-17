import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { SearchIcon } from 'lucide-react';
import { useState, type JSX } from 'react';
import CustomButton from '../../../../../Common/Button';
import MTBArchive from '../../../MTBArchive';

interface IProps {
  inReport?: boolean;
  onArchiveClose?: () => void;
  disabled?: boolean;
}

export default function SearchRecommendationsButton({
  inReport = false,
  onArchiveClose,
  disabled,
}: IProps): JSX.Element {
  const [archiveOpen, setArchiveOpen] = useState<boolean>(false);

  const canViewArchive = useIsUserAuthorised('clinical.sample.read');

  return (
    <>
      <CustomButton
        label="Search Recommendations"
        variant="outline"
        startIcon={<SearchIcon />}
        onClick={(): void => setArchiveOpen(true)}
        disabled={!canViewArchive || disabled}
      />
      {archiveOpen && (
        <MTBArchive
          open={archiveOpen}
          onClose={(): void => {
            if (onArchiveClose) onArchiveClose();
            setArchiveOpen(false);
          }}
          defaultTab="RECOMMENDATIONS"
          isReportArchive={inReport}
        />
      )}
    </>
  );
}
