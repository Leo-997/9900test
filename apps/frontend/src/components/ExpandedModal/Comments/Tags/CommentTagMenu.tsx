import { Menu, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { TagIcon } from 'lucide-react';
import { CommonCommentTypes, ICommentTagOption } from '../../../../types/Comments/CommonComments.types';
import CustomTypography from '../../../Common/Typography';

import type { JSX } from "react";

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
}));

interface IProps<T extends string = CommonCommentTypes> {
  anchorEl: HTMLElement | null;
  handleSetTag: (tag: ICommentTagOption<T>) => void;
  handleClose: () => void;
  tagOptions: ICommentTagOption<T>[];
}

export function CommentTagMenu<T extends string = CommonCommentTypes>({
  anchorEl,
  handleSetTag,
  handleClose,
  tagOptions,
}: IProps<T>): JSX.Element {
  const classes = useStyles();

  const handleTagClick = (tag: ICommentTagOption<T>): void => {
    handleSetTag(tag);
    handleClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      disableAutoFocusItem
      disableRestoreFocus
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      MenuListProps={{ disablePadding: true }}
    >
      { tagOptions.map((tag) => (
        <MenuItem
          key={`comment-tag-${tag.value}`}
          onClick={(): void => handleTagClick(tag)}
          style={{
            paddingLeft: '16px',
            height: '48px',
          }}
        >
          <span
            style={{ backgroundColor: tag.backgroundColor }}
            className={classes.tagIconWrapper}
          >
            <TagIcon size={16} stroke={tag.color} />
          </span>
          <CustomTypography variant="bodyRegular">{tag.name}</CustomTypography>
        </MenuItem>
      ))}
    </Menu>
  );
}
