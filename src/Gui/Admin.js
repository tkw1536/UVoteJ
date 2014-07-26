var Gui = {};
/**
 * Admin-GUI
 * @namespace Gui.Admin
 */
Gui.Admin = {};

/**
 * Length for animations in milliseconds.
 * @type {number}
 * @alias Gui.Admin.animateLength
 */
Gui.Admin.animateLength = 500;

/**
 * Called to intialise the Admin GUI.
 * @alias Gui.Admin.ready
 */
Gui.Admin.ready = function(){

    //we are done => fade out the loading screen
    Gui.Admin.components.loaderMessage.text("Done. ");
    Gui.Admin.components.loaderPart.fadeOut(Gui.Admin.animateLength, function(){

        //hide the alert box
        Gui.Admin.components.loginForm.find(".alert").hide();

        Gui.Admin.components.loginPart.hide().removeClass("hidden").fadeIn(Gui.Admin.animateLength, function(){
            Gui.Admin.readyLogin();
        });
    });

};

/**
 * Called to intialise the LoginForm.
 * @property {string|undefined} message - Message to display.
 * @alias Gui.Admin.readyLogin
 */
Gui.Admin.readyLogin = function(message){

    //hide the other two components
    Gui.Admin.components.loaderPart.hide();
    Gui.Admin.components.managerPart.hide();

    //and show this one
    Gui.Admin.components.loginPart.show();


    //alertMessageBox
    var alertBox = Gui.Admin.components.loginForm.find(".alert");

    if(typeof message == "string" && message !== ""){
        //set the message
        alertBox.show().text(message);
    } else {
        alertBox.hide();
    }

    //remove all the disabled stuffs (when reinitalising)
    Gui.Admin.components.loginForm.find("input").removeAttr("disabled");

    //listen to submit events
    Gui.Admin.components.loginForm.one("submit", function(event){

        //we don't really want to submit anything
        event.preventDefault();

        //disable all the elements
        Gui.Admin.components.loginForm.find("input").attr("disabled", "disabled");

        //Do the client login
        Gui.Admin.client.login($("#login-username").val(), $("#login-password").val(), function(suc, msg){
            if(!suc){
                //login has failed => ready it with the message
                Gui.Admin.readyLogin(msg);
            } else {
                //we're in => go to the next step
                Gui.Admin.components.loginPart.fadeOut(Gui.Admin.animateLength, function(){
                        Gui.Admin.components.managerPart.hide().removeClass("hidden").fadeIn(Gui.Admin.animateLength, function(){
                            Gui.Admin.readyManager();
                        });
                });
            }
        });
    })
};

/**
 * Called to intialise the LoginForm.
 * @property {string|undefined} message - Message to display.
 * @alias Gui.Admin.readyLogin
 */
Gui.Admin.readyManager = function(){

    //Logout
    $(".manager-logout").off("click").click(function(){
        location.reload();
    });

    //register the create new vote thing
    $("#manager-new").off("click").click(function(){
        $(".manager-msg-area").show().text("Creating vote ... ");
        Gui.Admin.client.createVote(function(m){
            //created the vote m
            Gui.Admin.refreshVoteList(function(){
                Gui.Admin.editVote(m);
            });
        });
    });

    $("#manager-refresh").off("click").click(function(){
        Gui.Admin.refreshVoteList();
    });

    $("#manager-back").off("click").click(function(){
        if(Gui.Admin.editor){
            Gui.Admin.editor.close();
        }

        //refresh the vote list
        Gui.Admin.refreshVoteList();

        //return to the manager
        $("#manager-manager").removeClass("hidden");
        $("#manager-editor").addClass("hidden");
    }).click();

    //register a disconnect handler
    Gui.Admin.client.socket.once("disconnect", function(){
        //logout
        Gui.Admin.client.logout();

        //and create a new client
        Gui.Admin.client = new Client.Admin();

        //we are ready for a new login
        Gui.Admin.readyLogin("You have been disconnected from the server. ");
    });
}

/**
 * Called to load all existing votes from the server.
 * @property {function} [cb] - Callback once ready.
 * @alias Gui.Admin.refreshVoteList
 */
Gui.Admin.refreshVoteList = function(cb){
    $(".manager-msg-area").show().text("Reloading votes ...");

    var voteList = $("#manager-votelist").empty();
    Gui.Admin.client.getSummaries(function(s, res){
        if(!s || res.length == 0){
            voteList.append('<a href="#" class="list-group-item">(No votes on the server, hit "create new vote" to add one. )</a>');
        } else {
            for(var i=0;i<res.length;i++){
                (function(i){
                    voteList.append(
                        $('<a href="#" class="list-group-item"></a>')
                        .append(
                            $('<h4 class="list-group-item-heading">').text(res[i].name).append(
                                $('<span class="btn btn-xs btn-danger" style="margin-left: 5px; ">Delete Vote</span>').click(function(e){
                                    e.stopPropagation();
                                    Gui.Admin.deleteVote(res[i].uuid, res[i].name);
                                })
                            ),
                            $('<h5 class="pull-right">').text(res[i].uuid),
                            $('<p class="list-group-item-text">').html(Markdown.toHTML(res[i].description))
                        ).click(function(){
                            //start editing a vote.
                            Gui.Admin.editVote(res[i].uuid);
                        })
                    );
                })(i);
            }

        }

        $(".manager-msg-area").show().text("Done. ").fadeOut();

        if(typeof cb == "function"){cb(); }
    })
}

/**
 * Deletes a vote form the server.
 * @property {string} uuid - UUID of vote to delete
 * @property {string} title - Title of vote to delete.
 * @alias Gui.Admin.refreshVoteList
 */
Gui.Admin.deleteVote = function(uuid, title){
    var box = $("#manager-confirm-delete-vote");
    box.find("span.label-default").text(title);

    var doDelete = false;
    var button = box.find(".btn.btn-danger.danger");

    button.off("click").on("click", function(){
        doDelete = true; //we really want to delete something.
        box.modal("hide");
    });

    box.one("hidden.bs.modal", function(){
        button.off("click");

        if(doDelete){
            $(".manager-msg-area").show().text("Deleting vote ...");

            Gui.Admin.client.deleteVote(uuid, function(s, m){
                if(!s){
                    $(".manager-msg-area").text("Did not delete vote. ").fadeOut();
                } else {
                    Gui.Admin.refreshVoteList();
                }
            });
        }

    }).removeClass("hidden").modal();
}

/**
 * Starts editing a vote.
 * @property {string} uuid - UUID of vote to delete
 * @property {string} title - Title of vote to delete.
 * @alias Gui.Admin.refreshVoteList
 */
Gui.Admin.editVote = function(uuid){
    //go to the editor
    $("#manager-manager").addClass("hidden");
    $("#manager-editor").removeClass("hidden");

    var editArea = $("#manager-editor-p");
    editArea.text("(Editor loading)");

    Gui.Admin.client.editVote(uuid, function(r, editor){

        if(!r){
            editArea.text("Could not start to edit vote. Please check the server connection. ");
            return;
        }

        /**
         * Current Gui Vote Editor (if applicable).
         * @type {*}
         * @alias Gui.Admin.editor
         */
        Gui.Admin.editor = new Gui.VoteEditor(editArea, editor);

        Gui.Admin.editor.init(); //init the editor.
    }, function(){
        $(".manager-msg-area").text(msg).fadeOut(function(){
            //refresh the vote list
            Gui.Admin.refreshVoteList();

            //return to the manager
            $("#manager-manager").removeClass("hidden");
            $("#manager-editor").addClass("hidden");
        });
    });

};

$(function(){
    /**
     * List of GUI components
     * @alias Gui.Admin.components
     * @type {object<string,Browser.jQuery>}
     * @property {Browser.jQuery} loaderPart - The loading dialog.
     * @property {Browser.jQuery} loaderMessage - Loader Message box.
     * @property {Browser.jQuery} loginPart - The login dialog.
     * @property {Browser.jQuery} loginForm - The login dialog - form element.
     * @property {Browser.jQuery} managerPart - The manager section.
     */
    Gui.Admin.components = {
        "loaderPart": $("#loader"),
        "loaderMessage": $(".loaderMessage"),
        "loginPart": $("#login"),
        "loginForm": $(".form-login"),
        "managerPart": $("#manager")
    };

    Gui.Admin.components.loaderMessage.text("Loading AdminClient...")

    Client.load("Admin", function(){
        Gui.Admin.components.loaderMessage.text("Initalising login dialog...");

        /**
         * The current Admin Client.
         * @type {Client.Admin}
         * @alias Gui.Admin.client
         */
        Gui.Admin.client = new Client.Admin();

        //we are ready now
        Gui.Admin.ready();
    });
})
