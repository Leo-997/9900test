export type Plugins =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'text-colour'
  | 'text-bg'
  | 'list' // Accounts for ordered and unordered lists, as well as indent and outdent
  | 'table'
  | 'evidence'
  | 'inline-citation'
  | 'comment'
  // The following aren't on the toolbar explicitly, but are still plugins
  | 'mention'
  | 'drag'
  | 'link';
