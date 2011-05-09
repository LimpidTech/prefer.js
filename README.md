PreferJS
========

What is it?
-----------

Prefer is a Node.JS library for helping you manage application configurations.

It provides a set of interfaces which can be provide standard methods for
reading arbitrary project configuration data. This can vary from simple cases
like JSON, to more complicated examples - such as retreiving configuration data
from a database.

Prefer currently provides drivers for accessing settings from the following
sources in a driver-based manner:

- JSON

Why asyncronous?
----------------

A lot of configuration tools prefer to provide a blocking method of retrieving
a project's configuration, in order to supply a more-simple method of getting
the configuration. However, one goal of prefer is to make sure that we aren't
limited to specific use-cases - and some projects require real-time, dynamic
updating of their configuration. Prefer provides all of it's interfaces in an
asyncronous manner in order to provide that possibility without the requirement
that those actions are blocking.
