var util = require('util'),
    fs = require('fs'),

    FileLoader = require('./fileloader');

function JSONLoader (options) {
    FileLoader.apply(this, arguments);
}

util.inherits(JSONLoader, FileLoader);

JSONLoader.prototype.parse = (function parse_json (callback, data) {
    // TODO: Is this meant to be async?
    callback(0, JSON.parse(data));
});

module.exports = JSONLoader;
