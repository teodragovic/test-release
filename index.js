'use strict';

var Github = require('github');
var path = require('path');
const Promise = require('bluebird');

var Git = require('./bin/git-log');
var md = require('./bin/markdown');

var config = require('/.config');

const pathTo = path.join.bind(null, process.cwd());

var pkg = require('./package.json');

var github = new Github({
    version: '3.0.0'
});

var auth = {
    type: 'oauth',
    token: config.GITHUB_TOKEN
};


github.authenticate(auth);

function getLogs() {
    return Git.getCommits()
        .then(data => md.markdown(data, pkg.repository.url));
}

function release(logs) {
    return new Promise((resolve, reject) =>
        github.repos.createRelease({
            user: getOwner(),
            repo: getRepo(),
            tag_name: 'v2.0.0',
            name: 'test',
            body: '* testing...'
        }, (err, resp) => {
            if (err) reject(err)
            resolve(resp);
        })
    );
}

function uploadAsset(id) {
    return new Promise((resolve, reject) =>
        github.repos.uploadAsset({
            user: getOwner(),
            repo: getRepo(),
            id: id,
            filePath: getFilePath(),
            name: getAssetName()
        }, (err, resp) => {
            if (err) reject(err);
            resolve(resp);
        })
    );
}

function makeRelease() {

    getLogs()
        .then(data => release(data))
        .then(release => uploadAsset(release.id))
        .catch(err => console.log('wild error appears', err));

}

makeRelease();

function getVersion() {
    return 'v' + pkg.version;
}

function getRepo() {
    var url = pkg.repository.url;
    var repo = url.match(/github\.com:?\/?([\w-]+)\/([\w-]+)/);
    return repo[2];
}

function getOwner() {
    var url = pkg.repository.url;
    var repo = url.match(/github\.com:?\/?([\w-]+)\/([\w-]+)/);
    return repo[1];
}

function getAssetName() {
    return pkg.name + '-' + pkg.version + '.zip';
}

function getFilePath() {
    return pathTo('assets', 'test.zip');
}
