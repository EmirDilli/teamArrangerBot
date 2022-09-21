const discord = require("discord.js");
const {readData} = require("../../databaseFeatures/dbReadData")
const {addData} = require("../../databaseFeatures/dbAddUser")
const {deleteData} = require("../../databaseFeatures/dbDeleteUser")

const membersAdd = require("../../features/member_checkerAdd")
const membersDelete = require("../../features/member_checkerDelete")

// Client being ready event

module.exports = {

    /**
     * 
     * @param {discord.Client} client 
     */
    async event(client, mongoClient){
        
        client.on("ready",async () => {

            console.log(`The ${client.user.username} has logged in`);

            membersAdd(client,mongoClient);
            membersDelete(client, mongoClient);
        });

    },


}