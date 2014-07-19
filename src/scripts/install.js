//modules required
var
    readline = require('readline'),
    fs = require('fs'),
    path = require('path');

//paths
var config_path = path.resolve(__dirname+"/../../config/config.json");
var example_config_path = path.resolve(__dirname+"/../../config/config.json.sample");

//configuration to read
var config_to_read = [
    ["mongodb", "str", "Enter mongodb adress: "],
    ["port", "int+", "Enter port: "],
    ["auth", "str", "Enter authentication type (dummy): "],
    ["normalise_usernames", "bool", "Should usernames be normalised?: "]
];

var auth_config = {};


//Read the proper configuration
console.log("UVoteJ Configuration");
console.log("Leave blank for default. ");

//Create a readline interface
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//parse some value
function parseval(type, val){
    switch(type){
        case "float":
            val = parseFloat(val);
            break;
        case "int":
            val = parseInt(val);
            break;
        case "int+":
            val = parseInt(val);
            if(val <= 0){
                val = undefined;
            }
            break;
        case "bool":
            val = (val.toLowerCase()[0] == "y");
            break;
        default:
            if(val == ""){
                val = undefined;
            }
            break;
    }

    return val;
}

//read in some config
function read_config(i, config){
    if(i < config_to_read.length){
        var what = config_to_read[i];
        var key = what[0];

        rl.question(what[2]+">", function(val){
            val = parseval(what[1], val);

            //check what we need to do.
            if(typeof val !== "undefined"){
                config[key] = val;
            }

            //read the next config
            read_config(i+1, config);
        });
    } else {


        //resolve the auth file
        var auth_file = config["auth"] || "dummy";
        config["auth"] = auth_file;
        auth_file = require(__dirname + "/../Backend/Authentication")[auth_file.toLowerCase()];

        //set the defaults and stuff
        auth_config = auth_file.config;
        config["auth_config"] = auth_file.defaults;

        read_auth_config(0, config);
    }
}

function read_auth_config(i, config){
    if(i < auth_config.length){
        var what = auth_config[i];
        var key = what[0];

        rl.question(what[2]+">", function(val){
            val = parseval(what[1], val);

            //check what we need to do.
            if(typeof val !== "undefined"){
                config["auth_config"][key] = val;
            }

            //read the next config
            read_auth_config(i+1, config);
        });
    } else {
        writeConfigFile(config);
    }
}

//start prompting the config
read_config(0, {});

//write the actual config file
var writeConfigFile = function(config){

    //close the radline
    rl.close();

    //read in the sample configuration
    var dummy_config = JSON.parse(fs.readFileSync(example_config_path));

    //overwrite it by what has been set
    for(var key in config){
        dummy_config[key] = config[key];
    }

    //write it to the file
    fs.writeFile(config_path, JSON.stringify(dummy_config, null, 4), function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("Wrote config to", config_path);
        }
    });
}
