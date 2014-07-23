var Client = (function(){

    /**
     * Loads external javascript files.
     *
     * @param {string|string[]} url Url(s) of script(s) to load.
     * @param {function} [callback=undefined] Callback to call once the script is loaded.
     * @param {*} [scope=window] Optional. Scope of callback.
     * @param {function} [preLoadHack=undefined] Optional. Function to call before loading a specific file.
     * @private
     */
    var loadExternalJS = function(url, callback, scope, preLoadHack){

        var TIMEOUT_CONST = 15000; //timeout for bad links
        var has_called = false;
        var preLoadHack = (typeof preLoadHack == "function")?preLoadHack:function(){};

        var do_call = function(suc){
            if(has_called){
                return;
            }
            has_called = true;

            var func = (typeof callback == "function")?callback:function(){};
            var scope = (typeof scope == "undefined")?window:scope;

            func.call(scope, url, suc);
        }


        if( typeof url !== "string"){
            //assume an array
            var i=0;
            var next = function(urls, suc){
                if(i>=url.length || !suc){
                    window.setTimeout(function(){
                        do_call(suc);
                    }, 0);
                } else {
                    loadExternalJS(url[i], function(urls, suc){
                        i++;
                        next(urls, suc);
                    }, scope, preLoadHack);
                }
            }

            window.setTimeout(function(){
                next("", true);
            }, 0);

            return url.length;
        } else {
                //adapted from: http://www.nczonline.net/blog/2009/07/28/the-best-way-to-load-external-javascript/
                var script = document.createElement("script")
                script.type = "text/javascript";

            if (script.readyState){  //IE
                script.onreadystatechange = function(){
                    if (script.readyState == "loaded" ||
                        script.readyState == "complete"){
                        script.onreadystatechange = null;
                    window.setTimeout(function(){
                        do_call(true);
                    }, 0);
                }
            };
            } else {  //Others
                script.onload = function(){
                    window.setTimeout(function(){
                        do_call(true);
                    }, 0);
                };
            }

            script.src = url;
            preLoadHack(url);
            document.getElementsByTagName("head")[0].appendChild(script);

            window.setTimeout(function(){
                do_call(false);
            }, TIMEOUT_CONST);
            return 1;
        }
    }

    /**
     * Namespace for Client-Side scripts.
     *
     * @namespace Client
     */
    var Client = {};

    /**
    * @memberof Client
    * @param {string} client - Client to load. One of "Admin", "vote".
    * @param {function} cb - Callback to call once the client is loaded.
    */
    Client.load = function(client, cb){
        if(!Client[client]){
            return loadExternalJS("/lib/client/"+client+".js", cb);
        } else {
            return cb([]);
        }
    }

    /**
     * Callback for server results.
     * @callback Client~resultCallback
     * @param {boolean} success - A boolean repsenting if the opertaion suceeded.
     * @param {object|string|undefined} result - The result of the request or an optional error message.
     */

     /**
      * Callback for server results.
      * @callback Client~editCallback
      * @param {boolean} success - A boolean repsenting if the opertaion suceeded.
      * @param {*} value - Current value of the setting in question.
      * @param {string} [error_message] - Error message, if any.
      */

    return Client;
})();
