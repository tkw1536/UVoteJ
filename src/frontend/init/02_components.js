//Requirements
var
    express = require("express"),
    http = require("http"),
    socket = require("socket.io");


module.exports = function(state, logger, next){
    //create servers
    state.app = express();
    state.server = http.Server(state.app);
    state.io = socket(state.server);

    //run the next thing
    next(state);
};
