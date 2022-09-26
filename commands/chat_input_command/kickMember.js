const { SlashCommandBuilder, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle , Client} = require("discord.js");
const discord = require("discord.js");
const { readData } = require("../../databaseFeatures/dbReadData.js");
const {deleteData} = require("../../databaseFeatures/dbDeleteUser.js");
const mongoose = require("mongoose");

require("dotenv").config();


module.exports = {
    command: new SlashCommandBuilder()
        .setName("kick_member")
        .setDescription("As the admin, you can kick one of your team members!")
        .addUserOption((option) => option
            .setName("kick_member")
            .setDescription("choose the member to kick")
            .setRequired(true)
        ),


    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {mongoose.Model} mongoClient 
     * @param {Client} client 
     */
    async kickMember(interaction, mongoClient, client){

        const kicked_member = interaction.options.get("kick_member").user;

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
        if (kicked_member.bot || kicked_member.id === interaction.user.id) {

            interaction.reply({
                content: "You have to select a member who is not a bot nor you.",
                ephemeral: true
            });
            return;
        }

        //  checks if the selected user is in the admin's team
        const kickedMemberTeam = (await readData(mongoClient, {"userID" : kicked_member.id}))[0].teamName;

        if(kickedMemberTeam !== adminUser.teamName){

            interaction.reply({
                content: "The user you want to kick, is not on your team!",
                ephemeral: true
            });
            return;

        }

        //  deleting the kicked user from database

        await deleteData(mongoClient, {"userID" : kicked_member.id});

        const embed = new EmbedBuilder()
            .setTitle("You've been Kicked From Your Team!")
            .setDescription(`You've been kicked from your team, you can find for other teams if you would like to!`)
            .setThumbnail("https://media.istockphoto.com/vectors/agreement-color-line-icon-documentation-status-linear-vector-request-vector-id1271490971?k=20&m=1271490971&s=612x612&w=0&h=AuGYSNj2B9lBBFWZ4CWaI39-VXxYE_b4EMzsbLR8OC4=")
            .setColor("Random");

        kicked_member.send({
            embeds: [embed]
        }).then(() => {
            interaction.reply({
                content: "Your kicking process has been done successfully!",
                ephemeral: true
            })
        }).catch((err) => {
            console.log("Error occured while kicking the member: " + err);
            interaction.reply({
                content: "Error occured while kicking the member",
                ephemeral: true
            })
        });

    }
    
}