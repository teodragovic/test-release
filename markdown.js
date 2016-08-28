'use strict';

var Bluebird = require('bluebird');

var DEFAULT_TYPE = 'other';
var TYPES = {
  chore: 'Chores',
  docs: 'Documentation Changes',
  feat: 'New Features',
  fix: 'Bug Fixes',
  other: 'Other Changes',
  refactor: 'Refactors',
  style: 'Code Style Changes',
  test: 'Tests'
};

/**
 * Generate the markdown for the changelog.
 * @param {Array<Object>} commits - array of parsed commit objects
 * @param {String} repoUrl - repo URL that will be used when linking commits
 * @returns {Promise<String>} the \n separated changelog string
 */
exports.markdown = function (commits, repoUrl) {
  var content = [];

  return Bluebird.resolve(commits)
  .bind({ types: {} })
  .each(function (commit) {
    var type = TYPES[commit.type] ? commit.type : DEFAULT_TYPE;
    var category = commit.category;

    this.types[type] = this.types[type] || {};
    this.types[type][category] = this.types[type][category] || [];

    this.types[type][category].push(commit);
  })
  .then(function () {
    return Object.keys(this.types).sort();
  })
  .each(function (type) {
    var types = this.types;

    content.push('##### ' + TYPES[type]);
    content.push('');

    Object.keys(this.types[type]).forEach(function (category) {
      var prefix = '*';
      var nested = types[type][category].length > 1;
      var categoryHeading = (category !== 'undefined') ? '* **' + category + ':**' : '*';

      if (nested) {
        content.push(categoryHeading);
        prefix = '  *';
      } else {
        prefix = categoryHeading;
      }

      types[type][category].forEach(function (commit) {
        var shorthash = commit.hash.substring(0, 8);

        if (repoUrl) {
          shorthash = '[' + shorthash + '](' + repoUrl + '/commit/' + commit.hash + ')';
        }

        content.push(prefix + ' ' + commit.subject + ' (' + shorthash + ')');
      });
    });

    content.push('');
  })
  .then(function () {
    content.push('');
    return content.join('\n');
  });
};
