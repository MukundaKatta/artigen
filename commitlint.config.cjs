/**
 * Commitlint config — conventional commits.
 *
 * Run on every commit via the husky 'commit-msg' hook (.husky/commit-msg).
 * See CONTRIBUTING.md for the accepted types and the full convention.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Accept these types. Defaults from config-conventional plus 'wip' for
    // in-flight commits that won't be squashed (rare).
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'refactor',
        'test',
        'docs',
        'perf',
        'style',
        'build',
        'ci',
        'revert',
        'wip',
      ],
    ],
    // Subject can be sentence-case (default is lower-case which is too strict
    // for "feat: New screen for X" style).
    'subject-case': [0],
    // Allow longer headers — our PR titles often need detail.
    'header-max-length': [1, 'always', 100],
  },
};
