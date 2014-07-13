var
    Authentication = require("./index.js"),
    fs = require('fs');


/**
 * LDAP Authentication class. Uses an LDAP server for authentication.
 *
 * @param {object} config - Given configuration for authentication.
 * @param {Authentication~readyCallback} callback - Called once Authentication has been initalised.
 * @class
 * @augments Authentication
 * @this {Dummy}
 */
function Dummy(config, callback){
    this.config = config;
    this.userData = JSON.parse(fs.readFileSync(__dirname+"/../../config/users.json"));

    setTimeout(callback, 0);
}

/**
 * Provides information about interactive config.
 *
 * @type {Authentication.ConfigInfo[]}
 */
Dummy.config = [];

/**
 * Dummy configuration defaults.
 * @type {object}
*/
Dummy.defaults = {}

/**
 * Authenticates a single user.
 *
 * @param {string} user - Username of user to login.
 * @param {string} pass - Password of user to login.
 * @param {Authentication~loginCallback} callback - Callback that handles the request.
 */
Dummy.prototype.loginUser = function(user, pass, callback){
    if(this.userData.hasOwnProperty(user)){
        callback(true, this.userData[user])
    } else {
        callback(false);
    }
}

/**
 * Lists all users.
 *
 * @param {string} key - Username of user to login.
 * @param {string} pass - Password of user to login.
 * @param {Authentication~listCallback} callback - Callback that handles the request.
 */
Dummy.prototype.getAll = function(user, pass, callback){
    if(this.userData.hasOwnProperty(user)){
        callback(true, this.userData)
    } else {
        callback(false);
    }
}

module.exports = Dummy;
