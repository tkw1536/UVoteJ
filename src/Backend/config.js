var fs = require("fs"),
    path = require("path"),
    logger = require("winston");

/** @namespace Backend.config */

var config_path = path.resolve(__dirname+"/../../config/config.json");
var example_config_path =  path.resolve(__dirname+"/../../config/config.json.sample");

var config_content = {};
var config_mtime = 0;

/**
 * Reads configuration data from the config file or from cache.
 *
 * @returns {Backend.config.config} - The configuration.
 * @alias Backend.config.read
 */
module.exports.read = function(){
    var mtime = new Date(fs.statSync(config_path).mtime).getTime();

    //Later then the last read time => read again
    if(mtime > config_mtime){
        config_content = JSON.parse(fs.readFileSync(config_path));
        config_mtime = mtime;
    }

    //return the content
    return config_content;
}

/**
 * Writes Configuration data to the config File.
 *
 * @param {object} configuration - Configuration to write to the file.
 * @returns {Backend.config.config} - The configuration.
 * @alias Backend.config.write
 */
module.exports.write = function(configuration){

    //first set the content correctly
    config_content = configuration;

    //write the config
    fs.writeFileSync(config_path, JSON.stringify(c, null, 4));

    //log it
    logger.info("ENV: Wrote updated config to", config_path);

    //set time and date correctly
    config_mtime = new Date(fs.statSync(config_path).mtime).getTime();

    //return the content
    return config_content;
}

/**
 * Configuration Object for UVoteJ.
 *
 * @typedef {object} Backend.config.config
 * @property {number|string} port - Port or adress to use for the HTTP Server.
 * @property {string} mongodb - {@link https://www.mongodb.org/|MongoDB} Server to use.
 * @property {string} auth - Authentication method to use. See the Authentication namespace.
 * @property {string} auth_admins - List of administrators.
 * @property {string} auth_idProperty - Property to use as user name identifier.
 * @property {object} auth_config - Authentification configuration passed to the correct Authentication class.
 */

try{
    //try and load from the original file
    config_content = JSON.parse(fs.readFileSync(config_path));

    //set the mtime
    mtime = new Date(fs.statSync(config_path).mtime).getTime();

    //and log it
    logger.info("ENV: Loaded config from", config_path);
} catch(e) {
    //we cant find the default
    logger.warn("ENV: Missing config, switching to default. ");

    //read the example config
    config_content = JSON.parse(fs.readFileSync(example_config_path));

    //log it
    logger.info("ENV: Loaded default config from", example_config_path);

    //write it back
    module.exports.write(config_content);
}
