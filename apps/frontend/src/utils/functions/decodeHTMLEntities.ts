// convert charactes like &#xe9; to the actual character é
export function decodeHTMLEntities (str: string) {
  const element = document.createElement('div');
  if (str) {
    // strip script/html tags
    str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
    str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
    // render the string
    element.innerHTML = str;
    // get the plain text from the element
    str = element.textContent || '';
  }
  // remove the element so that it does not create any overhead
  element.remove();
  return str;
}
