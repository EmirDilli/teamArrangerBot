const discord = require("discord.js");
const {MongoClient} = require("mongodb")
const updateData = require("../../databaseFeatures/dbUpdateUser")
const readData = require("../../databaseFeatures/dbReadData")


// Client messageCreate event

module.exports = {

    /**
     * 
     * @param {discord.Client} client 
     * @param {MongoClient} mongoClient
     */
    async event(client, mongoClient){
        
        client.on("messageCreate", async (msg) => {
           
        });

    },

    
}