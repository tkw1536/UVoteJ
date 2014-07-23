/**
 * The client-side counterpart to {@link Frontend.Server.VoteEditorClient}
 *
 * @param {NodeJS.SocketIO} socket - Socket to listen on.
 * @param {Client~editCallback} callback - Callback once we are ready. Will return the vote id as value.
 * @param {function} close_callback - Callback to be called once the voteEditor has to be closed.
 * @alias Client.VoteEditor
 * @this {Client.VoteEditor}
 * @class
 */

Client.VoteEditor = function(socket, callback, close_callback){
    var me = this;

    /**
     * The client to communicate via.
     * @name Client.VoteEditor#socket
     * @type {NodeJS.SocketIO}
     */
    this.socket = socket;

    /**
     * ID of the vote in question.
     * @name Client.VoteEditor#id
     * @type {string}
     */
    this.id = undefined;

    /**
     * Callback to trigger when the Vote Editor is closed.
     * @name Client.VoteEditor#close_callback
     * @type {function}
     */
    this.close_callback = close_callback;


    this.socket
    .once(Client.Protocol.VOTE_EDITOR.GET_ID, function(res, value, msg){
        if(!res){
            //we aren't ready
            callback(false, value, msg);
        } else {
            me.id = value;
            callback(true, value, msg);
        }
    })
    .once(Client.Protocol.VOTE_EDITOR.VOTE_DELETED, function(){

    })
    .emit(Client.Protocol.VOTE_EDITOR.GET_ID);
}

/**
 * Gets or sets the vote name.
 *
 * @param {string} [value] - Value to set the title to. If omitted, gets the value.
 * @param {Client~editCallback} callback - Callback on return.
 * @return {Client.VoteEditor} - for chaining
 */
Client.VoteEditor.prototype.name = function(value, callback){
    if(typeof value != "string"){
        //Assume we want to get the value.
        var callback = (typeof value == "function")?value:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.GET_TITLE, callback)
        .emit(Client.Protocol.VOTE_EDITOR.GET_TITLE);
    } else {
        //Assume we want to set the value.
        var callback = (typeof callback == "function")?callback:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.SET_TITLE, callback)
        .emit(Client.Protocol.VOTE_EDITOR.SET_TITLE, value);
    }

    return this;
}


/**
 * Gets or sets the machine_name.
 *
 * @param {string} [value] - Value to set the machine_name to. If omitted, gets the value.
 * @param {Client~editCallback} callback - Callback on return.
 * @return {Client.VoteEditor} - for chaining
 */
Client.VoteEditor.prototype.machine_name = function(value, callback){
    if(typeof value != "string"){
        //Assume we want to get the value.
        var callback = (typeof value == "function")?value:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.GET_MACHINE_NAME, callback)
        .emit(Client.Protocol.VOTE_EDITOR.GET_MACHINE_NAME);
    } else {
        //Assume we want to set the value.
        var callback = (typeof callback == "function")?callback:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.SET_MACHINE_NAME, callback)
        .emit(Client.Protocol.VOTE_EDITOR.SET_MACHINE_NAME, value);
    }

    return this;
}

/**
 * Gets or sets the description.
 *
 * @param {string} [value] - Value to set the description to. If omitted, gets the value.
 * @param {Client~editCallback} callback - Callback on return.
 * @return {Client.VoteEditor} - for chaining
 */
Client.VoteEditor.prototype.description = function(value, callback){
    if(typeof value !== "string"){
        //Assume we want to get the value.
        var callback = (typeof value == "function")?value:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.GET_DESCRIPTION, callback)
        .emit(Client.Protocol.VOTE_EDITOR.GET_DESCRIPTION);
    } else {
        //Assume we want to set the value.
        var callback = (typeof callback == "function")?callback:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.SET_DESCRIPTION, callback)
        .emit(Client.Protocol.VOTE_EDITOR.SET_DESCRIPTION, value);
    }

    return this;
}

/**
 * Gets or sets the voting_permissions.
 *
 * @param {Backend.PermissionNode.Rule[]} [value] - Value to set the voting_permissions to. If omitted, gets the value.
 * @param {Client~editCallback} callback - Callback on return.
 * @return {Client.VoteEditor} - for chaining
 */
Client.VoteEditor.prototype.voting_permissions = function(value, callback){
    if(typeof value !== "object"){
        //Assume we want to get the value.
        var callback = (typeof value == "function")?value:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.GET_VOTING_PERMISSIONS, callback)
        .emit(Client.Protocol.VOTE_EDITOR.GET_VOTING_PERMISSIONS);
    } else {
        //Assume we want to set the value.
        var callback = (typeof callback == "function")?callback:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.SET_VOTING_PERMISSIONS, callback)
        .emit(Client.Protocol.VOTE_EDITOR.SET_VOTING_PERMISSIONS, value);
    }

    return this;
}

/**
 * Gets or sets the admin_permissions.
 *
 * @param {Backend.PermissionNode.Rule[]} [value] - Value to set the admin_permissions to. If omitted, gets the value.
 * @param {Client~editCallback} callback - Callback on return.
 * @return {Client.VoteEditor} - for chaining
 */
Client.VoteEditor.prototype.admin_permissions = function(value, callback){
    if(typeof value !== "object"){
        //Assume we want to get the value.
        var callback = (typeof value == "function")?value:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.GET_ADMIN_PERMISSIONS, callback)
        .emit(Client.Protocol.VOTE_EDITOR.GET_ADMIN_PERMISSIONS);
    } else {
        //Assume we want to set the value.
        var callback = (typeof callback == "function")?callback:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.SET_ADMIN_PERMISSIONS, callback)
        .emit(Client.Protocol.VOTE_EDITOR.SET_ADMIN_PERMISSIONS, value);
    }

    return this;
}


/**
 * Gets or sets the minimum and maximum Votes.
 *
 * @param {number[]} [value] - Value to set the minimum and maximum votes to. Should be an array containing two numbers. If omitted, gets the value.
 * @param {Client~editCallback} callback - Callback on return.
 * @return {Client.VoteEditor} - for chaining
 */
Client.VoteEditor.prototype.minmax = function(value, callback){
    if(typeof value !== "object"){
        //Assume we want to get the value.
        var callback = (typeof value == "function")?value:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.GET_MIMMAXVOTES, callback)
        .emit(Client.Protocol.VOTE_EDITOR.GET_MIMMAXVOTES);
    } else {
        //Assume we want to set the value.
        var callback = (typeof callback == "function")?callback:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.SET_MIMMAXVOTES, callback)
        .emit(Client.Protocol.VOTE_EDITOR.SET_MIMMAXVOTES, value);
    }

    return this;
}

/**
 * Gets the current server time.
 *
 * @param {Client~editCallback} callback - Callback on return.
 * @return {Client.VoteEditor} - for chaining
 */
Client.VoteEditor.prototype.server_time = function(callback){
    this.socket
    .once(Client.Protocol.VOTE_EDITOR.GET_TIME, callback)
    .emit(Client.Protocol.VOTE_EDITOR.GET_TIME);

    return this;
}

/**
 * Gets or sets the open and close times.
 *
 * @param {number[]} [value] - Value to set the opening and closing times to. Should be an array containing two numbers. If omitted, gets the value.
 * @param {Client~editCallback} callback - Callback on return.
 * @return {Client.VoteEditor} - for chaining
 */
Client.VoteEditor.prototype.openclose = function(value, callback){
    if(typeof value !== "object"){
        //Assume we want to get the value.
        var callback = (typeof value == "function")?value:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.GET_OPENCLOSE_TIME, callback)
        .emit(Client.Protocol.VOTE_EDITOR.GET_OPENCLOSE_TIME);
    } else {
        //Assume we want to set the value.
        var callback = (typeof callback == "function")?callback:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.SET_OPENCLOSE_TIME, callback)
        .emit(Client.Protocol.VOTE_EDITOR.SET_OPENCLOSE_TIME, value);
    }

    return this;
}

/**
 * Gets or sets the current Stage.
 *
 * @param {Frontend.Server.Protocol.Stage} [value] - Value to set the stage to. If omitted, gets the value.
 * @param {Client~editCallback} callback - Callback on return.
 * @return {Client.VoteEditor} - for chaining
 */
Client.VoteEditor.prototype.stage = function(value, callback){
    if(typeof value !== "number"){
        //Assume we want to get the value.
        var callback = (typeof value == "function")?value:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.GET_STAGE, callback)
        .emit(Client.Protocol.VOTE_EDITOR.GET_STAGE);
    } else {
        //Assume we want to set the value.
        var callback = (typeof callback == "function")?callback:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.SET_STAGE, callback)
        .emit(Client.Protocol.VOTE_EDITOR.SET_STAGE, value);
    }

    return this;
}

/**
 * Gets or sets the current options.
 *
 * @param {Backend.Vote.Option[]} [value] - Value to set the options to. If omitted, gets the value.
 * @param {Client~editCallback} callback - Callback on return.
 * @return {Client.VoteEditor} - for chaining
 */
Client.VoteEditor.prototype.options = function(value, callback){
    if(typeof value !== "object"){
        //Assume we want to get the value.
        var callback = (typeof value == "function")?value:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.GET_OPTIONS, callback)
        .emit(Client.Protocol.VOTE_EDITOR.GET_OPTIONS);
    } else {
        //Assume we want to set the value.
        var callback = (typeof callback == "function")?callback:function(){};

        this.socket
        .once(Client.Protocol.VOTE_EDITOR.SET_OPTIONS, callback)
        .emit(Client.Protocol.VOTE_EDITOR.SET_OPTIONS, value);
    }

    return this;
}

/**
 * Gets the vote results.
 *
 * @param {Client~editCallback} callback - Callback on return.
 * @return {Client.VoteEditor} - for chaining
 */
Client.VoteEditor.prototype.results = function(callback){
    //Assume we want to get the value.
    var callback = (typeof callback == "function")?callback:function(){};

    this.socket
    .once(Client.Protocol.VOTE_EDITOR.GET_RESULTS, callback)
    .emit(Client.Protocol.VOTE_EDITOR.GET_RESULTS);

    return this;
}

/**
 * Gets the voting stats.
 *
 * @param {Client~editCallback} callback - Callback on return.
 * @return {Client.VoteEditor} - for chaining
 */
Client.VoteEditor.prototype.stats = function(callback){
    //Assume we want to get the value.
    var callback = (typeof callback == "function")?callback:function(){};

    this.socket
    .once(Client.Protocol.VOTE_EDITOR.GET_VOTER_STATS, callback)
    .emit(Client.Protocol.VOTE_EDITOR.GET_VOTER_STATS);

    return this;
}

/**
 * Executes all other callback methods at the same time and returns them in the form {"function_name": arguments_to_result_callback}
 *
 * @param {function} callback - Simple callback containing the resulting object.
 * @return {Client.VoteEditor} - for chaining
 */
Client.VoteEditor.prototype.grabAll = function(callback){
    var things = ["server_time", "name", "machine_name", "description", "voting_permissions", "admin_permissions", "minmax", "openclose", "stage", "options", "results", "stats"];
    var counter = 0;
    var res = {}

    for(var i=0;i<things.length;i++){
        (function(what){
            //request "what"
            this[what](function(s,r,m){
                res[what] = [s,r,m]; //store it where it belongs

                //and do the counter thing.
                counter++;
                if(counter == things.length){
                    //we have received all things!
                    callback(res);
                }
            });
        }).call(this, things[i]);
    }

    return this;
}

/**
 * Closes this vote editor. 
 *
 * @return {Client.VoteEditor} - for chaining
 */
Client.VoteEditor.prototype.close = function(){
    this.close_callback();

    return this;
}
