module.exports = function(state, logger, next){
    logger.warn("SOCKET: Unimplemented. ");
    next(state);
}
