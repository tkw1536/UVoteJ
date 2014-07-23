(function(){
    /**
     * Namespace for the protocol. Available to both client and server.
     * @namespace Frontend.Server.Protocol
     */
    var Protocol = {};


    /**
    * Admin Protocol Events.
    * @memberof Frontend.Server.Protocol
    * @alias Frontend.Server.Protocol.ADMIN
    * @enum {string}
    */
    Protocol.ADMIN = {
        /** Client connected to server.  */
        CONNECT: "connect",
        /** Client diconnected from server. */

        DISCONNECT: "disconnect",
        /** Admin Accesses the login.  */
        LOGIN: "admin_login",
        /** Cancels the admin login client on the server side. */
        CANCEL_LOGIN: "vote_login",

        /** Message is broadcasted from the server. */
        ADMIN_MESSAGE_BROADCAST: "admin_message",

        /** List all existing votes. */
        LIST_VOTE_UUIDS: "admin_list_vote_uuids",

        /** Grabs the title of a vote from the server.  */
        GET_VOTE_TITLE: "admin_get_vote_summary",

        /** Begins Editing a specific vote */
        BEGIN_EDIT: "admin_vote_begin_edit",

        /** Ends editing a certain vote */
        END_EDIT: "admin_vote_end_edit",
    }

    Protocol.VOTE_EDITOR = {

        /** Gets the title */
        GET_TITLE: "vote_edit_get_title",
        /** Sets the title */
        SET_TILE: "vote_edit_set_title",
        /** Gets the machine name */
        GET_MACHINE_NAME: "vote_edit_get_machine_name",
        /** Sets the machine name */
        SET_MACHINE_NAME: "vote_edit_set_machine_name",
        /** Gets the description fo a vote */
        GET_DESCRIPTION: "vote_edit_get_description",
        /** Sets the description of a vote. */
        SET_DESCRIPTION: "vote_edit_set_description",

        /** Gets the voting PermissionNode */
        GET_VOTING_PERMISSIONS: "vote_edit_get_voting_permissions",
        /** Sets the voting PermissionNode */
        SET_VOTING_PERMISSIONS: "vote_edit_set_voting_permissions",

        /** Gets the voting PermissionNode */
        GET_ADMIN_PERMISSIONS: "vote_edit_get_admin_permissions",
        /** Sets the voting PermissionNode */
        SET_ADMIN_PERMISSIONS: "vote_edit_set_admin_permissions",

        /** Gets the minimum / maximum number of votes */
        GET_MIMMAXVOTES: "vote_edit_get_minmax",
        /** Sets the minimum / maximum number of votes */
        SET_MINMAXVOTES: "vote_edit_set_minmax",


        /** Gets the current server time */
        GET_TIME: "vote_edit_getstime",
        /** Gets the opening / closing time of this vote. */
        GET_OPENCLOSE_TIME: "vote_edit_get_openclose_time",
        /** Sets the opening / closing time of this vote. */
        SET_OPENCLOSE_TIME: "vote_edit_set_openclose_time",

        /** Gets the current voting Stage */
        GET_STAGE: "vote_get_stage",
        /** Sets the current voting Stage */
        SET_STAGE: "vote_get_stage",

        /** Gets the options of this vote */
        GET_OPTIONS: "vote_edit_get_options",
        /** Sets the options of this vote */
        SET_OPTIONS: "vote_edit_set_options",

        /** Gets the results of the vote.  */
        GET_RESULTS: "vote_edit_get_results",

        /** Gets the voters */
        GET_VOTER_STATS: "vote_edit_get_voter_stats",

        /** Gets the vote Id */
        GET_VOTE_ID: "vote_edit_get_vote_id",

        /** Notifies the client that the vote has been updated. */
        VOTE_UPDATED: "vote_edit_updated"
    }

    /**
     * Available types for configuration.
     *
     * @memberof Frontend.Server.Protocol
     * @alias Frontend.Server.Protocol.configTypes
     * @enum {string}
     */
    Protocol.configTypes = {
        /** String */
        STR:  "str",
        /** Integer */
        INT: "int",
        /** Positive Integer */
        INT_POSITIVE:  "int+",
        /** Float number */
        FLOAT: "float",
        /** Boolean */
        BOOL: "bool"
    };

    /**
     * Types of relations between query and value of a user field.
     *
     * @enum {string}
     * @memberof Frontend.Server.Protocol
     * @alias Frontend.Server.Protocol.QueryRelation
     */
    Protocol.QueryRelation = {
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
     * @memberof Frontend.Server.Protocol
     * @alias Frontend.Server.Protocol.LogicalRelation
     */
    Protocol.LogicalRelation = {
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

    /**
     * Vote Stages.
     *
     * @enum {number}
     * @memberof Frontend.Server.Protocol
     * @alias Frontend.Server.Protocol.Stage
     */
    Protocol.Stage = {
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
     * @memberof Frontend.Server.Protocol
     * @alias Frontend.Server.Protocol.VoteState
     */
    Protocol.VoteState = {
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




    //export it the right way.
    if(typeof module !== "undefined" && module.exports){
        module.exports = Protocol;
    } else {
        Client.Protocol = Protocol;
    }
})();
