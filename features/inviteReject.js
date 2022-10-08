const discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Client } = require("discord.js");
const { readData } = require("../databaseFeatures/dbReadData.js");
const { deleteData } = require("../databaseFeatures/dbDeleteUser")
const mongoose = require("mongoose");
require("dotenv").config();


module.exports = {
    /** 
    * @param {ButtonInteraction} interaction 
    * @param {mongoose.Model} mongoClient 
    * @param {Client} client 
    */
    async invitationaReject(interaction, mongoClient, client){ 
        interaction.deferReply({
            ephemeral: true
        });
        //  getting the accepted user
        const teamID = interaction.customId.split(".")[1];
        const team = readData(mongoClient, { "teamCustomID": teamID });
        const acceptedUserID = interaction.customId.split(".")[2];
        
        deleteData(mongoClient, {
            "userID": acceptedUserID
        })

        if((await readData(mongoClient, {"teamCustomID": teamID})).length === 0){
            interaction.editReply({
                content: "The team you want to join does not exist anymore!",
                ephemeral: true
            })
            return;
        }

        interaction.editReply({
            content:"You successfully denied that bitch!",
            ephemeral: true
        })

        let admin;
        await team.then(datas => datas.find(data => {
            if (data.isAdmin === true) admin = data;
        }))
        const adminUser = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(admin.userID);
        
        adminUser.send({
            content: "You get denied bitch!",
            ephemeral: true
        })
    }

}