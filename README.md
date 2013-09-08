What is it?
-----------

[![Build Status][bs]](https://travis-ci.org/LimpidTech/prefer)

Prefer is a node library for helping you manage application configurations.

It provides a set of interfaces which provide standard methods for
reading arbitrary project configuration data. This can vary from simple cases
like JSON, to more complicated examples - such as retreiving configuration data
from a database.

How do I use it?
----------------

Firstly, you'll want to install the module. This can be done easily with `npm`.

    npm install prefer

Prefer is fairly simple to use. A basic use case might be that you have the
following JSON configuration:

    {
      "auth": {
        "username": "user",
        "password": "pass"
      }
    }

You can load these settings simply with the following code:

    var prefer = require('prefer');

    // Get a Configurator object which we can use to retrieve settings.
    prefer.load('settings.json', function (err, configurator) {
      if (err !== null) { throw err; }

      configurator.get('auth.username', function (err, value) {
        // value will be set to "user" at this point.
      });
    });

You will notice that prefer only required 'settings.json'. It should always be
given in this way, because prefer takes care of looking through the filesystem
for configuration files. On both Unix and Windows systems, it will look in all
of the standard folders, as well as some conventional places where people like
to put their configurations.

Ordering matters, so having a file in `./settings.json` as well as another in
`/etc/settings.json` is still reliable. The configuration in `./settings.json`
will be used first.

If you prefer to look in specific places, you can always pass an options object
as the second argument to prefer.load, and provide it the `files.searchPaths`
setting as an array of locations for prefer to look in. Here's an example:

    var prefer = require('prefer'),
        options = {
            files: {
                searchPaths: ['./etc', '.']
            }
        };

    // Get a Configurator object which we can use to retrieve settings.
    prefer.load('settings.json', options, someFunction);

Supported configuration formats
-------------------------------

Along with being fully configurable to support any arbitrary data source you'd
like, the following types of data can immediately be used as configuration formats
upon installation of prefer:

- CoffeeScript
- INI
- JSON
- XML
- YAML

Why asyncronous?
----------------

A lot of configuration tools prefer to provide a blocking method of retrieving
a project's configuration, in order to supply a more-simple method of getting
the configuration. However, one goal of prefer is to make sure that we aren't
limited to specific use-cases - and some projects require real-time, dynamic
updating of their configuration. Prefer provides all of it's interfaces in an
asyncronous manner in order to provide that possibility without the requirement
that those actions are blocking.



[bs]: https://travis-ci.org/LimpidTech/prefer.png?branch=master "Build Status"
