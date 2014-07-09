var PermissionNode = require("./PermissionNode");

/**
 * Creates a new Vote.
 *
 * @constructor
 * @this {Vote}
 * @param {Vote.Source} [source_object] - Optional JSON-style source for the vote.
 */
function Vote(source_object){

    /** PermissonNode representing users with access to voting. */
    this.votePermissions = new PermissionNode();

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
