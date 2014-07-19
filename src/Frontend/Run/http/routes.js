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

    //GET /vote
    state.app.use("/vote", function(req, res){
        res.end("Voting ended now!");
    });

    // 404 Page
    state.app.use("/", function(req, res){
        res.status(404);
        res.sendfile(state.dirs.static+"404.html");
    });

    //run the next thing
    next(state);
}
