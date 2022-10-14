const discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Client } = require("discord.js");
const { readData } = require("../databaseFeatures/dbReadData.js");
const { deleteData } = require("../databaseFeatures/dbDeleteUser")
const { updateData } = require("../databaseFeatures/dbUpdateUser.js");
const mongoose = require("mongoose");
require("dotenv").config();


module.exports = {
    /** 
    * @param {ButtonInteraction} interaction 
    * @param {mongoose.Model} mongoClient 
    * @param {Client} client 
    */
    async invitationReject(interaction, mongoClient, client){ 

        await interaction.deferReply({
            ephemeral: true
        });

        //  getting the accepted user
        const teamID = interaction.customId.split(".")[1];
        const team = readData(mongoClient, { "teamCustomID": teamID });
        const acceptedUserID = interaction.customId.split(".")[2];

        if((await readData(mongoClient, {"teamCustomID": teamID})).length === 0){
            await interaction.editReply({
                content: "The team you want to join does not exist anymore!",
                ephemeral: true
            })
            return;
        }

        await interaction.editReply({
            content:"You successfully denied that bitch!",
            ephemeral: true
        })

        let admin;
        await team.then(datas => datas.find(data => {
            if (data.isAdmin === true) admin = data;
        }))
        admin.inviteUserArr.forEach(async element => {
            if(element === acceptedUserID){
                let arr = admin.inviteUserArr
                let index = arr.indexOf(element);
                arr.splice(index,1)
                await updateData(mongoClient, {"userID": admin.userID}, {"inviteUserArr": arr})
            }
        });

        await interaction.message.delete();

        const adminUser = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(admin.userID);
        
        adminUser.send({
            content: "You get denied bitch!"
        })
    }

}