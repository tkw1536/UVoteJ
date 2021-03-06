var
    util = require("util"),
    events = require("events");
/**
 * Creates a new PermissionNode.
 *
 * @class
 * @augments NodeJS.EventEmitter
 * @alias Backend.PermissionNode
 * @this {Backend.PermissionNode}
 * @param {Backend.PermissionNode.Rule[]} [source_object] - Optional JSON-style source for the permissionNode.
 */
var PermissionNode = function PermissionNode(source_object){

    /**
    * JSON-style source for the permissionNode.
    *
    * @private
    * @name Backend.PermissionNode#_data
    * @type Backend.PermissionNode
    */
    this._data = [{
        "negate": false,
        "exceptionValue": false,

        "fieldName": "",
        "fieldRelation": PermissionNode.QueryRelation.EQUALS,

        "query": "",
        "nextRelation": PermissionNode.LogicalRelation.AND
    }];

    if(typeof source_object !== "undefined"){
        this.fromJSON(source_object);
    }
}

util.inherits(PermissionNode, events.EventEmitter);

/**
 * Updates a permissionNode from JSON.
 *
 * @param {Backend.PermissionNode.Rule[]} source_object - JSON-style source for the PermissionNode.
 * @return {Backend.PermissionNode} The PermissionNode the function was originally called on.
 */
PermissionNode.prototype.fromJSON = function(source_object){
    this._data = source_object;

    /**
    * Update event. Occurs whenever this PermissionNode is updated.
    *
    * @event Backend.PermissionNode#update
    */
    this.emit("update");

    return this;
}

/**
 * Returns the JSON-style source of this PermissionNode.
 *
 * @return {Backend.PermissionNode.Rule[]} -  The source of this PermissionNode.
 */
PermissionNode.prototype.toJSON = function(){
    return JSON.parse(JSON.stringify(this._data));
}

/**
 * Checks if a user with the given data matches the given Rule.
 *
 * @param {object} user_data - JSON-style user information.
 * @param {Backend.PermissionNode.Rule} rule - Rule to match.
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
            case PermissionNode.QueryRelation.EQUALS:
                result = (value.toString() === query.toString());
                break;
            //check equality without case
            case PermissionNode.QueryRelation.EQUALS_NO_CASE:
                result = (value.toString().toLowerCase() === query.toString().toLowerCase());
                break;
            //check if one string contains another
            case PermissionNode.QueryRelation.CONTAINS:
                result = (value.toString().indexOf(query.toString()) !== -1);
                break;
            //check if one string starts with the other
            case PermissionNode.QueryRelation.STARTS_WITH:
                result = (value.toString().slice(0, query.toString().length) == query.toString());
                break;
            //check if one string ends with the other
            case PermissionNode.QueryRelation.ENDS_WITH:
                result = (value.toString().indexOf(query.toString(), this.length - query.toString().length) !== -1);
                break;
            //check if a regular expression matches
            case PermissionNode.QueryRelation.MATCHES:
                result = (new RegExp(query.toString())).test(value.toString());
                break;
            //check if its bigger then as a number
            case PermissionNode.QueryRelation.BIGGER_THEN:
                result = (parseFloat(value) > parseFloat(query));
                break;
            //check if its bigger then as a number
            case PermissionNode.QueryRelation.SMALLER_THEN:
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
        logger.warn("AUTH: PermissionNode error: ", e.toString());
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

    this._data.map(function(e, i){

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
                defaut:
                    logger.warn("AUTH: PermissionNode error: Unknown LogicalRelation. ")
                    state = state && me.matchesRule(user_data, e)
                    break;
            }

        }

        //set the next relation
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
 * @typedef {Object} Backend.PermissionNode.Rule
 * @property {string} fieldName - Field to use.
 * @property {boolean} negate - Indicates if the rule should be negated or not.
 * @property {boolean} exceptionValue - Value to return in case an exception occurs while processing.
 * @property {Backend.PermissionNode.QueryRelation} fieldRelation - Type of relation between the value of the field and the query.
 * @property {string} query - Query to be related to the value in question.
 * @property {Backend.PermissionNode.LogicalRelation} nextRelation - Logical Relation to the next member in a PermissionNode.Rule array.
 */

/**
 * Types of relations between query and value of a user field.
 * @see {@link Frontend.Server.Protocol.QueryRelation}
 */
PermissionNode.QueryRelation = require("../Frontend/Server/protocol.js").QueryRelation;

/**
 * Logical relations to be used between two different values.
 * @see {@link Frontend.Server.Protocol.LogicalRelation}
 */
PermissionNode.LogicalRelation = require("../Frontend/Server/protocol.js").LogicalRelation;

module.exports = PermissionNode;
