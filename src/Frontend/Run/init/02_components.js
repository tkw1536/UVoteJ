//Requirements
var
    express = require("express"),
    http = require("http"),
    socket = require("socket.io");


module.exports = function(state, logger, next){
    //create servers

    /**
     * The Express instance for the server.
     * @type {NodeJS.Express}
     * @alias Frontend.State.app
     */
    state.app = express();

    /**
     * The HTTPServer instance for the server.
     * @type {NodeJS.HTTPServer}
     * @alias Frontend.State.server
     */
    state.server = http.Server(state.app);

    /**
     * The Socket.IO instance for the server.
     * @type {NodeJS.SocketIO}
     * @alias Frontend.State.io
     */
    state.io = socket(state.server);

    //run the next thing
    next(state);
};
