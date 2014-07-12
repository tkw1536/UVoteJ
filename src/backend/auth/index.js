/**
 * Creates a new Authentication Class. This class is supposed to be inherited by
 * custom Authentication modules.
 * This function is the constructor called once on startup. Should be used to
 * establish a connection.
 *
 * @param {object} config - Given configuration for authentication.
 * @param {Authentication~readyCallback} callback - Called once Authentication has been initalised.
 * @class
 * @this {Authentication}
 */
function Authentication(config, callback){}

/**
 * Callback for initialisation
 *
 * @callback Authentication~readyCallback
 */

/**
 * Authenticates a single user.
 *
 * @abstract
 * @param {string} user - Username of user to login.
 * @param {string} pass - Password of user to login.
 * @param {Authentication~loginCallback} callback - Callback that handles the request.
 */
Authentication.prototype.loginUser = function(user, pass, callback){}

/**
 * Callback for login Attempts.
 *
 * @callback Authentication~loginCallback
 * @param {boolean} success - Indicates success of the login (attempt).
 * @param {object} user_info - JSON-style user information.
 */


/**
 * Lists all users.
 *
 * @abstract
 * @param {Authentication~listCallback} callback - Callback that handles the request.
 */
Authentication.prototype.getAll = function(callback){}

/**
 * Callback for login Attempts.
 *
 * @callback Authentication~listCallback
 * @param {boolean} success - Indicates success of the list request.
 * @param {object[]} user_info - Array of JSON-style user information.
 */

module.exports = Authentication;
