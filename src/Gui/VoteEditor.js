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
    //TODO: Set up widgets here! 
    this.reload();
}

Gui.VoteEditor.prototype.reload = function(){
    this.element.text("Editing "+this.voteEnd.id);
}

/**
* Closes the VoteEditor.
*/
Gui.VoteEditor.prototype.close = function(){
    this.voteEnd.close();
}
