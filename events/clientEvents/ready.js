const discord = require("discord.js");
const {readData} = require("../../databaseFeatures/dbReadData")
const {addData} = require("../../databaseFeatures/dbAddUser")
const {deleteData} = require("../../databaseFeatures/dbDeleteUser")



// Client being ready event

module.exports = {

    /**
     * 
     * @param {discord.Client} client 
     */
    async event(client, mongoClient){
        
        client.on("ready",async () => {

            console.log(`The ${client.user.username} has logged in`);
        });

    },


}