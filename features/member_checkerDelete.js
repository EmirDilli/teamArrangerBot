const discord = require("discord.js")
const {readData} = require("../databaseFeatures/dbReadData")
const {deleteData} = require("../databaseFeatures/dbDeleteUser")
const { MongoClient } = require("mongodb");
require("dotenv").config();

async function readAndApply(client, mongoClient){

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    let serverMembers = [];
    
    await guild.members.fetch().then(members => {
        serverMembers = members;
    })

    readData(mongoClient, {}).then(datas => {
        datas.forEach(data => {
            //if isContain false, below code deletes the data in the database
            if (!serverMembers.get(data.userID)) {
                console.log(data.userName)
                console.log(serverMembers.get(data.userID))
                deleteData(mongoClient, {
                    "userID": data.userID
                })
            }
        });
    });
}

/**
 * 
 * @param {discord.Client} client 
 * @param {MongoClient} mongoClient
 */

module.exports = async (client, mongoClient) => {
    //discord server id

    readAndApply(client,mongoClient);
    setInterval(() => {
        readAndApply(client,mongoClient);
    }, 1000 * 60 * 10);
    

}