module.exports = function(state, logger, next){
    /**
    * Handles the voting on a specific vote.
    *
    * @param {string} uuid - UUID of vote to handle.
    * @param {*} req
    * @param {*} res
    * @alias Frontend.State.handleVoteVote
    * @function
    */
    state.handleVoteVote = function(uuid, req, res){
        res.end("This will handle the voting with uuid "+uuid)
    };

    /**
    * Handles the editing on a specific vote.
    *
    * @param {string} uuid - UUID of vote to handle.
    * @param {*} req
    * @param {*} res
    * @alias Frontend.State.handleVoteVote
    * @function
    */
    state.handleVoteEdit = function(uuid, req, res){
        res.end("This will handle the editing with uuid "+uuid)
    };

    /**
    * Handles the result displaying on a specific vote.
    *
    * @param {string} uuid - UUID of vote to handle.
    * @param {string} type - Result type. One of "json", "xml", "csv" and "html"
    * @param {*} req
    * @param {*} res
    * @alias Frontend.State.handleVoteRes
    * @function
    */
    state.handleVoteRes = function(uuid, type, req, res){
        res.end("This will handle the voting with uuid "+uuid+"of type"+type)
    };

    next(state); 
}
