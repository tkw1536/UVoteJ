(function($){

    var buttonRow1 = '<div class="row">\n\
        <div class="btn-group inline vcenter pull-right">\n\
            <button type="button" class="btn btn-default btn-primary">Edit</button>\n\
        </div>\n\
    </div>';

    var buttonRow2 = '<div class="row">\n\
        <div class="btn-group inline vcenter pull-right">\n\
            <button type="button" class="btn btn-default btn-primary">Save</button>\n\
            <button type="button" class="btn btn-default">Cancel</button>\n\
        </div>\n\
    </div>';

    var previewRow1 = '<div class="row">\n\
        <div class="pull-left" style="width: 45%; ">\n\
            <textarea style="width: 100%; "></textarea>\n\
        </div>\n\
        <div class="pull-right" style="width: 45%; "></div>\n\
    </div>';

    /**
     * Creates a new MarkdownEditor.
     *
     * @param {string} value - Value to set the editor to initially.
     * @param {boolean} [disabled = false] - If set to true, the MarkdownEditor is disabled and can not be edited.
     * @this {Browser.jQuery}
     * @class
     * @alias Gui.MarkdownEditor
     * @extends {Browser.jQuery}
     */
    var MarkdownEditor = function(value, disabled){
        var $this = this;

        var value = value || "(Edit me with markdown)";

        var messageSpan = $("<span class='pull-right' style='margin-right: 3px; '>");

        var showRow, previewRow, editButtonRow, saveButtonRow, updateRender;

        //called to update rendering
        updateRender = function(){
            //Get the html to render
            html = Markdown.toHTML(previewRow.find("textarea").val() || "");

            //apply it to both of the divs.
            showRow.html(html);
            previewRow.find(".pull-right").html(html);
        }

        //the row which shows the preview
        showRow = $("<div class='row'>").appendTo(this);

        //append the edit button
        editButtonRow = $(buttonRow1).appendTo(this).find("button").click(function(e){
            //prevent the default
            e.preventDefault();

            //set the value of the text area and update the render
            previewRow.find("textarea").val(value);
            updateRender();

            //set heights
            previewRow.height(showRow.height());

            //hide the showing part
            showRow.hide();
            editButtonRow.hide();

            //show the other one.
            previewRow.show();
            saveButtonRow.show();

            //Prepend the message Span
            messageSpan.detach().appendTo(saveButtonRow);
        }).end();

        //add the preview Row
        previewRow = $(previewRow1).appendTo(this).hide();
        previewRow.find("textarea").bind('input propertychange', function() {
            updateRender();
        });


        //append the save button Row
        saveButtonRow = $(buttonRow2).appendTo(this).hide();

        saveButtonRow.find("button").eq(0).click(function(e){
            //prevent the default
            e.preventDefault();

            //Store the value
            value = previewRow.find("textarea").val();
            updateRender();

            //hide the preview part
            previewRow.hide();
            saveButtonRow.hide();

            //show the other one
            showRow.show();
            editButtonRow.show();

            //Prepend the message Span
            messageSpan.detach().appendTo(editButtonRow);

            //Saved something on the MarkdownEditor.
            $this.trigger("MarkdownEditor.update", value);
        });

        //add the cancel handler
        saveButtonRow.find("button").eq(1).click(function(){

            //update everything
            previewRow.find("textarea").val(value);
            updateRender();

            //hide the preview part
            previewRow.hide();
            saveButtonRow.hide();

            //show the other one
            showRow.show();
            editButtonRow.show();

            //Prepend the message Span
            messageSpan.detach().appendTo(editButtonRow);
        }).click();

        editButtonRow.find("button").prop("disabled", disabled === true);
        saveButtonRow.find("button").prop("disabled", disabled === true);

        return $.extend(this, {
            /**
             * Gets the current value of the MarkdownEditor.
             *
             * @instance
             * @memberof Gui.MarkdownEditor
             * @return {string} - The value of the MarkdownEditor
             * @function
             */
            "get": function(){
                return value;
            },
            /**
             * Sets the current value of the MarkdownEditor.
             *
             * @param {string} v - Value to set the editor to.
             * @param {boolean} [disabled] - If set to true, the MarkdownEditor is disabled and can not be edited. If set to false, it will not be disabled. If not set, remains unchanged.
             * @instance
             * @memberof Gui.MarkdownEditor
             * @function
             */
            "set": function(v, disabled){
                value = v;
                previewRow.find("textarea").val(value);
                updateRender();

                if(typeof disabled == "boolean"){
                    editButtonRow.find("button").prop("disabled", disabled === true);
                    saveButtonRow.find("button").prop("disabled", disabled === true);

                    if(disabled === true){
                        //cancel editing, it is now disabled
                        saveButtonRow.find("button").eq(1).click();
                    }
                }
            },
            /**
             * Gets a reference to the Message Area of the editor.
             *
             * @instance
             * @memberof Gui.MarkdownEditor
             * @return {Browser.jQuery} - The message area.
             * @function
             */
            "getMessageArea": function(){
                return messageSpan;
            }
        });
    }

    $.fn.MarkdownEditor = MarkdownEditor;

})(jQuery);
