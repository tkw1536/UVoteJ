var
    ldap = require('ldapjs'),
    fs = require("fs"),
    logger = require("winston");



/**
 * JUB Authentication class. Uses an LDAP server for authentication and users.json for user information.
 *
 * @param {object} config - Given configuration for authentication.
 * @param {Backend.Authentication~readyCallback} callback - Called once Authentication has been initalised.
 * @class
 * @alias Backend.Authentication.JUB
 * @augments Backend.Authentication
 * @this {JUB}
 */
function JUB(config, callback){
    this.config = config;

    this.userData = JSON.parse(fs.readFileSync(__dirname+"/../../../config/users.json"));
    logger.info("AUTH: Loaded", this.userData.length, "jub user(s) from config file. ");

    setTimeout(callback, 0);
}

/**
 * Provides information about interactive config.
 *
 * @type {Backend.Authentication.ConfigInfo[]}
 */
JUB.config = [
    ["url", "string", "Enter LDAP Server URL: "],
    ["dn", "string", "Enter Server DN: "],
    ["user_suffix", "string", "Enter User Suffixes: "],
    ["nameField", "string", "Dummy Configuration User Field: "]
];

/**
 * JUB configuration defaults.
 * @type {object}
*/
JUB.defaults = {
    /** Host to connect to.  */
    "url": "ldap://jacobs.jacobs-university.de:389",
    "user_suffix": "@jacobs.jacobs-university.de",
    "dn": "OU=Users,OU=CampusNet,DC=jacobs,DC=jacobs-university,DC=de",
    "nameField": "username"
}

/**
 * Makes a new ldap query.
 *
 * @param {sring} user - Username
 * @param {srting} pass - Password
 * @param {string} query - Query to search for.
 * @param {function} callback with success and result parameters.
 */
JUB.prototype.makeQuery = function(user, pass, query, callback){
    //self-reference
    var me = this;

    //check if we are empty already
    if(user == "" || pass == ""){
        setTimeout(function(){callback(false); }, 0);
        return;
    }

    //create a client
    var client = ldap.createClient({
        url: this.config.url
    });

    //options to set
    var opts = {
        filter: query,
        scope: 'sub'
    };

    //bind (login)
    client.bind(user+me.config.user_suffix, pass, function (err) {

        //login error => unbind & exit
        if(err){
            client.unbind(function(err2){
                callback(false, err);
            });
            return;
        }

        //search for query
        client.search(me.config.dn, opts, function (err, search) {
            var res = [];

            //found someone
            search.on('searchEntry', function (entry) {
                res.push(entry.object);
            });

            //return and exit
            search.on('end', function(){
                client.unbind(function(err){
                    callback(true, res);
                });
            });
        });
    });
};

/**
 * Authenticates a single user via JUB.
 *
 * @param {string} user - Username of user to login.
 * @param {string} pass - Password of user to login.
 * @param {Backend.Authentication~loginCallback} callback - Callback that handles the request.
 */
JUB.prototype.loginUser = function(user, pass, callback){

    var me = this;

    this.makeQuery(user, pass, "(sAMAccountName="+user+")", function(s, r){
        if(s){
            for(var i=0;i<me.userData.length;i++){
                if(me.userData[i][me.config.nameField] == user){
                    callback(true, me.userData[i]);
                    return;
                }
            }

            //we did not find the user
            callback(false);
            return;
        } else {
            callback(s, r);
        }
    });
}

/**
 * Lists all users via JUB.
 *
 * @param {string} key - Username of user to login.
 * @param {string} pass - Password of user to login.
 * @param {Backend.Authentication~listCallback} callback - Callback that handles the request.
 */
JUB.prototype.getAll = function(user, pass, callback){
    callback(true, this.userData);
}

module.exports = JUB;
