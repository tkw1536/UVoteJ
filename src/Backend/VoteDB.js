var VoteAPI = require("./Vote.js"),
    uuid = require("node-uuid"),
    logger = require("winston");

/**
 * Represents a Database interface.
 *
 * @param {MongoDB.collection} collection - MongoDB collection representing the collection to store the votes in.
 * @param {function} callback - Callback
 * @class
 * @alias Backend.VoteDB
 * @this {Backend.VoteDB}
 */
var VoteDB = function VoteDB(collection, callback){
    var me = this;

    /**
     * Collection of supervised votes.
     * @type object<string,Backend.Vote>
     * @name Backend.VoteDB#votes
     */
    this.votes = {};

    /**
     * Database collection
     * @name Backend.VoteDB#collection
     * @type NodeJS.Mongo.Collection
     */
    this.collection = collection;

    /**
     * Logger
     * @name Backend.VoteDB#logger
     * @type NodeJS.Winston
     */
    this.logger = logger;

    //for each of the votes, add it to the database
    this.collection.find().toArray(function(e, docs){
        if(e){
            logger.warn("MONGO: Unable to load existing votes, skipping. ");
            callback();
            return;
        }

        var run = function(i){
            if (i<docs.length){
                //create Vote
                var v = new VoteAPI(docs[i]);
                //get id from db
                v.id = docs[i].id;
                //add it locally.
                me.addVote(v, function(){
                    run(i+1);
                });
            } else {
                logger.info("MONGO: Loaded", docs.length, "existing vote(s) from Database. ");
                callback();
            }
        }

        run(0);
    });
}

/**
 * Creates a new vote and adds it to the supervised colelction.
 *
 * @param {Backend.Vote.Source} [source_object] - Optional JSON-style source for the vote.
 * @param {function} cb - Callback
 */
VoteDB.prototype.createVote = function(source_object, cb){
    var me = this;
    var v = new VoteAPI(source_object);
    me.addVote(v, cb);
}

/**
 * Adds a vote to the supervised colelction.
 *
 * @param {Backend.Vote} vote - Vote to add.
 * @param {function} cb - Callback
 */
VoteDB.prototype.addVote = function(vote, cb){
    var me = this;

    var next = function(){
        //add a listener
        vote.addListener("update", function(){
            me.updateVote(vote, function(){});
        });

        //insert it locally
        me.votes[id] = vote;

        //update it in the databse
        me.updateVote(vote, cb);
    }

    if(!vote.id){
        //generate new id
        var id = uuid.v4();
        this.logger.info("MONGO: Adding new vote with id", id);
        vote.id = id;

        //insert the id into the database
        this.collection.insert({
            "id": id
        }, next);
    } else {
        //generate new id
        var id = vote.id;
        this.logger.info("MONGO: Loading existing vote", id);
        next();
    }
}

/**
 * Removes a vote from the supervised collection.
 *
 * @param {Backend.Vote} vote - Vote to remove.
 * @param {function} cb - Callback
 */
VoteDB.prototype.removeVote = function(vote, cb){
    //what do we have to do
    var id = vote.id;
    this.logger.info("MONGO: Deleting", id);

    //Stop the stages
    vote.stopStages();
    vote.removeAllListeners("update");

    //delete the object & the vote itself
    delete this.votes[id];
    delete vote;

    //delete it from the database
    this.collection.remove({
        "id": id
    }, cb);
}

/**
 * Gets the uuid of a vote given its machine_name
 *
 * @param {string} machine_name - Machine name to look for.
 * @return {string} - UUID of the vote in question or the empty string. 
 */
VoteDB.prototype.machine_to_uuid = function(machine_name){
    for(var key in this.votes){
        if(this.votes[key].machine_name == machine_name){
            return key;
        }
    }

    return "";
}

/**
 * Updates a vote in the database
 *
 * @param {Backend.Vote} vote - Vote to update.
 * @param {function} cb - Callback
 */
VoteDB.prototype.updateVote = function(vote, cb){
    //what do we have to do
    var id = vote.id;
    this.logger.info("MONGO: Storing", id);

    //create the document to store
    var doc = vote.toJSON();
    doc.id = id;

    //update it in the db
    this.collection.update({
        "id": id
    }, {"$set": doc}, function(){
        cb();
    });
}

module.exports = VoteDB;
