'use strict';

var Github = require('github');
var Q = require('q');
var path = require('path');
const Promise = require('bluebird');

var Git = require('generate-changelog/lib/git');
var md = require('./markdown');

const pathTo = path.join.bind(null, process.cwd());

var pkg = require('./package.json');

var github = new Github({
    version: '3.0.0'
});

var auth = {
    type: 'oauth',
    token: '264dbe2586a96bbbe2718f716197098b63857ec6'
};


github.authenticate(auth);

function release(logs) {
    return new Promise((resolve, reject) =>
        github.repos.createRelease({
            user: getOwner(),
            repo: getRepo(),
            tag_name: getVersion(),
            name: getVersion(),
            body: logs
        }, (err, resp) => {
            if (err) reject(err);
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
    .then(resp => console.log(resp));
    // izvuci release id i zovi upload asset

}

function getLogs() {
    return Git.getCommits()
        .then(data => md.markdown(data, pkg.repository.url);
}

/*function getReleaseId() {
    Q.nfcall(github.repos.getLatestRelease, {
        user: getOwner(),
        repo: getRepo()
    })
    .then(data => console.log(data))
    .catch(err => console.log(err));
}*/



function getVersion() {
    return pkg.version;
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

