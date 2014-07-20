(function($){

    //Template for a single row
    var rowTemplate = '<div class="input-group" style="margin-bottom: 3px; ">\n\
        <span class="input-group-addon"><input type="checkbox"> NOT</span>\n\
        <span class="input-group-addon">Field</span>\n\
        <input type="text" class="form-control" placeholder="Field">\n\
        <span class="input-group-addon">Relation</span>\n\
        <select class="form-control">\n\
            <option value="EQUALS" selected>equals</option>\n\
            <option value="EQUALS_NO_CASE">equals (no case)</option>\n\
            <option disabled="disabled">----</option>\n\
            <option value="CONTAINS">contains</option>\n\
            <option value="MATCHES">matches</option>\n\
            <option disabled="disabled">----</option>\n\
            <option value="STARTS_WITH">starts with</option>\n\
            <option value="ENDS_WITH">ends with</option>\n\
            <option disabled="disabled">----</option>\n\
            <option value="BIGGER_THEN">bigger then</option>\n\
            <option value="SMALLER_THEN">smaller then</option>\n\
        </select>\n\
        <span class="input-group-addon">Value</span>\n\
        <input type="text" class="form-control" placeholder="Value">\n\
        <span class="input-group-addon">Logic</span>\n\
        <select class="form-control">\n\
            <option value="AND" selected>AND</option>\n\
            <option value="NAND">NAND</option>\n\
            <option value="OR">OR</option>\n\
            <option value="NOR">NOR</option>\n\
            <option value="XOR">XOR</option>\n\
            <option value="XNOR">XNOR</option>\n\
        </select>\n\
        <div class="input-group-btn">\n\
            <button type="button" class="btn btn-default">+</button>\n\
        </div>\n\
        <div class="input-group-btn">\n\
            <button type="button" class="btn btn-default">-</button>\n\
        </div>\n\
    </div>';

    /**
     * Creates a new PermissionNodeEditor.
     *
     * @param {boolean} [disabled = false] - If set to true, the PermissionNodeEditor is disabled and can not be edited.
     * @param {Backend.PermissionNode.Rule[]} [initial_value] - Initial value for the PermissionNode Editor.
     * @this {Browser.jQuery}
     * @class
     * @alias Gui.PermissionNodeEditor
     * @extends {Browser.jQuery}
     */
    var PermissionNodeEditor = function(disabled, initial_value){
        //get the first element
        var element = this.eq(0);

        //Add a div
        var theDiv = $("<div>").appendTo(element);

        PermissionNodeEditor.Setter(theDiv, disabled===true, initial_value || [PermissionNodeEditor.default])

        return $.extend(this, {
            /**
             * Sets the current value of the PermissionNodeEditor.
             *
             * @param {boolean} disabled - If set to true, the PermissionNodeEditor is disabled and can not be edited.
             * @param {Backend.PermissionNode.Rule[]} value - Value to set the PermissionNode Editor to.
             * @instance
             * @memberof Gui.PermissionNodeEditor
             * @function
             */
            "set": function(disabled, value){
                return PermissionNodeEditor.Setter(theDiv, disabled, value);
            },

            /**
             * Gets the current value of the PermissionNodeEditor.
             *
             * @return {Backend.PermissionNode.Rule[]} - The current PermissionNode value.
             * @instance
             * @memberof Gui.PermissionNodeEditor
             * @function
             */
            "get": function(){
                return PermissionNodeEditor.Getter(theDiv);
            }
        });
    }

    /**
     * Sets the value of a PermissionNodeEditor.
     *
     * @param {Browser.jQuery} theDiv - Div element representing the PermissionNodeEditor
     * @param {boolean} disabled - If set to true, the PermissionNodeEditor is disabled and can not be edited.
     * @param {Backend.PermissionNode.Rule[]} value - Value to set the PermissionNode Editor to.
     * @static
     */
    PermissionNodeEditor.Setter = function(theDiv, disabled, value){
        theDiv.empty();

        for(var i=0;i<value.length;i++){
            (function(val, i){
                var template = $(rowTemplate);

                //set negation
                template.find("input[type=checkbox]").eq(0).prop("checked", val["negate"]);

                //set fieldName
                template.find("input[type=text]").eq(0).val(val["fieldName"]);

                //set fieldRelation
                for(var k in Client.Protocol.QueryRelation){
                    if(Client.Protocol.QueryRelation[k] == val["fieldRelation"]){
                        template.find("select").eq(0).val(k);
                        break;
                    }
                }

                //set query
                template.find("input[type=text]").eq(1).val(val["query"]);

                //set nextRelation
                for(var k in Client.Protocol.LogicalRelation){
                    if(Client.Protocol.LogicalRelation[k] == val["nextRelation"]){
                        template.find("select").eq(1).val(k);
                        break;
                    }
                }

                //add the add button handler
                template.find("button").eq(0).click(function(){

                    //get the current state and insert a default row below me.
                    var now = PermissionNodeEditor.Getter(theDiv);
                    now.splice(i+1, 0, PermissionNodeEditor.default);

                    //and set it correctly
                    PermissionNodeEditor.Setter(theDiv, disabled, now);
                });


                //Add remove button handler
                if(value.length == 1){
                    //if we are only one item, we do not want to be able to remove it.
                    template.find("button").eq(1).attr("disabled", "disabled");
                } else {
                    //else, remove the current element
                    template.find("button").eq(1).click(function(){

                        //get the current state and remove this row
                        var now = PermissionNodeEditor.Getter(theDiv);
                        now.splice(i, 1);

                        //and set it correctly
                        PermissionNodeEditor.Setter(theDiv, disabled, now);
                    });
                }

                //if we are the last element, disable the logical relation
                if(i == value.length - 1){
                    template.find("select").eq(1).prop("disabled", true)
                }

                if(disabled){
                    //we are disabled, so mark everything as disabled.
                    template.find("input,button,select").attr("disabled", true);
                }

                //add the row to the div
                template.appendTo(theDiv);

            })(value[i], i);
        }
    }

    /**
     * Gets the value of a PermissionNodeEditor.
     *
     * @param {Browser.jQuery} theDiv - Div element representing the PermissionNodeEditor
     * @return {Backend.PermissionNode.Rule[]} - The current PermissionNode value.
     * @static
     */
    PermissionNodeEditor.Getter = function(theDiv){
        var res = [];

        theDiv.find(".input-group").each(function(){
            var $this = $(this);

            //Grab all the values from this row.

            var negate = $this.find("input[type=checkbox]").eq(0).prop("checked");
            var exceptionValue = false; //$this.find("input[type=checkbox]").eq(1).prop("checked");

            var fname = $this.find("input[type=text]").eq(0).val();
            var query = $this.find("input[type=text]").eq(1).val();

            var frelation = $this.find("select").eq(0).val();
            var lrelation = $this.find("select").eq(1).val();

            //and push them to the result array
            res.push({
                "negate": negate,
                "exceptionValue": exceptionValue,

                "fieldName": fname,
                "fieldRelation": Client.Protocol.QueryRelation[frelation],

                "query": query,
                "nextRelation": Client.Protocol.LogicalRelation[lrelation]
            });
        });

        //return the result Array
        return res;
    }

    /**
     * Default Rule for PermissionNodeEditors.
     *
     * @type {Backend.PermissionNode.Rule}
     * @static
     */
    PermissionNodeEditor.default = {
        "negate": false,
        "exceptionValue": false,

        "fieldName": "",
        "fieldRelation": Client.Protocol.QueryRelation.EQUALS,

        "query": "",
        "nextRelation": Client.Protocol.LogicalRelation.AND
    }

    $.fn.PermissionNodeEditor = PermissionNodeEditor;


})(jQuery);
