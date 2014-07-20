var Protocol = require("./protocol.js"),
    logger = require("winston"),
    Vote = require("../../Backend").Vote;

/**
 * Represents an editable vote client.
 *
 * @param {NodeJS.SocketIO} socket - Socket to listen on.
 * @param {Backend.Vote} vote - Vote to make editable.
 * @param {Frontend.State} state - Current State of the server.
 *
 * @return {Frontend.Server.VoteEditorClient} - for chaining
 * @alias Frontend.Server.VoteEditorClient
 * @this {Frontend.Server.VoteEditorClient}
 * @class
 */
var VoteEditorClient = function(socket, vote, state){
    var me = this;

    /**
     * The socket this VoteEditorClient belongs to.
     * @name Frontend.Server.VoteEditorClient#socket
     * @type {NodeJS.SocketIO}
     */
    this.socket = socket;

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

    //Listen for updates on the vote
    vote.on("update."+this.id, function(){
        me.socket.emit(Protocol.VOTE_EDITOR.VOTE_UPDATED);
    });


    //Check for disconnect
    this.socket.on("disconnect", function(){
        logger.info("VOTE_EDIT:", this.id, "stopped editing", vote.id);
        me.close();
    });

    logger.info("VOTE_EDIT:", this.id, "started editing", vote.id);

    //Listen for all the events.
    this
    .title()
    .machine_name()
    .description()
    .voting_permissions()
    .admin_permissions(); 

};

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
        if(vote.stage !== Protocol.Stage.INIT){
            socket.emit(Protocol.VOTE_EDITOR.SET_MACHINE_NAME, false, vote.machine_name, "Cannot edit vote while in non-init stage. ");
        } else {

            //Check if we have another vote with the given machine_id
            var thatId = state.db.machine_to_uuid(machine_name);

            if(thatId != "" && thatId != vote.id){
                //we already have a machine_id like that from someone who is not me.
                socket.emit(Protocol.VOTE_EDITOR.SET_MACHINE_NAME, false, vote.machine_name, "Specefied machine_name already taken by another vote. ");
            } else {
                //we updated the vote
                vote.machine_name = machine_name;
                vote.emit("update");

                //send that to the client.
                socket.emit(Protocol.VOTE_EDITOR.SET_MACHINE_NAME, true, vote.name);
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

    socket
    .on(Protocol.VOTE_EDITOR.GET_VOTING_PERMISSIONS, function(){
        //send name to the client.
        socket.emit(Protocol.VOTE_EDITOR.GET_VOTING_PERMISSIONS, true, vote.votePermissions.toJSON());
    })
    .on(Protocol.VOTE_EDITOR.GET_VOTING_PERMISSIONS, function(voting_node){
        if(vote.stage !== Protocol.Stage.INIT){
            socket.emit(Protocol.VOTE_EDITOR.SET_VOTING_PERMISSIONS, false, vote.votePermissions.toJSON(), "Cannot edit vote while in non-init stage. ");
        } else {
            //we updated the vote
            vote.votePermissions.fromJSON(voting_node);
            vote.emit("update");

            //send that to the client.
            socket.emit(Protocol.VOTE_EDITOR.SET_VOTING_PERMISSIONS, true, vote.votePermissions.toJSON());
        }
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

    socket
    .on(Protocol.VOTE_EDITOR.GET_ADMIN_PERMISSIONS, function(){
        //send name to the client.
        socket.emit(Protocol.VOTE_EDITOR.GET_ADMIN_PERMISSIONS, true, vote.adminPermissions.toJSON());
    })
    .on(Protocol.VOTE_EDITOR.SET_ADMIN_PERMISSIONS, function(admin_node){
        //admin permissions can always be updated in order to allow more / less people to edit a vote.

        //we updated the vote
        vote.adminPermissions.fromJSON(admin_node);
        vote.emit("update");

        //send that to the client.
        socket.emit(Protocol.VOTE_EDITOR.SET_ADMIN_PERMISSIONS, true, vote.adminPermissions.toJSON());
    });

    return this;
}


/**
 * Closes the Editor and unbinds all events.
 */
VoteEditorClient.prototype.close = function(){

    //unlisten for Vote Updates.
    this.vote.removeAllListeners("update."+this.id);

    //unbind all the socket events
    this.socket
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_TITLE)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_TILE)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_MACHINE_NAME)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_DESCRIPTION)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_DESCRIPTION)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_VOTING_PERMISSIONS)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_VOTING_PERMISSIONS)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_ADMIN_PERMISSIONS)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_ADMIN_PERMISSIONS)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_OPEN_TIME)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_OPEN_TIME)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_CLOSE_TIME)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_CLOSE_TIME)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_MIMMAXVOTES)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_MINMAXVOTES)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_OPTIONS)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_OPTIONS)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_STAGE)
    .removeAllListeners(Protocol.VOTE_EDITOR.SET_STAGE)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_RESULTS)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_VOTERS)
    .removeAllListeners(Protocol.VOTE_EDITOR.GET_TIME);
}

module.exports = VoteEditor;
