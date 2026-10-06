export const changeTypes = [
  'feat',
  'fix',
  'docs',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];
const types = changeTypes.join('|');
const branchPattern = new RegExp(`^codex/(${types})/[a-z0-9]+(?:-[a-z0-9]+)*$`);
const subjectPattern = new RegExp(`^(${types})(?:\\([a-z][a-z0-9-]*\\))?(!)?: (\\S.*)$`);

export function assertBranch(branch) {
  if (branch.length > 100 || !branchPattern.test(branch))
    throw new Error('Use codex/<type>/<task-id>-<short-kebab-description> (100 characters max).');
  return branch;
}

export function assertCommit(message) {
  const text = message.replaceAll('\r\n', '\n').trimEnd();
  const [subject, second, ...body] = text.split('\n');
  const match = subjectPattern.exec(subject);
  if (!match || subject.length > 72 || subject.endsWith('.') || subject.trimEnd() !== subject)
    throw new Error(
      'Use type(scope): imperative description, max 72 characters, without a final period.',
    );
  if (second !== undefined && second !== '')
    throw new Error('Separate the commit body with a blank line.');
  if (match[2] && !body.some((line) => /^BREAKING CHANGE: \S/.test(line)))
    throw new Error('A breaking-change ! needs a BREAKING CHANGE: explanation in the body.');
  return subject;
}
