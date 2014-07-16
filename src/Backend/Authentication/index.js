/**
 * Creates a new Authentication Class. This class is supposed to be inherited by
 * custom Authentication modules.
 * This function is the constructor called once on startup. Should be used to
 * establish a connection.
 *
 * @param {object} config - Given configuration for authentication.
 * @param {Backend.Authentication~readyCallback} callback - Called once Authentication has been initalised.
 * @class
 * @abstract
 * @alias Backend.Authentication
 * @this {Backend.Authentication}
 */
function Authentication(config, callback){
    throw "Dummy config script only";
}

/**
 * Callback for initialisation
 *
 * @callback Backend.Authentication~readyCallback
 */

/**
 * Provides information about interactive config
 *
 * @abstract
 * @return {Backend.Authentication.ConfigInfo[]}
 */
Authentication.config = [];

/**
 * Configuration defaults.
 *
 * @abstract
 * @type {object}
*/
Authentication.defaults = {

};

/**
 * Configuration Information used by the interactive setup.
 *
 * @typedef {string[]} Authentication.ConfigInfo
 * @property {string} key - key of object to automatically configure.
 * @property {Backend.Authentication.configTypes} type - Configuration type.
 * @property {string} query - Query to ask the user with.
 */

/**
 * Available types for configuration.
 *
 * @enum {string}
 */
Authentication.configTypes = {
    /** String */
    STR:  "str",
    /** Integer */
    INT: "int",
    /** Positive Integer */
    INT_POSITIVE:  "int+",
    /** Float number */
    FLOAT: "float",
    /** Boolean */
    BOOL: "bool"
};

/**
 * Authenticates a single user.
 *
 * @abstract
 * @param {string} user - Username of user to login.
 * @param {string} pass - Password of user to login.
 * @param {Backend.Authentication~loginCallback} callback - Callback that handles the request.
 */
Authentication.prototype.loginUser = function(user, pass, callback){}

/**
 * Callback for login Attempts.
 *
 * @callback Backend.Authentication~loginCallback
 * @param {boolean} success - Indicates success of the login (attempt).
 * @param {object} user_info - JSON-style user information.
 */


/**
 * Lists all users.
 *
 * @abstract
 * @param {string} user - Username of user to login.
 * @param {string} pass - Password of user to login.
 * @param {Backend.Authentication~listCallback} callback - Callback that handles the request.
 */
Authentication.prototype.getAll = function(user, pass, callback){}

/**
 * Callback for login Attempts.
 *
 * @callback Backend.Authentication~listCallback
 * @param {boolean} success - Indicates success of the list request.
 * @param {object[]} user_info - Array of JSON-style user information.
 */

/**
 * List of available Authentications.
 * @type {string[]}
 * @static
 */
Authentication.available = ["dummy", "LDAP"];

module.exports = Authentication;
module.exports.dummy = require("./dummy.js");
module.exports.ldap = require("./ldap.js")
