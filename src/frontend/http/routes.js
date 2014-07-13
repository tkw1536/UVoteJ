var
    express = require("express");

module.exports = function(state, logger, next){
    //Allow some paths
    state.app.use("/lib", express.static(state.dirs.static+"lib"));
    state.app.use("/doc", express.static(state.dirs.static+"doc"));
    state.app.use("/admin", express.static(state.dirs.static+"admin"));
    state.app.use("/vote", function(req, res){
        res.end("Voting ended now!");
    });

    //Everything else is index.html
    state.app.use("/", function(req, res){
        res.sendfile(state.dirs.static+"index.html");
    });

    //run the next thing
    next(state);
}
