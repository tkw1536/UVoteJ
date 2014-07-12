var
    Authentication = require("./index.js");


/**
 * LDAP Authentication class.
 *
 * @param {object} config - Given configuration for authentication.
 * @param {Authentication~readyCallback} callback - Called once Authentication has been initalised.
 * @class
 * @augments Authentication
 * @this {LDAP}
 */
function LDAP(config, callback){
    
}

/**
 * Authenticates a single user via LDAP.
 *
 * @param {string} user - Username of user to login.
 * @param {string} pass - Password of user to login.
 * @param {Authentication~loginCallback} callback - Callback that handles the request.
 */
LDAP.prototype.loginUser = function(user, pass, callback){
    //TODO: Authenticate via LDAP.
}

/**
 * Lists all users via LDAP.
 *
 * @param {Authentication~listCallback} callback - Callback that handles the request.
 */
LDAP.prototype.getAll = function(callback){
    //TODO: List all users
}

module.exports = LDAP;
