'use strict';

var Bluebird = require('bluebird');
var CP       = Bluebird.promisifyAll(require('child_process'));

var SEPARATOR      = '===END===';
var COMMIT_PATTERN = /^(\w*)(\(([\w\$\.\-\* ]*)\))?\: (.*)$/;
var FORMAT         = '%H%n%s%n%b%n' + SEPARATOR;

/**
 * Get all commits between the last two tag (or from first commit if no tags or only single tag).
 * @returns {Promise<Array<Object>>} array of parsed commit objects
 */
exports.getCommits = function () {
  return CP.execAsync('git tag --sort=-refname')
  .catch(function () {
    return '';
  })
  .then(function (tag) {
    tag = tag.toString().trim().split('\n');
    var revisions = tag.length > 1 ? tag[1] + '..' + tag[0] : '';
    return CP.execAsync('git log -E --format=' + FORMAT + ' ' + revisions)
  })
  .catch(function () {
    throw new Error('no commits found');
  })
  .then(function (commits) {
    return commits.split('\n' + SEPARATOR + '\n');
  })
  .map(function (raw) {
    if (!raw) {
      return null;
    }

    var lines = raw.split('\n');
    var commit = {};

    commit.hash = lines.shift();
    commit.subject = lines.shift();
    commit.body = lines.join('\n');

    var parsed = commit.subject.match(COMMIT_PATTERN);

    if (!parsed || !parsed[1] || !parsed[4]) {
      return null;
    }

    commit.type = parsed[1].toLowerCase();
    commit.category = parsed[3];
    commit.subject = parsed[4];

    return commit;
  })
  .filter(function (commit) {
    return commit !== null;
  });
};
