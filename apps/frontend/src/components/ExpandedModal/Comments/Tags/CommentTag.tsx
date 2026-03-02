import {
  Box, ButtonBase, lighten, styled,
} from '@mui/material';
import TouchRippleBase, { TouchRippleActions, TouchRippleProps } from '@mui/material/ButtonBase/TouchRipple';
import { makeStyles } from '@mui/styles';
import { ChevronDownIcon, TagIcon } from 'lucide-react';
import {
  ForwardRefExoticComponent,
  JSX,
  RefAttributes,
  useEffect, useMemo, useRef, useState,
} from 'react';
import { corePalette } from '@/themes/colours';
import { germlineCommentTags, molecularCommentTags } from '@/constants/Curation/comments';
import { clinicalCommentTags } from '@/constants/Clinical/comments';
import { ICommentTagOption } from '../../../../types/Comments/CommonComments.types';
import { CurationCommentTypes } from '../../../../types/Comments/CurationComments.types';
import CustomTypography from '../../../Common/Typography';
import { CommentTagMenu } from './CommentTagMenu';

const TagButton = styled(ButtonBase)(({ color }) => ({
  minWidth: 0,
  height: '36px',
  padding: '0px 8px',
  transition: 'all 0.5s cubic-bezier(.19,1,.22,1)',
  '&:hover': {
    backgroundColor: color ? lighten(color, 0.9) : undefined,
  },
}));

const useStyles = makeStyles(() => ({
  tagIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  tagBtn: {
    minWidth: 0,
    height: '36px',
    padding: '0px 8px',
    transition: 'all 0.5s cubic-bezier(.19,1,.22,1)',
    '&:hover': {
      backgroundColor: corePalette.grey30,
    },
  },
}));

export interface IProps<T extends string = CurationCommentTypes> {
  commentType: T;
  isEdit: boolean;
  handleSetTag?: (tag: ICommentTagOption<T>) => void;
  tagOptions: ICommentTagOption<T>[];
}

const TouchRipple = TouchRippleBase as unknown as ForwardRefExoticComponent<
  TouchRippleProps & RefAttributes<TouchRippleActions>
>;

export default function CommentTag<T extends string = CurationCommentTypes>({
  commentType,
  isEdit,
  handleSetTag,
  tagOptions,
}: IProps<T>): JSX.Element {
  const classes = useStyles();

  const [tagMenuAnchorEl, setTagMenuAnchorEl] = useState<HTMLElement | null>(null);

  // The ref for the ripple component does not have a type from MUI
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rippleRef = useRef<any | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const tag = useMemo(() => (
    [
      ...molecularCommentTags,
      ...germlineCommentTags,
      ...clinicalCommentTags,
    ].find((t) => t.value === commentType)
  ), [commentType]);

  const tagInOptions = useMemo(() => (
    tagOptions.find((t) => t.value === commentType)
  ), [commentType, tagOptions]);

  useEffect(() => {
    const triggerRipple = (): void => {
      if (tagInOptions) {
        const rect = buttonRef.current?.getBoundingClientRect();
        rippleRef.current?.start(
          {
            clientX: (rect?.left || 0) + (rect?.width || 0) / 2,
            clientY: (rect?.top || 0) + (rect?.height || 0) / 2,
          },
          // when center is true, the ripple doesn't travel to the border of the container
          { center: false },
        );
        setTimeout(() => rippleRef.current.stop({}), 320);
      }
    };

    if (isEdit) {
      triggerRipple();
    }
  }, [isEdit, tagInOptions]);

  return tag ? (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
    >
      <TagButton
        ref={buttonRef}
        className={classes.tagBtn}
        onClick={(e): void => setTagMenuAnchorEl(e.currentTarget)}
        style={{ color: tag?.color, textTransform: 'none' }}
        disableRipple
        disabled={!isEdit || !handleSetTag || !tagInOptions}
        color={tag.color}
      >
        <span
          style={{ backgroundColor: tag?.backgroundColor }}
          className={classes.tagIconWrapper}
        >
          <TagIcon size={16} stroke={tag?.color} />
        </span>
        <CustomTypography
          variant="label"
          truncate
          style={{
            color: tag?.color,
            lineHeight: 1,
            fontSize: 12,
          }}
        >
          {tag?.name}
        </CustomTypography>
        <span>
          {isEdit && handleSetTag && tagInOptions ? (
            <ChevronDownIcon />
          ) : undefined}
        </span>
        <TouchRipple ref={rippleRef} center />
      </TagButton>
      {handleSetTag && (
        <CommentTagMenu
          anchorEl={tagMenuAnchorEl}
          handleClose={(): void => setTagMenuAnchorEl(null)}
          handleSetTag={handleSetTag}
          tagOptions={tagOptions}
        />
      )}
    </Box>
  ) : (
    <div />
  );
}
