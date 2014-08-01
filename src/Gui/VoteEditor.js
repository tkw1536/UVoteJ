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
    this.TitleEditor = $("<div>").LineEditor("Name", "", true);
    this.TitleEditor.getMessageArea().show().text("Loading ...");

    /**
     * A LineEditor representing the machine_name.
     *
     * @type {Gui.LineEditor}
     * @alias Gui.VoteEditor#MachineEditor
     */
    this.MachineEditor = $("<div>").LineEditor("Machine name", "", true);
    this.MachineEditor.getMessageArea().show().text("Loading ...");

    //empty the element.
    this.element.empty().append(
        $("<h3>"),
        this.TitleEditor,
        this.MachineEditor
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
