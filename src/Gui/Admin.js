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
