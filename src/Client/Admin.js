/**
 * Represents a client to the admin interface.
 *
 * @alias Client.Admin
 * @class
 * @this {Client.Admin}
 */
Client.Admin = function(){
    /**
    * A Socket.IO Socket Representing the connection to the server.
    * @name Client.Admin#socket
    */
    this.socket = undefined;

    /**
    * Boolean Indicating if the user is Logged in.
    * @name Client.Admin#isLoggedIn
    * @type {boolean}
    */
    this.isLoggedIn = false;

    /**
    * Current VoteEditor (if applicable)
    * @name Client.Admin#voteEditor
    * @type {Client.VoteEditor}
    */
    this.voteEditor = undefined;

    /**
    * The current Votes.
    */
    this.votes = {}
}

/**
 * Connects and logs in to the server using the given username and password.
 *
 * @param {string} username - Username to use for logging in.
 * @param {string} password - Password to use for logging in.
 * @param {Client~resultCallback} callback - Callback on login.
 * @return {boolean} - indicating if the request has been started.
 */
Client.Admin.prototype.login = function(username, password, callback){
    var me = this;

    if(this.isLoggedIn){
        return false;
    } else {
        var login = function(){
            //listen for the answer
            me.socket.once(Client.Protocol.ADMIN.LOGIN, function(s, msg){
                if(!s){
                    //we couldn't log in
                    callback(false, msg);
                } else {
                    me.isLoggedIn = true;
                    callback(true);
                }
            });

            Client.load("VoteEditor", function(){
                //emit the login event
                me.socket.emit(Client.Protocol.ADMIN.LOGIN, username, password);
            });

        }


        if(!this.socket){
            //we need to make a socket first
            this.socket = io.connect(location.protocol+"//"+location.hostname+((location.port == "")?"":":"+location.port), {reconnect: false});

            //listen for the nice broadcasts
            this.socket.on(Client.Protocol.ADMIN.ADMIN_MESSAGE_BROADCAST, function(msg){
                alert(msg);
            });

            //once we are connected, try to login
            this.socket.once(Client.Protocol.ADMIN.CONNECT, function(){
                login();
            });
        } else {
            //we a already have a socket, we can login immediatly
            login();
        }
        return true;
    }
}

/**
 * Exists the current session on the server.
 *
 * @return {boolean} - indicating if the logout was successfull.
 */
Client.Admin.prototype.logout = function(){
    //disconnect the server
    try{
        this.socket.close();
    } catch(e){}


    //set Everything back.
    this.socket = undefined;
    this.isLoggedIn = false;
    return true;
}

/**
 * Gets the UUIDs of all existing votes from the server.
 *
 * @param {Client~resultCallback} callback - Callback on results.
 * @return {boolean} - indicating if the request has been started.
 */
Client.Admin.prototype.getUUIDs = function(cb){
    if(!this.isLoggedIn){
        return false;
    }

    //Listen for the result
    this.socket.once(Client.Protocol.ADMIN.LIST_VOTE_UUIDS, cb);

    //Send the request
    this.socket.emit(Client.Protocol.ADMIN.LIST_VOTE_UUIDS);

    return true;
}

/**
 * Starts the editing on a given vote.
 *
 * @param {Client~resultCallback} callback - Callback on results.
 * @return {boolean} - indicating if the request has been started.
 */
Client.Admin.prototype.editVote = function(uuid, callback){
    if(!this.isLoggedIn){
        return false;
    }

    var me = this;

    //end the editing
    this.socket.once(Client.Protocol.ADMIN.END_EDIT, function(){
        me.voteEditor = undefined;
        me.socket.once(Client.Protocol.ADMIN.BEGIN_EDIT, function(r){
            if(!r){
                //we couldn't start editing
                callback.apply(me, arguments);
            } else {
                //we can start editing
                me.voteEditor = new Client.VoteEditor(me.socket);
                callback.call(me, true, me.voteEditor);
            }
        });

        me.socket.emit(Client.Protocol.ADMIN.BEGIN_EDIT, uuid); 
    });

    this.socket.emit(Client.Protocol.ADMIN.END_EDIT);

    return true;
}

/**
 * Sends a message to all admins currently logged on.
 *
 * @param {string} msg - Message to send.
 * @return {boolean} - indicating if the sending was.
 */
Client.Admin.prototype.message = function(msg){
    if(!this.isLoggedIn){
        return false;
    }

    this.socket.emit(Client.Protocol.ADMIN.ADMIN_MESSAGE_BROADCAST, msg);
}
