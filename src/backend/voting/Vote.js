var PermissionNode = require("./PermissionNode");

/**
 * Creates a new Vote.
 *
 * @class
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
    * @default @linkcode Vote.Stage.INIT
    */
    this.stage = Vote.Stage.INIT;

    //TODO: Implement Stage Timer

    //TODO: Implement Result Array

    //load it from source if required.
    if(typeof source_object !== "undefined"){
        this.fromJSON(source_object);
    }
}

/**
* Updates this Vote form JSON data.
*
* @param {Vote.Source} [source_object] - JSON-style source for this vote.
*/
Vote.prototype.fromJSON = function(source_object){
    //TODO: Implement this.

    this.PermissionNode = [];
}


/**
 * Vote Stages.
 *
 * @enum {string}
 */
Vote.Stage = {
    /** Vote has been aborted. */
    ABORTED: -1,
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
 * A JSON-style source object of the vote. Intended to be used to store in a database.
 *
 * @typedef {Object} Vote.Source
 */

 /**
  * A JSON-Style Vote Option
  *
  * @typedef {Object} Vote.Option
  */


 module.exports = Vote;
