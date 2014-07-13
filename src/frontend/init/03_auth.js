module.exports = function(state, logger, next){
    state.authReload = function(cb){
        var auth = state.config.auth;
        var auth_conf = state.config.auth_config;

        logger.info("AUTH: Initalising authentication method", auth);

        //try and load the auth
        try{
            var auth_class = require("../../backend/auth/"+auth+".js");
        } catch(e){
            logger.error("AUTH: Unable to load authentication, make sure it exists. ");
            process.exit(1);
        }

        state.auth = new auth_class(auth_conf, function(){
            //callback
            logger.info("AUTH: Authentication loaded. ");
            cb();
        });
    }

    state.authReload(function(){
        //onto the next one. 
        next(state);
    })
};
