var path = require('path'),

    default_loaders = require('./loaders/defaults'),
    default_configurators = require('./configurators/defaults');

module.exports = {
    'load': function load_configuration(callback, identifier, _options)
    {
        var options = _options || {},
            loader_string, loader;

        options.loaders = options.loaders || default_loaders,
        options.configurators = options.configurators || default_configurators,

        loader_string = options.loaders[path.extname(identifier)];
        loader = new (resolve_module(loader_string))(options);

        loader.load(function load_configuration (err, context) {
            if (err) callback(err);

            var configurator_string = options.configurators[loader_string],
                ConfiguratorObj = resolve_module(configurator_string),
                configurator;

            configurator = new ConfiguratorObj(options, context);

            callback(0, configurator);
        }, identifier);
    }
}

/**
 * Basically, this allows us to import modules based on strings - like require.
 * However, the difference is that this adds a convention that ':' will separate
 * the module name from the name of an attribute that actually exists within a
 * module.
 *
 * So, if you resolve_module('some/module/here:SomeObject') - you will actually
 * get the SomeObject variable that is pulled from some/module/here.js. This
 * allows PreferJS to provide a lot of flexibility with it's configuration
 * loaders - while still providing a lot of flexibility in how other developers
 * want to set up their code.
 *
 * PreferJS chooses to directly export classes, but other developers might not.
 */
function resolve_module (identifier, attribute_separator) {
    attribute_separator = attribute_separator || ':';

    var contained_module,
        attribute_name,
        module_name = identifier,
        attribute_index = identifier.lastIndexOf(attribute_separator);

    if (attribute_index != -1)
    {
            attribute_name = identifier.slice(attribute_index+1)
            module_name = identifier.slice(0, attribute_index)
    }

    contained_module = require(module_name)

    if (typeof attribute_name != 'undefined')
            return contained_module[attribute_name]

    else
            return contained_module
}