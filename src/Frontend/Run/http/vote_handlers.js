var Protocol = require("../../Server/protocol.js")

module.exports = function(state, logger, next){

    var rightVoteStage = function(req, res, vote){

        var url = req.originalUrl;
        var name = req.params.name;

        if(vote.stage == Protocol.Stage.INIT){
            res.set('content-type', "text/html");
            res.send(state.templates.vote_init({"url": url, "name": name}));
            return false;
        }

        if(vote.stage == Protocol.Stage.CLOSED){
            res.set('content-type', "text/html");
            res.send(state.templates.vote_closed({"url": url, "name": name}));
            return false;
        }

        if(vote.stage == Protocol.Stage.PUBLIC){
            res.set('content-type', "text/html");
            res.send(state.templates.vote_public({"url": url, "name": name}));
            return false;
        }

        return true;
    }

    /**
    * Handles the "welcome" to a vote thing.
    *
    * @param {string} uuid - UUID of vote to handle.
    * @param {*} req
    * @param {*} res
    * @alias Frontend.State.handleVoteWelcome
    * @function
    */
    state.handleVoteWelcome = function(uuid, req, res){
        var vote = state.votes.votes[uuid]; //get the right vote
        if(!rightVoteStage(req, res, vote)){
            return;
        }

        state.templates.send_500(req, res, 'We should be sending something, oops ...');

        return;
    };

    /**
    * Handles the voting login.
    *
    * @param {string} uuid - UUID of vote to handle.
    * @param {*} req
    * @param {*} res
    * @alias Frontend.State.handleVoteLogin
    * @function
    */
    state.handleVoteLogin = function(uuid, req, res){
        var vote = state.votes.votes[uuid]; //get the right vote
        if(!rightVoteStage(req, res, vote)){
            return;
        }

        state.templates.send_500(req, res, 'Vote Login is not yet implemented. ');
    };

    /**
    * Handles the actual voting.
    *
    * @param {string} uuid - UUID of vote to handle.
    * @param {*} req
    * @param {*} res
    * @alias Frontend.State.handleVoteVote
    * @function
    */
    state.handleVoteVote = function(uuid, req, res){
        var vote = state.votes.votes[uuid]; //get the right vote
        if(!rightVoteStage(req, res, vote)){
            return;
        }

        state.templates.send_500(req, res, 'Voting storing is not yet implemented. ');
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
        state.templates.send_500(req, res, 'Vote Editing is not yet implemented. ');
    };

    /**
    * Handles the result displaying on a specific vote.
    *
    * @param {string} uuid - UUID of vote to handle.
    * @param {*} req
    * @param {*} res
    * @alias Frontend.State.handleVoteRes
    * @function
    */
    state.handleVoteRes = function(uuid, req, res){
        var vote = state.votes.votes[uuid]; //get the right vote

        var url = req.originalUrl;
        var name = req.params.name;

        if(vote.stage == Protocol.Stage.INIT){
            res.set('content-type', "text/html");
            res.send(state.templates.results_init({"url": url, "name": name}));
            return;
        }

        if(vote.stage == Protocol.Stage.OPEN){
            res.set('content-type', "text/html");
            res.send(state.templates.results_open({"url": url, "name": name}));
            return;
        }

        if(vote.stage == Protocol.Stage.CLOSED){
            res.set('content-type', "text/html");
            res.send(state.templates.results_closed({"url": url, "name": name}));
            return;
        }

        state.templates.send_500(req, res, 'Vote Results are not yet implemented. ');
    };

    next(state);
}
