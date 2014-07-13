var
    Authentication = require("./index.js"),
    fs = require('fs'),
    logger = require("winston");


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
    this.userData = JSON.parse(fs.readFileSync(__dirname+"/../../../config/users.json"));
    logger.info("AUTH: Loaded", this.userData.length, "dummy user(s) from config file. ");

    setTimeout(callback, 0);
}

/**
 * Provides information about interactive config.
 *
 * @type {Authentication.ConfigInfo[]}
 */
Dummy.config = [["nameField", "string", "Dummy Configuration User Field: "]];

/**
 * Dummy configuration defaults.
 * @type {object}
*/
Dummy.defaults = {
    "nameField": "name"
}

/**
 * Authenticates a single user.
 *
 * @param {string} user - Username of user to login.
 * @param {string} pass - Password of user to login.
 * @param {Authentication~loginCallback} callback - Callback that handles the request.
 */
Dummy.prototype.loginUser = function(user, pass, callback){
    for(var i=0;i<this.userData.length;i++){
        if(this.userData[i][this.config.nameField] == user){
            callback(true, this.userData[i]);
            return;
        }
    }

    //we did not find the user
    callback(false);
    return;
}

/**
 * Lists all users.
 *
 * @param {string} key - Username of user to login.
 * @param {string} pass - Password of user to login.
 * @param {Authentication~listCallback} callback - Callback that handles the request.
 */
Dummy.prototype.getAll = function(user, pass, callback){
    callback(true, this.userData);
}

module.exports = Dummy;
