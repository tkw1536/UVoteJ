var
    express = require("express");

module.exports = function(state, logger, next){

    // GET /lib
    state.app.use("/lib/client/protocol.js", function(req, res){
        res.sendfile(state.dirs.src+"Frontend/Server/protocol.js")
    });
    state.app.use("/lib/client", express.static(state.dirs.src+"Client"));
    state.app.use("/lib/gui", express.static(state.dirs.src+"Gui"))
    state.app.use("/lib", express.static(state.dirs.static+"lib"));

    //GET /doc
    state.app.use("/doc", express.static(state.dirs.static+"doc"));

    //GET /admin
    state.app.use("/admin", express.static(state.dirs.static+"admin"));

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

    //Vote Editing
    state.app.use("/vote/:name/edit", function(req, res, next){
        var voteDB = state.votes;

        //Check if we can handle this with a uuid
        if(voteDB.votes.hasOwnProperty(req.params.name)){
            state.handleVoteEdit(req.params.name, req, res);
            return;
        }

        //Try and resolve the machine name
        var tryUUID = voteDB.machine_to_uuid(req.params.name);

        if(tryUUID !== ""){
            state.handleVoteEdit(tryUUID, req, res);
            return;
        }

        next();
    });

    //Voting
    state.app.use("/vote/:name", function(req, res, next){
        var voteDB = state.votes;

        //Check if we can handle this with a uuid
        if(voteDB.votes.hasOwnProperty(req.params.name)){
            state.handleVoteVote(req.params.name, req, res);
            return;
        }

        //Try and resolve the machine name
        var tryUUID = voteDB.machine_to_uuid(req.params.name);

        if(tryUUID !== ""){
            state.handleVoteVote(tryUUID, req, res);
            return;
        }

        next();
    });

    //User-friendly top-elevel aliases. These redirtect.
    state.app.use("/:name", function(req, res, next){
        //Handles the top-level urls. These might be disabled in the future.

        var voteDB = state.votes;

        //Check if we can handle this with a uuid
        if(voteDB.votes.hasOwnProperty(req.params.name)){
            res.redirect(303, "/vote/"+req.params.name);
            return;
        }

        //Try and resolve the machine name
        var tryUUID = voteDB.machine_to_uuid(req.params.name);

        if(tryUUID !== ""){
            //we have a name, so please do not cache
            res.redirect(303, "/vote/"+req.params.name);
            return;
        }

        next();
    });

    // 404 Page
    state.app.use("/", function(req, res){
        res.status(404);
        res.sendfile(state.dirs.static+"404.html");
    });

    //run the next thing
    next(state);
}
