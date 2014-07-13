//Logger config
var logger = require('winston');
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  prettyPrint: true,
  colorize: true,
  silent: false,
  timestamp: true
});

//Files to load
var files = [
    "init/pre",
    "http/routes",
    "socket/admin",

    "init/post"
]

//we are here
var here = __dirname+"/";


var runner_next = function(i, state){
    if(i < files.length){
        var fn = files[i];
        logger.info("Loading "+fn);
        require(here+fn+".js")(state, logger, function(s){
            logger.info("Loaded "+fn);
            runner_next(i+1, s);
        })
    } else {
        logger.info("Initalisation complete. ")
    }
}

//start everything
logger.info("Starting Initalisation. "); 
runner_next(0, {});
