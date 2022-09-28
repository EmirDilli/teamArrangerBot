const discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Client } = require("discord.js");
const { readData } = require("../databaseFeatures/dbReadData.js");
const mongoose = require("mongoose");

require("dotenv").config();

module.exports = {

    /**
     * 
     * @param {Client} client 
     */
    async embedBuilder(client, teamName, teamColor = null, teamDescription = null, teamLogo = null, members){

        let adminID;

        const embedMsg = new EmbedBuilder()
            .setAuthor({"name": teamName})
            .setColor(teamColor)
            .setDescription(teamDescription);

        try {
            embedMsg.setThumbnail(teamLogo);
        } catch (error) {
            
        }

        // adding team members to the embed message
        members.forEach(async member => {
            
            if(member.isAdmin){

                adminID = member.userID;
                embedMsg.addFields({
                    "name": "Admin",
                    "value": `${await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(member.userID)}`,
                    "inline": true
                });

            }
            else{

                embedMsg.addFields({
                    "name": "Member",
                    "value": `${await client.guilds.cache.get(process.env.GUILD_ID).members.fetch(member.userID)}`,
                    "inline": true
                });

            }

        });

        return embedMsg;

    }
}