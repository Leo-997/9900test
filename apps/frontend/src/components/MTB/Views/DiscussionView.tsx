import SlideHeader from './Components/Common/SlideHeader';
import SlideBase from './Components/Common/SlideBase';
import DiscussionSlide from './Components/Discussion/DiscussionSlide';

import type { JSX } from "react";

interface IProps {
  isPresentationMode: boolean;
  className?: string;
}

export default function DiscussionView({
  isPresentationMode,
  className,
}: IProps): JSX.Element {
  return (
    <SlideBase className={className}>
      <SlideHeader isPresentationMode={isPresentationMode} />
      <DiscussionSlide isPresentationMode={isPresentationMode} />
    </SlideBase>
  );
}
