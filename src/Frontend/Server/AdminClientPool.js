var AdminClient = require("./AdminClient.js")
    Protocol = require("./protocol.js"),
    logger = require("winston");

/**
 * Represents a pool of {@link Frontend.Server.AdminClient}s.
 * @param {NodeJS.SocketIO} socket - Socket connection for incoming clients.
 * @param {Frontend.State} state - The server state.
 * @class
 * @alias Frontend.Server.AdminClientPool
 * @this {Frontend.Server.AdminClientPool}
 */
var AdminClientPool = function AdminClientPool(socket, server_state){
    var me = this;

    /**
     * Currently connected Clients.
     * @type {Object.<string, Frontend.Server.AdminClient>}
     * @alias Frontend.Server.AdminClientPool#clients
     */
    this.clients = {};

    socket.on(Protocol.ADMIN.CONNECT, function(s){
        var Client = new AdminClient(s, me, server_state);
    });
}


/**
 * Sends all AdminClients in this AdminClientPool a message.
 * @param {string} msg - The message to send.
 */
AdminClientPool.prototype.message = function(msg){
    logger.info("ADMIN: Sending server-wide message:", msg);
    for(var key in this.clients){
        this.clients[key].message(msg);
    }
}

module.exports = AdminClientPool;
