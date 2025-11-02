Prefer
======

[![CI](https://github.com/LimpidTech/prefer.js/workflows/CI/badge.svg)](https://github.com/LimpidTech/prefer.js/actions)
[![npm version](https://badge.fury.io/js/prefer.svg)](https://www.npmjs.com/package/prefer)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

A modern TypeScript/Node.js library for managing application configurations with support for multiple formats.

It provides a set of interfaces which provide standard methods for
reading arbitrary project configuration data. This can vary from simple cases
like JSON, to more complicated examples - such as retreiving configuration data
from a database.


How do I use it?
----------------

Firstly, you'll want to install the module. This can be done easily with `npm`.

    npm install prefer

Prefer is fairly simple to use. A basic use case might be that you have the
following JSON configuration in *settings.json*:

    {
      "auth": {
        "username": "user",
        "password": "pass"
      }
    }

You can load these settings with modern async/await:

```typescript
import prefer from 'prefer';

async function loadConfig() {
    const configurator = await prefer.load('settings');
    const username = await configurator.get('auth.username');
    console.log(username); // "user"
}
```

Or using promises:

```javascript
const prefer = require('prefer');

prefer.load('settings')
    .then(configurator => configurator.get('auth.username'))
    .then(username => console.log(username)); // "user"
```

Callbacks are also supported:

```javascript
const prefer = require('prefer');

prefer.load('settings', (err, configurator) => {
    if (err) throw err;
    
    configurator.get('auth.username', (err, value) => {
        if (err) throw err;
        console.log(value); // "user"
    });
});
```

You will notice that prefer only required 'settings' as the filename. It should
always be given without a path or extension, because prefer takes care of
looking through the filesystem for configuration files. On both Unix and
Windows systems, it will look in all of the standard folders, as well as some
conventional places where people like to put their configurations.

Ordering matters, so having a file in `./settings.json` as well as another in
`/etc/settings.json` is still reliable. The configuration in `./settings.json`
will be used first. Prefer doesn't care what format your user writes your
settings in, so they can also use `settings.yaml`, `settings.xml`,
`settings.cson`, or any other supported format.

If you prefer to look in specific places, you can pass an options object
as the second argument to prefer.load with the `files.searchPaths` setting:

```typescript
import prefer from 'prefer';

const options = {
    files: {
        searchPaths: ['./etc', '.']
    }
};

const configurator = await prefer.load('settings', options);
```


Supported configuration formats
-------------------------------

The following configuration formats are supported out of the box:

- **JSON** - Standard JSON format
- **JSON5** (.json5, .jsonc) - JSON with comments, trailing commas, and more
- **YAML** (.yml, .yaml) - YAML format
- **XML** - XML format
- **INI** - INI format

The library is fully extensible to support custom data sources and formats.


Why asynchronous?
-----------------

Prefer uses asynchronous APIs to support real-time, dynamic configuration updates
without blocking your application. This allows for:

- File watching and automatic configuration reloading
- Remote configuration sources
- Database-backed configurations
- Non-blocking application startup

## TypeScript Support

Prefer is written in TypeScript and includes full type definitions:

```typescript
import prefer, { Configurator, PreferOptions } from 'prefer';

const options: PreferOptions = {
    identifier: 'config',
    files: {
        searchPaths: ['./config', '/etc']
    }
};

const configurator: Configurator = await prefer.load(options);
const value: string = await configurator.get<string>('some.key');
```

## Requirements

- Node.js 16.0.0 or higher

## API Documentation

📚 **[View Full API Documentation](https://YOUR_USERNAME.github.io/prefer/)**

Generate locally:
```bash
npm run docs
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint

# Generate documentation
npm run docs
```

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **Automated Testing**: Tests run on Node.js 14, 16, 18, and 20
- **Code Quality**: ESLint and TypeScript checks on every commit
- **Security**: CodeQL analysis for vulnerability detection
- **Automated Releases**: Publish to NPM on GitHub releases

See [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) for detailed CI/CD documentation.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for guidelines.

## Migration from v0.5.x

See [MIGRATION.md](./MIGRATION.md) for details on migrating from the CoffeeScript version.
