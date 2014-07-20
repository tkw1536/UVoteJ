var logger = require("winston"),
    util = require("util");

//Handle errors which aren't caught. 
process.on('uncaughtException', function(err) {
    try{
        logger.error("ERROR: ", err.toString());
        logger.error(err.stack);
    } catch(e){
        logger.error("ERROR: Error handling error. ");
        logger.error("ERROR: Exiting. ");
        process.exit(1);
    }
});

/**
 * The current State of the server.
 * @namespace Frontend.State
 */

var state = {
    /**
     * The Time when the server was started.
     *
     * @memberof Frontend.State
     * @type {Date}
    */
    "started": new Date(),
    /**
     * List of server logs accumulated since server start.
     *
     * @memberof Frontend.State
     * @type {Frontend.State.Log[]}
     */
    "logs": []
};

//Custom logger that stores all the logs
var StoreLogger = logger.transports.StoreLogger = function (options) {
    this.name = 'StoreLogger';
    this.level = 'info';
};
util.inherits(StoreLogger, logger.Transport);
StoreLogger.prototype.log = function (level, msg, meta, callback) {
    /**
     * A server log entry.
     * @typedef {object} Frontend.State.Log
     * @property {string} level - The level of the log message.
     * @property {string} message - The message of the log entry.
     * @property {object} meta - Meta Information
     * @property {number} time - Time when the message was recorded.
     */
    state.logs.push({
        "level": level,
        "message": msg,
        "meta": meta,
        "time": (new Date()).toString()
    })
    callback(null, true);
};

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  prettyPrint: true,
  colorize: true,
  silent: false,
  timestamp: true
});

logger.add(StoreLogger);


//Files to load
var files = [
    //init run
    "init/00_legal",
    "init/01_env",
    "init/02_components",
    "init/03_auth",

    //methods
    "mongo/init",
    "http/routes",
    "socket/init",

    //finally post init
    "init/05_post"
]

//we are here
var here = __dirname+"/";


var runner_next = function(i, state){
    if(i < files.length){
        var fn = files[i];
        logger.info("Loading module", fn);

        //Try and load the module
        try{
            var module = require(here+fn+".js");
        } catch(e){
            logger.error(e.stack);
            logger.error("Failed to load", fn);
            process.exit(1);
        }

        //and run it now:
        try{
            module(state, logger, function(s){
                setImmediate(function(){
                    runner_next(i+1, s);
                });
            });
        } catch(e){
            logger.error(e.stack);
            logger.error("Error occured while executing", fn);
            logger.error(e.toString());
            process.exit(1);
        }

    } else {
        //we are done with init
        logger.info("UVoteJ ready. ")
    }
}

//start everything
logger.info("Starting UVoteJ ...");
runner_next(0, state);
