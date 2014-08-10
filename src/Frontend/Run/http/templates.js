var
    dot = require("dot"),
    fs = require("fs");

module.exports = function(state, logger, next){

    /**
     * Contains response templates parsed with DoT.js
     * @namespace Frontend.State.templates
     */
    state.templates = {};

    var templateGetter = function(t){
        return dot.template(fs.readFileSync(state.dirs.static+"templates/"+t+".html"));
    }

    //for errors
    state.templates.error_404 = templateGetter("error_404");
    state.templates.error_500 = templateGetter("error_500");

    //send a 500 error message
    state.templates.send_500 = function(req, res, msg){
        res.set('Content-Type', 'text/html');
        res.send(500, state.templates.error_500({"message": msg, "url": req.protocol + '://' + req.get('host') + req.originalUrl}));
    }

    //voting error messages
    state.templates.vote_init = templateGetter("vote_01_init");
    state.templates.vote_closed = templateGetter("vote_02_closed");
    state.templates.vote_public = templateGetter("vote_03_public");

    //init error messages. 
    state.templates.results_init = templateGetter("results_01_init");
    state.templates.results_open = templateGetter("results_02_open");
    state.templates.results_closed = templateGetter("results_03_closed");

    next(state);
};
