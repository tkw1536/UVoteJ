var DB = require("../../backend/VoteDB.js"),
    MongoClient = require('mongodb').MongoClient;


// Connect to the db


module.exports = function(state, logger, next){

    logger.info("MONGO: Connecting to", state.config.mongodb);

    MongoClient.connect(state.config.mongodb, function(err, db) {

        if(!err) {
            logger.info("MONGO: Connection established. ");
        } else {
            logger.error("MONGO: Database connection failed. ");
            process.exit(1);
        }

        //This is the databse
        state.db = db;

        //now create our internal API.
        state.votes = new DB(db.collection("votes"), function(){
            next(state);
        });
    });
}
