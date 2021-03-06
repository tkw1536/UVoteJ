var
    util = require("util"),
    events = require("events"),
    PermissionNode = require("./PermissionNode"),
    logger = require("winston");

/**
 * Creates a new Vote.
 *
 * @class
 * @alias Backend.Vote
 * @augments NodeJS.EventEmitter
 * @this {Backend.Vote}
 * @param {Backend.Vote.Source} [source_object] - Optional JSON-style source for the vote.
 */
var Vote = function Vote(source_object){

    //for unnamed things
    var now = new Date();

    /**
    * Human-Readable Name of this vote.
    *
    * @name Backend.Vote#name
    * @type String
    * @default Unnamed Vote from (Date)
    */
    this.name = "Unnamed Vote from "+now.toLocaleString();

    /**
    * Machine-Readable Name of this vote.
    *
    * @name Backend.Vote#machine_name
    * @type String
    * @default unnamed_vote_(Date)
    */
    this.machine_name = "unnamed_vote_"+now.getTime().toString();

    /**
    * Description of Vote. May contain Markdown.
    *
    * @name Backend.Vote#description
    * @type String
    * @default An unnamed vote created at  (Date).
    */
    this.description = "An unnamed vote created at "+now.toLocaleString()+". ";

    /**
    * Set of options for this vote.
    *
    * @name Backend.Vote#options
    * @type Backend.Vote.Option[]
    */
    this.options = [{
        "title": "Option",
        "short_description": "This is an option for this vote. ",
        "markdown_description": "**Please change it using the vote editor**"
    }];

    /**
    * Id of this vote. Automatically assigned by other classes.
    *
    * @name Backend.Vote#.id
    * @type string
    * @default undefined
    */
    this.id = undefined;

    /**
    * Minimum Number of votes required.
    *
    * @name Backend.Vote#minVotes
    * @type number
    * @default 1
    */
    this.minVotes = 1;

    /**
    * Maximum number of votes allowed.
    *
    * @name Backend.Vote#maxVotes
    * @type number
    * @default 1
    */
    this.maxVotes = 1;

    /**
    * PermissonNode representing users with access to voting.
    *
    * @name Backend.Vote#votePermissions
    * @type Backend.PermissionNode
    */
    this.votePermissions = new PermissionNode();

    /**
    * PermissonNode representing users with access to voting administration.
    * Might be superseded by the site-wide Admin permissionNode.
    *
    * @name Backend.Vote#adminPermissions
    * @type Backend.PermissionNode
    * @default Empty Permission Node.
    */
    this.adminPermissions = new PermissionNode();

    /**
    * Current Stage of the Vote.
    *
    * @name Backend.Vote#stage
    * @type Backend.Vote.Stage
    * @default {@link Backend.Vote.Stage|Vote.Stage.INIT}
    */
    this.stage = Vote.Stage.INIT;

    /**
    * Time when the {@link Backend.Vote.Stage|Vote.Stage.OPEN} is scheduled.
    * Set to undefined if not scheduled.
    *
    * @name Backend.Vote#open_time
    * @type number
    * @default undefined
    */
    this.open_time = undefined;

    /**
    * Time when the {@link Backend.Vote.Stage|Vote.Stage.CLOSE} is scheduled.
    * Set to undefined if not scheduled.
    *
    * @name Backend.Vote#close_time
    * @type number
    * @default undefined
    */
    this.close_time = undefined;

    /**
    * List of votes for each opinion.
    *
    * @name Backend.Vote#results
    * @type number[]
    */
    this.results = undefined;

    /**
    * List of user identifiers of people that have voted. After the vote is CLOSED, we replace this by only the number.
    *
    * @name Backend.Vote#voters
    * @type {string[]|number}
    */
    this.voters = [];

    /**
    * Number of eligible voters. has to be udpated manually to take effect.
    *
    * @name Backend.Vote#count_eligible
    * @type number
    */
    this.count_eligible = undefined;

    /**
    * Current Timer for {@link Backend.Vote.Stage} scheduling or undefined.
    *
    * @private
    * @name Backend.Vote#_timer
    * @type *
    */
    this._timer = undefined;

    //load it from source if required.
    if(typeof source_object !== "undefined"){
        this.fromJSON(source_object);
    }
}

util.inherits(Vote, events.EventEmitter);

/**
* Updates this Vote form JSON data.
*
* @param {Backend.Vote.Source} [source_object] - JSON-style source for this vote.
* @return {Backend.Vote} - The Vote the function was originally called on.
*/
Vote.prototype.fromJSON = function(source_object){

    //general Vote info
    this.name = source_object.name;
    this.id = source_object.id;
    this.machine_name = source_object.machine_name;
    this.description = source_object.description;

    //Options & config
    this.options = source_object.options;
    this.minVotes = source_object.minVotes;
    this.maxVotes = source_object.maxVotes;

    //Permissions
    this.votePermissions.fromJSON(source_object.votePermissions);
    this.adminPermissions.fromJSON(source_object.adminPermissions);

    //Results
    this.results = source_object.results;
    this.voters = source_object.voters;
    this.count_eligible = source_object.count_eligible;

    //Update staging, we need to stop this
    this.stopStages();
    this.stage = source_object.stage;
    this.open_time = source_object.open_time;
    this.close_time = source_object.close_time;
    this.startStages();

    /**
    * Update event. Occurs whenever this PermissionNode is updated.
    *
    * @event Backend.Vote#update
    */
    this.emit("update");
}

/**
* Returns the JSON-style source of this Vote.
*
* @return {Backend.Vote.Source} - The source of this Vote.
*/
Vote.prototype.toJSON = function(){
    return JSON.parse(JSON.stringify({
        //general vote info
        "name": this.name,
        "machine_name": this.machine_name,
        "id": this.id,
        "description": this.description,

        //options, config
        "options": this.options,
        "minVotes": this.minVotes,
        "maxVotes": this.maxVotes,

        //Permissions
        "votePermissions": this.votePermissions.toJSON(),
        "adminPermissions": this.adminPermissions.toJSON(),

        //Results
        "results": this.results,
        "voters": this.voters,
        "count_eligible": this.count_eligible,

        //Staging
        "stage": this.stage,
        "open_time": this.open_time,
        "close_time": this.close_time
    }));
}

/**
* Stops all current staging timers.
*
* @return {Backend.Vote} - The vote this function was originally called from.
*/
Vote.prototype.stopStages = function(){
    //if we have a timeout, please clear it.
    if(typeof this._timer !== "undefined"){
        clearTimeout(this._timer());
        logger.info("VOTE: Scheduled for", this.id, " aborted. ");
        this._timer = undefined;
    }

    return this;
}


/*
  A helper function to fix timeouts of more than the max of INT_32.
  This one really makes sure that we have a proper timeout.
  from: http://stackoverflow.com/a/16321280
 */
var setLongTimeout = function(callback, timeout_ms) {

    var q = undefined;


    //if we have to wait more than max time, need to recursively call this function again
    if(timeout_ms > 2147483647){
        //now wait until the max wait time passes then call this function again with
        //requested wait - max wait we just did, make sure and pass callback
        q = setTimeout(function(){
            q = setLongTimeout(callback, (timeout_ms - 2147483647));
        }, 2147483647);
    } else {
        //if we are asking to wait less than max, finally just do regular seTimeout and call callback
        q = setTimeout(callback, timeout_ms);
    }

    return function(){
        if(typeof q == "function"){
            return q();
        } else {
            return q;
        }
    }
}

/**
* Sets Staging timers.
*
* @return {Backend.Vote} - The vote this function was originally called from.
*/
Vote.prototype.startStages = function(){
    //self-reference for callbacks
    var me = this;

    //make sure everything is stopped first.
    this.stopStages();

    if(this.stage == Vote.Stage.INIT && typeof this.open_time == "number"){
        //we need to set a timeout for opening the stage

        var now = (new Date()).getTime();
        var then = (this.open_time - now);

        var next_stage = function(){
            me._timer = undefined;

            logger.info("VOTE:", me.id, "now at STAGE.OPEN");

            //update the results, we need to reset them.
            me.results = [];

            //everything should be zero now.
            for(var i=0;i<me.options.length;i++){
                me.results.push(0);
            }

            //set the Stage to open
            me.stage = Vote.Stage.OPEN;

            //set the next timer
            me.startStages();

            //we have updated
            me.emit("update");
        }

        if(then > 0){
            logger.info("VOTE: Scheduled", me.id, "Stage.OPEN for", new Date(me.open_time).toLocaleString());
            this._timer = setLongTimeout(next_stage, then);
        } else {
            logger.warn("VOTE: ", me.id, " is behind schedule, setting late Stage.OPEN originally planned for ", new Date(me.open_time).toLocaleString());
            next_stage();
        }
    }

    if(this.stage == Vote.Stage.OPEN && typeof this.close_time == "number"){
        //we need to set a timeout for closing the stage

        var now = (new Date()).getTime();
        var then = ( this.close_time - now);

        var next_stage = function(){
            me._timer = undefined;

            logger.info("VOTE:", me.id, "now at STAGE.CLOSED");

            //set the Stage to closed
            me.stage = Vote.Stage.CLOSED;

            //Count the voters, we no longer need to know who voted.
            me.voters = me.voters.length;

            //we have updated
            me.emit("update");
        }

        if(then > 0){
            logger.info("VOTE: Scheduled", me.id, "Stage.CLOSED for", new Date(me.close_time).toLocaleString());
            this._timer = setLongTimeout(next_stage, then);
        } else {
            logger.warn("VOTE: ", me.id, " is behind schedule, setting late Stage.CLOSED originally planned for ", new Date(me.close_time).toLocaleString());
            next_stage();
        }
    }
}

/**
* Attempts to place a vote.
*
* @param {stering} username - Username of the user.
* @param {object} user - JSON-like information about the user attempting to vote.
* @param {number[]} opinions List of indexes of options selected.
* @return {Backend.Vote.VoteState} - Status of the Voting attempt.
*/
Vote.prototype.vote = function(username, user, opinions){

    //is the vote open?
    if(this.stage !== Vote.Stage.OPEN){
        return Vote.VoteState.CLOSED;
    }

    //do we have the right number of votes?
    if(opinions.length < this.minVotes || opinions.length > this.maxVotes){
        return Vote.VoteState.INVALID_NUMBER;
    }

    //List of unique vote
    var uniques = [];

    //do we only have votes that exist?
    for(var i=0;i<opinions.length;i++){
        if(typeof opinions[i] !== "number"){
            //Vote has to be a number
            return Vote.VoteState.UNKNOWN_OPINION;
        }

        if(opinions[i] % 1 !== 0){
            //it has to be an integer
            return Vote.VoteState.UNKNOWN_OPINION;
        }

        if(opinions[i] < 0 || opinions[i] >= this.options.length){
            //it has to be in the correct range
            return Vote.VoteState.UNKNOWN_OPINION;
        }

        //Do we have this opinion more than once?
        if(uniques.indexOf(opinions[i]) === -1){
            uniques.push(opinions[i])
        } else {
            return Vote.VoteState.DOUBLE_OPINION;
        }
    }



    //are we allowed to vote?
    if (!this.votePermissions.matches(user)){
        return Vote.VoteState.CANT_VOTE;
    }

    //have we already voted?
    if(this.voters.indexOf(username) !== -1){
        return Vote.VoteState.HAS_VOTED;
    }

    //ok, add me to the voters now!
    this.voters.push(username);

    //and don't forget to vote!
    for(var i=0;i<opinions.length;i++){
        this.results[opinions[i]]++;
    }

    //cause the update event, something has happened.
    this.emit("update");
}

/**
 * Vote Stages.
 * @see {@link Frontend.Server.Protocol.Stage}
*/
Vote.Stage = require("../Frontend/Server/protocol.js").Stage;

/**
 * Status of voting.
 * @see {@link Frontend.Server.Protocol.VoteState}
*/
Vote.VoteState = require("../Frontend/Server/protocol.js").VoteState;

/**
 * A JSON-style source object of the vote. Intended to be used to store in a database.
 *
 * @typedef {Object} Backend.Vote.Source
 * @property {string} name - Human-Readable Name of this vote.
 * @property {string} machine_name - Machine-Readable Name of this vote.
 * @property {string} id - Unique ID of this vote.
 * @property {string} description - Description of Vote. May contain Markdown.
 * @property {Backend.Vote.Option[]} options - Set of options for this vote.
 * @property {number} minVotes - Minimum number of votes required for this vote.
 * @property {number} maxVotes - Maximum number of votes allowed for this vote.
 * @property {number} count_eligible - Number of eligible voters.
 * @property {Backend.PermissionNode.Rule[]} votePermissions - PermissionNode for users being able to vote on this vote.
 * @property {Backend.PermissionNode.Rule[]} adminPermissions - PermissionNode for users being able to vote on this vote.
 * @property {number[]} results - List of results for this Vote.
 * @property {string[]} voters - List of user_identifiers of people that have voted.
 * @property {Vote.Stage} stage - Current Stage of the Vote.
 * @property {number} open_time - Time when the OPEN stage starts.
 * @property {number} close_time - Time when the CLOSED stage starts.
 */

 /**
  * A JSON-Style Vote Option
  *
  * @typedef {Object} Backend.Vote.Option
  *
  * @property {string} title - Title of this option. Short and human readable.
  * @property {string} short_description - Short, text only description of this Option.
  * @property {string} markdown_description - Description of the option, may contain markdown.
  */
 module.exports = Vote;
