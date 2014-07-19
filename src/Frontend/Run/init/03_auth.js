module.exports = function(state, logger, next){
    /**
    * Reloads the Authentication as given by the current server configuration.
    *
    * @param {function} cb - Callback
    * @alias Frontend.State.authReload
    */
    state.authReload = function(cb){
        var auth = state.config.auth;
        var auth_conf = state.config.auth_config;

        logger.info("AUTH: Initalising authentication method", auth);

        //try and load the auth
        try{
            var auth_class = require("../../../Backend/Authentication")[auth];
        } catch(e){
            logger.error("AUTH: Unable to load authentication, make sure it exists. ");
            process.exit(1);
        }

        /**
        * The current Authentication instance.
        *
        * @type {Backend.Authentication}
        * @alias Frontend.State.auth
        */
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
