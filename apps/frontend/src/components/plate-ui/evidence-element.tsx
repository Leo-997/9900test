import { cn, withRef } from '@udecode/cn';
import { useEditorRef, useSelected, withHOC } from '@udecode/plate/react';

import { corePalette } from '@/themes/colours';
import { isResource } from '@/types/Evidence/Evidences.types';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ResizableProvider } from '@udecode/plate-resizable';
import { useCallback, useEffect } from 'react';
import EvidenceTextCard from '../Evidence/EvidenceCard/EvidenceTextCard';
import { useRTEEvidence } from './Contexts/RTEEvidenceContext';
import { PlateElement } from './plate-element';

const useStyles = makeStyles(() => ({
  root: {
    boxSizing: 'border-box',
    padding: '8px',
    gap: '8px',
    width: '100%',
    border: '1px solid #F0F4F7',
    borderRadius: '8px',
    margin: '4px 0',
    position: 'relative',
  },
}));

export const EvidenceEmbedElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>(({ className, children, ...props }, ref) => {
    const classes = useStyles();
    const isSelected = useSelected();
    const {
      getEvidenceById,
      getUrl,
      hideEvidence,
      readonly,
    } = useRTEEvidence();
    const editor = useEditorRef();

    const evidence = getEvidenceById(props.element.evidenceId as string);

    const onDelete = useCallback((): void => {
      const thisEvidence = editor.api.node({
        at: editor,
        match: (node) => node.id === props.element.id,
      })?.[1];
      editor.tf.delete({
        at: thisEvidence,
      });
    }, [editor, props.element.id]);

    useEffect(() => {
      const onKeyDown = (event: KeyboardEvent): void => {
        if (event.defaultPrevented) return;
        let handled = false;
        if (isSelected) {
          switch (event.key) {
            case 'Backspace':
            case 'Delete':
              onDelete();
              handled = true;
              break;
            case 'ArrowDown':
            case 'ArrowRight':
              editor.tf.move({ reverse: false });
              handled = true;
              break;
            case 'ArrowUp':
            case 'ArrowLeft':
              editor.tf.move({ reverse: true });
              handled = true;
              break;
            case 'Enter':
            case 'Return':
              editor.tf.insertNode({
                type: 'p',
                children: [{ text: '' }],
              });
              handled = true;
              break;
            default:
              break;
          }
          if (handled) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      };

      document.addEventListener('keydown', onKeyDown);
      return (): void => {
        document.removeEventListener('keydown', onKeyDown);
      };
    }, [editor.tf, isSelected, onDelete]);

    return (
      <PlateElement
        ref={ref}
        className={cn('relative', className)}
        {...props}
      >
        {(!hideEvidence || evidence?.evidenceType === 'RESOURCE') && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            className={classes.root}
            style={{
              borderColor: isSelected && !readonly ? corePalette.green150 : undefined,
            }}
            contentEditable={false}
            {...props}
          >
            <EvidenceTextCard
              readonly={readonly}
              evidenceId={props.element.evidenceId as string}
              evidence={evidence}
              initialUrl={evidence && isResource(evidence) ? getUrl(evidence) : undefined}
              onDelete={onDelete}
            />
            {children}
          </Box>
        )}
      </PlateElement>
    );
  }),
);
