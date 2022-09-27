const discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction , Client} = require("discord.js");
const { readData } = require("../databaseFeatures/dbReadData.js");
const mongoose = require("mongoose");

require("dotenv").config();

module.exports = {

    /**
     * 
     * @param {ButtonInteraction} interaction 
     * @param {mongoose.Model} mongoClient 
     * @param {Client} client 
     */

    async inviteAccept(interaction, mongoClient, client){

        const applicationMsg = interaction.message;

        //  getting the accepted user
        const acceptedUserID = interaction.customId.split(".")[1];
        const acceptedUser = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(acceptedUserID)
            .catch(err => {

                interaction.reply({
                    content: "Error occured while processing the invitation accept!",
                    ephemeral: true
                });
                return;

            });

        //  check if accepted user is already in a team
        if ((await readData(mongoClient, {"userID" : acceptedUser.id})).length !== 0) {

            interaction.reply({
                content: "This invited user is already in a team!",
                ephemeral: true
            });

            applicationMsg.delete();
            return;
        }

        //  checking if the capacity of the team is full
        const teamName = (await readData(mongoClient, {"userID" : interaction.user.id}))[0].teamName;

        if ((await readData(mongoClient, {"teamName" : teamName})).length === 3) {

            interaction.reply({
                content: "Your team has full capacity to invite another member!",
                ephemeral: true
            });

            applicationMsg.delete();
            return;
        }
        

    }

};