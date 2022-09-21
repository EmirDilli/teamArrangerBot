const {MongoClient,Collection} = require("mongodb");
const mongoose = require("mongoose");


module.exports = {

    /**
     *  the "mongoClient" here is the Mongo Client that is formed while connecting the app to the database, it is not the bot client itself.
     * @param {mongoose.Model} mongoClient 
     */

    async updateData(mongoClient, filterSchema, newSchema){

        await mongoClient.updateMany(filterSchema,newSchema);

    }
}

