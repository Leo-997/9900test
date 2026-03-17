import React, { type JSX } from 'react';
import { cn } from '@udecode/cn';
import { CreateHOCOptions, ParagraphPlugin } from '@udecode/plate/react';
import {
  type PlaceholderProps,
  createNodeHOC,
  createNodesHOC,
  usePlaceholderState,
} from '@udecode/plate/react';
import { NodeComponent } from '@udecode/plate-core';

export const Placeholder = (props: PlaceholderProps): JSX.Element => {
  const { children, nodeProps, placeholder } = props;

  const { enabled } = usePlaceholderState(props);

  return React.Children.map(children, (child) => React.cloneElement(child, {
    className: child.props.className,
    nodeProps: {
      ...nodeProps,
      className: cn(
        enabled
            && 'before:absolute before:cursor-text before:opacity-30 before:content-[attr(placeholder)]',
      ),
      placeholder,
    },
  }));
};

export const withPlaceholder = createNodeHOC(Placeholder);
export const withPlaceholdersPrimitive = createNodesHOC(Placeholder);

export const withPlaceholders = (
  components: any,
  options?: CreateHOCOptions<PlaceholderProps> | CreateHOCOptions<PlaceholderProps>[],
): Record<string, NodeComponent> => withPlaceholdersPrimitive(
  components,
  options || [
    {
      key: ParagraphPlugin.key,
      placeholder: 'Type a paragraph',
      hideOnBlur: true,
      query: {
        maxLevel: 1,
      },
    },
  ],
);
