$(function(){

    //client-side javascript for voting
    //we don't really need any of this to provide the fucntionailty
    //but it makes stuff look a lot better.


    //re-parse all the dates.
    //so that we get local time zones
    $(".date").each(function(){
        var $this = $(this);
        try{
            $this.text(new Date($this.text()).toLocaleString());
        } catch(e){}

    })


    $(".list-group-item").each(function(){
        var item = $(this);
        var option = item.find("input[type=checkbox]");

        item.on("click", function(){
            option.prop("checked", !option.prop("checked"));
            option.trigger("change");
        });

        option
        .on("change", function(){
            if(option.prop("checked")){
                item.addClass("active");
            } else {
                item.removeClass("active");
            }
        })
        .on("click", function(e){
            e.stopPropagation();
        });
    })
})
