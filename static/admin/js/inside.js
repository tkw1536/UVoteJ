var Constants = {};

Constants.Stage = {
    INIT: 0,
    OPEN: 1,
    CLOSED: 2,
    PUBLIC: 3
};

//from: http://stackoverflow.com/questions/4535888/jquery-text-and-newlines
function html_nls(text) {
    var htmls = [];
    var lines = text.split(/\n/);
    var tmpDiv = jQuery(document.createElement('div'));
    for (var i = 0 ; i < lines.length ; i++) {
        htmls.push(tmpDiv.text(lines[i]).html());
    }
    return htmls.join("<br>");
}


var vote_cache = {}


var updateVotes = function(socket, callback){
    //updated the votes
    vote_cache = {};

    socket.once("list_votes", function(vote_list){
        var read_vote = function(i){
            if(i < vote_list.length){
                var uuid = vote_list[i];
                socket.once("grab_vote", function(the_vote){
                    vote_cache[uuid] = the_vote;
                    read_vote(i+1)
                });

                socket.emit("grab_vote", uuid);
            } else {
                callback();
            }
        }

        read_vote(0);
    });

    socket.emit("list_votes");
}

//cache for all the votes.
var pages = {
    "overview": function(socket){
        //prepare the overview page
    },
    "logs": function(socket){
        //request the logs
        socket.once("list_logs", function(logs){
            logs.reverse(); 

            //find the table body and clear it
            var tbody = $("#log-table-body").empty();

            //now insert all of them.
            for(var i=0;i<logs.length;i++){
                var log_entry = logs[i];

                $("<tr>").append(
                    $("<td>").text(new Date(log_entry.time).toLocaleString()),
                    $("<td>").text(log_entry.level),
                    $("<td>").html(html_nls(log_entry.message))
                ).appendTo(tbody);

            }
        });

        socket.emit("list_logs");
    }
}

var show_page = function(socket, p){

    //load the correct page
    $(".page").addClass("hidden");
    $(".page-"+p).removeClass("hidden");


    //update the menu
    $("#linkbar")
    .find("li.active")
    .removeClass("active");

    $("#"+p).parent().addClass("active");

    //run the init script
    try{
        pages[p](socket);
    } catch(e){
        console.log(e.stack);
    }
};



var adminInside = function(socket){
    //Client side scripts for admin go here.

    //for DEBUG only
    window.socket = socket;

    updateVotes(socket, function(){
        //TODO: Register links

        show_page(socket, "logs");
    });
}
