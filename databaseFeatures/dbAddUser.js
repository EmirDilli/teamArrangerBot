const {MongoClient, Collection, Double, Int32} = require("mongodb");
const mongoose = require("mongoose");


module.exports = {

    /**
     *  the "mongoClient" here is the Mongo Client that is formed while connecting the app to the database, it is not the bot client itself.
     * @param {mongoose.Model} mongoClient 
     */

    async addData(mongoClient, schema){

        try {

            mongoClient.create(schema);

        } catch (error) {
            console.log("Error occured while adding data to database: " + error);
        }

    }
}