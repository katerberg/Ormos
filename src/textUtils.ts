export function trimLine(line: string): string {
  const trimmedLine = line.trim();
  const numberPrefixRegex = new RegExp('^\\d\\S*');
  const numberSuffixRegex = new RegExp('\\S*\\d$');
  const deNumberedLine = trimmedLine.replace(numberPrefixRegex, '').replace(numberSuffixRegex, '');
  const deQuotedLine = deNumberedLine.replace('‘', "'").replace('’', "'");
  const deParenthesizedLine = deQuotedLine.replace(/\([^)]*\)/, '');

  const newLine = deParenthesizedLine;
  if (newLine !== line) {
    return trimLine(newLine);
  }
  return newLine;
}

export function getLines(textBlock: string): string[] {
  return textBlock
    .split(/\n/)
    .map((t) => t.trim())
    .filter((t) => t);
}

/**
 * Returns a hash code from a string
 * @param  {String} str The string to hash.
 * @return {Number}    A 32bit integer
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + chr;
    // eslint-disable-next-line no-bitwise
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
