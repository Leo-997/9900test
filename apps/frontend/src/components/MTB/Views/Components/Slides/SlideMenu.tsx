import CustomModal from '@/components/Common/CustomModal';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { Menu, MenuItem } from '@mui/material';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { ISlide } from '../../../../../types/MTB/Slide.types';

interface IProps {
  data: ISlide;
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
}

export default function SlideMenu({
  data,
  anchorEl,
  setAnchorEl,
}: IProps): JSX.Element {
  const navigate = useNavigate();
  const zeroDashSdk = useZeroDashSdk();
  const {
    slides,
    setSlides,
    clinicalVersion,
    mtbBaseUrl,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();

  const canViewSlide = useIsUserAuthorised('clinical.sample.read');
  const canEditSlide = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);

  const handleEdit = (): void => {
    if (data?.index !== undefined) {
      navigate(`/${mtbBaseUrl}/${data.id}`);
    }
    setAnchorEl(null);
  };

  const handleDelete = async (): Promise<void> => {
    // Remove slide from array
    let arr = slides.filter((s: ISlide) => s.id !== data.id);
    await zeroDashSdk.mtb.slides.deleteSlide(clinicalVersion.id, data.id);

    // Re-order slides
    arr = arr.map((s, i) => ({ ...s, index: i }));
    await zeroDashSdk.mtb.slides.updateSlideOrder(clinicalVersion.id, [
      ...arr.map((o) => ({
        id: o.id,
        index: o.index,
      })),
    ]);

    setSlides(arr);
    setAnchorEl(null);
  };

  return (
    <>
      <Menu
        id="slide-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={(): void => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        variant="menu"
      >
        <MenuItem
          onClick={handleEdit}
          disabled={!canViewSlide}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={(): void => {
            setAnchorEl(null);
            setDeleteConfirmOpen(true);
          }}
          style={{ color: '#DD0951' }}
          disabled={!canEditSlide}
        >
          Delete
        </MenuItem>
      </Menu>
      <CustomModal
        title="Delete slide"
        content={'Are you sure you want to delete this slide?\nThis action cannot be undone.'}
        open={deleteConfirmOpen}
        onClose={(): void => setDeleteConfirmOpen(false)}
        onConfirm={(): void => {
          handleDelete();
          setDeleteConfirmOpen(false);
        }}
        variant="alert"
        buttonText={{
          cancel: 'No, don\'t delete',
          confirm: 'Yes, delete',
        }}
      />
    </>
  );
}
