export function trimLine(line: string): string {
  const trimmedLine = line.trim();
  const numberPrefixRegex = new RegExp('^\\d\\S*');
  const numberSuffixRegex = new RegExp('\\S*\\d$');
  const deNumberedLine = trimmedLine.replace(numberPrefixRegex, '').replace(numberSuffixRegex, '');
  const deQuotedLine = deNumberedLine.replace('‘', "'").replace('’', "'");

  const newLine = deQuotedLine;
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
