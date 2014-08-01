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
 * Gets the current server time in milliseconds.
 *
 * @param {Client~resultCallback} callback - Callback on results.
 * @return {boolean} - indicating if the request has been started.
 */
Client.Admin.prototype.getTime = function(cb){

    //Listen for the result
    this.socket.once(Client.Protocol.ADMIN.GET_TIME, cb);

    //Send the request
    this.socket.emit(Client.Protocol.ADMIN.GET_TIME);

    return true;
}

/**
 * Gets the summary of all votes currently on the server.
 * @param {Client~resultCallback} callback - Callback on results.
 * @return {boolean} - indicating if the request has been started.
 */
Client.Admin.prototype.getSummaries = function(cb){
    if(!this.isLoggedIn){
        return false;
    }

    var me = this;

    //Listen for the result
    this.socket.once(Client.Protocol.ADMIN.LIST_VOTE_UUIDS, function(s, votes){
        if(!s){
            return cb.apply(this, arguments);
        }

        var result = [];

        //get info on a per element basis
        var get_info = function(i){
            if(i < votes.length){
                me.socket.once(Client.Protocol.ADMIN.GET_VOTE_SUMMARY, function(s, r){
                    //error
                    if(!s){
                        return cb.apply(me, arguments);
                    }

                    result.push(r);

                    get_info(i+1);
                });

                //emit the event
                me.socket.emit(Client.Protocol.ADMIN.GET_VOTE_SUMMARY, votes[i]);
            } else {
                return cb(true, result);
            }
        };

        get_info(0);

    });

    //Send the request
    this.socket.emit(Client.Protocol.ADMIN.LIST_VOTE_UUIDS);

    return true;
}

/**
 * Starts the editing on a given vote.
 *
 * @param {Client~resultCallback} callback - Callback on results.
 * @param {function} close_callback - Callback to call when the editor is closed.
 * @return {boolean} - indicating if the request has been started.
 */
Client.Admin.prototype.editVote = function(uuid, callback, close_callback){
    if(!this.isLoggedIn){
        return false;
    }

    var me = this;

    //end the editing
    this.socket.once(Client.Protocol.ADMIN.END_EDIT, function(){
        try{
            me.voteEditor.close(); //close the vote editor
        } catch(e){}

        me.voteEditor = undefined;

        me.socket.once(Client.Protocol.ADMIN.BEGIN_EDIT, function(r){
            if(!r){
                //we couldn't start editing
                callback.apply(me, arguments);
            } else {
                //we can start editing
                me.voteEditor = new Client.VoteEditor(me.socket, function(r, s, m){
                    if(r){
                        callback.call(me, true, me.voteEditor);
                    }
                }, function(msg){
                    //we are closed now, so we are undefined!
                    me.voteEditor = undefined;
                    close_callback(msg);
                });
            }
        });

        me.socket.emit(Client.Protocol.ADMIN.BEGIN_EDIT, uuid);
    });

    this.socket.emit(Client.Protocol.ADMIN.END_EDIT);

    return true;
}

/**
 * Creates a new vote.
 *
 * @param {Client~resultCallback} callback - Callback on results.
 * @return {boolean} - indicating if the request has been started.
 */
Client.Admin.prototype.createVote = function(cb){
    if(!this.isLoggedIn){
        return false;
    }

    //listen for event and then try to create one.
    this.socket.once(Client.Protocol.ADMIN.CREATE_VOTE, cb);
    this.socket.emit(Client.Protocol.ADMIN.CREATE_VOTE);

    return true;
}

/**
 * Deletes a vote.
 *
 * @param {string} uuid - UUID of vote to delete.
 * @param {Client~resultCallback} callback - Callback on results.
 * @return {boolean} - indicating if the request has been started.
 */
Client.Admin.prototype.deleteVote = function(uuid, cb){
    if(!this.isLoggedIn){
        return false;
    }

    //listen for event and then try to create one.
    this.socket.once(Client.Protocol.ADMIN.DELETE_VOTE, cb);
    this.socket.emit(Client.Protocol.ADMIN.DELETE_VOTE, uuid);

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
