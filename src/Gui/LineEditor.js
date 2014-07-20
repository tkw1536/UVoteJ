(function($){
    var staticForm = '<form class="form-inline" role="form">\n\
        <span><b></b>: &nbsp; </span>\n\
        <span></span>\n\
        <div class="btn-group">\n\
            <button type="submit" class="btn btn-primary">Edit</button>\n\
        </div>\n\
    </form>';
    var editForm = '<form class="form-inline" role="form">\n\
        <span><b></b>: &nbsp; </span>\n\
        <div class="form-group">\n\
            <input type="text" class="form-control">\n\
        </div>\n\
        <div class="btn-group">\n\
            <button type="submit" class="btn btn-primary">Save</button>\n\
            <button type="submit" class="btn btn-default">Cancel</button>\n\
        </div>\n\
    </form>';


    /**
     * Creates a new LineEditor.
     *
     * @param {string} title - title to use for the editing node.
     * @param {string} value - Value to set the editor to initially.
     * @param {boolean} [disabled = false] - If set to true, the LineEditor is disabled and can not be edited.
     * @this {Browser.jQuery}
     * @class
     * @alias Gui.LineEditor
     * @extends {Browser.jQuery}
     */
    var LineEditor = function(description, value, disabled){
        var $this = this;

        //new Text
        var value = value || "(Edit the text that is here)";

        var messageArea = $("<span>");

        //create Viewer and editor
        var viewer = $(staticForm).appendTo(this);
        var editor = $(editForm).appendTo(this).hide();

        //set descriptions
        viewer.find("b").text(description);
        editor.find("b").text(description)

        //Prevent submission
        viewer.submit(function(e){
            //prevent default
            e.preventDefault();
        });
        editor.submit(function(e){
            //prevent default
            e.preventDefault();
        });

        viewer.find("button").click(function(e){
            //prevent default
            e.preventDefault();

            //set width
            editor.find("input[type=text]").css("min-width", viewer.find("span").eq(1).width());

            //set the value
            editor.find("input[type=text]").val(viewer.find("span").eq(1).text());

            //show the editor
            viewer.hide();
            editor.show();

            //Append the message thingy.
            messageArea.detach().appendTo(editor);

        });

        editor.find("button").eq(0).click(function(e){
            //prevent default
            e.preventDefault();

            //set the value
            value = editor.find("input[type=text]").val();
            viewer.find("span").eq(1).text(value);

            //show the viewer
            editor.hide();
            viewer.show();

            //Append the message thingy
            messageArea.detach().appendTo(viewer);

            //we have updated
            $this.trigger("LineEditor.update", value);
        });

        editor.find("button").eq(1).click(function(e){
            //prevent default
            e.preventDefault();

            //set the value
            viewer.find("span").eq(1).text(value);

            //show the viewer
            editor.hide();
            viewer.show();

            //Append the message thingy
            messageArea.detach().appendTo(viewer);
        }).click();

        //Disable buttons
        editor.find("button").prop("disabled", disabled === true);
        viewer.find("button").prop("disabled", disabled === true);

        return $.extend(this, {
            /**
             * Gets the current value of the LineEditor.
             *
             * @instance
             * @memberof Gui.LineEditor
             * @return {string} - The value of the LineEditor
             * @function
             */
            "get": function(){
                return value;
            },
            /**
             * Sets the current value of the LineEditor.
             *
             * @param {string} v - Value to set the editor to.
             * @param {boolean} [disabled] - If set to true, the LineEditor is disabled and can not be edited. If set to false, it will not be disabled. If not set, remains unchanged.
             * @instance
             * @memberof Gui.LineEditor
             * @function
             */
            "set": function(v, disabled){
                //Set the value
                value = v;

                //And put it everywhere.
                editor.find("input[type=text]").val(v);
                viewer.find("span").eq(1).text(v);


                if(typeof disabled == "boolean"){
                    //Disable buttons
                    editor.find("button").prop("disabled", disabled === true);
                    viewer.find("button").prop("disabled", disabled === true);

                    if(disabled === true){
                        //cancel editing
                        editor.find("button").eq(1).click();
                    }
                }
            },
            /**
             * Gets a reference to the Message Area of the editor.
             *
             * @instance
             * @memberof Gui.LineEditor
             * @return {Browser.jQuery} - The message area.
             * @function
             */
            "getMessageArea": function(){
                return messageArea;
            }
        });
    }

    $.fn.LineEditor = LineEditor;

})(jQuery);
