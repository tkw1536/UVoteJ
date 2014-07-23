var VoteEditorClient = require("./VoteEditorClient.js"),
    Protocol = require("./protocol.js"),
    Vote = require("../../Backend").Vote
    logger = require("winston");

/**
 * Represents a client who wants to be an administrator.
 * @param {NodeJS.SocketIO} socket - Socket connection for incoming clients.
 * @param {Frontend.Server.AdminClientPool} AdminClientPool - The Pool this client belongs to.
 * @param {Frontend.State} state - The server state.
 * @class
 * @alias Frontend.Server.AdminClient
 * @this {Frontend.Server.AdminClient}
 */
var AdminClient = function AdminClient(socket, AdminClientPool, server_state){
    var me = this;

    /**
    * A unique ID of this client. Shared with the socket ID.
    * @type {string}
    * @alias Frontend.Server.AdminClient#id
    */
    this.id = socket.id;

    logger.info("ADMIN: Creating client", this.id);


    /**
    * The socket connected to this AdminClient.
    * @type {NodeJS.SocketIO}
    * @alias Frontend.Server.AdminClient#socket
    */
    this.socket = socket;

    /**
    * The AdminClientPool that belongs to this AdminClient.
    * @type {Frontend.Server.AdminClientPool}
    * @alias Frontend.Server.AdminClient#AdminClientPool
    */
    this.AdminClientPool = AdminClientPool;

    /**
    * The State of the server this AdminClient belongs to.
    * @type {Frontend.State}
    * @alias Frontend.Server.AdminClient#server_state
    */
    this.server_state = server_state;

    /**
    * Username used to login.
    * @type {string|undefined}
    * @alias Frontend.Server.AdminClient#login_user
    */
    this.login_user = undefined;

    /**
    * Password used to login.
    * @type {string|undefined}
    * @alias Frontend.Server.AdminClient#login_password
    */
    this.login_password = undefined;

    /**
    * JSON-style User-Information.
    * @type {object|undefined}
    * @alias Frontend.Server.AdminClient#login_info
    */
    this.login_info = undefined;

    /**
    * Boolean Indicating if this user is signed in.
    * @type {boolean}
    * @alias Frontend.Server.AdminClient#loggedIn
    */
    this.loggedIn = false;

    /**
    * Current VoteEditorClient (if appicable).
    * @alias Frontend.Server.AdminClient#loggedIn
    * @type {Frontend.Server.VoteEditorClient}
    */
    this.editVoteClient = undefined;

    //wait for login requests
    me.socket.on(Protocol.ADMIN.LOGIN, function(user, password){

        //we are already logged in => we cant do that again.
        if(me.loggedIn){
            socket.emit(Protocol.ADMIN.LOGIN, false, "Already logged in. ");
            return;
        }

        if(me.server_state.config.normalise_usernames){
            //normalise the username, please
            var user = user.toLowerCase().trim();
        }

        me.server_state.auth.loginUser(user, password, function(s, user_info){
            if(!s){
                logger.info("ADMIN: Failed to authenticate", me.id);
                socket.emit(Protocol.ADMIN.LOGIN, false, "Unknown username / password. ");
            } else {
                if(me.server_state.config.auth_admins.indexOf(user) !== -1){
                    me.loggedin(user, password, user_info);
                    socket.emit(Protocol.ADMIN.LOGIN, true);
                } else {
                    logger.info("ADMIN: Blocked non-admin login attempt by", me.id, "(", user, ")");
                    socket.emit(Protocol.ADMIN.LOGIN, false, "You are not an administrator. This is the admin login. Do not try to vote here. ");
                }
            }
        });
    });

    //register with the AdminClientPool
    this.AdminClientPool.clients[this.id] = this;

    // All the logout events
    this.socket.once(Protocol.ADMIN.DISCONNECT, function(){
        me.destroyed();
    });
    this.socket.once(Protocol.ADMIN.CANCEL_LOGIN, function(){
        me.destroyed(true);
    });
}


/**
 * Called once a user is logged in as admin
 * @param {string} user - Username used for login.
 * @param {string} password - Password used for login.
 * @param {object} user_info - JSON-style user-information.
 */
AdminClient.prototype.loggedin = function(user, password, user_info){
    var me = this;
    logger.info("ADMIN: Authenticated as", user, this.id);

    this.loggedIn = true;
    this.login_user = user;
    this.login_password = password;
    this.login_info = user_info;

    //Sending Admin Broadcasts
    this.socket.on(Protocol.ADMIN.ADMIN_MESSAGE_BROADCAST, function(msg){
        if(me.loggedIn){
            me.AdminClientPool.message(msg);
        }
    });

    //Listing UUIDs
    this.socket.on(Protocol.ADMIN.LIST_VOTE_UUIDS, function(){
        if(me.loggedIn){
            me.sendUUIDs();
        }
    });

    //Listening to edits
    this.socket.on(Protocol.ADMIN.BEGIN_EDIT, function(u){

        //we are already editing a vote
        if(me.editVoteClient){
            me.socket.emit(Protocol.ADMIN.BEGIN_EDIT, false, "Already editing a vote. ");
            return;
        }

        var vote = me.server_state.votes.votes[u];

        if(!vote){
            me.socket.emit(Protocol.ADMIN.BEGIN_EDIT, false, "Unknown Vote UUID. ");
            return;
        }

        //create the vote client
        me.editVoteClient = new VoteEditorClient(me.socket, vote, user, password, me.server_state);

        me.socket.emit(Protocol.ADMIN.BEGIN_EDIT, true);
    });

    //Listening to edits
    this.socket.on(Protocol.ADMIN.END_EDIT, function(){

        if(me.editVoteClient){
            //we are editing something.
            me.editVoteClient.close();
            me.editVoteClient = undefined;
        }

        me.socket.emit(Protocol.ADMIN.END_EDIT, true);
    });

    //get title of a vote
    this.socket.on(Protocol.ADMIN.GET_VOTE_SUMMARY, function(uuid){
        var vote = me.server_state.votes.votes[uuid];
        if(!vote){
            me.socket.emit(Protocol.ADMIN.GET_VOTE_SUMMARY, false, "Unknown Vote UUID. ");
            return;
        }

        //send info about the vote
        me.socket.emit(Protocol.ADMIN.GET_VOTE_SUMMARY, true, {
            "uuid": uuid,
            "name": vote.name,
            "machine_name": vote.machine_name,
            "description": vote.description
        });
    });

    //create a new vote, return the new UUID
    this.socket.on(Protocol.ADMIN.CREATE_VOTE, function(){
        me.server_state.votes.createVote(undefined, function(id){
            me.socket.emit(Protocol.ADMIN.CREATE_VOTE, id);
        });
    });

    //delete a vote
    this.socket.on(Protocol.ADMIN.DELETE_VOTE, function(uuid){
        var vote = me.server_state.votes.votes[uuid];

        if(!vote){
            return me.socket.emit(Protocol.ADMIN.DELETE_VOTE, false, "Unknown Vote UUID. ");
        }

        //Delete the vote.
        me.server_state.votes.removeVote(vote, function(){
            me.socket.emit(Protocol.ADMIN.DELETE_VOTE, true);
        });
    });

}

/**
 * Sends all existing vote UUIDs to the client.
 */
AdminClient.prototype.sendUUIDs = function(){
    var uuids = [];

    for(uuid in this.server_state.votes.votes){
        uuids.push(uuid);
    }

    //Log entry
    logger.info("ADMIN: Sending UUIDs to", this.id);

    //send the uuids to the client
    this.socket.emit(Protocol.ADMIN.LIST_VOTE_UUIDS, true, uuids);
}

/**
 * Sends this AdminClient a message.
 * @param {string} msg - Message to send.
 */
AdminClient.prototype.message = function(msg){
    logger.info("ADMIN: Sending message to", this.id+":", msg);
    this.socket.emit(Protocol.ADMIN.ADMIN_MESSAGE_BROADCAST, msg);
}

/**
 * Destroys and logs out this client.
 */
AdminClient.prototype.logout = function(){
    //disconnect the client
    this.socket.disconnect();
    this.destroyed(true);
}

/**
 * Called upon destruction of this client.
 * @param {boolean} keep_socket - Boolean indicating if the connection should be kept open.
 */
AdminClient.prototype.destroyed = function(keep_socket){
    if (keep_socket){
        logger.info("ADMIN: Destroying client", this.id);
    } else {
        logger.info("ADMIN: Destroying connection", this.id);
    }

    if(this.editVoteClient){
        this.editVoteClient.close();
    }

    //Delete all the information
    this.loggedIn = false;
    this.login_user = undefined;
    this.login_password = undefined;
    this.login_info = undefined;

    if(!keep_socket){
        //close the connection
        this.socket.disconnect();
    } else {
        //no longer listen to login attempts
        this.socket.off(Protocol.ADMIN.LOGIN);
    }

    //unregister from the AdminClientPool
    delete this.AdminClientPool.clients[this.id];
}


module.exports = AdminClient;
