var sys = require('sys'),
    fs = require('fs'),

    FileLoader = require('./fileloader');

function JSONLoader (options) {
    FileLoader.apply(this, arguments);
}

sys.inherits(JSONLoader, FileLoader);

JSONLoader.prototype.parse = (function parse_json (callback, data) {
    JSON.parse(data, function post_json_parsed (err, object) {
        if (err)
            callback(err);
        else
            callback(err, object);
    });
});

module.exports = JSONLoader;
