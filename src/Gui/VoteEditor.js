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

    var me = this;

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
    this.PEditor1 = $("<div>").PermissionNodeEditor(true, []);

    /**
     * A PermissionNodeEditor representing the admin Permissions.
     *
     * @type {Gui.PermissionNodeEditor}
     * @alias Gui.VoteEditor#PEditor2
     */
    this.PEditor2 = $("<div>").PermissionNodeEditor(true, []);

    /**
     * A jQuery element representing the minimum number of votes required.
     *
     * @type {Browser.jQuery}
     * @alias Gui.VoteEditor#minVotes
     */
    this.minVotes = $("<input type='number' min='1' disabled='disabled' class='form-control'>");

    /**
     * A jQuery element representing the maximum number of votes required.
     *
     * @type {Browser.jQuery}
     * @alias Gui.VoteEditor#maxVotes
     */
    this.maxVotes = $("<input type='number' disabled='disabled'  class='form-control'>");

    /**
     * A jQuery element representing the staging settings
     *
     * @type {Browser.jQuery}
     * @alias Gui.VoteEditor#stager
     */
    this.stager = $("<div class='row'>");


    try{
        /**
         * An OptionEditor handling option editing.
         *
         * @type {Gui.OptionEditor}
         * @alias Gui.VoteEditor#Options
         */
        this.Options = $("<div>").OptionEditor();
    } catch(e){console.log(e); }

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
        $("<div class='row'>").append(
            $("<b>").text("Voting Permissions: "),
            $("<button class='btn btn-sm btn-default'>").text("Inspect").click(function(e){
                //don't do anything
                e.preventDefault();
                e.stopPropagation();

                //create a new window
                var w = window.open("about:blank", "_blank", "toolbar=no, scrollbars=no, resizable=yes, width=400, height=400");

                //write the new window
                w.document.write("<html><head><title>Loading viewer...</title></head><body><h1>Loading Viewer...</h1></body></html>");
                w.document.close();

                me.voteEnd.get_voters(function(s, e){
                    if(s){
                        $.fn.peopleViewer(e, "Inspect Voters", w);
                    } else {
                        //TODO: Error message
                    }
                });
            })
        ),
        "<br />",
        this.PEditor1,
        /*
        $("<div class='row'>").append(
            $("<b>").text("Edit Permissions: "),
            $("<button class='btn btn-sm btn-default'>").text("Inspect").click(function(e){
                //don't do anything
                e.preventDefault();
                e.stopPropagation();

                //create a new window
                var w = window.open("about:blank", "_blank", "toolbar=no, scrollbars=no, resizable=yes, width=400, height=400");

                //write the new window
                w.document.write("<html><head><title>Loading viewer...</title></head><body><h1>Loading Viewer...</h1></body></html>");
                w.document.close();

                me.voteEnd.get_admins(function(s, e){
                    if(s){
                        $.fn.peopleViewer(e, "Inspect Admins", w);
                    } else {
                        //TODO: Error message
                    }
                });
            })
        ),
        "<br />",
        this.PEditor2,*/

        $("<div class='row'>").append($("<h4>").text("Staging")),
        this.stager,
        $("<div class='row'>").append($("<h4>").text("Voting Options")),
        $("<div class='row'>").html("<form class='form-inline'><b>Minimum # of options to select: </b><span style='margin-left: 3px; '></span></form>").find("span").before(this.minVotes).end(),
        "<br />",
        $("<div class='row'>").html("<form class='form-inline'><b>Maximum # of options to select: </b><span style='margin-left: 3px; '></span></form>").find("span").before(this.maxVotes).end(),
        this.Options
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

            //whenever we cahnge the stage, we want to reload
            me.voteEnd.update_callback = function(){
                me.voteEnd.stage(function(s, re, m){
                    if(s && re !== r.stage[1]){
                        me.reload();
                    } else {}
                });
            };

            (function(){
                me.stager.empty();

                var curstage = $("<b>").text("Current Stage: ");
                var nextstage = $("<b>").text("Next Stage: ");

                var open_time =
                $('<div class="input-group date" style="margin-bottom: 3px; "><span class="input-group-addon">Open Vote at: </span><input type="text" class="form-control" /><span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span></div>').datetimepicker();

                var close_time = $('<div class="input-group date" style="margin-bottom: 3px; "><span class="input-group-addon">Close Vote at: </span><input type="text" class="form-control" /><span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span></div>').datetimepicker();

                var open_picker = open_time.data("DateTimePicker");
                var close_picker = close_time.data("DateTimePicker");

                if(typeof r["openclose"][1][0] == "number"){
                    open_picker.setDate(new Date(r["openclose"][1][0]));
                    close_picker.setDate(new Date(r["openclose"][1][1]));
                }

                if(isInitStage){
                    me.stager.append(
                        curstage,
                        $('<span class="label label-default">').text("Initial Stage"),
                        "<br>",
                        nextstage,
                        $('<span class="label label-default">').text("Open Voting")
                    )
                }

                if(isOpenStage){
                    me.stager.append(
                        curstage,
                        $('<span class="label label-default">').text("Open Voting"),
                        "<br>",
                        nextstage,
                        $('<span class="label label-default">').text("Vote Closed")
                    )
                }

                if(isClosedStage){
                    me.stager.append(
                        curstage,
                        $('<span class="label label-default">').text("Vote Closed"),
                        "<br>",
                        nextstage,
                        $('<span class="label label-default">').text("Public Results"),
                        $("<button class='btn btn-xs btn-default' style='margin-left: 3px; '>").text("Advance").click(function(){
                            me.voteEnd.stage(Client.Protocol.Stage.PUBLIC, function(r, s, m){});
                        })
                    )
                }

                if(isPublicStage){
                    me.stager.append(
                        curstage,
                        $('<span class="label label-default">').text("Results public"),
                        "<br>",
                        nextstage,
                        $('<span class="label label-default">').text("None")
                    )
                }

                me.stager.append(
                    "<br>",
                    "<br>",
                    open_time,
                    close_time
                )

                var msgtext = $("<span>");

                if(isInitStage){
                    me.stager.append(
                        "<br>",
                        $("<div class='btn-group'></div>").append(
                            $("<button class='btn btn-sm btn-primary'>").text("Save scheduling").click(function(){
                                var open = open_picker.getDate().toDate().getTime();
                                var close = close_picker.getDate().toDate().getTime();

                                me.voteEnd.openclose([open, close], function(s, v, m){
                                    if(!s){
                                        msgtext.show().text(m).fadeOut();
                                    } else {
                                        msgtext.show().text("Done! ").fadeOut();
                                    }
                                });

                            }),
                            $("<button class='btn btn-sm btn-danger'>").text("Reset").click(function(){
                                me.reload();
                            })
                        ),
                        msgtext
                    )
                } else {
                    //disable the pickers
                    open_picker.disable();
                    close_picker.disable();

                    me.stager.append(
                        "<br>",
                        $("<div class='btn-group'></div>").append(
                            $("<button class='btn btn-sm btn-primary' disabled=disabled>").text("Save scheduling"),
                            $("<button class='btn btn-sm btn-danger' disabled=disabled>").text("Reset")
                        )
                    );
                }


            })();

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

            /*
                (Min|Max)? Options
            */
            (function(){
                var updating = false;

                me.Options.set(!isInitStage, r.options[1]);

                me.Options
                .off("OptionEditor.update")
                .on("OptionEditor.update", function(e, w){
                    if(updating){
                        return;
                    }

                    updating = true;

                    var v = me.Options.get();

                    //Disable
                    me.minVotes.prop("disabled", true);
                    me.maxVotes.prop("disabled", true);
                    me.Options.set(true, me.Options.get());

                    me.voteEnd.options(v, function(s, v, m){
                        if(!s){
                            console.log(m);
                        }

                        //set the options
                        me.Options.set(!isInitStage, v);

                        //re-enable the other stuff.
                        me.minVotes.prop("disabled", !isInitStage);
                        me.maxVotes.prop("disabled", !isInitStage);

                        updating = false;
                    });
                });

                me.minVotes
                .val(r.minmax[1][0])
                .prop("disabled", !isInitStage)
                .off('keyup mouseup change')
                .on('keyup mouseup change', (function() {
                    var timer = 0;
                    return function(){
                        clearTimeout(timer);
                        timer = setTimeout(function(){
                            if(updating){
                                return;
                            }

                            updating = true;

                            var value = me.minVotes.val();
                            var msgArea = me.minVotes.parent().parent().find("span");

                            msgArea.show().text("Saving ...");

                            //Disable
                            me.minVotes.prop("disabled", true);
                            me.maxVotes.prop("disabled", true);
                            me.Options.set(true, me.Options.get());

                            //Set the other minimum correctly.
                            me.maxVotes.prop("min", value);

                            //Try and save
                            me.voteEnd.minmax([me.minVotes.val(), me.maxVotes.val()], function(s, v, m){
                                if(!s){
                                    me.minVotes.val(v[0]);
                                    me.maxVotes.val(v[1]);
                                    msgArea.show().text(m);
                                } else {
                                    msgArea.show().text("Done. ").fadeOut();
                                }

                                //Enable again?
                                me.minVotes.prop("disabled", !isInitStage);
                                me.maxVotes.prop("disabled", !isInitStage);
                                me.Options.set(!isInitStage, me.Options.get());

                                updating = false;
                            });
                        }, 1000);
                    };
                })());


                me.maxVotes
                .val(r.minmax[1][1])
                .prop("disabled", !isInitStage)
                .prop("min", r.minmax[1][0])
                .off('keyup mouseup change')
                .on('keyup mouseup change', (function() {
                    var timer = 0;
                    return function(){
                        clearTimeout(timer);
                        timer = setTimeout(function(){

                            if(updating){
                                return;
                            }

                            updating = true;

                            var value = me.maxVotes.val();
                            var msgArea = me.maxVotes.parent().parent().find("span");

                            msgArea.show().text("Saving ...");

                            //Disable
                            me.minVotes.prop("disabled", true);
                            me.maxVotes.prop("disabled", true);
                            me.Options.set(true, me.Options.get());

                            //Try and save
                            me.voteEnd.minmax([me.minVotes.val(), me.maxVotes.val()], function(s, v, m){
                                if(!s){
                                    me.minVotes.val(v[0]);
                                    me.maxVotes.val(v[1]);
                                    msgArea.show().text(m);
                                } else {
                                    msgArea.show().text("Done. ").fadeOut();
                                }

                                //Enable again?
                                me.minVotes.prop("disabled", !isInitStage);
                                me.maxVotes.prop("disabled", !isInitStage);
                                me.Options.set(!isInitStage, me.Options.get());

                                updating = false;
                            });
                        }, 1000);
                    };
                })());
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
