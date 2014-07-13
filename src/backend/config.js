var fs = require("fs"),
    path = require("path"),
    logger = require("winston");


var config_path = path.resolve(__dirname+"/../../config/config.json");
var example_config_path =  path.resolve(__dirname+"/../../config/config.json.sample");

var config_content = {};
var config_mtime = 0;

module.exports.read = function(c){
    var mtime = new Date(fs.statSync(config_path).mtime).getTime();

    //Later then the last read time => read again
    if(mtime > config_mtime){
        config_content = JSON.parse(fs.readFileSync(config_path));
        config_mtime = mtime;
    }

    //return the content
    return config_content;
}

module.exports.write = function(c){

    //first set the content correctly
    config_content = c;

    //write the config
    fs.writeFileSync(config_path, JSON.stringify(c, null, 4));

    //log it
    logger.info("ENV: Wrote updated config to", config_path);

    //set time and date correctly
    config_mtime = new Date(fs.statSync(config_path).mtime).getTime();

    //return the content
    return config_content;
}



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
