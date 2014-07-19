var AdminClient = require("./AdminClient.js"),
    Protocol = require("./protocol.js"),
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
        me.AdminClientPool.message(msg);
    });
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