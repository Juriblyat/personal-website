/** Elements the layout primitives may render as. */
export type Tag =
  | 'div'
  | 'section'
  | 'article'
  | 'main'
  | 'header'
  | 'footer'
  | 'nav'
  | 'aside'
  | 'ul'
  | 'ol'
  | 'li';

/** A step on the spacing scale, i.e. var(--space-N). */
export type Gap = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
