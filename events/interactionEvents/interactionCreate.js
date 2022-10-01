const discord = require("discord.js");
const { MongoClient } = require("mongodb")
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = discord;
const { inviteMember } = require("../../commands/chat_input_command/inviteMember.js");
const { createTeam } = require("../../commands/chat_input_command/createTeam.js");
const { deleteTeam } = require("../../commands/chat_input_command/deleteTeam.js");
const { kickMember } = require("../../commands/chat_input_command/kickMember.js");
const { customize_team } = require("../../commands/chat_input_command/customizeTeam.js");
const { applyTeam } = require("../../features/teamApply");




require("dotenv").config();

// Client interactionCreate event

module.exports = {

    /**
     * 
     * @param {discord.Client} client 
     * @param {MongoClient} mongoClient
     */

    async event(client, mongoClient) {

        // collects every slash command script into an object
        client.on("interactionCreate", async (interaction) => {

            if (interaction.isCommand()) {

                if (interaction.commandName === "invite_member") {
                    inviteMember(interaction, mongoClient);
                }
                if (interaction.commandName === "create_team") {
                    createTeam(interaction, mongoClient, client);
                }
                if (interaction.commandName === "delete_team") {
                    deleteTeam(interaction, mongoClient, client);
                }
                if (interaction.commandName === "kick_member") {
                    kickMember(interaction, mongoClient, client);
                }
                if (interaction.commandName === "customize_team") {
                    customize_team(interaction, mongoClient, client);
                }

            }

            //  button interactions
            if (interaction.isButton()) {
                

                if (interaction.customId.startsWith("teamApply")) {
                    applyTeam(interaction,mongoClient,client)

                }

            }

        });

    },


}