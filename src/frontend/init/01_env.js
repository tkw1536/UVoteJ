//Requirements
var
    fs = require("fs"),
    path = require("path"),
    config = require("../../Backend/config.js");


module.exports = function(state, logger, next){
    //the root directory
    state.dirs = {};
    state.dirs.root = path.resolve(__dirname + "/../../../")+"/";
    state.dirs.static = state.dirs.root + "static/"

    //read / write config
    Object.defineProperty(state, "config", {
        "set": function(c){
            //write the config back
            config.write(c);
        },
        "get": function(c){
            //read the config
            var tmp = config.read();

            //"proxy" the changes back to the file
            var gotten = {};
            for(var key in tmp){
                (function(key){
                    Object.defineProperty(gotten, key, {
                        "get": function(){
                                return tmp[key];
                        },
                        "set": function(s){
                                tmp[key] = s;
                                state.config = tmp;
                        }
                    })
                })(key);
            }
            return gotten;
        }
    });

    //run the next thing
    next(state);
};
