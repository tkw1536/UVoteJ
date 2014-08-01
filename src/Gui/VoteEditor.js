/**
 * Votte Editor GUI
 *
 * @param {Browser.jQuery} element - Element to bind the Vote Editor to.
 * @param {Client.VoteEditor} voteEditor - Vote Editor to use.
 * @param {function} close_callback - Callback when the editor has to be closed unexpectedly.
 * @class
 * @alias Gui.VoteEditor
 */
Gui.VoteEditor = function VoteEditor(element, voteEditor){

    /**
     * The element this Vote Editor is bound to.
     *
     * @type {Browser.jQuery}
     * @alias Gui.VoteEditor#element
     */
    this.element = element;

    /**
     * The VoteEditor associated to this GUI.
     *
     * @type {Client.VoteEditor}
     * @alias Gui.VoteEditor#voteEnd
     */
    this.voteEnd = voteEditor;
}

/**
* Initialises the GUI.
*/
Gui.VoteEditor.prototype.init = function(){

    /**
     * A LineEditor representing the title.
     *
     * @type {Gui.LineEditor}
     * @alias Gui.VoteEditor#TitleEditor
     */
    this.TitleEditor = $("<div class='row'>").LineEditor("Name", "", true);
    this.TitleEditor.getMessageArea().show().text("Loading ...");



    /**
     * A LineEditor representing the machine_name.
     *
     * @type {Gui.LineEditor}
     * @alias Gui.VoteEditor#MachineEditor
     */
    this.MachineEditor = $("<div class='row'>").LineEditor("Machine name", "", true);
    this.MachineEditor.getMessageArea().show().text("Loading ...");

    /**
     * A MarkdownEditor representing the description.
     *
     * @type {Gui.LineEditor}
     * @alias Gui.VoteEditor#DescEditor
     */
    this.DescEditor = $("<div>").MarkdownEditor("Name", "", true);
    this.DescEditor.getMessageArea().show().text("Loading ...");

    /**
     * A PermissionNodeEditor representing the voting Permissions.
     *
     * @type {Gui.PermissionNodeEditor}
     * @alias Gui.VoteEditor#PEditor1
     */
    this.PEditor1 = $("<div>").PermissionNodeEditor([], true);

    /**
     * A PermissionNodeEditor representing the admin Permissions.
     *
     * @type {Gui.PermissionNodeEditor}
     * @alias Gui.VoteEditor#PEditor2
     */
    this.PEditor2 = $("<div>").PermissionNodeEditor([], true);

    //add all this stuff.
    this.element.empty().append(
        $("<div class='row'>").append($("<h3>")),
        $("<div class='row'>").append($("<h4>").text("Name & Description")),
        this.TitleEditor,
        "<br />",
        this.MachineEditor,
        "<br />",
        $("<div class='row'>").append($("<b>").text("Description: ")),
        "<br />",
        this.DescEditor,
        $("<div class='row'>").append($("<h4>").text("Permissions")),
        $("<div class='row'>").append($("<b>").text("Voting Permissions: ")),
        "<br />",
        this.PEditor1,
        $("<div class='row'>").append($("<b>").text("Edit Permissions: ")),
        "<br />",
        this.PEditor2,
        $("<div class='row'>").append($("<h4>").text("Staging")),
        $("<div class='row'>").append($("<h4>").text("Voting Options"))
    );

    this.reload();
}

Gui.VoteEditor.prototype.reload = function(){
    var me = this;

    this.element.find("h3").eq(0).text("Editing "+this.voteEnd.id);

    this.voteEnd.grabAll(function(r){
        try{

            //check which stage we are in.
            var isInitStage = (r.stage[1] == Client.Protocol.Stage.INIT);
            var isOpenStage = (r.stage[1] == Client.Protocol.Stage.OPEN);
            var isClosedStage = (r.stage[1] == Client.Protocol.Stage.CLOSED);
            var isPublicStage = (r.stage[1] == Client.Protocol.Stage.PUBLIC);


            /*
                name
            */
            (function(){
                var updating = false;

                me.TitleEditor.set(r.name[1], !isInitStage);

                me.TitleEditor
                .off("LineEditor.update")
                .on("LineEditor.update", function(e, v){
                    if(updating){
                        return;
                    }

                    //we are now updating, so block
                    updating = true;
                    me.TitleEditor.set(v, true);
                    me.TitleEditor.getMessageArea().show().text("Saving ...");


                    //and try to save on the server
                    me.voteEnd.name(v, function(s, v, m){
                        me.TitleEditor.set(v, !isInitStage);
                        if(s){
                            me.TitleEditor.getMessageArea().text("Done. ").fadeOut();
                        } else {
                            //error occured
                            me.TitleEditor.getMessageArea().text(m);
                        }

                        //we are no longer updating.
                        updating = false;
                    });
                })
                .getMessageArea().text("Done. ").fadeOut();
            })();


            /*
                machine_name
            */
            (function(){
                var updating = false;

                me.MachineEditor.set(r.machine_name[1], !isInitStage);

                me.MachineEditor
                .off("LineEditor.update")
                .on("LineEditor.update", function(e, v){
                    if(updating){
                        return;
                    }

                    //we are now updating, so block
                    updating = true;
                    me.MachineEditor.set(v, true);
                    me.MachineEditor.getMessageArea().show().text("Saving ...");


                    //and try to save on the server
                    me.voteEnd.machine_name(v, function(s, v, m){
                        me.MachineEditor.set(v, !isInitStage);
                        if(s){
                            me.MachineEditor.getMessageArea().text("Done. ").fadeOut();
                        } else {
                            //error occured
                            me.MachineEditor.getMessageArea().text(m);
                        }

                        //we are no longer updating.
                        updating = false;
                    });
                })
                .getMessageArea().text("Done. ").fadeOut();
            })();

            /*
                description
            */
            (function(){
                var updating = false;

                me.DescEditor.set(r.description[1], !isInitStage);

                me.DescEditor
                .off("MarkdownEditor.update")
                .on("MarkdownEditor.update", function(e, v){
                    if(updating){
                        return;
                    }

                    //we are now updating, so block
                    updating = true;
                    me.DescEditor.set(v, true);
                    me.DescEditor.getMessageArea().show().text("Saving ...");


                    //and try to save on the server
                    me.voteEnd.description(v, function(s, v, m){
                        me.DescEditor.set(v, !isInitStage);
                        if(s){
                            me.DescEditor.getMessageArea().text("Done. ").fadeOut();
                        } else {
                            //error occured
                            me.DescEditor.getMessageArea().text(m);
                        }

                        //we are no longer updating.
                        updating = false;
                    });
                })
                .getMessageArea().text("Done. ").fadeOut();
            })();

            /*
                Voting Permissions
            */
            (function(){
                var updating = false;

                me.PEditor1.set(!isInitStage, r.voting_permissions[1]);

                me.PEditor1
                .off("PermissionNodeEditor.update")
                .on("PermissionNodeEditor.update", function(e, w){

                    var v = me.PEditor1.get(); //get the current value!

                    if(updating){
                        return;
                    }

                    //we are now updating, so block
                    updating = true;
                    me.PEditor1.set(true, v);


                    //and try to save on the server
                    me.voteEnd.voting_permissions(v, function(s, v, m){
                        //set it.
                        me.PEditor1.set(!isInitStage, v);

                        //we are no longer updating.
                        updating = false;
                    });
                });
            })();

            /*
                Admin Permissions
            */
            (function(){
                var updating = false;

                me.PEditor2.set(false, r.admin_permissions[1]);

                me.PEditor2
                .off("PermissionNodeEditor.update")
                .on("PermissionNodeEditor.update", function(e, w){

                    var v = me.PEditor2.get(); //get the current value!

                    if(updating){
                        return;
                    }

                    //we are now updating, so block
                    updating = true;
                    me.PEditor2.set(true, v);


                    //and try to save on the server
                    me.voteEnd.admin_permissions(v, function(s, v, m){
                        //set it.
                        me.PEditor2.set(false, v);

                        //we are no longer updating.
                        updating = false;
                    });
                });
            })();
        } catch(e){
            console.error(e);
        }

    });
}

/**
* Closes the VoteEditor.
*/
Gui.VoteEditor.prototype.close = function(){
    this.voteEnd.close();
}
