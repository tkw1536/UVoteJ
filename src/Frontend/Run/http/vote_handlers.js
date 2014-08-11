var
    Protocol = require("../../Server/protocol.js"),
    markdown = require( "markdown" ).markdown,
    entities = require('html-entities').AllHtmlEntities;

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

    var voteWrapper = function(req, res, vote, message){
        var htmls = new entities();
        var show_res = (typeof vote.count_eligible == "number");

        return {
            "user": htmls.encode(req.body.user || ""),
            "pass": htmls.encode(req.body.pass || ""),

            "message": message,

            "machine_name": req.params.name,

            "name": vote.name,
            "description": markdown.toHTML(vote.description),

            "open_time": new Date(vote.open_time).toUTCString(),
            "close_time": new Date(vote.close_time).toUTCString(),

            "min": vote.minVotes,
            "max": vote.maxVotes,

            "options": vote.options.map(function(o, i){

                var count = vote.results[i];


                return {
                    "title": o.title,
                    "index": i,
                    "tagline": o.short_description,
                    "description": markdown.toHTML(o.markdown_description),
                    "count_abs": show_res?count:undefined,
                    "count_per": show_res?(100*(count/vote.voters)):undefined
                }

                return e;
            }),

            "voters": show_res?vote.voters:undefined,
            "voters_per": show_res?((vote.voters/vote.count_eligible)* 100):undefined,
            "unvoters": show_res?(vote.count_eligible - vote.voters):undefined,
            "unvoters_per": show_res?(((vote.count_eligible - vote.voters)/vote.count_eligible)* 100):undefined,
            "eligible": show_res?vote.count_eligible:undefined,
            "results": show_res?JSON.stringify(vote.results):undefined,
            "result_labels": show_res?JSON.stringify(vote.options.map(function(o){return o.title; })):undefined,
        };
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

        //here we just show a login form.
        res.set('content-type', "text/html");
        res.send(state.templates.voting_welcome({"name": req.params.name, "message": ""}));

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

        if(state.config.normalise_usernames){
            //normalise the username, please
            var user = req.body.user.toLowerCase().trim();
        } else {
            var user = req.body.user;
        }

        state.auth.loginUser(user, req.body.pass, function(s, user_info){
            if(!s){
                res.set('content-type', "text/html");
                res.send(state.templates.voting_welcome({"name": req.params.name, "message": "Unknown Username / Password. "}));
            } else {

                //are you eligible?
                if(! vote.votePermissions.matches(user_info) ){

                    res.set('content-type', "text/html");
                    res.send(state.templates.voting_welcome({"name": req.params.name, "message": "You are ineligible for this vote. "}));

                    return;
                }

                //have you already voted?
                if (vote.voters.indexOf(user) != -1){
                    res.set('content-type', "text/html");
                    res.send(state.templates.voting_welcome({"name": req.params.name, "message": "You have already voted and can not vote again. "}));

                    return;
                }

                res.set('content-type', "text/html");
                res.send(state.templates.voting_login(voteWrapper(req, res, vote)));
            }
        })
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

        if(state.config.normalise_usernames){
            //normalise the username, please
            var user = req.body.user.toLowerCase().trim();
        } else {
            var user = req.body.user;
        }

        state.auth.loginUser(user, req.body.pass, function(s, user_info){

            res.set('content-type', "text/html");

            if(!s){
                res.send(state.templates.voting_welcome({"name": req.params.name, "message": "Unknown Username / Password. "}));
            } else {

                //what did we select?
                var options = [];
                for(var i=0;i<vote.options.length;i++){
                    if(req.body["select_option_"+i] == "is_selected"){
                        options.push(i);
                    }
                }

                //now, lets try and vote.
                var vote_res = vote.vote(user, user_info, options);

                if(vote_res == Protocol.VoteState.CANT_VOTE){
                    res.send(state.templates.voting_welcome({"name": req.params.name, "message": "You are ineligible for this vote. "}));

                    return;
                }

                if(vote_res == Protocol.VoteState.HAS_VOTED){
                    res.send(state.templates.voting_welcome({"name": req.params.name, "message": "You have already voted and can not vote again. "}));

                    return;
                }

                if(vote_res == Protocol.VoteState.CLOSED){
                    res.send(state.templates.voting_welcome({"name": req.params.name, "message": "The vote seems to have closed just now. "}));

                    return;
                }

                if(vote_res == Protocol.VoteState.UNKNOWN_OPINION || vote_res == Protocol.VoteState.DOUBLE_OPINION){
                    res.send(state.templates.voting_welcome({"name": req.params.name, "message": "Looks like you broke something. Please report a bug. "}));
                    return;
                }

                if(vote_res == Protocol.VoteState.INVALID_NUMBER){
                    res.send(state.templates.voting_login(voteWrapper(req, res, vote, "You selected an invalid number of opinions. ")));
                    return;
                }

                //ok, everything is fine
                res.send(state.templates.voting_vote({"name": req.params.name}));
            }
        })
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

        res.set('content-type', "text/html");
        res.send(state.templates.results(voteWrapper(req, res, vote)));
    };

    next(state);
}
