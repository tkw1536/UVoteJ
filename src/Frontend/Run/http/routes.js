var
    bodyParser = require('body-parser')
    express = require("express");

module.exports = function(state, logger, next){

    //support the post forms
    state.app.use(bodyParser.json());
    state.app.use(bodyParser.urlencoded({extended: false }));

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
    state.app.use("/admin/", function(req, res){
        res.set('Content-Type', 'text/html');
        res.send(state.templates.admin());
    });

    //returns a
    var resolveUUID = function(callback){
        return function(req, res, next){
            var voteDB = state.votes;

            //Check if we can handle this with a uuid
            if(voteDB.votes.hasOwnProperty(req.params.name)){
                callback(req.params.name, req, res);
                return;
            }

            //Try and resolve the machine name
            var tryUUID = voteDB.machine_to_uuid(req.params.name);

            if(tryUUID !== ""){
                callback(tryUUID, req, res);
                return;
            }

            next();
        }
    }


    //Edit URLs, for administrators so that they can edit the vote.
    //Always available even once vote is closed / public.
    state.app.all("/edit/:name", resolveUUID(state.handleVoteEdit.bind(state)));

    //Vote URLs, for the public so that they can vote.



    //hanldes the "leaving" of the vote
    state.app.all("/vote/:name/vote", resolveUUID(state.handleVoteVote.bind(state)));

    //handles the login of the Vote
    state.app.all("/vote/:name/login", resolveUUID(state.handleVoteLogin.bind(state)));

    //handles the initiall login dialog of the vote.
    state.app.all("/vote/:name", resolveUUID(state.handleVoteWelcome.bind(state)));

    // HTML Result URLs, for the public so that they can view results
    //Will result in a 404 if the results are not yet available.
    state.app.all("/results/:name",  resolveUUID(state.handleVoteRes.bind(state)));



    //Public URLs, these redirect either to /vote/:name or /results/:nam
    //dependening on the state of the vote.
    state.app.all("/:name", resolveUUID(function(uuid, req, res){
        res.redirect(303, "/vote/"+req.params.name);
    }));


    // 404 Page
    state.app.use(function(req, res){
        res.set('Content-Type', 'text/html');
        res.send(404, state.templates.error_404({"url": req.protocol + '://' + req.get('host') + req.originalUrl}))
    });

    //run the next thing
    next(state);
}
