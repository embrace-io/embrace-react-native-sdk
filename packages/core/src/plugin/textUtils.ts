const hasMatch = (lines: string[], matcher: string) => {
  return lines.find(line => line.match(matcher));
};

const addAfter = (lines: string[], matcher: RegExp, toAdd: string) => {
  let match;
  let matchIndex = 0;
  for (let l = 0; l < lines.length; l++) {
    match = lines[l].match(matcher);
    if (match) {
      matchIndex = l;
      break;
    }
  }
  if (!match) {
    return false;
  }

  const whitespace = match[1];
  lines.splice(matchIndex + 1, 0, `${whitespace}${toAdd}`);

  return true;
};

export {hasMatch, addAfter};
