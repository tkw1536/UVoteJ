var fs = require("fs");

module.exports = function(state, logger, next){
    try{
        var license = fs.readFileSync(__dirname+"/../../../LICENSE").toString()
        logger.info(license);
    } catch(f) {
        logger.error("LICENSE: Please restore the file LICENSE in the UVoteJ directory. ");
        logger.error("LICENSE: Missing license file, aborting. ");
        throw "Abort"; 
    }

    //run the next thing
    next(state);
};
