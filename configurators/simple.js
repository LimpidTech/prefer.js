var responses = {
    success: 0,
    does_not_exist: {
        type: 'does_not_exist',
        message: 'The requested setting does not exist.'
    }
};

/**
 * This is a general configurator which fits the need of all configurations
 * which don't change dynamically. This means that the entire configuration
 * should be able to remain in memory.
 *
 * This object is passed a context, which should contain all of the
 * variables for this particular configuration. If an attribute of the object
 * happens to be another object, you can get tranversed data by separating
 * each attribute from it's parent with a '.' character.
 */
function Configurator (options, context) {
    this.options = options;
    this.context = context;
}

Configurator.prototype = {};

Configurator.prototype.get = function get_setting (setting_name, default_val) {
    var setting_layers = setting_name.split('.'),
        current_node = this.context;

    while (setting_layers.length > 0)
    {
        var next_setting = setting_layers.shift(),
            next_node = current_node[next_setting];

        if (next_node)
            current_node = next_node;
        else
        {
            if (default_val)
                return default_val;

            throw responses.does_not_exist;
        }
    }

    return current_node;
}

//  TODO: Implement methods for writing back to the configuration.

module.exports = Configurator;
