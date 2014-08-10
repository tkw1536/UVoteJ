(function($){

    /**
     * Creates a new OptionEditor.
     *
     * @param {boolean} [disabled = false] - If set to true, the PermissionNodeEditor is disabled and can not be edited.
     * @param {Backend.Vote.Option[]} [initial_value] - Initial value for the OptionEditor Editor.
     * @this {Browser.jQuery}
     * @class
     * @alias Gui.OptionEditor
     * @extends {Browser.jQuery}
     */
    var OptionEditor = function(disabled, initial_value){
        //get the first element
        var element = this.eq(0);

        //Add a div
        var theDiv = $("<div>").appendTo(element);

        OptionEditor.Setter(theDiv, disabled===true, initial_value || [OptionEditor.default])

        return $.extend(this, {
            /**
             * Sets the current value of the OptionEditor.
             *
             * @param {boolean} disabled - If set to true, the OptionEditor is disabled and can not be edited.
             * @param {Backend.Vote.Option[]} value - Value to set the OptionEditor Editor to.
             * @instance
             * @memberof Gui.OptionEditor
             * @function
             */
            "set": function(disabled, value){
                return OptionEditor.Setter(theDiv, disabled, value);
            },

            /**
             * Gets the current value of the OptionEditor.
             *
             * @return {Backend.Vote.Option[]} - The current Option value.
             * @instance
             * @memberof Gui.OptionEditor
             * @function
             */
            "get": function(){
                return OptionEditor.Getter(theDiv);
            }
        });
    }

    /**
     * Sets the value of a PermissionNodeEditor.
     *
     * @param {Browser.jQuery} theDiv - Div element representing the OptionEditor
     * @param {boolean} disabled - If set to true, the OptionEditor is disabled and can not be edited.
     * @param {Backend.Vote.Option[]} value - Value to set the OptionEditor Editor to.
     * @static
     */
    OptionEditor.Setter = function(theDiv, disabled, value){
        theDiv.empty();

        var updateHandler = function(){
            theDiv.parent().trigger("OptionEditor.update", OptionEditor.Getter(theDiv));
        }

        for(var i=0;i<value.length;i++){
            (function(val, i){
                var fs = $("<fieldset>");

                //The three editors
                var tedit = $("<div class='row row-tedit' style='margin-top: 3px; '>").LineEditor("Title", val.title, disabled).on("LineEditor.update", updateHandler);
                var sedit = $("<div class='row row-sedit' style='margin-top: 3px; '>").LineEditor("Short description", val.short_description, disabled).on("LineEditor.update", updateHandler);
                var medit = $("<div class='row-medit' style='margin-top: 3px; '>").MarkdownEditor(val.markdown_description, disabled).on("MarkdownEditor.update", updateHandler);

                fs.append(
                    $("<div class='row'></div>").append(
                        $("<h5>").text("Option #"+(i+1)),
                        $("<div class='btn-group' style='margin-left: 3px; '>").append(
                                $("<button class='btn btn-default btn-sm move-up'>Up</button>").click(function(e){
                                    //prevent the default
                                    e.preventDefault();

                                    //get the current value
                                    var now = OptionEditor.Getter(theDiv);

                                    //move the item from i to i-1
                                    now.splice(i-1, 0, now.splice(i, 1)[0]);

                                    OptionEditor.Setter(theDiv, disabled, now);

                                    // update stuffs
                                    updateHandler();
                                }),
                                $("<button class='btn btn-default btn-sm move-down'>Down</button>").click(function(e){
                                    //prevent the default
                                    e.preventDefault();

                                    //get the current value
                                    var now = OptionEditor.Getter(theDiv);

                                    //move the item from i to i+1
                                    now.splice(i+1, 0, now.splice(i, 1)[0]);

                                    OptionEditor.Setter(theDiv, disabled, now);

                                    // update stuffs
                                    updateHandler();
                                }),
                                $("<button class='btn btn-default btn-sm btn-primary'>+</button>").click(function(e){
                                    //prevent the default
                                    e.preventDefault();

                                    //get the current value
                                    var now = OptionEditor.Getter(theDiv);

                                    //add a new item
                                    now.splice(i+1, 0, OptionEditor.default);

                                    OptionEditor.Setter(theDiv, disabled, now);

                                    // update stuffs
                                    updateHandler();
                                }),
                                $("<button class='btn btn-default btn-sm btn-danger delete'>-</button>").click(function(e){
                                    //prevent the default
                                    e.preventDefault();

                                    //get the current value
                                    var now = OptionEditor.Getter(theDiv);

                                    //add a new item
                                    now.splice(i, 1);

                                    OptionEditor.Setter(theDiv, disabled, now);

                                    // update stuffs
                                    updateHandler();
                                })
                        )
                    ),
                    tedit.data("OptionEditor.editor", tedit),
                    sedit.data("OptionEditor.editor", sedit),
                    medit.data("OptionEditor.editor", medit)
                )

                fs.appendTo(theDiv);
            })(value[i], i);
        }

        if(value.length == 1){
            //we only have one item, so we cant delete it.
            theDiv.find(".delete").prop("disabled", true);
        }

        //we cant move the first one up and the last one down
        theDiv.find(".move-up").eq(0).prop("disabled", true);
        theDiv.find(".move-down").last().prop("disabled", true);

        if(disabled === true){
            //Disable everything.
            theDiv.find("button").prop("disabled", true);
        }
    }

    /**
     * Gets the value of a OptionEditor.
     *
     * @param {Browser.jQuery} theDiv - Div element representing the OptionEditor
     * @return {Backend.Vote.Option[]} - The current OptionEditor value.
     * @static
     */
    OptionEditor.Getter = function(theDiv){
        var res = [];

        theDiv.find("fieldset").each(function(){
            var me = $(this);

            res.push({
                "title": me.find(".row-tedit").data("OptionEditor.editor").get(),
                "short_description": me.find(".row-sedit").data("OptionEditor.editor").get(),
                "markdown_description": me.find(".row-medit").data("OptionEditor.editor").get()
            })
        });

        //return the result Array
        return res;
    }

    /**
     * Default Rule for PermissionNodeEditors.
     *
     * @type {Backend.Vote.Option}
     * @static
     */
    OptionEditor.default = {
        "title": "An Option. ",
        "short_description": "A short description. ",
        "markdown_description": "A longer description using markdown. "
    }

    $.fn.OptionEditor = OptionEditor;


})(jQuery);
