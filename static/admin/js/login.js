(function($){

    var socket; //The Socket

    var usePart = function(component){
        //Loads a specific part of the page
        $(".part").addClass("hidden");
        return $(document.getElementById(component)).removeClass("hidden");
    }

    var initComponent = function(){
        //Loads the initalisation component.
        usePart("init");
        $("#message").text("Connecting to socket...");

        //connect
        socket = io.connect(location.protocol+"//"+location.hostname+((location.port == "")?"":":"+location.port));

        //connect event
        socket.once('connect', function(){
            loginComponent();
        });

        //Also listen for server wide messages.
        socket.on("message", function(msg){
            alert(msg);
        })
    };

    var loginComponent = function(msg){
        //Loads the login component.
        usePart("login");

        //we might have a message
        if(typeof msg !== "undefined"){
            $("#form-signin-message").html(msg);
        } else {
            //no message
            $("#form-signin-message").html("");
        }

        $(".form-signin").off("submit").submit(function(evt){
            //no submission
            evt.preventDefault();

            //grab username and password
            var user = $("#form-signin-user").val();
            var pass = $("#form-signin-pass").val();

            //set a text as dummy
            $("#message").text("Authenticating...");
            usePart("init");

            socket.once("auth", function(state){
                if(state){
                    socket.once("mode", function(state){
                        if(state){
                            //we are now logged in
                            insideComponent();
                        } else {
                            //not an admin
                            loginComponent('<div class="alert alert-warning" role="alert"><b><b>Authentication failed. </b>You are not an admin. </div>');
                        }
                    });

                    //we want to be an admin
                    socket.emit("mode", "admin");
                } else {
                    //wrong credentials
                    loginComponent('<div class="alert alert-warning" role="alert"><b>Authentication failed. </b> Wrong username / password. </div>');
                }
            });

            //now ask the server
            socket.emit("auth", user, pass);

            return false;
        })
    }

    var insideComponent = function(){
        usePart("inside");
        adminInside(socket);
    }

    $(document).ready(initComponent);
})(jQuery);
