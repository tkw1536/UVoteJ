var
    ldap = require('ldapjs');


/**
 * LDAP Authentication class. Uses an LDAP server for authentication.
 *
 * @param {object} config - Given configuration for authentication.
 * @param {Backend.Authentication~readyCallback} callback - Called once Authentication has been initalised.
 * @class
 * @alias Backend.Authentication.LDAP
 * @augments Backend.Authentication
 * @this {LDAP}
 */
function LDAP(config, callback){
    this.config = config;

    setTimeout(callback, 0);
}

/**
 * Provides information about interactive config.
 *
 * @type {Backend.Authentication.ConfigInfo[]}
 */
LDAP.config = [
    ["url", "string", "Enter LDAP Server URL: "],
    ["dn", "string", "Enter Server DN: "],
    ["user_suffix", "string", "Enter User Suffixes: "],
];

/**
 * LDAP configuration defaults.
 * @type {object}
*/
LDAP.defaults = {
    /** Host to connect to.  */
    "url": "ldap://jacobs.jacobs-university.de:389",
    "user_suffix": "@jacobs.jacobs-university.de",
    "dn": "OU=Users,OU=CampusNet,DC=jacobs,DC=jacobs-university,DC=de"
}

/**
 * Makes a new ldap query.
 *
 * @param {sring} user - Username
 * @param {srting} pass - Password
 * @param {string} query - Query to search for.
 * @param {function} callback with success and result parameters.
 */
LDAP.prototype.makeQuery = function(user, pass, query, callback){
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
 * Authenticates a single user via LDAP.
 *
 * @param {string} user - Username of user to login.
 * @param {string} pass - Password of user to login.
 * @param {Backend.Authentication~loginCallback} callback - Callback that handles the request.
 */
LDAP.prototype.loginUser = function(user, pass, callback){
    this.makeQuery(user, pass, "(sAMAccountName="+user+")", function(s, r){
        if(s){
            callback(s, r[0]);
        } else {
            callback(s, r);
        }
    });
}

/**
 * Lists all users via LDAP.
 *
 * @param {string} key - Username of user to login.
 * @param {string} pass - Password of user to login.
 * @param {Backend.Authentication~listCallback} callback - Callback that handles the request.
 */
LDAP.prototype.getAll = function(user, pass, callback){
    var queries = "abcdefghijklmnopqrstuvwxyz";
    var res = [];
    var me = this;

    var query = function(i){
        if(i < queries.length){
            //make the next query
            me.makeQuery(user, pass, "(sAMAccountName="+queries[i]+"*)", function(s, r){
                if(s){
                    //ok, we found something, we can do stuff
                    res.push.apply(res, r);
                    query(i+1);
                } else {
                    //we did not find anything
                    callback(false, r);
                }
            });
        } else {
            callback(true, res);
        }
    };

    //start querying
    query(0);
}

module.exports = LDAP;
