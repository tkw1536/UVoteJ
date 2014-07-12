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
    ["port", "int+", "Enter port: "]
];


//Read the proper configuration
console.log("UVoteJ Configuration");
console.log("Leave blank for default. ");

//Create a readline interface
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//read in some config
function read_config(i, config){
    if(i < config_to_read.length){
        var what = config_to_read[i];
        var key = what[0];

        rl.question(what[2]+">", function(val){
            switch(what[1]){
                case "int+":
                    val = parseInt(val);
                    if(val <= 0){
                        val = undefined;
                    }
                    break;
                default:
                    if(val == ""){
                        val = undefined;
                    }
                    break;
            }

            //check what we need to do.
            if(typeof val !== "undefined"){
                config[key] = val;
            }

            //read the next config
            read_config(i+1, config);
        });
    } else {
        writeConfigFile(config);
    }
}

//start prompting the config
read_config(0, {});


//mongodb
rl.question("Enter port: >", function(port) {
    var port = parseInt(port);
    rl.question("Enter mongodb adress: >", function(mongo_path) {
        rl.close();

        var config = {
            "port": port,
            "mongodb": mongo_path,
            "auth": "ldap",
            "auth_config": {}
        };



    });
});

//write the actual config file
var writeConfigFile = function(config){

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
            process.exit(0);
        } else {
            console.log("Wrote config to", config_path);
            process.exit(1);
        }
    });
}
