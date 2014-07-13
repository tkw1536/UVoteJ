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
    "init/legal",
    "init/pre",
    "mongo/init",
    "http/routes",
    "socket/admin",

    "init/post"
]

//we are here
var here = __dirname+"/";


var runner_next = function(i, state){
    if(i < files.length){
        //Load a specific file

        var fn = files[i];
        logger.info("BOOTSTRAP: Loading module", fn);
        try{
            var module = require(here+fn+".js");
        } catch(e){
            logger.error("BOOTSTRAP: Failed to load", fn);
            process.exit(1);
        }

        try{
            module(state, logger, function(s){
                setImmediate(function(){
                    runner_next(i+1, s);
                });
            });
        } catch(e){
            logger.error("BOOTSTRAP: Error occured while executing", fn);
            logger.error(e.toString());
            process.exit(1);
        }

    } else {
        //we are done with init
        logger.info("BOOTSTRAP: UVoteJ ready. ")
    }
}

//start everything
logger.info("BOOTSTRAP: Starting UVoteJ ...");
runner_next(0, {});
