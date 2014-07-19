var Server = require("../../Server");

module.exports = function(state, logger, next){
    /**
    * The Server AdminClientPool.
    *
    * @type {Frontend.Server.AdminClientPool}
    * @alias Frontend.State.AdminClientPool
    */
    state.AdminClientPool = new Server.AdminClientPool(state.io, state);

    //To be rewritten
    next(state);
}
