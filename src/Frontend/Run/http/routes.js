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


    //Edit URLs, for administrators so that they can edit the vote.
    //Always available even once vote is closed / public.
    state.app.use("/edit/:name", function(req, res, next){
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

    //Vote URLs, for the public so that they can vote.
    //URLs will show a link to the results page once the vote is closed.
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

    // JSON Result URLs, for the public so that they can view results
    //Will result in a 404 if the results are not yet available.
    state.app.use("/results/:name/json", function(req, res, next){
        var voteDB = state.votes;

        //Check if we can handle this with a uuid
        if(voteDB.votes.hasOwnProperty(req.params.name)){
            state.handleVoteRes(req.params.name, "json", req, res);
            return;
        }

        //Try and resolve the machine name
        var tryUUID = voteDB.machine_to_uuid(req.params.name);

        if(tryUUID !== ""){
            state.handleVoteRes(tryUUID, "json", req, res);
            return;
        }

        next();
    });

    // XML Result URLs, for the public so that they can view results
    //Will result in a 404 if the results are not yet available.
    state.app.use("/results/:name/xml", function(req, res, next){
        var voteDB = state.votes;

        //Check if we can handle this with a uuid
        if(voteDB.votes.hasOwnProperty(req.params.name)){
            state.handleVoteRes(req.params.name, "xml", req, res);
            return;
        }

        //Try and resolve the machine name
        var tryUUID = voteDB.machine_to_uuid(req.params.name);

        if(tryUUID !== ""){
            state.handleVoteRes(tryUUID, "xml", req, res);
            return;
        }

        next();
    });

    // CSV Result URLs, for the public so that they can view results
    //Will result in a 404 if the results are not yet available.
    state.app.use("/results/:name/csv", function(req, res, next){
        var voteDB = state.votes;

        //Check if we can handle this with a uuid
        if(voteDB.votes.hasOwnProperty(req.params.name)){
            state.handleVoteRes(req.params.name, "csv", req, res);
            return;
        }

        //Try and resolve the machine name
        var tryUUID = voteDB.machine_to_uuid(req.params.name);

        if(tryUUID !== ""){
            state.handleVoteRes(tryUUID, "csv", req, res);
            return;
        }

        next();
    });

    // HTML Result URLs, for the public so that they can view results
    //Will result in a 404 if the results are not yet available.
    state.app.use("/results/:name", function(req, res, next){
        var voteDB = state.votes;

        //Check if we can handle this with a uuid
        if(voteDB.votes.hasOwnProperty(req.params.name)){
            state.handleVoteRes(req.params.name, "html", req, res);
            return;
        }

        //Try and resolve the machine name
        var tryUUID = voteDB.machine_to_uuid(req.params.name);

        if(tryUUID !== ""){
            state.handleVoteRes(tryUUID, "html", req, res);
            return;
        }

        next();
    });



    //Public URLs, these redirect either to /vote/:name or /results/:nam
    //dependening on the state of the vote.
    state.app.use("/:name", function(req, res, next){
        //Handles the top-level urls. These might be disabled in the future.
        //TODO: Check whic state the vote is in and redirect to either the result or the vote
        //TODO: Make these links onnthe admin page also.
        //Note: These redirects are 303 because they should nt be cached
        //as the vote state might change.

        var voteDB = state.votes;

        //Check if we can handle this with a uuid
        if(voteDB.votes.hasOwnProperty(req.params.name)){
            voteDB.votes[req.params.name]
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
