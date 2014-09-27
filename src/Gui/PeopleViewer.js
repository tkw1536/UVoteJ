(function($){

    var ModalTemplate =
    '<div class="modal fade" role="dialog">\
  <div class="modal-dialog">\
    <div class="modal-content">\
      <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>\
        <h4 class="modal-title"></h4>\
      </div>\
      <div class="modal-body">\
      </div>\
      <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
      </div>\
    </div>\
  </div>\
</div>';

    var typer = function(a){
        //undefined < bool < number < string < everything else
        if(typeof a == "string"){
            return 3;
        } else if(typeof a == "boolean"){
            return 1;
        } else  if(typeof a == "number"){
            return 2;
        } else if(typeof a == "undefined"){
            return 0;
        }

        return 4;
    }

    var primitive_sorter = function(a, b){

        //get the types
        var tA = typer(a);
        var tB = typer(b);


        //types do not match, so compare the types
        if(tA != tB){
            return tA - tB;
        } else if(tA == 0){
            //undefined is always the same
            return 0;
        } else {
            //we compare objects directly
            if(a > b){
                return -1;
            } else if( a < b){
                return 1;
            } else {
                return 0;
            }
        }
    }

    var sorter = function(asc, key){
        var sort = asc?-1:1;

        return function(a, b){
            return sort*primitive_sorter(a[key], b[key]);
        }
    }

    var makeSortedTable = function($table, keys, key, order, data){

        //Delete the table.
        $table.empty();

        //the sorted data
        var data_sorted;

        if(typeof key == "string"){
            //sort it by the right key and order
            var data_sorted = data.sort(sorter(order, key));
        } else {
            //dont sort it.
            var data_sorted = data;
        }

        //create the table head.
        var $thead = $("<tr>").appendTo($("<thead>").appendTo($table));

        //create the table body
        var $tbody = $("<tbody>").appendTo($table)

        keys.map(function(k){
            //create column header
            var col = $("<th>").text(k).appendTo($thead);

            if(k === key){
                if(order === true){
                    col
                    .append(" (+)")
                    .click(function(e){
                        //stop e
                        e.preventDefault();
                        e.stopPropagation();

                        //and make a new table
                        makeSortedTable($table, keys, k, false, data);
                    });
                } else {
                    col
                    .append(" (-)")
                    .click(function(e){
                        //stop e
                        e.preventDefault();
                        e.stopPropagation();

                        //and make a new table
                        makeSortedTable($table, keys, undefined, false, data);
                    });
                }

            } else {
                //Remake the sorted table
                col
                .click(function(e){
                    //stop e
                    e.preventDefault();
                    e.stopPropagation();

                    //and make a new table
                    makeSortedTable($table, keys, k, true, data);
                });
            }
        });

        data_sorted.map(function(d){
            //create a new row
            var row = $("<tr>").appendTo($tbody);

            keys.map(function(k){
                //value
                var v = d[k];

                //create the cell and append it to the row
                var cell = $("<td>").appendTo(row);

                //type descriptor
                var type = $("<span>").css({
                        "color": "gray",
                        "font-style": "italic"
                }).appendTo(cell);

                //space
                cell.append("&nbsp;");

                //value
                var val = $("<span>").appendTo(cell);

                //and lets color it.
                if(typeof v == "number"){
                    type.text("<number>");
                    val.text(v.toString()).css({"color": "blue"});
                } else if(typeof v == "string"){
                    type.text("<string>");
                    val.text(v).css({"color": "red"});
                } else if(typeof v == "boolean"){
                    type.text("<boolean>");
                    val.text(v).css({"color": "green"});
                } else if(typeof v == "undefined"){
                    type.text("<undefined>");
                } else {
                    type.text("<object>");
                    val.text(v);
                }


            });
        });

    }


    /**
     * Creates a new PeopleViewer.
     *
     * @param {Object[]} people - List of people to show.
     * @param {string} [title = "People Viewer"] - Title of People Viewer.
     * @this {Browser.jQuery}
     * @class
     * @alias Gui.OptionEditor
     * @extends {Browser.jQuery}
     */
    var PeopleViewer = function(people, title){

        var title = title;

        if(typeof title !== "string"){
            title = "People Viewer";
        }

        title += " ("+people.length+")"; 

        // The objects to visualise.
        var things = [];

        //Map over the people
        people.map(function(e){
            for(var k in e){
                if(e.hasOwnProperty(k)){
                    if(things.indexOf(k) == -1){
                        things.push(k);
                    }
                }
            }
        });

        //create the modal and find title and body.
        var modal = $(ModalTemplate);
        var modal_title = modal.find(".modal-title");
        var modal_body = modal.find(".modal-body");

        //rebuilds a table
        var table = $("<table class='table'>");

        //Make the table sorted
        makeSortedTable(table, things, undefined, true, people);

        //set title
        modal_title.text(title)

        //Set the body
        modal_body.append(table);

        //Show the modal
        modal.modal();
    };

    $.fn.peopleViewer = PeopleViewer;

})(jQuery);
