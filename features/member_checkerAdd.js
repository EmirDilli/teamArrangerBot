const discord = require("discord.js")
const {readData} = require("../databaseFeatures/dbReadData")
const {addData} = require("../databaseFeatures/dbAddUser")
const { MongoClient } = require("mongodb");
const dbConnect = require("../databaseFeatures/dbConnect.js");

require("dotenv").config();

async function readAndApply(client, mongoClient){
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    guild.members.fetch().then( async (members) => {
        //iterating over each member whether is it added to database
            members.forEach(member => {
                if (!member.user.bot) {
                    
                    readData(mongoClient, { "userID": member.user.id }).then((data) => {
                        if (data.length === 0) {
                            console.log("There is no such user with this filtration " + data);
                             addData(mongoClient, {
                                "userID": member.user.id,
                                "XP": 0,
                                "userName": member.user.username,
                                "Level": 1
                            })
                        }
                        else{
                            console.log("User exists!");
                        }
                    });
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

    readAndApply(client, mongoClient);
    setInterval(async () => {
        readAndApply(client,mongoClient);
    }, 1000 * 60 * 10 );
    
}