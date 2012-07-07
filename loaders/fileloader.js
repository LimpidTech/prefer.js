// TODO: Modify this to use caolan/async where possible.

/**
 * Maps text responses and their numeric values, so that we aren't passing
 * random integers to callbacks. Also, allows us to easily change integers
 * mapped to responses in case I'm not following the standard properly. :)
 */
var fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    Step = require('step'),
    winston = require('winston'),

    responses = {
        'success': 0
    },

    // TODO: Figure out how to add user home-directory configuration.
    default_options = {
        'files': {
            'search_paths': [
                './conf/',
                './',
                '/etc/'
            ]
        }
    };

/**
 * In environments with a HOME variables, add some user-level support, too!
 */
if (process.env.HOME)
{
    default_options.files.search_paths.splice(2, 0,
                                              process.env.HOME + '/.config/');

    default_options.files.search_paths.splice(3, 0,
                                              process.env.HOME + '/.');
}

/**
 * A basic loader, which finds a file in a prioritized list of path strings on
 * a first-come first-server basis.
 */
function FileLoader (options) {
    this.responses = responses;
    this.options = {};

    // Updates our configuration whenever called
    this.update_options(options);
}

FileLoader.prototype = {};

FileLoader.prototype.update_options = function update_options (options) {
    this.options = _.extend(default_options, this.options, options);
}

FileLoader.prototype.find = function (callback, filename) {
    var loader = this,
        search_data = {},
        search_result = undefined;

        /**
         * This function is used to verify that the search has completed.
         */
    var check_search_completed = (function check_search_completed () {
        var current_data, current_data_index,
            current_path, current_path_index;

        /**
         * If our search data is the same length as our search_paths array,
         * then we've exhausted all possibilities and the search has been
         * completed.
         */
        if (search_data.length == loader.options.files.search_paths.length)
            return true;

        /**
         * If we haven't exhausted all possibilities, but we have exhausted
         * all possibilities of lower priority than one that has already
         * been found - then the search has completed successfully.
         */
        for (current_path_index in loader.options.files.search_paths)
        {
            current_path = loader.options.files.search_paths[current_path_index];

            if (typeof search_data[current_path] == undefined)
            {
                return false;
            }

            // This evaluates to true only if it is defined AND set to true
            if (search_data[current_path])
            {
                search_result = current_path + filename;

                return true;
            }
        }

        return false;
    });

    var finalize_search = function finalize_search() {
        if (search_result == undefined)
        {
            throw {
                'type': 'file_not_found',
                'message': 'The requested file was not found in our paths.'
            };

            callback(responses.file_not_found);
        }

        callback(responses.success, search_result)
    }

    /**
     * After we have checked if a file exists or not, this will attempt to call
     * functions which decide whether the search is finished or not.
     */
    var check_found = function (path_string) {
        return (function check_found (result) {
            if (search_result) return;
    
            // This will evaluate to true if no error occured, otherwise false.
            search_data[path_string] = (result == true);

            if (check_search_completed() == true)
                finalize_search();
        });
    };

    /***
     * This function begins the actual process of finding our files.
     */
    (function find_file () {
        for (var index in loader.options.files.search_paths)
        {
            var path_string = loader.options.files.search_paths[index]
                check_found = check_found;

            fs.exists(path_string + filename, check_found(path_string));
        }
    })();
}

FileLoader.prototype.load = (function load_file (callback, filename) {
    var loader = this;

    this.find(function post_find_file (err, found_filename) {
        if (err)
        {
            throw err;
            return;
        }

        // Since a file was found, we'll read it's contents into 'data'.
        fs.readFile(found_filename, 'UTF-8', function read_file (err, data) {
            if (err)
            {
                throw err;
                return;
            }

            loader.parse(callback, data);
        });
    }, filename);
})

FileLoader.prototype.parse = (function parse_file (callback, data) {
    callback({
        'type': 'indirection_required',
        'message': 'FileLoader can not be used directly. It is inherited by ' +
                   'more specific loaders, such as JSONLoader - which ' +
                   'should implement a "parse" method.'
    });
})

module.exports = FileLoader
