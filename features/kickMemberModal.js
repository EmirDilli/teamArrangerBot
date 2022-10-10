const discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Client } = require("discord.js");
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


    async kickMemberModal(interaction, mongoClient, client) {
        const kicked_member = interaction.options.get("kick_member").member;
        
        const adminUser = (await readData(mongoClient, {"userID" : interaction.user.id}))[0];
        const isAdminUser = adminUser ? adminUser.isAdmin : null;

        //  checks if the interacted user is an admin in any particular team
        if(!isAdminUser){

            interaction.reply({
                content: "Since you're not an admin in any particular team, you're not authorized to execute this function.",
                ephemeral: true
            });
            return;
        }

        //  checking if the selected user is valid for invitation
        if (kicked_member.bot || kicked_member.user.id === interaction.user.id) {

            await interaction.reply({
                content: "You have to select a member who is not a bot nor you.",
                ephemeral: true
            });
            return;
        }

        //  checks if the selected user is in the database
        if((await readData(mongoClient, {"userID" : kicked_member.user.id})).length === 0){

            interaction.reply({
                content: "The user you want to kick, is not on your team!",
                ephemeral: true
            });
            return;
        }

        //  checks if the selected user is in the admin's team
        const kickedMemberTeam = (await readData(mongoClient, {"userID" : kicked_member.user.id}))[0].teamName;

        if(kickedMemberTeam !== adminUser.teamName){

            interaction.reply({
                content: "The user you want to kick, is not on your team!",
                ephemeral: true
            });
            return;

        }



        const modal = new discord.ModalBuilder()
            .setCustomId(`kickReason.${kicked_member.user.id}`)
            .setTitle('Reason To Kick')
            .setComponents(
                new ActionRowBuilder()
                    .setComponents(
                        new discord.TextInputBuilder()
                            .setCustomId('reasonKick')
                            .setLabel('Reason To Kick')
                            .setStyle(discord.TextInputStyle.Paragraph)
                            .setRequired(true)
                            .setMinLength(10)
                            .setMaxLength(500)
                    )
            )
        
        await interaction.showModal(modal);
        

    }
}