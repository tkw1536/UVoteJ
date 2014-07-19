var DB = require("../../../Backend/VoteDB.js"),
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

        /**
        * The current MONGODB Database.
        *
        * @type {NodeJS.Mongo.Database}
        * @alias Frontend.State.db
        */
        state.db = db;

        /**
        * Current Databse of Votes.
        *
        * @type {Backend.VoteDB}
        * @alias Frontend.State.votes
        */
        state.votes = new DB(db.collection("votes"), function(){
            next(state);
        });
    });
}
