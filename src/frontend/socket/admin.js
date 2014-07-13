var logger = require("winston"),
    Vote = require("../../backend/Vote.js");

module.exports = function(socket, info, user, pass, state){

    //Get Information about a vote by uuid
    var grab_vote = function(uuid){
        if(state.votes.votes.hasOwnProperty(uuid)){
            var v = state.votes.votes[uuid].toJSON();
            if(v.stage !== Vote.Stage.CLOSED && v.stage !== Vote.Stage.PUBLIC ){
                //we are neither close nor public => hide results from the JSON.
                v.results = undefined;
                v.voters = undefined;
            }
            return v;
        }

        return false;
    }

    socket.on("grab_vote", function(uuid){
        //Log the action
        logger.info("ADMIN: ", user, "grab_vote", uuid);
        socket.emit("grab_vote", grab_vote(uuid));
    });

    //List all the votes
    socket.on("list_votes", function(){
        var votes = [];

        for(var uuid in state.votes.votes){
            votes.push(uuid);
        }

        //Log the action
        logger.info("ADMIN: ", user, "list_votes");
        socket.emit("list_votes", votes);
    });

    //List all the votes
    socket.on("list_logs", function(){
        logger.info("ADMIN: ", user, "list_log");
        socket.emit("list_logs", state.logs);
    });

}
