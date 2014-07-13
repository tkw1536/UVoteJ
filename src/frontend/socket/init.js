var socket_admin = require("./admin.js");

module.exports = function(state, logger, next){

    //auth Handler: Handles authentication Handlers
    var authHandler = function(socket, user, pass){
        logger.info("AUTH:", user, ": Checking. ");
        state.auth.loginUser(user, pass, function(s, info){
            if(s){
                logger.info("AUTH:", user, ": Authenticated. ");
                //we are now inside
                selectMode(socket, user, pass, info);

                //we can tell the client
                socket.emit("auth", true);
            } else {
                logger.info("AUTH:", user, ": Authentication failure. ");

                //we need to also listen to future attempts
                registerAuthHandler(socket);

                //authentication failure, we send it back the false and then disconnect the socket.
                socket.emit("auth", false);
            }
        });
    }

    //Mode Selector: User will have to select the mode.
    var selectMode = function(socket, user, pass, info){
        socket.once("mode", function(m){
            if(m == "admin"){
                if(state.config.auth_admins.indexOf(info[state.config.auth_idProperty]) !== -1){
                    logger.info("AUTH:", user, ": Admin login. ");

                    //we are an admin, so lets run that script.
                    socket_admin(socket, info, user, pass, state);

                    //also tell the client that we are an admin.
                    socket.emit("mode", true);
                } else {
                    logger.info("AUTH:", user, ": Attempted admin login. ");

                    //not an admin
                    registerAuthHandler(socket);
                    socket.emit("mode", false);
                }
            } else {
                //unknown mode => we have nothing to do anymore.
                registerAuthHandler(socket);
                socket.emit("mode", false);
            }
        });
    }

    //Register the auth handler
    var registerAuthHandler = function(socket){
        socket.once("auth", function(u, p){return authHandler(socket, u, p); });
    }

    //On connection, we require an auth first.
    state.io.on("connection", function(socket){
        registerAuthHandler(socket);

        //for proper cleanup
        socket.on("disconnect", function(){
            try{
                socket.connection.close();
            } catch(e){}
        }); 
    });

    next(state);
}
