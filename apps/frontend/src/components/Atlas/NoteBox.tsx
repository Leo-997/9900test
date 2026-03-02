import styled from '@emotion/styled';
import { Box, alpha } from '@mui/material';
import { useState, type JSX } from 'react';
import { corePalette } from '@/themes/colours';
import CustomButton from '../Common/Button';
import { RichTextEditor } from '../Input/RichTextEditor/RichTextEditor';

const StyledBox = styled(Box)({
  position: 'relative',
  padding: '16px 0 0 0',
  display: 'flex',
  flexDirection: 'column',
  '& .rich-text-editor': {
    height: '100%',
  },
});

const ButtonBar = styled(Box)({
  width: 'calc(100% - 2px)',
  margin: '0px 1px',
  padding: '16px',
  display: 'flex',
  justifyContent: 'flex-end',
  position: 'absolute',
  borderRadius: '0 0 8px 8px',
  bottom: 0,
  left: 0,
  alignItems: 'center',
  backgroundColor: alpha(corePalette.white, 0.95),
  gap: '8px',
  boxShadow: `0 -5px 15px -3px  ${alpha(corePalette.offBlack100, 0.08)}`,
});

const EditBox = styled(Box)({
  position: 'absolute',
  bottom: 16,
  right: 16,
});

interface IProps {
  note: string;
  onUpdate: (note: string) => void;
  canEdit: boolean;
  containerHeight?: string;
  editorHeightReadOnly?: string;
  editorHeightEdit?: string;
}

export default function NoteBox({
  note,
  onUpdate,
  canEdit,
  containerHeight = 'calc(100vh - 333px)',
  editorHeightReadOnly = 'calc(100vh - 348px)',
  editorHeightEdit = 'calc(100vh - 385px)',
}: IProps): JSX.Element {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [rteValue, setRTEValue] = useState<string>(note || '');

  return (
    <StyledBox height={containerHeight}>
      <Box
        display="flex"
        height="100%"
        sx={{
          '& .editor': {
            height: isEdit ? editorHeightEdit : editorHeightReadOnly,
            backgroundColor: corePalette.white,
            padding: '16px',
            paddingBottom: '80px',
          },
        }}
      >
        <RichTextEditor
          mode={isEdit ? 'autoSave' : 'readOnly'}
          initialText={note || ''}
          placeholder="No notes yet..."
          classNames={{
            editor: 'editor',
          }}
          onChange={(newText): void => setRTEValue(newText)}
        />
      </Box>
      {!isEdit ? (
        <EditBox>
          <CustomButton
            label="Edit Content"
            variant="bold"
            onClick={(): void => setIsEdit(true)}
            disabled={!canEdit}
            sx={{
              boxShadow: `0px 7px 12px ${corePalette.grey50}`,
            }}
          />
        </EditBox>
      ) : (
        <ButtonBar>
          <CustomButton
            label="Cancel"
            variant="subtle"
            onClick={(): void => setIsEdit(false)}
          />
          <CustomButton
            label="Save"
            variant="bold"
            onClick={(): void => {
              onUpdate(rteValue);
              setIsEdit(false);
            }}
          />
        </ButtonBar>
      )}
    </StyledBox>
  );
}
