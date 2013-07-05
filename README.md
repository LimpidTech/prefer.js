PreferJS
========

What is it?
-----------

Prefer is a Node.JS library for helping you manage application configurations.

It provides a set of interfaces which can be provide standard methods for
reading arbitrary project configuration data. This can vary from simple cases
like JSON, to more complicated examples - such as retreiving configuration data
from a database.

How do I use it?
----------------

Prefer.JS is fairly simple to use. A basic use case might be that you have the
following JSON configuration:

    {
      "auth": {
        "username": "user",
        "password": "pass"
      }
    }

You can load these settings simply with the following code:

    var prefer = require('prefer');

    // Get a Configurator object which we can use to retreive settings.
    prefer.load('settings.json', {}, function (err, configurator) {
      if (err !== null) { throw err; }

      configurator.get('auth.username', function (err, value) {
        // value will be set to "user" at this point.
      });
    })

You will notice that prefer only required 'settings.json'. It should always be
given in this way, because prefer takes care of looking through the filesystem
for configuration files. For instance, this specific case just looked in:

- ./etc/settings.json
- ./settings.json
- /home/username/.config/settings.json
- /home/username/settings.json
- /etc/settings.json

Ordering matters, so having the same file in `./settings.json` and in
`/etc/settings.json` is still reliable. The configuration in `./settings.json`
will be used first.

Why asyncronous?
----------------

A lot of configuration tools prefer to provide a blocking method of retrieving
a project's configuration, in order to supply a more-simple method of getting
the configuration. However, one goal of prefer is to make sure that we aren't
limited to specific use-cases - and some projects require real-time, dynamic
updating of their configuration. Prefer provides all of it's interfaces in an
asyncronous manner in order to provide that possibility without the requirement
that those actions are blocking.
