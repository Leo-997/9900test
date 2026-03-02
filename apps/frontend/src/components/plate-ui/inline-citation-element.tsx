import { corePalette } from '@/themes/colours';
import { Link } from '@mui/material';
import { useFloatingCommentsContentState } from '@udecode/plate-comments/react';
import { ResizableProvider } from '@udecode/plate-resizable';
import {
  PlateElement,
  useEditorRef,
  useReadOnly,
  useSelected,
  withHOC,
  withRef,
} from '@udecode/plate/react';
import { useEffect, useMemo } from 'react';
import { useRTECitations } from './Contexts/RTECitationContext';
import { IInlineCitation } from './Plugins/inline-citation';

export const InlineCitationElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement, IInlineCitation>(({ ...props }, ref) => {
    const { children, element } = props;
    const isSelected = useSelected();
    const readOnly = useReadOnly();
    const { getCitation } = useRTECitations();
    const {
      activeCommentId,
    } = useFloatingCommentsContentState();

    const editor = useEditorRef();
    const { selection } = editor;

    const citation = useMemo(
      () => getCitation(element.evidenceId),
      [element.evidenceId, getCitation],
    );

    useEffect(() => {
      const onKeyDown = (event): void => {
        if (event.defaultPrevented) return;
        let handled = false;
        if (isSelected && !activeCommentId) {
          switch (event.key) {
            case 'Backspace':
            case 'Delete':
              editor.tf.delete({ at: selection?.anchor });
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
    }, [editor.tf, selection?.anchor, isSelected, activeCommentId]);

    return (
      <PlateElement
        asChild
        ref={ref}
        {...props}
      >
        <span
          contentEditable={false}
          style={{
            fontWeight: element.children[0].bold ? 'bold' : undefined,
            fontStyle: element.children[0].italic ? 'italic' : undefined,
            textDecoration: `${element.children[0].underline || citation?.link ? 'underline' : ''} ${element.children[0].strikethrough ? 'line-through' : ''}`,
            color: element.children[0].color as string,
            backgroundColor: element.children[0].backgroundColor as string,
            border: isSelected && !readOnly ? `1px solid ${corePalette.green150}` : undefined,
            padding: isSelected && !readOnly ? '4px' : undefined,
            borderRadius: '4px',
          }}
        >
          {children}
          {readOnly && citation?.link
            ? (
              <Link
                href={citation.link}
                target="_blank"
                color={corePalette.green150}
              >
                {element.citation}
              </Link>
            )
            : element.citation}
        </span>
      </PlateElement>
    );
  }),
);
