//Logger config
var logger = require("winston");
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  prettyPrint: true,
  colorize: true,
  silent: false,
  timestamp: true
});

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
runner_next(0, {});
