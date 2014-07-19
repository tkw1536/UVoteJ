module.exports = function(state, logger, next){
    var port = state.config.port || 3000;
    state.server.listen(port, function(){
        logger.info('INIT: Server listening on '+port);
        next(state);
    });
}
