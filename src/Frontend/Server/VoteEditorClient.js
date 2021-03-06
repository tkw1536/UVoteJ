var Protocol = require("./protocol.js"),
    logger = require("winston"),
    Vote = require("../../Backend").Vote;

/**
 * Represents an editable vote client.
 *
 * @param {NodeJS.SocketIO} socket - Socket to listen on.
 * @param {Backend.Vote} vote - Vote to make editable.
 * @param {string} user - Username of querying user.
 * @param {string} pass - Password of querying user.
 * @param {Frontend.State} state - Current State of the server.
 *
 * @return {Frontend.Server.VoteEditorClient} - for chaining
 * @alias Frontend.Server.VoteEditorClient
 * @this {Frontend.Server.VoteEditorClient}
 * @class
 */
var VoteEditorClient = function(socket, vote, user, pass, state){
    var me = this;

    /**
     * The socket this VoteEditorClient belongs to.
     * @name Frontend.Server.VoteEditorClient#socket
     * @type {NodeJS.SocketIO}
     */
    this.socket = socket;

    /**
     * Username of querying user.
     * @name Frontend.Server.VoteEditorClient#user
     * @type {string}
     */
    this.user = user;

    /**
     * Password of querying user.
     * @name Frontend.Server.VoteEditorClient#pass
     * @type {string}
     */
    this.pass = pass;

    /**
     * The Vote this VoteEditorClient belongs to.
     * @name Frontend.Server.VoteEditorClient#vote
     * @type {Backend.Vote}
     */
    this.vote = vote;

    /**
     * Current State of the server.
     * @name Frontend.Server.VoteEditorClient#state
     * @type {Frontend.State}
     */
    this.state = state;

    /**
     * ID of this VoteEditorClient.
     * @name Frontend.Server.VoteEditorClient#id
     * @type {string}
     */
    this.id = this.socket.id;

    /**
     * A list of handler which will be unbound on destruction of this client.
     * @name Frontend.Server.VoteEditorClient#handlers
     * @type {function[]}
     */
    this.handlers = [
        function(){
            me.socket.emit(Protocol.VOTE_EDITOR.VOTE_UPDATED);
        },
        function(){
            me.socket.emit(Protocol.VOTE_EDITOR.VOTE_DELETED);
            me.close();
        },
        function(){
            me.close();
        }
    ];


    //Listen for updates on the vote
    vote.on("update", this.handlers[0]);

    //Listen for updates on the vote
    vote.on("delete", this.handlers[1]);


    //Check for disconnect
    this.socket.on("disconnect", this.handlers[2]);

    logger.info("VOTE_EDIT:", this.id, "started editing", vote.id);

    //Listen for all the events.
    this
    .idable()
    .title()
    .machine_name()
    .description()
    .voting_permissions()
    .admin_permissions()
    .minmax_votes()
    .stage()
    .options()
    .time();

};

/**
 * Exposes the vote id to the client.
 * @return {Frontend.Server.VoteEditorClient} - for chaining
 */
VoteEditorClient.prototype.idable = function(){

    var vote = this.vote;
    var socket = this.socket;

    socket
    .on(Protocol.VOTE_EDITOR.GET_VOTE_ID, function(){
        //send id to the client.
        socket.emit(Protocol.VOTE_EDITOR.GET_VOTE_ID, true, vote.id);
    });

    return this;
}

/**
 * Makes the title editable.
 * @return {Frontend.Server.VoteEditorClient} - for chaining
 */
VoteEditorClient.prototype.title = function(){

    var vote = this.vote;
    var socket = this.socket;

    socket
    .on(Protocol.VOTE_EDITOR.GET_TITLE, function(){
        //send name to the client.
        socket.emit(Protocol.VOTE_EDITOR.GET_TITLE, true, vote.name);
    })
    .on(Protocol.VOTE_EDITOR.SET_TITLE, function(name){
        if(vote.stage !== Protocol.Stage.INIT){
            socket.emit(Protocol.VOTE_EDITOR.SET_TITLE, false, vote.name, "Cannot edit vote while in non-init stage. ");
        } else {
            //we updated the vote
            vote.name = name;
            vote.emit("update");

            //send that to the client.
            socket.emit(Protocol.VOTE_EDITOR.SET_TITLE, true, vote.name);
        }
    });

    return this;
}

/**
 * Makes the machine_name editable.
 * @return {Frontend.Server.VoteEditorClient} - for chaining
 */
VoteEditorClient.prototype.machine_name = function(){

    var vote = this.vote;
    var socket = this.socket;
    var state = this.state;

    socket
    .on(Protocol.VOTE_EDITOR.GET_MACHINE_NAME, function(){
        //send machine_name to the client.
        socket.emit(Protocol.VOTE_EDITOR.GET_MACHINE_NAME, true, vote.machine_name);
    })
    .on(Protocol.VOTE_EDITOR.SET_MACHINE_NAME, function(machine_name){
        var machine_name = machine_name.toLowerCase();
        if(vote.stage !== Protocol.Stage.INIT){
            socket.emit(Protocol.VOTE_EDITOR.SET_MACHINE_NAME, false, vote.machine_name, "Cannot edit vote while in non-init stage. ");
        } else {

            //Check if we have another vote with the given machine_id
            var thatId = state.votes.machine_to_uuid(machine_name);

            if(thatId != "" && thatId != vote.id){
                //we already have a machine_id like that from someone who is not me.
                socket.emit(Protocol.VOTE_EDITOR.SET_MACHINE_NAME, false, vote.machine_name, "Specefied machine_name already taken by another vote. ");
            } else if(/^(lib|admin|edit|api|help|vote|results)$/.test(machine_name)){
                //those words are reserved
                socket.emit(Protocol.VOTE_EDITOR.SET_MACHINE_NAME, false, vote.machine_name, "Specefied machine_name is a reserved system word. ");
            } else if(! /^[a-zA-Z0-9_\-]+$/.test(machine_name)){
                //we cant have some of the characters.
                socket.emit(Protocol.VOTE_EDITOR.SET_MACHINE_NAME, false, vote.machine_name, "The machine_name may only have letters, numbers, underscores and -. ");
            } else if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(machine_name)){
                //we acn't be a uuid.
                socket.emit(Protocol.VOTE_EDITOR.SET_MACHINE_NAME, false, vote.machine_name, "The machine_name may not be a UUID. ");
            } else {
                //we updated the vote
                vote.machine_name = machine_name;
                vote.emit("update");

                //send that to the client.
                socket.emit(Protocol.VOTE_EDITOR.SET_MACHINE_NAME, true, vote.machine_name);
            }
        }
    });

    return this;
}

/**
 * Makes the description editable.
 * @return {Frontend.Server.VoteEditorClient} - for chaining
 */
VoteEditorClient.prototype.description = function(){

    var vote = this.vote;
    var socket = this.socket;

    socket
    .on(Protocol.VOTE_EDITOR.GET_DESCRIPTION, function(){
        //send name to the client.
        socket.emit(Protocol.VOTE_EDITOR.GET_DESCRIPTION, true, vote.description);
    })
    .on(Protocol.VOTE_EDITOR.SET_DESCRIPTION, function(description){
        if(vote.stage !== Protocol.Stage.INIT){
            socket.emit(Protocol.VOTE_EDITOR.SET_DESCRIPTION, false, vote.description, "Cannot edit vote while in non-init stage. ");
        } else {
            //we updated the vote
            vote.description = description;
            vote.emit("update");

            //send that to the client.
            socket.emit(Protocol.VOTE_EDITOR.SET_DESCRIPTION, true, vote.description);
        }
    });

    return this;
}

/**
 * Makes voting permissions editable.
 * @return {Frontend.Server.VoteEditorClient} - for chaining
 */
VoteEditorClient.prototype.voting_permissions = function(){

    var vote = this.vote;
    var socket = this.socket;

    var state = this.state;

    var user = this.user;
    var pass = this.pass;

    socket
    .on(Protocol.VOTE_EDITOR.GET_VOTING_PERMISSIONS, function(){
        //send name to the client.
        socket.emit(Protocol.VOTE_EDITOR.GET_VOTING_PERMISSIONS, true, vote.votePermissions.toJSON());
    })
    .on(Protocol.VOTE_EDITOR.SET_VOTING_PERMISSIONS, function(voting_node){
        if(vote.stage !== Protocol.Stage.INIT){
            socket.emit(Protocol.VOTE_EDITOR.SET_VOTING_PERMISSIONS, false, vote.votePermissions.toJSON(), "Cannot edit vote while in non-init stage. ");
        } else {
            //we updated the vote
            vote.votePermissions.fromJSON(voting_node);
            vote.emit("update");

            //send that to the client.
            socket.emit(Protocol.VOTE_EDITOR.SET_VOTING_PERMISSIONS, true, vote.votePermissions.toJSON());
        }
    }).on(Protocol.VOTE_EDITOR.GET_VOTING_PEOPLE, function(){

        //Get the users
        state.auth.getAll(user, pass, function(s, users){

            //we did not get them
            if(!s){
                socket.emit(Protocol.VOTE_EDITOR.GET_VOTING_PEOPLE, false, "Unable to get all users. ");
                return;
            }

            //find all the matching users.
            var matching_users = vote.votePermissions.findMatchingUsers(users);


            //and return it.
            socket.emit(Protocol.VOTE_EDITOR.GET_VOTING_PEOPLE, true, matching_users);
        });
    });

    return this;
}

/**
 * Makes voting permissions editable.
 * @return {Frontend.Server.VoteEditorClient} - for chaining
 */
VoteEditorClient.prototype.admin_permissions = function(){

    var vote = this.vote;
    var socket = this.socket;

    var state = this.state;

    var user = this.user;
    var pass = this.pass;

    socket
    .on(Protocol.VOTE_EDITOR.GET_ADMIN_PERMISSIONS, function(){
        //send name to the client.
        socket.emit(Protocol.VOTE_EDITOR.GET_ADMIN_PERMISSIONS, true, vote.adminPermissions.toJSON());
    })
    .on(Protocol.VOTE_EDITOR.SET_ADMIN_PERMISSIONS, function(admin_node){
        //we updated the vote
        vote.adminPermissions.fromJSON(admin_node);
        vote.emit("update");

        //send that to the client.
        socket.emit(Protocol.VOTE_EDITOR.SET_ADMIN_PERMISSIONS, true, vote.adminPermissions.toJSON());
    })
    .on(Protocol.VOTE_EDITOR.GET_ADMIN_PEOPLE, function(){
        //Get the users
        state.auth.getAll(user, pass, function(s, users){

            //we did not get them
            if(!s){
                socket.emit(Protocol.VOTE_EDITOR.GET_ADMIN_PEOPLE, false, "Unable to get all users. ");
                return;
            }

            //find all the matching users.
            var matching_users = vote.adminPermissions.findMatchingUsers(users);


            //and return it.
            socket.emit(Protocol.VOTE_EDITOR.GET_ADMIN_PEOPLE, true, matching_users);
        });
    });

    return this;
}

/**
 * Makes minimum / maximum votes editable.
 * @return {Frontend.Server.VoteEditorClient} - for chaining
 */
VoteEditorClient.prototype.minmax_votes = function(){

    var vote = this.vote;
    var socket = this.socket;

    socket
    .on(Protocol.VOTE_EDITOR.GET_MINMAXVOTES, function(){
        //send name to the client.
        socket.emit(Protocol.VOTE_EDITOR.GET_MINMAXVOTES, true, [vote.minVotes, vote.maxVotes]);
    })
    .on(Protocol.VOTE_EDITOR.SET_MINMAXVOTES, function(v){

        try{
            var min = v[0];
            var max = v[1];
        } catch(e){
            var min = NaN;
            var max = NaN;
        }

        if(vote.stage !== Protocol.Stage.INIT){
            socket.emit(Protocol.VOTE_EDITOR.SET_MINMAXVOTES, false, [vote.minVotes, vote.maxVotes], "Cannot edit vote while in non-init stage. ");
            return;
        }

        //Check for all the constraints.
        if(!isFinite(min) || !isFinite(max)){
            socket.emit(Protocol.VOTE_EDITOR.SET_MINMAXVOTES, false, [vote.minVotes, vote.maxVotes], "Minimum and Maximum Number of votes have to be finite. ");
            return;
        }

        if(min % 1 !== 0 || max % 1 !== 0){
            socket.emit(Protocol.VOTE_EDITOR.SET_MINMAXVOTES, false, [vote.minVotes, vote.maxVotes], "Minimum and Maximum Number of votes have to be integers. ");
            return;
        }

        if(max <= 0 || min < 0){
            socket.emit(Protocol.VOTE_EDITOR.SET_MINMAXVOTES, false, [vote.minVotes, vote.maxVotes], "Minimum number of votes has to be at least zero and maximum must be postive. ");
            return;
        }

        if(min > max){
            socket.emit(Protocol.VOTE_EDITOR.SET_MINMAXVOTES, false, [vote.minVotes, vote.maxVotes], "Minimum has to be less than maximum. ");
            return;
        }

        if(min > vote.options.length){
            socket.emit(Protocol.VOTE_EDITOR.SET_MINMAXVOTES, false, [vote.minVotes, vote.maxVotes], "It has to be possible to vote on this vote. Add more options to increase the minimum. ");
            return;
        }

        //we updated the vote
        vote.minVotes = min;
        vote.maxVotes = max;
        vote.emit("update");

        //send that to the client.
        socket.emit(Protocol.VOTE_EDITOR.SET_MINMAXVOTES, true, [vote.minVotes, vote.maxVotes]);
    });

    return this;
}

/**
 * Makes opening and closing time editable.
 * @return {Frontend.Server.VoteEditorClient} - for chaining
 */
VoteEditorClient.prototype.time = function(){
    var vote = this.vote;
    var socket = this.socket;

    socket
    .on(Protocol.VOTE_EDITOR.GET_OPENCLOSE_TIME, function(){
        socket.emit(Protocol.VOTE_EDITOR.GET_OPENCLOSE_TIME, true, [vote.open_time, vote.close_time]);
    })
    .on(Protocol.VOTE_EDITOR.SET_OPENCLOSE_TIME, function(v){
        try{
            var open = v[0];
            var close = v[1];
        } catch(e){
            var open = NaN;
            var close = NaN;
        }


        if(vote.stage !== Protocol.Stage.INIT){
            if(typeof open !== "undefined" && typeof close !== "undefined"){
                socket.emit(Protocol.VOTE_EDITOR.SET_OPENCLOSE_TIME, false, [vote.open_time, vote.close_time], "Cannot edit vote while in non-init stage. ");
            } else {
                //we canceled scheduling
                vote.open_time = undefined;
                vote.close_time = undefined;

                //we also cancel the stage if its open
                if(vote.stage == protocol.Stagenumber.OPEN || vote.stage == protocol.Stagenumber.CLOSED){
                    vote.stage = protocol.STAGE.CLOSED; //we are also closing the votze
                }

                vote.stopStages();
                vote.emit("update");
                vote.startStage();

                socket.emit(Protocol.VOTE_EDITOR.SET_OPENCLOSE_TIME, true, [vote.open_time, vote.close_time]);
            }

            return;
        }

        if(typeof open == "undefined" && typeof close == "undefined"){
            //we canceled scheduling
            vote.open_time = undefined;
            vote.close_time = undefined;

            vote.stopStages();
            vote.emit("update");
            vote.startStage();

            socket.emit(Protocol.VOTE_EDITOR.SET_OPENCLOSE_TIME, true, [vote.open_time, vote.close_time]);

            return;
        }

        //current time
        var now = (new Date()).getTime();

        //Check for all the constraints.
        if(!isFinite(open) || !isFinite(close)){
            socket.emit(Protocol.VOTE_EDITOR.SET_OPENCLOSE_TIME, false, [vote.open_time, vote.close_time], "Vote times have to be finite. ");
            return;
        }

        if(open % 1 !== 0 || close % 1 !== 0){
            socket.emit(Protocol.VOTE_EDITOR.SET_OPENCLOSE_TIME, false, [vote.open_time, vote.close_time], "Vote times have to be intergers. ");
            return;
        }

        if(close - open < 60 * 1000){
            socket.emit(Protocol.VOTE_EDITOR.SET_OPENCLOSE_TIME, false, [vote.open_time, vote.close_time], "CLOSED stage has to open at least one minute after OPEN stage. ");
            return;
        }

        if(open - now < 10 * 1000){
            socket.emit(Protocol.VOTE_EDITOR.SET_OPENCLOSE_TIME, false, [vote.open_time, vote.close_time], "OPEN stage has to open at least ten seconds in the future. ");
            return;
        }

        //we set the time
        vote.open_time = open;
        vote.close_time = close;

        vote.stopStages();
        vote.emit("update");
        vote.startStages();

        socket.emit(Protocol.VOTE_EDITOR.SET_OPENCLOSE_TIME, true, [vote.open_time, vote.close_time]);
    });

    return this;

};


/**
 * Makes the STAGE editable.
 * @return {Frontend.Server.VoteEditorClient} - for chaining
 */
VoteEditorClient.prototype.stage = function(){
    var me = this;


    var vote = this.vote;
    var socket = this.socket;

    socket
    .on(Protocol.VOTE_EDITOR.GET_STAGE, function(){
        //send the current stage to the client.
        socket.emit(Protocol.VOTE_EDITOR.GET_STAGE, true, vote.stage);
    })
    .on(Protocol.VOTE_EDITOR.SET_STAGE, function(s){
        if(vote.stage == s){
            //nothing changed.
            socket.emit(Protocol.VOTE_EDITOR.SET_STAGE, true, vote.stage);
            return;
        }

        if(s == Protocol.Stage.INIT){
            socket.emit(Protocol.VOTE_EDITOR.SET_STAGE, false, vote.stage, "Cannot go back to INIT Stage. ");
            return;
        }

        if(s == Protocol.Stage.OPEN || s == Protocol.Stage.CLOSED){
            socket.emit(Protocol.VOTE_EDITOR.SET_STAGE, false, vote.stage, "Cannot set OPEN and CLOSED Stages manually. ");
            return;
        }

        if(s !== Protocol.Stage.PUBLIC){
            socket.emit(Protocol.VOTE_EDITOR.SET_STAGE, false, vote.stage, "Unknown STAGE. ");
        } else {
            me.state.auth.getAll(me.user, me.pass, function(s, r){

                if(!s){
                    socket.emit(Protocol.VOTE_EDITOR.SET_STAGE, false, vote.stage, "Unable to update count_eligible. ");
                    return;
                }

                //we can now update the stage
                vote.stage = Protocol.Stage.PUBLIC;

                //also, we can count everyone now.
                vote.count_eligible = vote.votePermissions.findMatchingUsers(r).length;

                //lets update and then thats it
                vote.emit("update");
                socket.emit(Protocol.VOTE_EDITOR.SET_STAGE, true, vote.stage);
            });
        }
    });

    return this;
};

/**
 * Makes optuions editable.
 * @return {Frontend.Server.VoteEditorClient} - for chaining
 */
VoteEditorClient.prototype.options = function(){

    var vote = this.vote;
    var socket = this.socket;

    socket
    .on(Protocol.VOTE_EDITOR.GET_OPTIONS, function(){
        //send the current stage to the client.
        socket.emit(Protocol.VOTE_EDITOR.GET_OPTIONS, true, vote.options);
    })
    .on(Protocol.VOTE_EDITOR.SET_OPTIONS, function(options){

        if(vote.stage != Protocol.Stage.INIT){
            socket.emit(Protocol.VOTE_EDITOR.SET_OPTIONS, false, vote.options, "Cannot edit vote while in non-init stage. ");
            return;
        }

        if(options.length < vote.minVotes || options.length == 0){
            socket.emit(Protocol.VOTE_EDITOR.SET_OPTIONS, false, vote.options, "Setting these options makes the vote impossible. ");
            return;
        }

        //we have updated the vote
        vote.options = options;
        vote.emit("update");

        socket.emit(Protocol.VOTE_EDITOR.SET_OPTIONS, true, vote.options);
    });

    return this;
};


/**
 * Closes the Editor and unbinds all events.
 */
VoteEditorClient.prototype.close = function(){

    logger.info("VOTE_EDIT:", this.id, "stopped editing", this.vote.id);

    //unlisten for Vote Updates.
    this.vote.removeListener("update", this.handlers[0]);
    this.vote.removeListener("delete", this.handlers[1]);
    this.socket.removeListener("disconnect", this.handlers[2]);


    //unbind all the socket events
    this.socket
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_VOTE_ID)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_TITLE)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_TITLE)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_MACHINE_NAME)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_MACHINE_NAME)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_DESCRIPTION)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_DESCRIPTION)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_VOTING_PERMISSIONS)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_VOTING_PEOPLE)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_VOTING_PERMISSIONS)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_ADMIN_PERMISSIONS)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_ADMIN_PERMISSIONS)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_ADMIN_PEOPLE)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_OPENCLOSE_TIME)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_OPENCLOSE_TIME)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_CLOSE_TIME)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_CLOSE_TIME)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_MINMAXVOTES)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_MINMAXVOTES)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_OPTIONS)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_OPTIONS)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_STAGE)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_STAGE);
}

module.exports = VoteEditorClient;
