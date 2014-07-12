var
    util = require("util"),
    events = require("events"),
    PermissionNode = require("./PermissionNode");

/**
 * Creates a new Vote.
 *
 * @class
 * @inherits EventEmitter
 * @this {Vote}
 * @param {Vote.Source} [source_object] - Optional JSON-style source for the vote.
 */
function Vote(source_object){

    //for unnamed things
    var now = new Date();

    /**
    * Human-Readable Name of this vote.
    *
    * @name Vote#name
    * @type String
    * @default Unnamed Vote from (Date)
    */
    this.name = "Unnamed Vote from "+now.toLocaleString();

    /**
    * Machine-Readable Name of this vote.
    *
    * @name Vote#machine_name
    * @type String
    * @default unnamed_vote_(Date)
    */
    this.machine_name = "unnamed_vote_"+now.getTime().toString();

    /**
    * Description of Vote. May contain Markdown.
    *
    * @name Vote#description
    * @type String
    * @default An unnamed vote created at  (Date).
    */
    this.description = "An unnamed vote created at "+now.toLocaleString()+". ";

    /**
    * Set of options for this vote.
    *
    * @name Vote#options
    * @type Vote.Option[]
    * @default []
    */
    this.options = [];

    /**
    * Minimum Number of votes required.
    *
    * @name Vote#minVotes
    * @type number
    * @default 1
    */
    this.minVotes = 1;

    /**
    * Maximum number of votes allowed.
    *
    * @name Vote#maxVotes
    * @type number
    * @default 1
    */
    this.maxVotes = 1;

    /**
    * PermissonNode representing users with access to voting.
    *
    * @name Vote#votePermissions
    * @type PermissionNode
    */
    this.votePermissions = new PermissionNode();

    /**
    * PermissonNode representing users with access to voting administration.
    * Might be superseded by the site-wide Admin permissionNode.
    *
    * @name Vote#adminPermissions
    * @type PermissionNode
    * @default Empty Permission Node.
    */
    this.adminPermissions = new PermissionNode();

    /**
    * Property to identifiy users on. Preferably something like 'id'.
    *
    * @name Vote#userIdentifier
    * @type string
    * @default name
    */
    this.userIdentifier = "name";

    /**
    * Current Stage of the Vote.
    *
    * @name Vote#stage
    * @type Vote.Stage
    * @default {@link Vote.Stage|Vote.Stage.INIT}
    */
    this.stage = Vote.Stage.INIT;

    /**
    * Time when the {@link Vote.Stage|Vote.Stage.OPEN} is scheduled.
    * Set to undefined if not scheduled.
    *
    * @name Vote#open_time
    * @type number
    * @default undefined
    */
    this.open_time = undefined;

    /**
    * Time when the {@link Vote.Stage|Vote.Stage.CLOSE} is scheduled.
    * Set to undefined if not scheduled.
    *
    * @name Vote#close_time
    * @type number
    * @default undefined
    */
    this.close_time = undefined;

    /**
    * List of votes for each opinion.
    *
    * @name Vote#results
    * @type number[]
    */
    this.results = undefined;

    /**
    * List of user identifiers of people that have voted.
    *
    * @name Vote#voters
    * @type string[]
    */
    this.voters = [];

    /**
    * Current Timer for {@link Vote.Stage} scheduling or undefined.
    *
    * @private
    * @name Vote#_timer
    * @type *
    */
    this._timer = undefined;

    //load it from source if required.
    if(typeof source_object !== "undefined"){
        this.fromJSON(source_object);
    }
}

/**
* Updates this Vote form JSON data.
*
* @param {Vote.Source} [source_object] - JSON-style source for this vote.
* @return {Vote} - The Vote the function was originally called on.
*/
Vote.prototype.fromJSON = function(source_object){

    //general Vote info
    this.name = source_object.name;
    this.machine_name = source_object.machine_name;
    this.description = source_object.description;

    //Options & config
    this.options = source_object.options;
    this.minVotes = source_object.minVotes;
    this.maxVotes = source_object.maxVotes;
    this.userIdentifier = source_object.userIdentifier;

    //Permissions
    this.votePermissions.fromJSON(source_object.votePermissions);
    this.adminPermissions.fromJSON(source_object.adminPermissions);

    //Results
    this.results = source_object.results;
    this.voters = source_object.voters;

    //Update staging, we need to stop this
    this.stopStages();
    this.stage = source_object.stage;
    this.open_time = source_object.open_time;
    this.close_time = source_object.close_time;
    this.startStages();

    /**
    * Update event. Occurs whenever this PermissionNode is updated.
    *
    * @event Vote#update
    */
    this.emit("update");
}

/**
* Returns the JSON-style source of this Vote.
*
* @return {Vote.Source} - The source of this Vote.
*/
Vote.prototype.toJSON = function(){
    return {
        //general vote info
        "name": this.name,
        "machine_name": this.machine_name,
        "description": this.description,

        //options, config
        "options": this.options,
        "minVotes": this.minVotes,
        "maxVotes": this.maxVotes,
        "userIdentifier": this.userIdentifier,

        //Permissions
        "votePermissions": this.votePermissions.toJSON(),
        "adminPermissions": this.adminPermissions.toJSON(),

        //Results
        "results": this.results,
        "voters": this.voters,

        //Staging
        "stage": this.stage,
        "open_time": this.open_time,
        "close_time": this.close_time
    }
}

//TODO: Implement Vote.prototype.stopStages
//TODO: Implement Vote.prototype.startStages

/**
* Attempts to place a vote.
*
* @param {object} user - JSON-like information about the user attempting to vote.
* @param {number[]} opinions List of indexes of options selected.
* @return {Vote.VoteState} - Status of the Voting attempt.
*/
Vote.prototype.vote = function(user, opinions){

    //is the vote open?
    if(this.stage !== Vote.Stage.OPEN){
        return this.VoteState.CLOSED;
    }

    //do we have the right number of votes?
    if(opinions.length < this.minVotes || opinions.length > this.maxVotes){
        return this.VoteState.INVALID_NUMBER;
    }

    //List of unique vote
    var uniques = [];

    //do we only have votes that exist?
    for(var i=0;i<opinions.length;i++){
        if(typeof opinions[i] !== "number"){
            //Vote has to be a number
            return this.VoteState.UNKNOWN_OPINION;
        }

        if(opinions[i] % 1 !== 0){
            //it has to be an integer
            return this.VoteState.UNKNOWN_OPINION;
        }

        if(opinions[i] < 0 || opinions[i] >= this.options.length){
            //it has to be in the correct range
            return this.VoteState.UNKNOWN_OPINION;
        }

        //Do we have this opinion more than once?
        if(uniques.indexOf(opinions[i]) === -1){
            uniques.push(opinions[i])
        } else {
            return this.VoteState.DOUBLE_OPINION;
        }
    }



    //are we allowed to vote?
    if (!this.votePermissions.matches(user)){
        return this.VoteState.CANT_VOTE;
    }

    //have we already voted?
    var userIdentifier = user.hasOwnProperty(this.userIdentifier)?user[this.userIdentifier]:"";
    if(this.voters.indexOf(userIdentifier) !== -1){
        return this.VoteState.HAS_VOTED;
    }

    //ok, add me to the voters now!
    this.voters.push(userIdentifier);

    //and don't forget to vote!
    for(var i=0;i<opinions.length;i++){
        this.results[opinions[i]]++;
    }

    //cause the update event, something has happened.
    this.emit("update");
}

/**
 * Vote Stages.
 *
 * @enum {number}
 */
Vote.Stage = {
    /** Vote has been created and is ready to be scheduled. */
    INIT: 0,
    /** Vote is open and people can vote. */
    OPEN: 1,
    /** Voting is closed.  */
    CLOSED: 2,
    /** Vote is closed and results are now public. */
    PUBLIC: 3
};

/**
 * Status of voting.
 *
 * @enum {number}
 */
Vote.VoteState = {
    /** Voting was successfull. */
    OK: 0,
    /** Failure: User is not allowed to vote here. */
    CANT_VOTE: 1,
    /** Failure: User has already voted. */
    HAS_VOTED: 2,
    /** Failure: Voting is not open. */
    CLOSED: 3,
    /** Failure: Invalid number of opinions selected. */
    INVALID_NUMBER: 4,
    /** Failure: Unknown Opinion selected. */
    UNKNOWN_OPINION: 5,
    /** Failure: Some opinion was selected more than once. */
    DOUBLE_OPINION: 6
};

/**
 * A JSON-style source object of the vote. Intended to be used to store in a database.
 *
 * @typedef {Object} Vote.Source
 * @property {string} name - Human-Readable Name of this vote.
 * @property {string} machine_name - Machine-Readable Name of this vote.
 * @property {string} description - Description of Vote. May contain Markdown.
 * @property {Vote.Option[]} options - Set of options for this vote.
 * @property {number} minVotes - Minimum number of votes required for this vote.
 * @property {number} maxVotes - Maximum number of votes allowed for this vote.
 * @property {string} userIdentifier - Property to identifiy users on.
 * @property {PermissionNode.Rule[]} votePermissions - PermissionNode for users being able to vote on this vote.
 * @property {PermissionNode.Rule[]} adminPermissions - PermissionNode for users being able to vote on this vote.
 * @property {number[]} results - List of results for this Vote.
 * @property {string[]} voters - List of user_identifiers of people that have voted.
 * @property {Vote.Stage} stage - Current Stage of the Vote.
 * @property {number} open_time - Time when the OPEN stage starts.
 * @property {number} close_time - Time when the CLOSED stage starts.
 */

 /**
  * A JSON-Style Vote Option
  *
  * @typedef {Object} Vote.Option
  *
  * @property {string} title - Title of this option. Short and human readable.
  * @property {string} short_description - Short, text only description of this Option.
  * @property {string} markdown_description - Description of the option, may contain markdown.
  */

 util.inherits(Vote, events.EventEmitter);
 module.exports = Vote;
