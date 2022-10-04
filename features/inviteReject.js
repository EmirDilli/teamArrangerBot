const discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Client } = require("discord.js");
const { readData } = require("../databaseFeatures/dbReadData.js");
const mongoose = require("mongoose");
require("dotenv").config();


module.exports = {
    /** 
    * @param {ButtonInteraction} interaction 
    * @param {mongoose.Model} mongoClient 
    * @param {Client} client 
    */
    async invitationReject(interaction, mongoClient, client){ 

    }
}