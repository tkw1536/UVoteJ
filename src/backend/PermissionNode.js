var
    util = require("util"),
    events = require("events");
/**
 * Creates a new PermissionNode.
 *
 * @class
 * @augments EventEmitter
 * @this {PermissionNode}
 * @param {PermissionNode.Rule[]} [source_object] - Optional JSON-style source for the permissionNode.
 */
function PermissionNode(source_object){
    /**
    * JSON-style source for the permissionNode.
    *
    * @private
    * @name PermissionNode#_data
    * @type PermissionNode
    */
    this._data = [];

    if(typeof source_object !== "undefined"){
        this.fromJSON(source_object);
    }
}

/**
 * Updates a permissionNode from JSON.
 *
 * @param {PermissionNode.Rule[]} source_object - JSON-style source for the PermissionNode.
 * @return {PermissionNode} The PermissionNode the function was originally called on.
 */
PermissionNode.prototype.fromJSON = function(source_object){
    this._data = source_object;

    /**
    * Update event. Occurs whenever this PermissionNode is updated.
    *
    * @event PermissionNode#update
    */
    this.emit("update");

    return this;
}

/**
 * Returns the JSON-style source of this PermissionNode.
 *
 * @return {PermissionNode.Rule[]} -  The source of this PermissionNode.
 */
PermissionNode.prototype.toJSON = function(){
    return this._data;
}

/**
 * Checks if a user with the given data matches the given Rule.
 *
 * @param {object} user_data - JSON-style user information.
 * @param {PermissionNode.Rule} rule - Rule to match.
 */
PermissionNode.prototype.matchesRule = function(user_data, rule){
    //get the two different values from the rule and the data

    var value = user_data[rule["fieldName"]];
    var query = rule["query"];

    //in case we have an exception, this is our result
    var result = rule["exceptionValue"];

    try{
        switch(rule["fieldRelation"]){
            //check equality
            case PermissionNode.Relations.EQUALS:
                result = (value.toString() === query.toString());
                break;
            //check equality without case
            case PermissionNode.Relations.EQUALS_NO_CASE:
                result = (value.toString().toLowerCase() === query.toString().toLowerCase());
                break;
            //check if one string contains another
            case PermissionNode.Relations.CONTAINS:
                result = (value.toString().indexOf(query.toString()) !== -1);
                break;
            //check if one string starts with the other
            case PermissionNode.Relations.STARTS_WITH:
                result = (value.toString().slice(0, query.toString().length) == query.toString());
                break;
            //check if one string ends with the other
            case PermissionNode.Relations.ENDS_WITH:
                result = (value.toString().indexOf(query.toString(), this.length - query.toString().length) !== -1);
                break;
            //check if a regular expression matches
            case PermissionNode.Relations.MATCHES:
                result = (new RegExp(query.toString())).test(value.toString());
                break;
            //check if its bigger then as a number
            case PermissionNode.Relations.BIGGER_THEN:
                result = (parseFloat(value) > parseFloat(query));
                break;
            //check if its bigger then as a number
            case PermissionNode.Relations.SMALLER_THEN:
                result = (parseFloat(value) < parseFloat(query));
                break;
            default:
                throw "UnknownComparator";
        }

        //negate if we need to
        if(rule["negate"]){
            result = !result;
        }
    } catch(e){
        //TODO: Better logging
        console.warn("PermissionNodeError: "+e);
    }

    return result;
}

/**
 * Checks if a user with the given data matches the PermissionNode.
 * @param {Object} user_data - JSON-style user information.
 * @return {boolean} Indicator if the given user matches the PermissionNode or not.
 */
PermissionNode.prototype.matches = function(user_data){

    var me = this;

    var state = undefined;
    var relation = "";

    this._data.map(function(i, e){
        if(i==0){
            //initial check, we do not care about the relation
            state = me.matchesRule(user_data, e);
        } else {
            //we now use the relation
            //we always have state first, because JS is lazy in evaluating relations and we can use that (a lot).

            switch(relation){
                case PermissionNode.LogicalRelation.AND:
                    state = state && me.matchesRule(user_data, e);
                    break;
                case PermissionNode.LogicalRelation.NAND:
                    state = !(state && me.matchesRule(user_data, e));
                    break;
                case PermissionNode.LogicalRelation.OR:
                    state = state || me.matchesRule(user_data, e);
                    break;
                case PermissionNode.LogicalRelation.NOR:
                    state = !(state || me.matchesRule(user_data, e));
                    break;
                case PermissionNode.LogicalRelation.XOR:
                    state = (state != me.matchesRule(user_data, e));
                    break;
                case PermissionNode.LogicalRelation.XNOR:
                    state = (state == me.matchesRule(user_data, e));
                    break;

            }

        }

        relation = e["nextRelation"];
    })

    return state;
}

/**
 * Finds all users matching this permissionNode.
 * @param {Object[]} users - List of JSON-style user information.
 * @return {Object[]} List of users matching this permissionNode.
 */
PermissionNode.prototype.findMatchingUsers = function(users){
    var me = this;
    return users.filter(function(user){ return me.matches(user); });
}

/**
 * A single rule for matching users.
 *
 * @typedef {Object} PermissionNode.Rule
 * @property {boolean} negate - Indicates if the rule should be negated or not.
 * @property {boolean} exceptionValue - Value to return in case an exception occurs while processing.
 * @property {PermissionNode.QueryRelation} fieldRelation - Type of relation between the value of the field and the query.
 * @property {*} query - Query to be related to the value in question.
 * @property {PermissionNode.LogicalRelation} nextRelation - Logical Relation to the next member in a PermissionNode.Rule array.
 */

/**
 * Types of relations between query and value of a user field.
 *
 * @enum {string}
 */
PermissionNode.QueryRelation = {
    /** Query and user field are equal as strings. */
    EQUALS: "equals",
    /** Query and user field are equal as strings neglecting character cases. */
    EQUALS_NO_CASE: "equalsNoCase",
    /** Value of the user field contains the query. */
    CONTAINS: "contains",
    /** Value of the user field starts with the query. */
    STARTS_WITH: "startsWith",
    /** Value of the user field ends with the query. */
    ENDS_WITH: "endsWith",
    /** Value of the user field matches the regex given by the query. */
    MATCHES: "matches",
    /** Value of the user field is bigger then the query. */
    BIGGER_THEN: "biggerThen",
    /** Value of the user field is smaller then the query. */
    SMALLER_THEN: "smallerThen"
};

/**
 * Logical relations to be used between two different values.
 *
 * @enum {string}
 */
PermissionNode.LogicalRelation = {
    /** Both values are true. */
    AND: "and",
    /** At most one of the values is true. */
    NAND: "nand",
    /** At least one value is true. */
    OR: "or",
    /** Both values are false. */
    NOR: "nor",
    /** Exactly one of the values is true. */
    XOR: "xor",
    /** Both values are equal */
    XNOR: "xnor"
};

util.inherits(PermissionNode, events.EventEmitter);
module.exports = PermissionNode;
