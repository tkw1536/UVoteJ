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
        state.config = JSON.parse(fs.readFileSync(state.dirs.root+"config/config.json"));
    } catch(e) {
        logger.warn("Missing config, switching to default. ");
        state.config = JSON.parse(fs.readFileSync(state.dirs.root+"config/config.json.sample"));
    }

    //create servers
    state.app = express();
    state.server = http.Server(state.app);
    state.io = socket(state.server);

    //run the next thing
    next(state);
};
