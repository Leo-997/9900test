import { renderToStaticMarkup } from 'react-dom/server';

import type { JSX } from "react";

const convertSVGToDataURI = (svg: JSX.Element): string => {
  const markup = renderToStaticMarkup(svg);
  const encoded = encodeURIComponent(markup);
  const dataUri = `url('data:image/svg+xml;utf8,${encoded}')`;
  return dataUri;
};

export default convertSVGToDataURI;
