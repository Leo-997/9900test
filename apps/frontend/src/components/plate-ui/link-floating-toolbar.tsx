import { cn } from '@udecode/cn';
import {
  flip,
  offset,
  UseVirtualFloatingOptions,
} from '@udecode/plate-floating/';
import {
  FloatingLinkUrlInput,
  LinkFloatingToolbarState,
  LinkOpenButton,
  useFloatingLinkEdit,
  useFloatingLinkEditState,
  useFloatingLinkInsert,
  useFloatingLinkInsertState,
} from '@udecode/plate-link/react';

import { Icons } from '@/components/plate-ui/Icons';

import { useFormInputProps } from '@udecode/plate/react';
import { CSSProperties, type JSX } from 'react';
import { buttonVariants } from './button';
import { inputVariants } from './input';
import { popoverVariants } from './popover';
import { Separator } from './separator';

const floatingOptions: UseVirtualFloatingOptions = {
  placement: 'bottom-start',
  middleware: [
    offset(12),
    flip({
      padding: 12,
      fallbackPlacements: ['bottom-end', 'top-start', 'top-end'],
    }),
  ],
};

export interface ILinkFloatingToolbarProps {
  state?: LinkFloatingToolbarState;
}

export function LinkFloatingToolbar({ state }: ILinkFloatingToolbarProps): JSX.Element | null {
  const insertState = useFloatingLinkInsertState({
    ...state,
    ...floatingOptions,
  });
  const {
    hidden,
    props: { style: insertStyle, ...insertProps },
    ref: insertRef,
    textInputProps,
  } = useFloatingLinkInsert(insertState);

  const editState = useFloatingLinkEditState({
    ...state,
    ...floatingOptions,
  });
  const {
    props: { style: editStyle, ...editProps},
    ref: editRef,
    editButtonProps,
    unlinkButtonProps,
  } = useFloatingLinkEdit(editState);
  const inputProps = useFormInputProps({
    preventDefaultOnEnterKeydown: true,
  });

  if (hidden) return null;

  const input = (
    <div className="flex w-[330px] flex-col" {...inputProps}>
      <div className="flex items-center">
        <div className="flex items-center pl-2 pr-1 text-muted-foreground">
          <Icons.link className="size-4" />
        </div>

        <FloatingLinkUrlInput
          className={inputVariants({ h: 'sm', variant: 'ghost' })}
          placeholder="Paste link"
          data-plate-focus
        />
      </div>
      <Separator className="my-1" />
      <div className="flex items-center">
        <div className="flex items-center pl-2 pr-1 text-muted-foreground">
          <Icons.text className="size-4" />
        </div>
        <input
          className={inputVariants({ h: 'sm', variant: 'ghost' })}
          placeholder="Text to display"
          data-plate-focus
          {...textInputProps}
        />
      </div>
    </div>
  );

  const editContent = editState.isEditing ? (
    input
  ) : (
    <div className="box-content flex items-center">
      <button
        className={buttonVariants({ size: 'sm', variant: 'ghost' })}
        type="button"
        {...editButtonProps}
      >
        Edit link
      </button>

      <Separator orientation="vertical" />

      <LinkOpenButton
        className={buttonVariants({
          size: 'icon',
          variant: 'ghost',
        })}
      >
        <Icons.externalLink width={18} />
      </LinkOpenButton>

      <Separator orientation="vertical" />

      <button
        className={buttonVariants({
          size: 'icon',
          variant: 'ghost',
        })}
        type="button"
        {...unlinkButtonProps}
      >
        <Icons.unlink width={18} />
      </button>
    </div>
  );

  return (
    <>
      <div
        ref={insertRef}
        className={cn(popoverVariants(), 'w-auto p-1')}
        {...insertProps}
        style={insertStyle  as CSSProperties}
      >
        {input}
      </div>

      <div
        ref={editRef}
        className={cn(popoverVariants(), 'w-auto p-1')}
        {...editProps}
        style={editStyle as CSSProperties}
      >
        {editContent}
      </div>
    </>
  );
}
