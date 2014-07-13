//Requirements
var
    express = require("express"),
    fs = require("fs"),
    http = require("http"),
    socket = require("socket.io"),
    path = require("path");


module.exports = function(state, logger, next){
    //the root directory
    state.dirs = {};
    state.dirs.root = path.resolve(__dirname + "/../../../")+"/";
    state.dirs.static = state.dirs.root + "static/"

    try{
        config_path = state.dirs.root+"config/config.json"
        state.config = JSON.parse(fs.readFileSync(config_path));
        logger.info("INIT: Loaded config from", config_path)
    } catch(e) {
        config_default_path = state.dirs.root+"config/config.json.sample"
        logger.warn("INIT: Missing config, switching to default. ");
        state.config = JSON.parse(fs.readFileSync(config_default_path));
        logger.info("INIT: Loaded default config from", config_default_path)
    }

    //create servers
    state.app = express();
    state.server = http.Server(state.app);
    state.io = socket(state.server);

    //run the next thing
    next(state);
};
