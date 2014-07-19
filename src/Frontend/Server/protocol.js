(function(){
    /**
     * Namespacve for the protocol.
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
    }


    //export it the right way.
    if(typeof module !== "undefined" && module.exports){
        module.exports = Protocol;
    } else {
        Client.Protocol = Protocol;
    }
})();
